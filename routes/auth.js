const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// Pagina login
router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Login POST
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND attivo = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.render('login', { error: 'Utente non trovato' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.render('login', { error: 'Password errata' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.nome = user.nome;
    req.session.ruolo = user.ruolo;

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Errore login:', error);
    res.render('login', { error: 'Errore del server' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
