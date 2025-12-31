const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Lista preventivi
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.*, h.nome as hospital_name, u.nome as created_by_name
      FROM quotes q
      LEFT JOIN hospitals h ON q.hospital_id = h.id
      LEFT JOIN users u ON q.created_by = u.id
      ORDER BY q.created_at DESC
    `);
    
    res.render('quotes/list', {
      user: req.session,
      quotes: result.rows
    });
  } catch (error) {
    console.error('Errore lista preventivi:', error);
    res.status(500).send('Errore caricamento preventivi');
  }
});

// Form nuovo preventivo
router.get('/new', async (req, res) => {
  try {
    const hospitals = await pool.query('SELECT * FROM hospitals WHERE attivo = true ORDER BY nome');
    
    res.render('quotes/form', {
      user: req.session,
      quote: null,
      hospitals: hospitals.rows,
      items: [],
      error: null
    });
  } catch (error) {
    console.error('Errore form preventivo:', error);
    res.status(500).send('Errore caricamento form');
  }
});

// Crea preventivo
router.post('/create', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { hospital_id, descrizione, note, items } = req.body;
    
    // Genera numero preventivo
    const yearResult = await client.query("SELECT EXTRACT(YEAR FROM CURRENT_DATE) as year");
    const year = yearResult.rows[0].year;
    const countResult = await client.query(
      "SELECT COUNT(*) as count FROM quotes WHERE EXTRACT(YEAR FROM data_preventivo) = $1",
      [year]
    );
    const numero_preventivo = `PREV-${year}-${String(parseInt(countResult.rows[0].count) + 1).padStart(4, '0')}`;

    // Calcola totali
    let totale_manodopera = 0, totale_materiali = 0, totale_trasferte = 0;
    
    const itemsArray = Array.isArray(items) ? items : [items];
    itemsArray.forEach(item => {
      const totale = parseFloat(item.totale) || 0;
      if (item.tipologia === 'manodopera') totale_manodopera += totale;
      else if (item.tipologia === 'materiale') totale_materiali += totale;
      else if (item.tipologia === 'trasferta') totale_trasferte += totale;
    });

    const totale_generale = totale_manodopera + totale_materiali + totale_trasferte;

    // Inserisci preventivo
    const quoteResult = await client.query(`
      INSERT INTO quotes (numero_preventivo, hospital_id, descrizione, totale_manodopera, 
                         totale_materiali, totale_trasferte, totale_generale, note, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [numero_preventivo, hospital_id, descrizione, totale_manodopera, totale_materiali, 
        totale_trasferte, totale_generale, note, req.session.userId]);

    const quote_id = quoteResult.rows[0].id;

    // Inserisci voci preventivo
    for (let i = 0; i < itemsArray.length; i++) {
      const item = itemsArray[i];
      await client.query(`
        INSERT INTO quote_items (quote_id, tipologia, descrizione, quantita, prezzo_unitario, totale, ordinamento)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [quote_id, item.tipologia, item.descrizione, item.quantita, item.prezzo_unitario, item.totale, i]);
    }

    await client.query('COMMIT');
    res.redirect('/quotes');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Errore creazione preventivo:', error);
    res.status(500).send('Errore creazione preventivo');
  } finally {
    client.release();
  }
});

// Visualizza dettaglio preventivo
router.get('/view/:id', async (req, res) => {
  try {
    const quote = await pool.query(`
      SELECT q.*, h.nome as hospital_name, h.indirizzo, h.citta, h.partita_iva,
             u.nome as created_by_name
      FROM quotes q
      LEFT JOIN hospitals h ON q.hospital_id = h.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = $1
    `, [req.params.id]);

    if (quote.rows.length === 0) {
      return res.status(404).send('Preventivo non trovato');
    }

    const items = await pool.query(`
      SELECT * FROM quote_items 
      WHERE quote_id = $1 
      ORDER BY ordinamento
    `, [req.params.id]);

    res.render('quotes/view', {
      user: req.session,
      quote: quote.rows[0],
      items: items.rows
    });
  } catch (error) {
    console.error('Errore visualizzazione preventivo:', error);
    res.status(500).send('Errore visualizzazione preventivo');
  }
});

// Cambia stato preventivo
router.post('/status/:id', async (req, res) => {
  const { stato } = req.body;
  
  try {
    const updateData = { stato };
    
    if (stato === 'inviato') {
      updateData.data_invio = new Date();
    } else if (stato === 'approvato') {
      updateData.data_approvazione = new Date();
    }

    const setClause = Object.keys(updateData).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(updateData), req.params.id];

    await pool.query(`
      UPDATE quotes 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
    `, values);

    res.json({ success: true });
  } catch (error) {
    console.error('Errore cambio stato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Converti preventivo in commessa
router.post('/convert-to-workorder/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Verifica che il preventivo sia approvato
    const quote = await client.query('SELECT * FROM quotes WHERE id = $1 AND stato = $2', 
                                     [req.params.id, 'approvato']);
    
    if (quote.rows.length === 0) {
      throw new Error('Il preventivo deve essere approvato prima di creare la commessa');
    }

    const q = quote.rows[0];

    // Genera numero commessa
    const yearResult = await client.query("SELECT EXTRACT(YEAR FROM CURRENT_DATE) as year");
    const year = yearResult.rows[0].year;
    const countResult = await client.query(
      "SELECT COUNT(*) as count FROM work_orders WHERE EXTRACT(YEAR FROM data_apertura) = $1",
      [year]
    );
    const numero_commessa = `COM-${year}-${String(parseInt(countResult.rows[0].count) + 1).padStart(4, '0')}`;

    // Crea commessa
    await client.query(`
      INSERT INTO work_orders (numero_commessa, quote_id, hospital_id, descrizione, 
                              budget_previsto, stato, created_by)
      VALUES ($1, $2, $3, $4, $5, 'da_iniziare', $6)
    `, [numero_commessa, q.id, q.hospital_id, q.descrizione, q.totale_generale, req.session.userId]);

    await client.query('COMMIT');
    res.redirect('/work-orders');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Errore conversione in commessa:', error);
    res.status(500).send(error.message);
  } finally {
    client.release();
  }
});

module.exports = router;
