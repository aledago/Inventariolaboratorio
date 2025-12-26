// script_attrezzatura.js

// Nota: PASSWORD_ADMIN è ora gestita in gestione_comune.js
const BASE_URL_DB = "https://console.firebase.google.com/project/inventario-lab-rainerum/firestore/databases/-default-/data/~2Fattrezzature";

const firebaseConfig = {
    apiKey: "AIzaSyDjXP6cMEnIJZQdSwz7KE9UVGS65L3p1-I",
    authDomain: "inventario-lab-rainerum.firebaseapp.com",
    projectId: "inventario-lab-rainerum",
    storageBucket: "inventario-lab-rainerum.firebasestorage.app",
    messagingSenderId: "1089947549262",
    appId: "1:1089947549262:web:1d02f48d03cada06994d1f"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const dbCollection = db.collection("attrezzature"); 

let listaAttrezzi = [];
let idCorrente = null;

document.addEventListener("DOMContentLoaded", () => {
    inizializzaArmadi(); 
    caricaDati();
    window.onclick = function(e) { if(e.target == document.getElementById("modalAttrezzo")) chiudiModale(); }
});

function caricaDati() {
    const grid = document.getElementById("listaAttrezzi");
    grid.innerHTML = '<p style="text-align:center;">Caricamento...</p>';
    dbCollection.get().then((querySnapshot) => {
        listaAttrezzi = [];
        querySnapshot.forEach((doc) => { listaAttrezzi.push({ id: doc.id, ...doc.data() }); });
        renderizza(listaAttrezzi);
        popolaSelectCategorie(listaAttrezzi);
    });
}

function renderizza(lista) {
    const grid = document.getElementById("listaAttrezzi");
    grid.innerHTML = "";
    if (lista.length === 0) { grid.innerHTML = '<p>Nessun oggetto trovato.</p>'; return; }

    lista.forEach(item => {
        let coloreArmadio = "#ccc";
        if(window.CONFIGURAZIONE && window.CONFIGURAZIONE.armadi) {
            const arm = window.CONFIGURAZIONE.armadi.find(a => a.id === item.armadio);
            if(arm) coloreArmadio = arm.colore;
        }
        let dettagli = "";
        if(item.capienza) dettagli += `<span class="tech-details"><i class="fas fa-flask"></i> ${item.capienza}</span>`;
        if(item.sensibilita) dettagli += `<span class="tech-details"><i class="fas fa-balance-scale"></i> ${item.sensibilita}</span>`;

        const card = document.createElement("div");
        card.className = "card";
        
        // --- QUI C'ERA IL PROBLEMA, ORA RISOLTO CON align-items: center ---
        card.innerHTML = `
            <div class="card-header" style="display:flex; justify-content:space-between; align-items: center; margin-bottom:10px;">
                <span class="badge-cat" style="margin-bottom:0">${item.categoria || "Generico"}</span>
                <span style="background:${coloreArmadio}; color:#fff; padding:2px 8px; border-radius:10px; font-size:0.8em; font-weight:bold;">${item.armadio} - ${item.ripiano || "?"}</span>
            </div>
            <h3 style="margin: 0 0 10px 0; font-size:1.25rem; color:#1f2937;">${item.nome}</h3>
            <div style="font-size:0.9em; color:#555; margin-bottom:10px;"><i class="fas fa-cubes"></i> Quantità: <b>${item.quantita || 1}</b></div>
            <div style="margin-bottom:15px;">${dettagli}</div>
            <div style="margin-top:auto; display:flex;">
                <button class="btn-edit" onclick="apriModifica('${item.id}')"><i class="fas fa-cog"></i> Gestisci</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function apriModaleNuovo() {
    idCorrente = null;
    document.getElementById("titoloModale").innerText = "Nuovo Oggetto";
    document.getElementById("btnSalva").innerHTML = "SALVA";
    
    // Funzioni Comuni
    annullaEliminazione();
    document.getElementById("btnMostraPanel").style.display = "none"; 

    document.getElementById("inputNome").value = "";
    document.getElementById("selectCategoria").value = "";
    document.getElementById("inputCategoria").style.display = "none";
    document.getElementById("inputQuantita").value = "1";
    document.getElementById("selectArmadio").value = "";
    document.getElementById("selectRipiano").innerHTML = ""; document.getElementById("selectRipiano").disabled = true;
    document.getElementById("inputQuadrante").value = "";
    document.getElementById("inputCapienza").value = "";
    document.getElementById("inputSensibilita").value = "";
    document.getElementById("modalAttrezzo").style.display = "flex";
}

function apriModifica(id) {
    idCorrente = id;
    const item = listaAttrezzi.find(i => i.id === id);
    if (!item) return;

    document.getElementById("titoloModale").innerText = "Modifica Oggetto";
    document.getElementById("btnSalva").innerHTML = "AGGIORNA";

    // Funzioni Comuni
    annullaEliminazione();
    document.getElementById("btnMostraPanel").style.display = "block"; 

    document.getElementById("inputNome").value = item.nome || "";
    
    const selCat = document.getElementById("selectCategoria");
    const inputCat = document.getElementById("inputCategoria");
    let found = false;
    for(let i=0; i<selCat.options.length; i++) {
        if(selCat.options[i].value === item.categoria) {
            selCat.selectedIndex = i; found = true; break;
        }
    }
    if(found) { inputCat.style.display = "none"; inputCat.value = item.categoria; } 
    else { selCat.value = "nuova"; inputCat.style.display = "block"; inputCat.value = item.categoria || ""; }

    document.getElementById("inputQuantita").value = item.quantita || 1;
    document.getElementById("inputQuadrante").value = item.quadrante || "";
    document.getElementById("inputCapienza").value = item.capienza || "";
    document.getElementById("inputSensibilita").value = item.sensibilita || "";
    const selArm = document.getElementById("selectArmadio"); selArm.value = item.armadio;
    aggiornaRipiani();
    document.getElementById("selectRipiano").value = item.ripiano;
    document.getElementById("modalAttrezzo").style.display = "flex";
}

function chiudiModale() { document.getElementById("modalAttrezzo").style.display = "none"; }

function salvaAttrezzatura() {
    const btn = document.getElementById("btnSalva"); btn.innerHTML = "Salvataggio..."; btn.disabled = true;
    const nome = document.getElementById("inputNome").value;
    const arm = document.getElementById("selectArmadio").value;
    if (!nome || !arm) { alert("Dati mancanti!"); btn.disabled=false; return; }

    const customId = nome.trim().replace(/[\/\s\.]/g, '_'); 
    const selCat = document.getElementById("selectCategoria");
    let catFinale = (selCat.value === "nuova") ? document.getElementById("inputCategoria").value : selCat.value;

    const dati = {
        nome: nome, categoria: catFinale, quantita: parseInt(document.getElementById("inputQuantita").value) || 1,
        armadio: arm, ripiano: document.getElementById("selectRipiano").value,
        quadrante: document.getElementById("inputQuadrante").value,
        capienza: document.getElementById("inputCapienza").value, sensibilita: document.getElementById("inputSensibilita").value,
        data_modifica: firebase.firestore.FieldValue.serverTimestamp()
    };
    const promesse = [];
    if (idCorrente && idCorrente !== customId) promesse.push(dbCollection.doc(idCorrente).delete());
    promesse.push(dbCollection.doc(customId).set(dati));

    Promise.all(promesse).then(() => { chiudiModale(); caricaDati(); }).finally(() => { btn.innerHTML = "SALVA"; btn.disabled = false; });
}

function eseguiEliminazione() {
    // Funzione helper dal file comune
    if (verificaPasswordAdmin()) { 
        if(idCorrente) {
            dbCollection.doc(idCorrente).delete().then(() => {
                chiudiModale(); caricaDati();
            });
        }
    }
}

// --- HELPER FUNCTIONS ESSENZIALI (ERANO MANCANTI) ---
function popolaSelectCategorie(lista) {
    const select = document.getElementById("selectCategoria");
    const esistenti = new Set();
    lista.forEach(i => { if(i.categoria) esistenti.add(i.categoria); });
    
    select.innerHTML = '<option value="">-- Seleziona --</option>';
    esistenti.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat; opt.text = cat; select.appendChild(opt);
    });
    
    const optNew = document.createElement("option");
    optNew.value = "nuova"; optNew.text = "+ Nuova Categoria...";
    optNew.style.fontWeight = "bold"; optNew.style.color = "#ea580c";
    select.appendChild(optNew);
}

function gestisciInputCategoria(selectElement) {
    const input = document.getElementById("inputCategoria");
    if (selectElement.value === "nuova") {
        input.style.display = "block"; input.focus(); input.value = ""; 
    } else {
        input.style.display = "none"; input.value = selectElement.value;
    }
}

function inizializzaArmadi() {
    if (!window.CONFIGURAZIONE) return;
    const sel = document.getElementById("selectArmadio");
    const fil = document.getElementById("filtroArmadioRapido");
    sel.innerHTML = '<option value="">-- Seleziona --</option>';
    fil.innerHTML = '<option value="tutti">Tutti gli Armadi</option>';
    window.CONFIGURAZIONE.armadi.forEach(arm => {
        const opt = document.createElement("option");
        opt.value = arm.id; opt.text = `${arm.id} - ${arm.nome}`;
        sel.appendChild(opt);
        const optFil = document.createElement("option");
        optFil.value = arm.id; optFil.text = `${arm.id} - ${arm.nome}`;
        fil.appendChild(optFil);
    });
}

function aggiornaRipiani() {
    const armId = document.getElementById("selectArmadio").value;
    const selRip = document.getElementById("selectRipiano");
    selRip.innerHTML = "";
    if (!armId) { selRip.disabled = true; return; }
    const armConf = window.CONFIGURAZIONE.armadi.find(a => a.id === armId);
    if (armConf) {
        selRip.disabled = false;
        for (let i = 1; i <= armConf.ripiani; i++) {
            const opt = document.createElement("option"); opt.value = i; opt.text = `Ripiano ${i}`; selRip.appendChild(opt);
        }
    }
}

function applicaFiltri() {
    const testo = document.getElementById("cercaAttrezzo").value.toLowerCase();
    const filtroArm = document.getElementById("filtroArmadioRapido").value;
    const filtrati = listaAttrezzi.filter(i => {
        const matchTesto = (i.nome||"").toLowerCase().includes(testo) || (i.categoria||"").toLowerCase().includes(testo);
        const matchArm = (filtroArm === "tutti" || i.armadio === filtroArm);
        return matchTesto && matchArm;
    });
    renderizza(filtrati);
}

window.apriModaleNuovo = apriModaleNuovo;
window.apriModifica = apriModifica;
window.chiudiModale = chiudiModale;
window.salvaAttrezzatura = salvaAttrezzatura;
window.eseguiEliminazione = eseguiEliminazione;
window.aggiornaRipiani = aggiornaRipiani;
window.applicaFiltri = applicaFiltri;
window.gestisciInputCategoria = gestisciInputCategoria;