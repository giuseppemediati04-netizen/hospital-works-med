# ⚡ QUICK START - Hospital-Works-Med

## 🎯 Deploy in 10 Minuti

### 1️⃣ CREA REPOSITORY GITHUB (2 min)
```
1. Vai su github.com
2. Clicca "New Repository"
3. Nome: Hospital-Works-Med
4. Visibilità: Private
5. Clicca "Create repository"
```

### 2️⃣ CARICA IL CODICE (3 min)
```bash
# Estrai archivio
tar -xzf Hospital-Works-Med.tar.gz
cd Hospital-Works-Med

# Setup Git automatico
./setup-git.sh
# (inserisci il tuo username GitHub quando richiesto)

# Push su GitHub
git push -u origin main
# (usa Personal Access Token come password)
```

### 3️⃣ DEPLOY SU RENDER (5 min)
```
1. Vai su render.com (login con GitHub)

2. Crea Database:
   - New + → PostgreSQL
   - Name: hospital-works-med-db
   - Free plan
   - COPIA la "Internal Database URL"

3. Crea Web Service:
   - New + → Web Service
   - Connetti repository "Hospital-Works-Med"
   - Name: hospital-works-med
   - Build: npm install
   - Start: npm start
   - Free plan

4. Aggiungi Environment Variables:
   NODE_ENV = production
   SESSION_SECRET = hospital_med_secret_2025_xyz
   DATABASE_URL = [incolla URL database]

5. Clicca "Create Web Service"
   ASPETTA 2-3 MINUTI

6. Quando vedi "Live" → FATTO! 🎉
```

### 4️⃣ ACCEDI AL GESTIONALE
```
URL: https://hospital-works-med.onrender.com
Username: admin
Password: admin123

⚠️ CAMBIA LA PASSWORD SUBITO!
```

---

## 🔄 Per Aggiornare Dopo Modifiche
```bash
git add .
git commit -m "tue modifiche"
git push
# Render fa il deploy automaticamente!
```

---

## 📁 File Importanti
- `DEPLOY.md` - Guida completa dettagliata
- `README.md` - Documentazione progetto
- `.env` - Configurazione locale (NON committare!)
- `render.yaml` - Configurazione Render

---

## 🆘 Problemi?
Leggi `DEPLOY.md` sezione TROUBLESHOOTING

---

**Tutto chiaro? Inizia con il passo 1!** 🚀
