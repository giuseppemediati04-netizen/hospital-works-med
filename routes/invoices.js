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

module.exports = router;
