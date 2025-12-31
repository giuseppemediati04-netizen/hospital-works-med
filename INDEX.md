# 📚 INDICE DOCUMENTAZIONE - Hospital-Works-Med

Questa cartella contiene tutta la documentazione per usare e deployare il gestionale.

---

## 🎯 INIZIO RAPIDO

**Sei alle prime armi?** Inizia da qui:

1. **[QUICKSTART.md](QUICKSTART.md)** ⚡  
   Deploy in 10 minuti - Guida velocissima passo-passo

2. **[CHECKLIST.md](CHECKLIST.md)** ✅  
   Checklist da seguire per non dimenticare nulla

---

## 📖 DOCUMENTAZIONE COMPLETA

### Guide per il Deploy

- **[DEPLOY.md](DEPLOY.md)** 🚀  
  Guida completa e dettagliata per deploy su Render.com  
  *Include: setup Git, GitHub, Render, troubleshooting*

- **[COMANDI.md](COMANDI.md)** 💻  
  Tutti i comandi pronti da copiare e incollare  
  *Include: Git, database, debug, personalizzazioni*

### Documentazione Progetto

- **[README.md](README.md)** 📋  
  Documentazione generale del progetto  
  *Include: funzionalità, installazione locale, struttura*

---

## 🛠️ FILE CONFIGURAZIONE

- **[render.yaml](render.yaml)**  
  Configurazione automatica per Render.com

- **[setup-git.sh](setup-git.sh)**  
  Script bash per setup automatico Git/GitHub

- **[.env.example](.env.example)**  
  Template per variabili d'ambiente

- **[.gitignore](.gitignore)**  
  File da escludere da Git

---

## 📊 STRUTTURA CARTELLE

```
Hospital-Works-Med/
│
├── 📄 Documentazione
│   ├── INDEX.md (questo file)
│   ├── QUICKSTART.md
│   ├── CHECKLIST.md
│   ├── DEPLOY.md
│   ├── COMANDI.md
│   └── README.md
│
├── 🔧 Configurazione
│   ├── .env.example
│   ├── .gitignore
│   ├── render.yaml
│   ├── setup-git.sh
│   └── package.json
│
├── 💻 Codice Backend
│   ├── server.js
│   ├── config/
│   │   └── database.js
│   ├── database/
│   │   └── schema.js
│   └── routes/
│       ├── auth.js
│       ├── dashboard.js
│       ├── hospitals.js
│       ├── quotes.js
│       ├── workOrders.js
│       ├── activities.js
│       └── invoices.js
│
├── 🎨 Frontend
│   ├── views/
│   │   ├── partials/
│   │   ├── hospitals/
│   │   ├── quotes/
│   │   ├── workOrders/
│   │   ├── activities/
│   │   ├── invoices/
│   │   ├── login.ejs
│   │   └── dashboard.ejs
│   └── public/
│       ├── css/style.css
│       └── js/main.js
│
└── 📦 Dependencies
    └── package.json
```

---

## 🎯 PERCORSI CONSIGLIATI

### 👨‍💻 Per Sviluppatori
```
1. README.md (panoramica progetto)
2. DEPLOY.md (setup completo)
3. COMANDI.md (reference rapido)
```

### 🚀 Per Deploy Veloce
```
1. QUICKSTART.md (10 minuti)
2. CHECKLIST.md (verifica completa)
```

### 🔧 Per Troubleshooting
```
1. DEPLOY.md → sezione Troubleshooting
2. COMANDI.md → sezione Debug
3. Render Dashboard → Logs
```

---

## 📝 COME USARE QUESTA DOCUMENTAZIONE

### Scenario 1: "Voglio deployare subito!"
```
→ Apri QUICKSTART.md
→ Segui i 4 passi
→ Usa CHECKLIST.md per verificare
```

### Scenario 2: "Voglio capire tutto nei dettagli"
```
→ Leggi README.md
→ Studia DEPLOY.md
→ Tieni aperto COMANDI.md per reference
```

### Scenario 3: "Ho un problema"
```
→ Controlla DEPLOY.md (Troubleshooting)
→ Prova i comandi in COMANDI.md (Debug)
→ Verifica CHECKLIST.md (cosa manca?)
```

### Scenario 4: "Devo fare modifiche"
```
→ COMANDI.md → sezione "Aggiornamenti futuri"
→ Modifica codice
→ git add, commit, push
→ Render deploya automaticamente!
```

---

## 🔍 RICERCA VELOCE

**Cerchi info su...?**

- **Git/GitHub**: DEPLOY.md (parte 1), COMANDI.md (sezioni 2-3)
- **Render.com**: DEPLOY.md (parte 2), QUICKSTART.md
- **Database**: COMANDI.md (sezione 7), DEPLOY.md
- **Variabili d'ambiente**: .env.example, DEPLOY.md (step 3)
- **Troubleshooting**: DEPLOY.md (fine), COMANDI.md (sezione 8)
- **Modifiche codice**: COMANDI.md (sezioni 5, 10)
- **Comandi Git**: COMANDI.md (sezione 6)
- **Test locale**: README.md (Installazione), COMANDI.md (sezione 4)

---

## 🆘 AIUTO RAPIDO

**Problemi comuni:**

| Problema | Dove guardare |
|----------|---------------|
| Build fallito su Render | DEPLOY.md → Troubleshooting |
| Errore database | DEPLOY.md → Step 3, COMANDI.md → sezione 7 |
| Git push non funziona | COMANDI.md → sezione 3 (Personal Token) |
| Sito lento | DEPLOY.md → "Il sito è lento..." |
| Cambiare password | COMANDI.md → sezione 11 |
| Non ricordo i comandi | COMANDI.md |

---

## 📞 SUPPORTO

1. Leggi la documentazione pertinente
2. Controlla i logs su Render Dashboard
3. Verifica la CHECKLIST.md
4. Prova i comandi in COMANDI.md (sezione Debug)

---

## ✨ TIPS

- 💾 **Bookmark questo file** per trovare velocemente le info
- 📋 **Stampa CHECKLIST.md** per averla sottomano
- 💻 **Tieni aperto COMANDI.md** mentre lavori
- 🔖 **Segna le pagine** importanti con il browser

---

**Buon lavoro con Hospital-Works-Med! 🏥**

*Tutte le guide sono in italiano e pensate per essere chiare e pratiche.*

---

**Ultimo aggiornamento:** 31 Dicembre 2025  
**Versione:** 1.0.0
