#!/bin/bash

echo "🚀 Hospital-Works-Med - Setup Git"
echo "=================================="
echo ""

# Chiedi username GitHub
read -p "Inserisci il tuo username GitHub: " github_username

if [ -z "$github_username" ]; then
    echo "❌ Username non inserito. Uscita."
    exit 1
fi

echo ""
echo "📝 Configurazione Git in corso..."

# Configura Git
git config user.name "Giuseppe"
git config user.email "giuseppe@hospital-works-med.com"

# Inizializza repository (se non già fatto)
if [ ! -d ".git" ]; then
    git init
    echo "✅ Repository Git inizializzato"
fi

# Aggiungi tutti i file
git add .
echo "✅ File aggiunti"

# Primo commit
git commit -m "Initial commit - Hospital-Works-Med v1.0"
echo "✅ Commit creato"

# Aggiungi remote
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$github_username/Hospital-Works-Med.git"
echo "✅ Remote GitHub collegato"

# Rinomina branch in main
git branch -M main
echo "✅ Branch rinominato in 'main'"

echo ""
echo "🎉 Setup completato!"
echo ""
echo "📤 Ora esegui il push su GitHub:"
echo "   git push -u origin main"
echo ""
echo "⚠️  Ti verrà chiesta la password: usa un Personal Access Token"
echo "    (vedi DEPLOY.md per le istruzioni)"
echo ""
