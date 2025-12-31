// Hospital-Works-Med - JavaScript principale

// Funzioni di utilità
function formatCurrency(value) {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
    }).format(value);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('it-IT');
}

// Conferma eliminazione
document.querySelectorAll('form[onsubmit*="confirm"]').forEach(form => {
    form.addEventListener('submit', function(e) {
        if (!confirm('Sei sicuro di voler procedere?')) {
            e.preventDefault();
        }
    });
});

// Auto-dismiss alerts
setTimeout(() => {
    document.querySelectorAll('.alert:not(.alert-permanent)').forEach(alert => {
        alert.style.transition = 'opacity 0.5s';
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 500);
    });
}, 5000);

// Gestione stato preventivo
async function changeQuoteStatus(quoteId, newStatus) {
    if (!confirm(`Cambiare lo stato in "${newStatus}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/quotes/status/${quoteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stato: newStatus })
        });

        const result = await response.json();
        
        if (result.success) {
            location.reload();
        } else {
            alert('Errore: ' + result.error);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore di connessione');
    }
}

// Gestione stato commessa
async function changeWorkOrderStatus(workOrderId, newStatus) {
    if (!confirm(`Cambiare lo stato in "${newStatus}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/work-orders/status/${workOrderId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stato: newStatus })
        });

        const result = await response.json();
        
        if (result.success) {
            location.reload();
        } else {
            alert('Errore: ' + result.error);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore di connessione');
    }
}

// Converti preventivo in commessa
async function convertToWorkOrder(quoteId) {
    if (!confirm('Vuoi creare una commessa da questo preventivo?')) {
        return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/quotes/convert-to-workorder/${quoteId}`;
    document.body.appendChild(form);
    form.submit();
}

console.log('Hospital-Works-Med initialized');
