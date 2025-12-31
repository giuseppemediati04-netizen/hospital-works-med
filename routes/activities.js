const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Lista attività
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT wa.*, h.nome as hospital_name, 
             w.numero_commessa,
             u.nome as tecnico_name
      FROM work_activities wa
      LEFT JOIN hospitals h ON wa.hospital_id = h.id
      LEFT JOIN work_orders w ON wa.work_order_id = w.id
      LEFT JOIN users u ON wa.tecnico_id = u.id
      ORDER BY wa.data_attivita DESC
      LIMIT 50
    `);
    
    res.render('activities/list', {
      user: req.session,
      activities: result.rows
    });
  } catch (error) {
    console.error('Errore lista attività:', error);
    res.status(500).send('Errore caricamento attività');
  }
});

module.exports = router;
