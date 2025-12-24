import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURAZIONE FIREBASE ---
// ⚠️ INCOLLA QUI SOTTO IL TUO BLOCCO "firebaseConfig" PRESO DALLA CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyDjXP6cMEnIJZQdSwz7KE9UVGS65L3p1-I",
    authDomain: "inventario-lab-rainerum.firebaseapp.com",
    databaseURL: "https://inventario-lab-rainerum-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "inventario-lab-rainerum",
    storageBucket: "inventario-lab-rainerum.firebasestorage.app",
    messagingSenderId: "1089947549262",
    appId: "1:1089947549262:web:1d02f48d03cada06994d1f",
    measurementId: "G-2B5R2YF8H4"
  };

// Avvio connessione
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const dbCollection = collection(db, "composti"); 

let inventario = [];
let oggettoCorrenteId = null;

// --- 1. LETTURA DATI (TEMPO REALE) ---
onSnapshot(dbCollection, (snapshot) => {
    inventario = [];
    snapshot.forEach((doc) => {
        inventario.push({ ...doc.data(), id: doc.id });
    });
    renderizzaOggetti(inventario);
});

// --- 2. DISEGNA LE SCHEDE ---
function renderizzaOggetti(lista) {
    const contenitore = document.getElementById("listaComposti");
    contenitore.innerHTML = ""; 

    if (lista.length === 0) {
        contenitore.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nessun composto trovato.</p>';
        return;
    }

    // Ordina per Ripiano e poi per Quadrante
    lista.sort((a, b) => {
        const rA = parseInt(a.ripiano) || 0;
        const rB = parseInt(b.ripiano) || 0;
        if (rA !== rB) return rA - rB;
        return (parseInt(a.quadrante) || 0) - (parseInt(b.quadrante) || 0);
    });

    lista.forEach(obj => {
        // Calcolo Scadenza
        const oggi = new Date();
        const dataScad = new Date(obj.scadenza);
        let classeScadenza = "exp-ok";
        let testoScadenza = "Valido";

        if (obj.scadenza) {
            const diffGiorni = (dataScad - oggi) / (1000 * 60 * 60 * 24);
            if (diffGiorni < 0) {
                classeScadenza = "exp-bad"; 
                testoScadenza = "SCADUTO";
            } else if (diffGiorni < 30) {
                classeScadenza = "exp-soon";
                testoScadenza = "In scadenza";
            }
        } else {
            testoScadenza = "N/D";
        }

        const card = document.createElement("div");
        card.className = "card";
        
        // Uniamo i due numeri per la visualizzazione (es: 1.2)
        const posizioneVisuale = `${obj.ripiano}.${obj.quadrante}`;

        card.innerHTML = `
            <h3>${obj.nome}</h3>
            <p class="formula-text">${obj.formula}</p>
            
            <div style="margin: 10px 0; font-size: 1.1em; color: #2c3e50; background-color:#ecf0f1; padding:5px; border-radius:4px; text-align:center;">
                <i class="fas fa-map-marker-alt"></i> Posizione: <strong>${posizioneVisuale}</strong>
            </div>

            <p>Quantità: <strong>${obj.quantita}</strong></p>
            
            <div class="expiry-badge ${classeScadenza}">
                <i class="fas fa-calendar-alt"></i> ${obj.scadenza || "--/--/--"} (${testoScadenza})
            </div>

            <div style="margin-top:10px;">
                ${obj.linkScheda ? `<a href="${obj.linkScheda}" target="_blank" style="color:#3498db; text-decoration:underline;">Apri Scheda Tecnica</a>` : '<span style="color:#ccc">Nessuna scheda</span>'}
            </div>

            <button class="btn-edit" onclick="apriModaleModifica('${obj.id}')">
                <i class="fas fa-edit"></i> Gestisci
            </button>
        `;
        contenitore.appendChild(card);
    });
}

// --- 3. FILTRI DI RICERCA ---
window.applicaFiltri = function() {
    const testo = document.getElementById("cercaNome").value.toLowerCase();
    const lista = inventario.filter(obj => {
        return (obj.nome || "").toLowerCase().includes(testo) || 
               (obj.formula || "").toLowerCase().includes(testo);
    });
    renderizzaOggetti(lista);
}

// --- 4. GESTIONE MODALE (APRI/CHIUDI) ---
function pulisciErrori() {
    document.querySelectorAll('.modal-content input').forEach(el => el.classList.remove('error-field'));
}

// Funzione collegata al tasto "Nuovo Composto"
window.apriModaleNuovo = function() {
    oggettoCorrenteId = null;
    document.getElementById("titoloModale").innerText = "Nuovo Composto";
    pulisciErrori();
    
    // Resettiamo i campi usando gli ID corretti del tuo HTML
    document.getElementById("inputNome").value = "";
    document.getElementById("inputFormula").value = "";
    document.getElementById("inputRipiano").value = "";   // Campo numerico
    document.getElementById("inputQuadrante").value = ""; // Campo numerico
    document.getElementById("inputQuantita").value = "";
    document.getElementById("inputScadenza").value = "";
    document.getElementById("inputScheda").value = "";

    document.getElementById("modalModifica").style.display = "block";
}

// Funzione collegata al tasto "Gestisci"
window.apriModaleModifica = function(id) {
    const obj = inventario.find(x => x.id === id);
    if (!obj) return;
    pulisciErrori();
    
    oggettoCorrenteId = id;
    document.getElementById("titoloModale").innerText = "Modifica " + obj.nome;
    
    document.getElementById("inputNome").value = obj.nome;
    document.getElementById("inputFormula").value = obj.formula;
    document.getElementById("inputRipiano").value = obj.ripiano;
    document.getElementById("inputQuadrante").value = obj.quadrante;
    document.getElementById("inputQuantita").value = obj.quantita;
    document.getElementById("inputScadenza").value = obj.scadenza;
    document.getElementById("inputScheda").value = obj.linkScheda || "";

    document.getElementById("modalModifica").style.display = "block";
}

window.chiudiModale = function() {
    document.getElementById("modalModifica").style.display = "none";
}

// --- 5. SALVATAGGIO ---
window.salvaModifiche = async function() {
    pulisciErrori();

    // Recuperiamo i dati dall'HTML
    const elNome = document.getElementById("inputNome");
    const elFormula = document.getElementById("inputFormula");
    const elRipiano = document.getElementById("inputRipiano");
    const elQuadrante = document.getElementById("inputQuadrante");
    const elQuantita = document.getElementById("inputQuantita");
    const elScadenza = document.getElementById("inputScadenza");
    const elScheda = document.getElementById("inputScheda");

    const nome = elNome.value.trim();
    const formula = elFormula.value.trim();
    const ripiano = elRipiano.value.trim();
    const quadrante = elQuadrante.value.trim();
    const quantita = elQuantita.value.trim();
    const scadenza = elScadenza.value;
    const linkScheda = elScheda.value.trim();

    // Validazione: controlliamo che i campi non siano vuoti
    let errori = false;
    if (!nome) { elNome.classList.add('error-field'); errori = true; }
    if (!ripiano) { elRipiano.classList.add('error-field'); errori = true; }
    if (!quadrante) { elQuadrante.classList.add('error-field'); errori = true; }
    if (!scadenza) { elScadenza.classList.add('error-field'); errori = true; }

    if (errori) {
        alert("Inserisci Nome, Posizione completa e Scadenza.");
        return;
    }

    const btnSave = document.querySelector('.btn-save');
    const oldText = btnSave.innerHTML;
    btnSave.innerHTML = 'Salvataggio...';
    btnSave.disabled = true;

    try {
        const dati = {
            nome, 
            formula, 
            ripiano,     // Salviamo "1"
            quadrante,   // Salviamo "2"
            quantita, 
            scadenza, 
            linkScheda
        };

        if (oggettoCorrenteId === null) {
            // Crea nuovo
            await addDoc(dbCollection, dati);
        } else {
            // Aggiorna esistente
            const docRef = doc(db, "composti", oggettoCorrenteId);
            await updateDoc(docRef, dati);
        }
        chiudiModale();
    } catch (e) {
        console.error("Errore salvataggio:", e);
        alert("Errore salvataggio: " + e.message);
    } finally {
        btnSave.innerHTML = oldText;
        btnSave.disabled = false;
    }
}

// Chiudi cliccando fuori dal modale
window.onclick = function(e) {
    if (e.target == document.getElementById("modalModifica")) chiudiModale();
}
