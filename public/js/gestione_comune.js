// gestione_comune.js

// CONFIGURAZIONE CONDIVISA
// La password hardcoded è stata rimossa per sicurezza.
// Ora l'accesso è gestito tramite Firebase Authentication.

// Inizializzazione Auth
document.addEventListener("DOMContentLoaded", () => {
    if (window.auth) {
        window.auth.onAuthStateChanged((user) => {
            aggiornaInterfacciaAuth(user);
        });
    }
});

function aggiornaInterfacciaAuth(user) {
    const isAdmin = !!user;
    
    // Mostra/Nasconde bottoni admin
    const adminElements = [
        document.querySelector('.btn-add'),
        ...document.querySelectorAll('.btn-edit'),
        document.getElementById('footerNormal'),
        document.getElementById('footerButtons')
    ];

    adminElements.forEach(el => {
        if (el) {
            el.style.display = isAdmin ? '' : 'none';
        }
    });

    // Aggiorna link login/logout nella navbar se esiste
    const nav = document.querySelector('.navbar');
    if (nav) {
        let authLink = document.getElementById('navAuthLink');
        if (!authLink) {
            authLink = document.createElement('a');
            authLink.id = 'navAuthLink';
            authLink.className = 'nav-link';
            nav.appendChild(authLink);
        }
        
        if (isAdmin) {
            authLink.innerHTML = '🚶 Logout';
            authLink.href = '#';
            authLink.onclick = (e) => {
                e.preventDefault();
                window.auth.signOut().then(() => {
                    window.location.reload();
                });
            };
        } else {
            authLink.innerHTML = '👤 Login Admin';
            authLink.href = 'login.html';
            authLink.onclick = null;
        }
    }
}

// Funzione helper per verificare se l'utente è loggato (usata negli altri script)
function isUserAdmin() {
    return window.auth && window.auth.currentUser !== null;
}

// Il vecchio sistema di password non è più necessario ma manteniamo le firme
// delle funzioni per evitare errori negli script che le chiamano, semplificandole.

function mostraPanelElimina() {
    if (!isUserAdmin()) {
        alert("Devi essere loggato come Admin per eliminare.");
        return;
    }
    
    if (confirm("Sei sicuro di voler eliminare questo elemento?")) {
        // Chiama la funzione di eliminazione specifica dello script della pagina
        if (typeof window.eseguiEliminazioneDiretta === 'function') {
            window.eseguiEliminazioneDiretta();
        } else if (typeof window.eseguiEliminazione === 'function') {
            // Nota: eseguiEliminazione negli script originali chiama verificaPasswordAdmin
            // Dobbiamo assicurarci che non blocchi l'azione se già loggati.
            window.eseguiEliminazione();
        }
    }
}

function annullaEliminazione() {
    // Non più usato con il nuovo sistema di conferma, ma mantenuto per compatibilità
}

function verificaPasswordAdmin() {
    // Se l'utente è loggato in Firebase, la password è considerata verificata
    return isUserAdmin();
}