const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Lista fatture
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, h.nome as hospital_name, 
             w.numero_commessa
      FROM invoices i
      LEFT JOIN hospitals h ON i.hospital_id = h.id
      LEFT JOIN work_orders w ON i.work_order_id = w.id
      ORDER BY i.data_fattura DESC
    `);
    
    res.render('invoices/list', {
      user: req.session,
      invoices: result.rows
    });
  } catch (error) {
    console.error('Errore lista fatture:', error);
    res.status(500).send('Errore caricamento fatture');
  }
});

// Visualizza dettaglio fattura
router.get('/view/:id', async (req, res) => {
  try {
    const invoice = await pool.query(`
      SELECT i.*, h.nome as hospital_name, h.indirizzo, h.citta, h.cap, h.partita_iva,
             w.numero_commessa, w.descrizione as commessa_descrizione,
             u.nome as created_by_name
      FROM invoices i
      LEFT JOIN hospitals h ON i.hospital_id = h.id
      LEFT JOIN work_orders w ON i.work_order_id = w.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.id = $1
    `, [req.params.id]);

    if (invoice.rows.length === 0) {
      return res.status(404).send('Fattura non trovata');
    }

    // Voci della fattura
    const items = await pool.query(`
      SELECT * FROM invoice_items 
      WHERE invoice_id = $1
      ORDER BY tipologia, id
    `, [req.params.id]);

    res.render('invoices/view', {
      user: req.session,
      invoice: invoice.rows[0],
      items: items.rows
    });
  } catch (error) {
    console.error('Errore visualizzazione fattura:', error);
    res.status(500).send('Errore visualizzazione fattura');
  }
});

// Genera fattura da commessa
router.post('/generate-from-work-order/:workOrderId', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const workOrderId = req.params.workOrderId;

    // Verifica che la commessa sia completata
    const workOrder = await client.query(`
      SELECT w.*, h.nome as hospital_name, h.id as hospital_id
      FROM work_orders w
      LEFT JOIN hospitals h ON w.hospital_id = h.id
      WHERE w.id = $1
    `, [workOrderId]);

    if (workOrder.rows.length === 0) {
      throw new Error('Commessa non trovata');
    }

    if (workOrder.rows[0].stato !== 'completata') {
      throw new Error('Solo le commesse completate possono essere fatturate');
    }

    // Verifica se esiste già una fattura per questa commessa
    const existingInvoice = await client.query(
      'SELECT id FROM invoices WHERE work_order_id = $1',
      [workOrderId]
    );

    if (existingInvoice.rows.length > 0) {
      throw new Error('Esiste già una fattura per questa commessa');
    }

    // Genera numero fattura (formato: FATT-YYYY-NNNN)
    const year = new Date().getFullYear();
    const lastInvoice = await client.query(`
      SELECT numero_fattura FROM invoices 
      WHERE numero_fattura LIKE $1
      ORDER BY numero_fattura DESC 
      LIMIT 1
    `, [`FATT-${year}-%`]);

    let numeroFattura;
    if (lastInvoice.rows.length === 0) {
      numeroFattura = `FATT-${year}-0001`;
    } else {
      const lastNumber = parseInt(lastInvoice.rows[0].numero_fattura.split('-')[2]);
      numeroFattura = `FATT-${year}-${String(lastNumber + 1).padStart(4, '0')}`;
    }

    // Calcola totali dalla commessa
    const totals = await client.query(`
      SELECT 
        COALESCE(SUM(wa.totale_manodopera), 0) as manodopera,
        COALESCE((SELECT SUM(totale) FROM work_materials WHERE work_order_id = $1), 0) as materiali,
        COALESCE((SELECT SUM(totale_trasferta) FROM work_travels WHERE work_order_id = $1), 0) as trasferte
      FROM work_activities wa
      WHERE wa.work_order_id = $1
    `, [workOrderId]);

    const imponibile = parseFloat(totals.rows[0].manodopera) + 
                      parseFloat(totals.rows[0].materiali) + 
                      parseFloat(totals.rows[0].trasferte);
    const iva = imponibile * 0.22; // IVA 22%
    const totale_fattura = imponibile + iva;

    const data_fattura = new Date();
    const data_scadenza = new Date();
    data_scadenza.setDate(data_scadenza.getDate() + 30); // Scadenza 30 giorni

    // Crea fattura
    const invoiceResult = await client.query(`
      INSERT INTO invoices (
        work_order_id, hospital_id, numero_fattura, data_fattura, data_scadenza,
        imponibile, iva, totale_fattura, stato, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [
      workOrderId,
      workOrder.rows[0].hospital_id,
      numeroFattura,
      data_fattura,
      data_scadenza,
      imponibile,
      iva,
      totale_fattura,
      'emessa',
      req.session.userId
    ]);

    const invoiceId = invoiceResult.rows[0].id;

    // Aggiungi voci fattura - Manodopera
    const activities = await client.query(`
      SELECT data_attivita, descrizione, ore_lavoro, costo_orario, totale_manodopera
      FROM work_activities 
      WHERE work_order_id = $1
      ORDER BY data_attivita
    `, [workOrderId]);

    for (const activity of activities.rows) {
      if (parseFloat(activity.totale_manodopera) > 0) {
        await client.query(`
          INSERT INTO invoice_items (
            invoice_id, tipologia, descrizione, quantita, prezzo_unitario, totale
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          invoiceId,
          'manodopera',
          `${activity.descrizione} (${new Date(activity.data_attivita).toLocaleDateString('it-IT')})`,
          activity.ore_lavoro,
          activity.costo_orario,
          activity.totale_manodopera
        ]);
      }
    }

    // Aggiungi voci fattura - Materiali
    const materials = await client.query(`
      SELECT descrizione, quantita, prezzo_unitario, totale
      FROM work_materials 
      WHERE work_order_id = $1
    `, [workOrderId]);

    for (const material of materials.rows) {
      if (parseFloat(material.totale) > 0) {
        await client.query(`
          INSERT INTO invoice_items (
            invoice_id, tipologia, descrizione, quantita, prezzo_unitario, totale
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          invoiceId,
          'materiale',
          material.descrizione,
          material.quantita,
          material.prezzo_unitario,
          material.totale
        ]);
      }
    }

    // Aggiungi voci fattura - Trasferte
    const travels = await client.query(`
      SELECT km_percorsi, costo_km, pedaggi, vitto, alloggio, totale_trasferta, note
      FROM work_travels 
      WHERE work_order_id = $1
    `, [workOrderId]);

    for (const travel of travels.rows) {
      if (parseFloat(travel.totale_trasferta) > 0) {
        let descrizione = 'Trasferta';
        if (travel.note) descrizione += ` - ${travel.note}`;
        if (travel.km_percorsi > 0) descrizione += ` (${travel.km_percorsi} km)`;

        await client.query(`
          INSERT INTO invoice_items (
            invoice_id, tipologia, descrizione, quantita, prezzo_unitario, totale
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          invoiceId,
          'trasferta',
          descrizione,
          1,
          travel.totale_trasferta,
          travel.totale_trasferta
        ]);
      }
    }

    // Aggiorna stato commessa
    await client.query(`
      UPDATE work_orders 
      SET stato = 'fatturata', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [workOrderId]);

    await client.query('COMMIT');
    res.redirect(`/invoices/view/${invoiceId}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Errore generazione fattura:', error);
    res.status(500).send(`Errore generazione fattura: ${error.message}`);
  } finally {
    client.release();
  }
});

// Cambia stato fattura
router.post('/status/:id', async (req, res) => {
  const { stato } = req.body;
  
  try {
    await pool.query(`
      UPDATE invoices 
      SET stato = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [stato, req.params.id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Errore cambio stato fattura:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
