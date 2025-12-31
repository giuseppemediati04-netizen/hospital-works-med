# 🚀 Deploy Hospital-Works-Med su Render.com

Guida completa per pubblicare il gestionale su Render.com usando Git/GitHub.

---

## 📋 PREREQUISITI

1. **Account GitHub** - https://github.com
2. **Account Render.com** - https://render.com (puoi loggarti con GitHub)
3. **Git installato** sul tuo PC

---

## 🔧 PARTE 1: SETUP GIT E GITHUB

### Step 1: Crea Repository su GitHub

1. Vai su https://github.com
2. Clicca su **"New Repository"** (pulsante verde in alto a destra)
3. Compila:
   - **Repository name:** `Hospital-Works-Med`
   - **Description:** `Gestionale Manutenzione Ospedaliera`
   - **Visibilità:** Private (consigliato) o Public
   - ⚠️ **NON** selezionare "Initialize with README" (lo abbiamo già)
4. Clicca **"Create repository"**

### Step 2: Carica il Progetto su GitHub

Apri il terminale nella cartella del progetto ed esegui:

```bash
# Se non l'hai già fatto, estrai l'archivio
tar -xzf Hospital-Works-Med.tar.gz
cd Hospital-Works-Med

# Inizializza Git (se non già fatto)
git init

# Aggiungi tutti i file
git add .

# Fai il primo commit
git commit -m "Initial commit - Hospital-Works-Med v1.0"

# Collega al repository GitHub (sostituisci TUO_USERNAME)
git remote add origin https://github.com/TUO_USERNAME/Hospital-Works-Med.git

# Pusha il codice
git branch -M main
git push -u origin main
```

**Nota:** Ti verrà chiesto username e password GitHub. Per la password usa un **Personal Access Token**:
1. GitHub → Settings → Developer settings → Personal access tokens → Generate new token
2. Seleziona scope "repo"
3. Copia il token e usalo come password

---

## 🌐 PARTE 2: DEPLOY SU RENDER.COM

### Step 1: Crea Database PostgreSQL

1. Vai su https://dashboard.render.com
2. Clicca **"New +"** → **"PostgreSQL"**
3. Compila:
   - **Name:** `hospital-works-med-db`
   - **Database:** `hospital_works_med`
   - **User:** (lascia default)
   - **Region:** Frankfurt (o quello più vicino)
   - **Plan:** Free
4. Clicca **"Create Database"**
5. **IMPORTANTE:** Copia la **"Internal Database URL"** (la userai dopo)

### Step 2: Crea Web Service

1. Torna alla Dashboard di Render
2. Clicca **"New +"** → **"Web Service"**
3. Clicca **"Connect a repository"** e connetti GitHub
4. Seleziona il repository **Hospital-Works-Med**
5. Compila:
   - **Name:** `hospital-works-med`
   - **Region:** Frankfurt (stesso del database)
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Step 3: Configura Variabili d'Ambiente

Nella sezione **"Environment Variables"**, aggiungi:

```
NODE_ENV = production
SESSION_SECRET = your_random_secret_key_here_change_this_123456
DATABASE_URL = [Incolla qui la Internal Database URL copiata prima]
```

**Per SESSION_SECRET**, genera una stringa casuale sicura, es:
```
hospital_med_2025_secret_key_giuseppe_xyz123abc
```

### Step 4: Deploy!

1. Clicca **"Create Web Service"**
2. Render inizierà automaticamente il deploy
3. Aspetta che finisca (circa 2-3 minuti)
4. Quando vedi **"Live"** in verde, clicca sul link!

Il tuo gestionale sarà disponibile su: `https://hospital-works-med.onrender.com`

---

## 🔄 AGGIORNARE IL SITO (dopo modifiche)

Ogni volta che modifichi il codice:

```bash
# Salva le modifiche
git add .
git commit -m "Descrizione delle modifiche"
git push

# Render rileverà automaticamente il push e rifarà il deploy!
```

---

## 🎯 ACCESSO AL GESTIONALE

Una volta deployato:

1. Vai su `https://hospital-works-med.onrender.com`
2. Login con:
   - **Username:** `admin`
   - **Password:** `admin123`
3. **⚠️ IMPORTANTE:** Cambia subito la password!

---

## 🐛 TROUBLESHOOTING

### Problema: "Application failed to respond"
**Soluzione:** Controlla i logs su Render Dashboard → Logs

### Problema: Errore connessione database
**Soluzione:** Verifica che `DATABASE_URL` sia corretta nelle variabili d'ambiente

### Problema: Build fallito
**Soluzione:** Controlla che il file `package.json` sia corretto

### Il sito è lento dopo inattività
**Soluzione:** Il piano Free di Render "dorme" dopo 15 minuti di inattività. Il primo accesso dopo inattività può richiedere 30-50 secondi per "svegliarsi".

---

## 📊 MONITORAGGIO

Su Render Dashboard puoi:
- ✅ Vedere lo stato del servizio
- 📝 Leggere i logs in tempo reale
- 📈 Monitorare l'uso risorse
- 🔄 Fare manual deploy
- ⚙️ Modificare variabili d'ambiente

---

## 🔐 SICUREZZA

### Raccomandazioni:

1. **Cambia password admin** dopo il primo accesso
2. **Usa HTTPS** (Render lo fornisce automaticamente)
3. **Non committare mai** il file `.env` su GitHub
4. **Usa variabili d'ambiente** su Render per le credenziali
5. **Backup database** regolarmente (esporta da Render dashboard)

---

## 💾 BACKUP DATABASE

Per fare backup del database:

1. Vai su Render Dashboard → Database
2. Clicca sul database `hospital-works-med-db`
3. Vai su **"Backups"**
4. Render fa backup automatici (piano Free: 7 giorni retention)
5. Puoi anche fare **"Manual Backup"**

---

## 📞 SUPPORTO

**Documentazione Render:** https://render.com/docs
**GitHub Help:** https://docs.github.com

---

## ✅ CHECKLIST DEPLOY

- [ ] Repository GitHub creato
- [ ] Codice pushato su GitHub
- [ ] Database PostgreSQL creato su Render
- [ ] Web Service creato su Render
- [ ] Variabili d'ambiente configurate
- [ ] Deploy completato (status "Live")
- [ ] Accesso al sito funzionante
- [ ] Login admin funzionante
- [ ] Password admin cambiata
- [ ] Test creazione ospedale
- [ ] Test creazione preventivo
- [ ] Test conversione in commessa

---

**🎉 Complimenti! Il tuo gestionale è online!**

---

## 🔄 WORKFLOW GIORNALIERO

```bash
# Mattina: inizia a lavorare
cd Hospital-Works-Med
git pull  # Scarica eventuali modifiche

# Durante il giorno: fai modifiche...

# Fine giornata: salva il lavoro
git add .
git commit -m "Descrizione di cosa hai fatto oggi"
git push

# Render farà automaticamente il deploy!
```

---

**Hospital-Works-Med** - Deploy Guide v1.0  
Giuseppe © 2025
