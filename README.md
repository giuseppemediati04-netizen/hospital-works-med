# Hospital-Works-Med

## Gestionale Manutenzione Ospedaliera
Sistema completo per la gestione di preventivi, commesse e attività di manutenzione ospedaliera.

---

## 🚀 Funzionalità Principali

### 1. **Gestione Ospedali**
- Anagrafica clienti/ospedali completa
- Dati fiscali e contatti
- Referenti

### 2. **Preventivi**
- Creazione preventivi con voci dettagliate
- Categorie: Manodopera, Materiali, Trasferte
- Stati: Bozza → Inviato → Approvato/Rifiutato
- Calcolo automatico totali
- Stampa preventivo

### 3. **Commesse**
- Conversione automatica da preventivi approvati
- Tracking budget vs speso
- Gestione stati: Da Iniziare → In Corso → Completata → Fatturata
- Calcolo scostamenti
- Dashboard avanzamento

### 4. **Attività**
- Registrazione interventi giornalieri
- Collegamento a commesse
- Tracking ore e costi
- Gestione materiali e trasferte

### 5. **Fatturazione**
- Generazione fatture da commesse completate
- Gestione scadenze e pagamenti

---

## 📋 Requisiti

- Node.js 14+
- PostgreSQL 12+
- npm o yarn

---

## 🔧 Installazione

### 1. Clona il repository
```bash
git clone <repository-url>
cd Hospital-Works-Med
```

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Configura il database
Crea un database PostgreSQL e aggiorna il file `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/hospital_works_med
SESSION_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

### 4. Avvia il server
```bash
npm start
```

L'applicazione sarà disponibile su: **http://localhost:3000**

---

## 👤 Credenziali Default

- **Username:** `admin`
- **Password:** `admin123`

> ⚠️ **IMPORTANTE:** Cambia la password dopo il primo accesso!

---

## 📁 Struttura del Progetto

```
Hospital-Works-Med/
├── config/
│   └── database.js          # Configurazione database
├── database/
│   └── schema.js            # Schema tabelle
├── routes/
│   ├── auth.js              # Autenticazione
│   ├── dashboard.js         # Dashboard
│   ├── hospitals.js         # Ospedali
│   ├── quotes.js            # Preventivi
│   ├── workOrders.js        # Commesse
│   ├── activities.js        # Attività
│   └── invoices.js          # Fatture
├── views/
│   ├── partials/
│   ├── hospitals/
│   ├── quotes/
│   ├── workOrders/
│   ├── activities/
│   ├── invoices/
│   ├── login.ejs
│   └── dashboard.ejs
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── .env
├── server.js
└── package.json
```

---

## 🗄️ Database

Il sistema crea automaticamente le seguenti tabelle:

- `users` - Utenti sistema
- `hospitals` - Anagrafica ospedali
- `suppliers` - Fornitori
- `quotes` - Preventivi
- `quote_items` - Voci preventivo
- `work_orders` - Commesse
- `work_activities` - Attività su commesse
- `work_materials` - Materiali utilizzati
- `work_travels` - Trasferte
- `invoices` - Fatture

---

## 🔄 Flusso di Lavoro

1. **Crea Ospedale** → Inserisci anagrafica cliente
2. **Crea Preventivo** → Aggiungi voci di costo
3. **Invia Preventivo** → Cambia stato in "Inviato"
4. **Approva Preventivo** → Segna come approvato
5. **Crea Commessa** → Converti preventivo in commessa
6. **Registra Attività** → Tracking lavori eseguiti
7. **Completa Commessa** → Chiudi i lavori
8. **Genera Fattura** → Emetti fattura

---

## 🚀 Deploy su Render.com

### 1. Crea PostgreSQL Database su Render
- Vai su Render.com
- Crea un nuovo PostgreSQL Database
- Copia la `DATABASE_URL`

### 2. Crea Web Service
- Collega il repository GitHub
- Imposta variabili d'ambiente:
  - `DATABASE_URL`
  - `SESSION_SECRET`
  - `NODE_ENV=production`

### 3. Deploy
Render deploierà automaticamente l'applicazione!

---

## 🛠️ Tecnologie Utilizzate

- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Template Engine:** EJS
- **Frontend:** Bootstrap 5 + Bootstrap Icons
- **Session:** express-session
- **Sicurezza:** bcryptjs

---

## 📝 TODO / Prossime Funzionalità

- [ ] Export PDF preventivi
- [ ] Invio email preventivi
- [ ] Calendario attività
- [ ] Report statistici avanzati
- [ ] Export Excel
- [ ] Multi-utente con ruoli
- [ ] Notifiche scadenze
- [ ] Dashboard grafica avanzata

---

## 🐛 Bug Reporting

Per segnalare bug o richiedere funzionalità, apri una issue su GitHub.

---

## 📄 Licenza

Proprietario: Giuseppe  
Uso interno aziendale

---

## 👨‍💻 Autore

**Giuseppe**  
Gestionale sviluppato per la gestione manutenzione ospedaliera

---

**Hospital-Works-Med v1.0.0** - © 2025
