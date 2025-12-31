const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Lista ospedali
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM hospitals 
      WHERE attivo = true 
      ORDER BY nome
    `);
    
    res.render('hospitals/list', {
      user: req.session,
      hospitals: result.rows
    });
  } catch (error) {
    console.error('Errore lista ospedali:', error);
    res.status(500).send('Errore caricamento ospedali');
  }
});

// Form nuovo ospedale
router.get('/new', (req, res) => {
  res.render('hospitals/form', {
    user: req.session,
    hospital: null,
    error: null
  });
});

// Crea ospedale
router.post('/create', async (req, res) => {
  const { nome, indirizzo, citta, provincia, cap, partita_iva, codice_fiscale, telefono, email, referente, note } = req.body;

  try {
    await pool.query(`
      INSERT INTO hospitals (nome, indirizzo, citta, provincia, cap, partita_iva, codice_fiscale, telefono, email, referente, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [nome, indirizzo, citta, provincia, cap, partita_iva, codice_fiscale, telefono, email, referente, note]);

    res.redirect('/hospitals');
  } catch (error) {
    console.error('Errore creazione ospedale:', error);
    res.render('hospitals/form', {
      user: req.session,
      hospital: req.body,
      error: 'Errore salvataggio ospedale'
    });
  }
});

// Form modifica ospedale
router.get('/edit/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hospitals WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).send('Ospedale non trovato');
    }

    res.render('hospitals/form', {
      user: req.session,
      hospital: result.rows[0],
      error: null
    });
  } catch (error) {
    console.error('Errore caricamento ospedale:', error);
    res.status(500).send('Errore caricamento ospedale');
  }
});

// Aggiorna ospedale
router.post('/update/:id', async (req, res) => {
  const { nome, indirizzo, citta, provincia, cap, partita_iva, codice_fiscale, telefono, email, referente, note } = req.body;

  try {
    await pool.query(`
      UPDATE hospitals 
      SET nome = $1, indirizzo = $2, citta = $3, provincia = $4, cap = $5,
          partita_iva = $6, codice_fiscale = $7, telefono = $8, email = $9,
          referente = $10, note = $11
      WHERE id = $12
    `, [nome, indirizzo, citta, provincia, cap, partita_iva, codice_fiscale, telefono, email, referente, note, req.params.id]);

    res.redirect('/hospitals');
  } catch (error) {
    console.error('Errore aggiornamento ospedale:', error);
    res.status(500).send('Errore aggiornamento ospedale');
  }
});

// Elimina (disattiva) ospedale
router.post('/delete/:id', async (req, res) => {
  try {
    await pool.query('UPDATE hospitals SET attivo = false WHERE id = $1', [req.params.id]);
    res.redirect('/hospitals');
  } catch (error) {
    console.error('Errore eliminazione ospedale:', error);
    res.status(500).send('Errore eliminazione ospedale');
  }
});

module.exports = router;
