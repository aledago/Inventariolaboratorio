// gestione_comune.js

// CONFIGURAZIONE CONDIVISA
const PASSWORD_ADMIN = "1234"; // La cambi qui e vale per TUTTI

// --- GESTIONE GRAFICA PANNELLO ELIMINAZIONE ---
// Queste funzioni valgono sia per le Attrezzature che per i Composti

function mostraPanelElimina() {
    // Nasconde i tasti normali e mostra il pannello rosso
    const footer = document.getElementById('footerNormal') || document.getElementById('footerButtons');
    if(footer) footer.style.display = 'none';

    const panel = document.getElementById('panelPassword');
    if(panel) {
        panel.style.display = 'block';
        // Pulisce il campo e mette il cursore pronto a scrivere
        const input = document.getElementById('inputPassDelete');
        if(input) {
            input.value = '';
            input.focus();
        }
    }
}

function annullaEliminazione() {
    // Torna alla visualizzazione normale
    const panel = document.getElementById('panelPassword');
    if(panel) panel.style.display = 'none';

    const footer = document.getElementById('footerNormal') || document.getElementById('footerButtons');
    if(footer) footer.style.display = 'flex';
    
    document.getElementById('inputPassDelete').value = '';
}

// Funzione helper per verificare la password
function verificaPasswordAdmin() {
    const input = document.getElementById('inputPassDelete').value;
    if (input === PASSWORD_ADMIN) {
        return true;
    } else {
        alert("Password Errata! Accesso negato.");
        document.getElementById('inputPassDelete').value = ''; // Pulisce per riprovare
        return false;
    }
}