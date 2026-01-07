const pool = require('../config/database');

const updateInvoicesTable = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Aggiornamento tabella invoices...');
    
    await client.query('BEGIN');

    // Verifica se la colonna imponibile esiste già
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'invoices' AND column_name = 'imponibile'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('📝 Aggiunta colonne mancanti...');
      
      // Aggiungi colonna imponibile
      await client.query(`
        ALTER TABLE invoices 
        ADD COLUMN IF NOT EXISTS imponibile DECIMAL(10,2) DEFAULT 0
      `);

      // Aggiungi colonna created_by se non esiste
      await client.query(`
        ALTER TABLE invoices 
        ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id)
      `);

      // Aggiungi colonna updated_at se non esiste
      await client.query(`
        ALTER TABLE invoices 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);

      // Rinomina colonne vecchie se esistono
      await client.query(`
        DO $$ 
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'importo_netto') THEN
            ALTER TABLE invoices RENAME COLUMN importo_netto TO imponibile_old;
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'importo_iva') THEN
            ALTER TABLE invoices DROP COLUMN importo_iva;
          END IF;
        END $$;
      `);

      console.log('✅ Colonne aggiunte!');
    } else {
      console.log('✅ Tabella invoices già aggiornata!');
    }

    // Crea tabella invoice_items se non esiste
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
        tipologia VARCHAR(20) NOT NULL,
        descrizione TEXT NOT NULL,
        quantita DECIMAL(10,2) DEFAULT 1,
        prezzo_unitario DECIMAL(10,2) NOT NULL,
        totale DECIMAL(10,2) NOT NULL,
        ordinamento INTEGER DEFAULT 0
      )
    `);

    console.log('✅ Tabella invoice_items creata!');

    await client.query('COMMIT');
    console.log('✅ Database aggiornato con successo!');
    
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Errore aggiornamento database:', error);
    process.exit(1);
  } finally {
    client.release();
  }
};

updateInvoicesTable();
