const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 ore
  }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware autenticazione
const requireAuth = (req, res, next) => {
  // Imposta automaticamente la sessione se non esiste
  if (!req.session.userId) {
    req.session.userId = 1;
    req.session.username = 'admin';
    req.session.nome = 'Amministratore';
    req.session.ruolo = 'admin';
  }
  next();
};

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const hospitalsRoutes = require('./routes/hospitals');
const quotesRoutes = require('./routes/quotes');
const workOrdersRoutes = require('./routes/workOrders');
const activitiesRoutes = require('./routes/activities');
const invoicesRoutes = require('./routes/invoices');

// Tutte le routes ora usano requireAuth che crea automaticamente la sessione
app.use('/dashboard', requireAuth, dashboardRoutes);
app.use('/hospitals', requireAuth, hospitalsRoutes);
app.use('/quotes', requireAuth, quotesRoutes);
app.use('/work-orders', requireAuth, workOrdersRoutes);
app.use('/activities', requireAuth, activitiesRoutes);
app.use('/invoices', requireAuth, invoicesRoutes);

// Home redirect - Accesso diretto senza login
app.get('/', (req, res) => {
  req.session.userId = 1;
  req.session.username = 'admin';
  req.session.nome = 'Amministratore';
  req.session.ruolo = 'admin';
  res.redirect('/dashboard');
});

// Reindirizza anche /login alla dashboard
app.get('/login', (req, res) => {
  req.session.userId = 1;
  req.session.username = 'admin';
  req.session.nome = 'Amministratore';
  req.session.ruolo = 'admin';
  res.redirect('/dashboard');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Errore del server');
});

// Inizializza database e avvia server
const { createTables } = require('./database/schema');

const startServer = async () => {
  try {
    await createTables();
    app.listen(PORT, () => {
      console.log(`\n🏥 Hospital-Works-Med avviato su porta ${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}`);
      console.log(`👤 Accesso diretto senza login\n`);
    });
  } catch (error) {
    console.error('❌ Errore avvio server:', error);
    process.exit(1);
  }
};

startServer();
