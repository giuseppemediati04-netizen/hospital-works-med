const pool = require('../config/database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Tabella Utenti
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        ruolo VARCHAR(20) DEFAULT 'tecnico',
        attivo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabella Ospedali/Clienti
    await client.query(`
      CREATE TABLE IF NOT EXISTS hospitals (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        indirizzo TEXT,
        citta VARCHAR(100),
        provincia VARCHAR(2),
        cap VARCHAR(10),
        partita_iva VARCHAR(20),
        codice_fiscale VARCHAR(20),
        telefono VARCHAR(50),
        email VARCHAR(100),
        referente VARCHAR(100),
        note TEXT,
        attivo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabella Fornitori
    await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        indirizzo TEXT,
        citta VARCHAR(100),
        provincia VARCHAR(2),
        partita_iva VARCHAR(20),
        telefono VARCHAR(50),
        email VARCHAR(100),
        note TEXT,
        attivo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabella Preventivi
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        numero_preventivo VARCHAR(50) UNIQUE NOT NULL,
        hospital_id INTEGER REFERENCES hospitals(id),
        descrizione TEXT NOT NULL,
        data_preventivo DATE DEFAULT CURRENT_DATE,
        data_invio DATE,
        data_approvazione DATE,
        stato VARCHAR(20) DEFAULT 'bozza',
        totale_manodopera DECIMAL(10,2) DEFAULT 0,
        totale_materiali DECIMAL(10,2) DEFAULT 0,
        totale_trasferte DECIMAL(10,2) DEFAULT 0,
        totale_generale DECIMAL(10,2) DEFAULT 0,
        note TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabella Voci Preventivo
    await client.query(`
      CREATE TABLE IF NOT EXISTS quote_items (
        id SERIAL PRIMARY KEY,
        quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
        tipologia VARCHAR(20) NOT NULL,
        descrizione TEXT NOT NULL,
        quantita DECIMAL(10,2) DEFAULT 1,
        prezzo_unitario DECIMAL(10,2) NOT NULL,
        totale DECIMAL(10,2) NOT NULL,
        ordinamento INTEGER DEFAULT 0
      )
    `);

    // Tabella Commesse
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_orders (
        id SERIAL PRIMARY KEY,
        numero_commessa VARCHAR(50) UNIQUE NOT NULL,
        quote_id INTEGER REFERENCES quotes(id),
        hospital_id INTEGER REFERENCES hospitals(id) NOT NULL,
        descrizione TEXT NOT NULL,
        data_apertura DATE DEFAULT CURRENT_DATE,
        data_chiusura DATE,
        stato VARCHAR(20) DEFAULT 'da_iniziare',
        budget_previsto DECIMAL(10,2) DEFAULT 0,
        totale_speso DECIMAL(10,2) DEFAULT 0,
        scostamento DECIMAL(10,2) DEFAULT 0,
        percentuale_completamento INTEGER DEFAULT 0,
        note TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabella Attività su Commesse
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_activities (
        id SERIAL PRIMARY KEY,
        work_order_id INTEGER REFERENCES work_orders(id) ON DELETE CASCADE,
        hospital_id INTEGER REFERENCES hospitals(id) NOT NULL,
        data_attivita DATE NOT NULL,
        tecnico_id INTEGER REFERENCES users(id),
        descrizione TEXT NOT NULL,
        ore_lavoro DECIMAL(5,2) DEFAULT 0,
        costo_orario DECIMAL(10,2) DEFAULT 0,
        totale_manodopera DECIMAL(10,2) DEFAULT 0,
        tipo_intervento VARCHAR(50),
        stato VARCHAR(20) DEFAULT 'completata',
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabella Materiali Utilizzati
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_materials (
        id SERIAL PRIMARY KEY,
        activity_id INTEGER REFERENCES work_activities(id) ON DELETE CASCADE,
        work_order_id INTEGER REFERENCES work_orders(id),
        descrizione TEXT NOT NULL,
        quantita DECIMAL(10,2) DEFAULT 1,
        prezzo_unitario DECIMAL(10,2) NOT NULL,
        totale DECIMAL(10,2) NOT NULL,
        fornitore_id INTEGER REFERENCES suppliers(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabella Trasferte
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_travels (
        id SERIAL PRIMARY KEY,
        activity_id INTEGER REFERENCES work_activities(id) ON DELETE CASCADE,
        work_order_id INTEGER REFERENCES work_orders(id),
        km_percorsi DECIMAL(10,2),
        costo_km DECIMAL(10,2) DEFAULT 0.50,
        totale_km DECIMAL(10,2),
        pedaggi DECIMAL(10,2) DEFAULT 0,
        vitto DECIMAL(10,2) DEFAULT 0,
        alloggio DECIMAL(10,2) DEFAULT 0,
        totale_trasferta DECIMAL(10,2),
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabella Fatture
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        numero_fattura VARCHAR(50) UNIQUE NOT NULL,
        work_order_id INTEGER REFERENCES work_orders(id),
        hospital_id INTEGER REFERENCES hospitals(id) NOT NULL,
        data_fattura DATE DEFAULT CURRENT_DATE,
        data_scadenza DATE,
        importo_netto DECIMAL(10,2) NOT NULL,
        iva DECIMAL(10,2) DEFAULT 22,
        importo_iva DECIMAL(10,2),
        totale_fattura DECIMAL(10,2) NOT NULL,
        stato VARCHAR(20) DEFAULT 'emessa',
        data_pagamento DATE,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('✅ Tabelle create con successo!');

    // Crea utente admin di default
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (username, password, nome, ruolo)
      VALUES ('admin', $1, 'Amministratore', 'admin')
      ON CONFLICT (username) DO NOTHING
    `, [hashedPassword]);

    console.log('✅ Utente admin creato (username: admin, password: admin123)');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Errore creazione tabelle:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { createTables };
