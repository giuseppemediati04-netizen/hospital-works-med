# ✅ CHECKLIST DEPLOY - Hospital-Works-Med

Segui questa checklist passo-passo per deployare il gestionale.

---

## 📦 PREPARAZIONE LOCALE

- [ ] Archivio estratto
- [ ] Cartella aperta nel terminale
- [ ] Node.js installato (verifica: `node --version`)
- [ ] Git installato (verifica: `git --version`)
- [ ] Account GitHub creato

---

## 🌐 GITHUB

- [ ] Repository "Hospital-Works-Med" creato su GitHub
- [ ] Repository impostato come Private (consigliato)
- [ ] Personal Access Token generato (Settings → Developer settings)
- [ ] Script `setup-git.sh` eseguito
- [ ] Codice pushato su GitHub (`git push -u origin main`)
- [ ] Repository visibile su GitHub

---

## 🗄️ RENDER.COM - DATABASE

- [ ] Account Render.com creato (login con GitHub)
- [ ] Nuovo PostgreSQL database creato
- [ ] Nome database: `hospital-works-med-db`
- [ ] Region: Frankfurt
- [ ] Plan: Free
- [ ] **Internal Database URL** copiata e salvata

---

## 🌍 RENDER.COM - WEB SERVICE

- [ ] Nuovo Web Service creato
- [ ] Repository "Hospital-Works-Med" collegato
- [ ] Branch: `main` selezionato
- [ ] Nome service: `hospital-works-med`
- [ ] Region: Frankfurt (stessa del database)
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Plan: Free

---

## ⚙️ VARIABILI D'AMBIENTE

Nella sezione Environment Variables di Render:

- [ ] `NODE_ENV` = `production`
- [ ] `SESSION_SECRET` = `[stringa casuale sicura]`
- [ ] `DATABASE_URL` = `[Internal Database URL copiata]`

---

## 🚀 DEPLOY

- [ ] Bottone "Create Web Service" cliccato
- [ ] Build iniziato
- [ ] Build completato con successo (controlla logs)
- [ ] Status cambiato in "Live" (verde)
- [ ] URL generato: `https://hospital-works-med.onrender.com`

---

## ✨ TEST FINALE

- [ ] Sito raggiungibile via browser
- [ ] Pagina login visualizzata correttamente
- [ ] Login con admin/admin123 funzionante
- [ ] Dashboard caricata
- [ ] Test creazione ospedale
- [ ] Test creazione preventivo
- [ ] Password admin cambiata

---

## 🎉 DEPLOY COMPLETATO!

Il tuo gestionale è online e funzionante!

**URL:** https://hospital-works-med.onrender.com

---

## 📝 NOTE

- ⏱️ Primo caricamento dopo inattività: 30-50 secondi (piano Free)
- 💾 Backup automatici database: 7 giorni (piano Free)
- 🔄 Deploy automatico: ad ogni `git push`
- 📊 Monitoraggio: Dashboard Render → Logs

---

## 🆘 IN CASO DI PROBLEMI

1. Controlla i **Logs** su Render Dashboard
2. Verifica le **Environment Variables**
3. Ricontrolla la **DATABASE_URL**
4. Leggi il file **DEPLOY.md** (sezione Troubleshooting)

---

**Tutto verde? Congratulazioni! 🎊**

Ora puoi iniziare ad usare il gestionale per i tuoi preventivi e commesse!
