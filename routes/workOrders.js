const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Lista commesse
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*, h.nome as hospital_name, 
             q.numero_preventivo,
             u.nome as created_by_name
      FROM work_orders w
      LEFT JOIN hospitals h ON w.hospital_id = h.id
      LEFT JOIN quotes q ON w.quote_id = q.id
      LEFT JOIN users u ON w.created_by = u.id
      ORDER BY w.data_apertura DESC
    `);
    
    res.render('workOrders/list', {
      user: req.session,
      workOrders: result.rows
    });
  } catch (error) {
    console.error('Errore lista commesse:', error);
    res.status(500).send('Errore caricamento commesse');
  }
});

// Visualizza dettaglio commessa
router.get('/view/:id', async (req, res) => {
  try {
    const workOrder = await pool.query(`
      SELECT w.*, h.nome as hospital_name, h.indirizzo, h.citta,
             q.numero_preventivo, q.totale_generale as preventivo_totale,
             u.nome as created_by_name
      FROM work_orders w
      LEFT JOIN hospitals h ON w.hospital_id = h.id
      LEFT JOIN quotes q ON w.quote_id = q.id
      LEFT JOIN users u ON w.created_by = u.id
      WHERE w.id = $1
    `, [req.params.id]);

    if (workOrder.rows.length === 0) {
      return res.status(404).send('Commessa non trovata');
    }

    // Attività della commessa
    const activities = await pool.query(`
      SELECT wa.*, u.nome as tecnico_name
      FROM work_activities wa
      LEFT JOIN users u ON wa.tecnico_id = u.id
      WHERE wa.work_order_id = $1
      ORDER BY wa.data_attivita DESC
    `, [req.params.id]);

    // Materiali utilizzati
    const materials = await pool.query(`
      SELECT m.*, s.nome as fornitore_name
      FROM work_materials m
      LEFT JOIN suppliers s ON m.fornitore_id = s.id
      WHERE m.work_order_id = $1
    `, [req.params.id]);

    // Trasferte
    const travels = await pool.query(`
      SELECT * FROM work_travels 
      WHERE work_order_id = $1
    `, [req.params.id]);

    // Calcola totali
    const totals = {
      manodopera: activities.rows.reduce((sum, a) => sum + parseFloat(a.totale_manodopera || 0), 0),
      materiali: materials.rows.reduce((sum, m) => sum + parseFloat(m.totale || 0), 0),
      trasferte: travels.rows.reduce((sum, t) => sum + parseFloat(t.totale_trasferta || 0), 0)
    };
    totals.totale = totals.manodopera + totals.materiali + totals.trasferte;

    res.render('workOrders/view', {
      user: req.session,
      workOrder: workOrder.rows[0],
      activities: activities.rows,
      materials: materials.rows,
      travels: travels.rows,
      totals
    });
  } catch (error) {
    console.error('Errore visualizzazione commessa:', error);
    res.status(500).send('Errore visualizzazione commessa');
  }
});

// Aggiungi attività alla commessa
router.post('/add-activity/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const workOrderId = req.params.id;
    const { 
      data_attivita, 
      descrizione, 
      ore_lavoro, 
      costo_orario, 
      totale_manodopera,
      tipo_intervento,
      note,
      materiali,
      km_percorsi,
      costo_km,
      pedaggi,
      vitto,
      alloggio,
      totale_trasferta,
      note_trasferta
    } = req.body;

    // Ottieni hospital_id dalla commessa
    const workOrder = await client.query(
      'SELECT hospital_id FROM work_orders WHERE id = $1',
      [workOrderId]
    );
    const hospital_id = workOrder.rows[0].hospital_id;

    // Inserisci attività
    const activityResult = await client.query(`
      INSERT INTO work_activities (
        work_order_id, hospital_id, data_attivita, tecnico_id, descrizione,
        ore_lavoro, costo_orario, totale_manodopera, tipo_intervento, note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [
      workOrderId, 
      hospital_id, 
      data_attivita, 
      req.session.userId, 
      descrizione,
      ore_lavoro || 0, 
      costo_orario || 0, 
      totale_manodopera || 0, 
      tipo_intervento, 
      note
    ]);

    const activityId = activityResult.rows[0].id;

    // Inserisci materiali (se presenti)
    if (materiali) {
      const materialiArray = Array.isArray(materiali) ? materiali : [materiali];
      
      for (const materiale of materialiArray) {
        if (materiale.descrizione && materiale.descrizione.trim() !== '') {
          await client.query(`
            INSERT INTO work_materials (
              activity_id, work_order_id, descrizione, quantita, prezzo_unitario, totale
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            activityId,
            workOrderId,
            materiale.descrizione,
            materiale.quantita || 1,
            materiale.prezzo_unitario || 0,
            materiale.totale || 0
          ]);
        }
      }
    }

    // Inserisci trasferta (se presente)
    if (km_percorsi || pedaggi || vitto || alloggio) {
      const totale_km = (parseFloat(km_percorsi) || 0) * (parseFloat(costo_km) || 0);
      const totale_trasferta_calc = totale_km + 
                                    (parseFloat(pedaggi) || 0) + 
                                    (parseFloat(vitto) || 0) + 
                                    (parseFloat(alloggio) || 0);

      await client.query(`
        INSERT INTO work_travels (
          activity_id, work_order_id, km_percorsi, costo_km, totale_km,
          pedaggi, vitto, alloggio, totale_trasferta, note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        activityId,
        workOrderId,
        km_percorsi || 0,
        costo_km || 0,
        totale_km,
        pedaggi || 0,
        vitto || 0,
        alloggio || 0,
        totale_trasferta_calc,
        note_trasferta
      ]);
    }

    // Aggiorna totali commessa
    const totalsResult = await client.query(`
      SELECT 
        COALESCE(SUM(wa.totale_manodopera), 0) as manodopera,
        COALESCE((SELECT SUM(totale) FROM work_materials WHERE work_order_id = $1), 0) as materiali,
        COALESCE((SELECT SUM(totale_trasferta) FROM work_travels WHERE work_order_id = $1), 0) as trasferte
      FROM work_activities wa
      WHERE wa.work_order_id = $1
    `, [workOrderId]);

    const totals = totalsResult.rows[0];
    const totale_speso = parseFloat(totals.manodopera) + 
                        parseFloat(totals.materiali) + 
                        parseFloat(totals.trasferte);

    const workOrderData = await client.query(
      'SELECT budget_previsto FROM work_orders WHERE id = $1', 
      [workOrderId]
    );
    const budget = parseFloat(workOrderData.rows[0].budget_previsto) || 0;
    const scostamento = totale_speso - budget;

    await client.query(`
      UPDATE work_orders 
      SET totale_speso = $1, scostamento = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [totale_speso, scostamento, workOrderId]);

    await client.query('COMMIT');
    res.redirect(`/work-orders/view/${workOrderId}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Errore aggiunta attività:', error);
    res.status(500).send('Errore aggiunta attività');
  } finally {
    client.release();
  }
});

// Elimina attività
router.post('/delete-activity/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Ottieni work_order_id prima di eliminare
    const activity = await client.query(
      'SELECT work_order_id FROM work_activities WHERE id = $1',
      [req.params.id]
    );

    if (activity.rows.length === 0) {
      return res.status(404).send('Attività non trovata');
    }

    const workOrderId = activity.rows[0].work_order_id;

    // Elimina attività (materiali e trasferte si eliminano in cascata)
    await client.query('DELETE FROM work_activities WHERE id = $1', [req.params.id]);

    // Aggiorna totali commessa
    const totalsResult = await client.query(`
      SELECT 
        COALESCE(SUM(wa.totale_manodopera), 0) as manodopera,
        COALESCE((SELECT SUM(totale) FROM work_materials WHERE work_order_id = $1), 0) as materiali,
        COALESCE((SELECT SUM(totale_trasferta) FROM work_travels WHERE work_order_id = $1), 0) as trasferte
      FROM work_activities wa
      WHERE wa.work_order_id = $1
    `, [workOrderId]);

    const totals = totalsResult.rows[0];
    const totale_speso = parseFloat(totals.manodopera) + 
                        parseFloat(totals.materiali) + 
                        parseFloat(totals.trasferte);

    const workOrderData = await client.query(
      'SELECT budget_previsto FROM work_orders WHERE id = $1', 
      [workOrderId]
    );
    const budget = parseFloat(workOrderData.rows[0].budget_previsto) || 0;
    const scostamento = totale_speso - budget;

    await client.query(`
      UPDATE work_orders 
      SET totale_speso = $1, scostamento = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [totale_speso, scostamento, workOrderId]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Errore eliminazione attività:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// Cambia stato commessa
router.post('/status/:id', async (req, res) => {
  const { stato } = req.body;
  
  try {
    const updates = { stato };
    
    if (stato === 'completata') {
      updates.data_chiusura = new Date();
    }

    const setClause = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    await pool.query(`
      UPDATE work_orders 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
    `, values);

    res.json({ success: true });
  } catch (error) {
    console.error('Errore cambio stato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Aggiorna totali spesi
router.post('/update-totals/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(wa.totale_manodopera), 0) as manodopera,
        COALESCE((SELECT SUM(totale) FROM work_materials WHERE work_order_id = $1), 0) as materiali,
        COALESCE((SELECT SUM(totale_trasferta) FROM work_travels WHERE work_order_id = $1), 0) as trasferte
      FROM work_activities wa
      WHERE wa.work_order_id = $1
    `, [req.params.id]);

    const totals = result.rows[0];
    const totale_speso = parseFloat(totals.manodopera) + parseFloat(totals.materiali) + parseFloat(totals.trasferte);

    const workOrder = await pool.query('SELECT budget_previsto FROM work_orders WHERE id = $1', [req.params.id]);
    const budget = parseFloat(workOrder.rows[0].budget_previsto) || 0;
    const scostamento = totale_speso - budget;

    await pool.query(`
      UPDATE work_orders 
      SET totale_speso = $1, scostamento = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [totale_speso, scostamento, req.params.id]);

    res.json({ success: true, totale_speso, scostamento });
  } catch (error) {
    console.error('Errore aggiornamento totali:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
