const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    // Statistiche generali
    const statsQuotes = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE stato = 'bozza') as bozze,
        COUNT(*) FILTER (WHERE stato = 'inviato') as inviati,
        COUNT(*) FILTER (WHERE stato = 'approvato') as approvati,
        COUNT(*) as totali,
        COALESCE(SUM(totale_generale) FILTER (WHERE stato = 'approvato'), 0) as valore_approvati
      FROM quotes
    `);

    const statsWorkOrders = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE stato = 'da_iniziare') as da_iniziare,
        COUNT(*) FILTER (WHERE stato = 'in_corso') as in_corso,
        COUNT(*) FILTER (WHERE stato = 'completata') as completate,
        COUNT(*) as totali,
        COALESCE(SUM(budget_previsto), 0) as budget_totale,
        COALESCE(SUM(totale_speso), 0) as speso_totale
      FROM work_orders
    `);

    const statsHospitals = await pool.query(
      'SELECT COUNT(*) as totali FROM hospitals WHERE attivo = true'
    );

    // Preventivi recenti
    const recentQuotes = await pool.query(`
      SELECT q.*, h.nome as hospital_name, u.nome as created_by_name
      FROM quotes q
      LEFT JOIN hospitals h ON q.hospital_id = h.id
      LEFT JOIN users u ON q.created_by = u.id
      ORDER BY q.created_at DESC
      LIMIT 5
    `);

    // Commesse attive
    const activeWorkOrders = await pool.query(`
      SELECT w.*, h.nome as hospital_name
      FROM work_orders w
      LEFT JOIN hospitals h ON w.hospital_id = h.id
      WHERE w.stato IN ('da_iniziare', 'in_corso')
      ORDER BY w.data_apertura DESC
      LIMIT 5
    `);

    res.render('dashboard', {
      user: req.session,
      stats: {
        quotes: statsQuotes.rows[0],
        workOrders: statsWorkOrders.rows[0],
        hospitals: statsHospitals.rows[0]
      },
      recentQuotes: recentQuotes.rows,
      activeWorkOrders: activeWorkOrders.rows
    });
  } catch (error) {
    console.error('Errore dashboard:', error);
    res.status(500).send('Errore caricamento dashboard');
  }
});

module.exports = router;
