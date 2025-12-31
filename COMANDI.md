# 🎯 COMANDI PRONTI - Hospital-Works-Med

Copia e incolla questi comandi nel terminale per velocizzare il deploy.

---

## 📦 1. ESTRAZIONE E SETUP INIZIALE

```bash
# Estrai l'archivio
tar -xzf Hospital-Works-Med-Git-Ready.tar.gz

# Entra nella cartella
cd Hospital-Works-Med

# Verifica che tutto sia ok
ls -la

# Installa dipendenze (per test locale)
npm install
```

---

## 🔧 2. CONFIGURAZIONE GIT

### Opzione A: Setup Automatico (Consigliato)
```bash
# Esegui lo script di setup
./setup-git.sh

# Quando richiesto, inserisci il tuo username GitHub
# Esempio: giuseppe123
```

### Opzione B: Setup Manuale
```bash
# Configura Git
git config user.name "Giuseppe"
git config user.email "tua-email@example.com"

# Inizializza repository
git init

# Aggiungi tutti i file
git add .

# Primo commit
git commit -m "Initial commit - Hospital-Works-Med v1.0"

# Collega a GitHub (sostituisci TUO_USERNAME)
git remote add origin https://github.com/TUO_USERNAME/Hospital-Works-Med.git

# Rinomina branch
git branch -M main
```

---

## 📤 3. PUSH SU GITHUB

```bash
# Push del codice
git push -u origin main

# Ti verrà chiesto:
# Username: [il tuo username GitHub]
# Password: [il tuo Personal Access Token]
```

### Come ottenere il Personal Access Token:
```
1. Vai su GitHub.com
2. Click sulla tua foto profilo → Settings
3. Developer settings (in fondo alla sidebar)
4. Personal access tokens → Tokens (classic)
5. Generate new token (classic)
6. Seleziona scope "repo"
7. Generate token
8. COPIA IL TOKEN (non lo vedrai più!)
9. Usa il token come password nel comando git push
```

---

## 🚀 4. TEST LOCALE (Opzionale)

Prima di deployare su Render, puoi testare in locale:

```bash
# Crea database PostgreSQL locale
# (assicurati di avere PostgreSQL installato)
createdb hospital_works_med

# Configura .env
cp .env.example .env
# Poi modifica .env con i tuoi dati locali

# Avvia il server
npm start

# Apri browser su: http://localhost:3000
# Login: admin / admin123
```

---

## 🔄 5. AGGIORNAMENTI FUTURI

Ogni volta che modifichi il codice:

```bash
# Verifica cosa è cambiato
git status

# Aggiungi le modifiche
git add .

# Crea commit con messaggio descrittivo
git commit -m "Descrizione delle modifiche fatte"

# Pusha su GitHub
git push

# Render farà automaticamente il deploy!
```

---

## 📊 6. COMANDI UTILI GIT

```bash
# Vedi lo stato del repository
git status

# Vedi la cronologia dei commit
git log --oneline

# Vedi le differenze non ancora committate
git diff

# Scarica gli ultimi aggiornamenti
git pull

# Crea un nuovo branch
git checkout -b nome-branch

# Torna al branch main
git checkout main
```

---

## 🗄️ 7. COMANDI DATABASE (su Render)

Connettiti al database da terminale (dopo aver copiato External Database URL da Render):

```bash
# Connessione al database Render
psql [EXTERNAL_DATABASE_URL]

# Una volta connesso, comandi utili:
\dt                    # Lista tabelle
\d users               # Struttura tabella users
SELECT * FROM users;   # Vedi utenti
\q                     # Esci
```

---

## 🐛 8. DEBUG E TROUBLESHOOTING

```bash
# Vedi i logs di Render in tempo reale
# (fallo dalla dashboard Render)

# Test connessione database locale
psql -U username -d hospital_works_med -c "SELECT version();"

# Verifica versione Node.js
node --version

# Verifica versione npm
npm --version

# Reinstalla dipendenze se ci sono problemi
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 9. ESEMPI DI COMMIT MESSAGES

```bash
# Buoni esempi:
git commit -m "Aggiunto export PDF preventivi"
git commit -m "Fix calcolo totali preventivo"
git commit -m "Migliorata UI dashboard"
git commit -m "Aggiunte validazioni form ospedali"

# Da evitare:
git commit -m "fix"
git commit -m "aggiornamento"
git commit -m "wip"
```

---

## 🎨 10. PERSONALIZZAZIONI RAPIDE

### Cambia il nome visualizzato:
```bash
# Modifica in views/partials/header.ejs linea ~22:
<a class="navbar-brand" href="/dashboard">
    <i class="bi bi-hospital"></i> TUO NOME
</a>
```

### Cambia colori tema:
```bash
# Modifica in public/css/style.css
# Cerca .navbar-brand, .btn-primary, etc.
```

---

## 🔐 11. GESTIONE PASSWORD

### Cambia password admin via database:
```sql
-- Connettiti al database e esegui:
UPDATE users 
SET password = '$2a$10$...'  -- genera hash con bcrypt
WHERE username = 'admin';
```

### Genera hash password con Node.js:
```javascript
// Crea file test-password.js:
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('nuova_password', 10);
console.log(hash);
```

---

## 📞 12. LINK UTILI

```
GitHub Repository: https://github.com/TUO_USERNAME/Hospital-Works-Med
Render Dashboard: https://dashboard.render.com
Gestionale Live: https://hospital-works-med.onrender.com

Documentazione:
- Node.js: https://nodejs.org/docs
- Express: https://expressjs.com
- PostgreSQL: https://www.postgresql.org/docs
- Render: https://render.com/docs
```

---

**💡 TIP:** Salva questo file come riferimento rapido!

Puoi stamparlo o tenerlo aperto mentre lavori al progetto.

---

**Buon lavoro Giuseppe! 🚀**
