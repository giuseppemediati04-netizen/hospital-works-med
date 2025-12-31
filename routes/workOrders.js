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
