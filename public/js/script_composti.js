// script_composti.js

// Nota: PASSWORD_ADMIN è ora gestita in gestione_comune.js
// Aggiornato il link per puntare alla nuova cartella
const BASE_URL_DB = "https://console.firebase.google.com/project/inventario-lab-rainerum/firestore/databases/-default-/data/~2Fcomposti";

// La collezione viene recuperata dal db globale

// --- MODIFICA APPLICATA QUI SOTTO ---
const dbCollection = db.collection("composti");

let listaComposti = [];
let idCorrente = null;

document.addEventListener("DOMContentLoaded", () => {
    inizializzaArmadi();
    caricaDati();
    window.onclick = function (e) { if (e.target == document.getElementById("modalComposto")) chiudiModale(); }
});

function caricaDati() {
    dbCollection.get().then((querySnapshot) => {
        listaComposti = [];
        querySnapshot.forEach((doc) => { listaComposti.push({ id: doc.id, ...doc.data() }); });
        renderizza(listaComposti);
    });
}

function renderizza(lista) {
    const grid = document.getElementById("listaComposti");
    grid.innerHTML = "";
    if (lista.length === 0) { grid.innerHTML = "<p>Nessun composto trovato.</p>"; return; }

    lista.forEach(item => {
        let coloreArmadio = "#ccc";
        if (window.CONFIGURAZIONE && window.CONFIGURAZIONE.armadi) {
            const arm = window.CONFIGURAZIONE.armadi.find(a => a.id === item.armadio);
            if (arm) coloreArmadio = arm.colore;
        }

        let scadenzaHtml = "";
        if (item.scadenza) {
            const today = new Date().toISOString().split('T')[0];
            const dateParts = item.scadenza.split("-");
            const dataIT = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            if (item.scadenza < today) {
                scadenzaHtml = `<span class="scaduto-label"><i class="fas fa-exclamation-triangle"></i> Scaduto (${dataIT})</span>`;
            } else {
                scadenzaHtml = `<div style="font-size:0.9em; color:#059669; margin-bottom:5px;"><i class="far fa-calendar-alt"></i> Scadenza: <b>${dataIT}</b></div>`;
            }
        }

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span class="formula-text">${item.formula || "---"}</span>
                <span style="background:${coloreArmadio}; color:#fff; padding:2px 8px; border-radius:10px; font-size:0.8em; font-weight:bold;">${item.armadio} - ${item.ripiano}</span>
            </div>
            <h3 style="margin:0 0 5px 0; font-size:1.2rem; color:#1f2937;">${item.nome}</h3>
            ${scadenzaHtml}
            <div style="font-size:0.9em; color:#555; margin-bottom:10px;"><i class="fas fa-cubes"></i> Quantità: <b>${item.quantita || "N/A"}</b></div>
            <div style="clear:both; margin-top:5px;">${item.link_sicurezza ? `<a href="${item.link_sicurezza}" target="_blank" class="btn-sds"><i class="fas fa-file-pdf"></i> Scheda Sicurezza</a>` : ''}</div>
            <div style="margin-top:auto; padding-top:15px; display:flex;">
                <button class="btn-edit" onclick="apriModifica('${item.id}')"><i class="fas fa-cog"></i> Gestisci</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function apriModaleNuovo() {
    idCorrente = null;
    document.getElementById("titoloModale").innerText = "Nuovo Composto";
    document.getElementById("btnSalva").innerHTML = "SALVA";

    // Funzioni Comuni
    annullaEliminazione();
    document.getElementById("btnMostraPanel").style.display = "none";

    document.getElementById("inputNome").value = "";
    document.getElementById("inputClasse").value = "";
    document.getElementById("inputFormula").value = "";
    document.getElementById("inputScadenza").value = "";
    document.getElementById("inputQuantita").value = "";
    document.getElementById("selectArmadio").value = "";
    document.getElementById("selectRipiano").innerHTML = ""; document.getElementById("selectRipiano").disabled = true;
    document.getElementById("inputQuadrante").value = "";
    document.getElementById("inputLink").value = "";
    document.getElementById("modalComposto").style.display = "flex";
}

function apriModifica(id) {
    idCorrente = id;
    const item = listaComposti.find(i => i.id === id);
    if (!item) return;

    document.getElementById("titoloModale").innerText = "Modifica Composto";
    document.getElementById("btnSalva").innerHTML = "AGGIORNA";

    // Funzioni Comuni
    annullaEliminazione();
    document.getElementById("btnMostraPanel").style.display = "block";

    document.getElementById("inputNome").value = item.nome || "";
    document.getElementById("inputClasse").value = item.classe || "";
    document.getElementById("inputFormula").value = item.formula || "";
    document.getElementById("inputScadenza").value = item.scadenza || "";
    document.getElementById("inputQuantita").value = item.quantita || "";
    document.getElementById("selectArmadio").value = item.armadio || "";
    aggiornaRipiani();
    document.getElementById("selectRipiano").value = item.ripiano || "";
    document.getElementById("inputQuadrante").value = item.quadrante || "";
    document.getElementById("inputLink").value = item.link_sicurezza || "";
    document.getElementById("modalComposto").style.display = "flex";
}

function chiudiModale() { document.getElementById("modalComposto").style.display = "none"; }

function salvaComposto() {
    const nome = document.getElementById("inputNome").value;
    const arm = document.getElementById("selectArmadio").value;
    const rip = document.getElementById("selectRipiano").value;

    if (!nome || !arm) { alert("Nome e Armadio obbligatori"); return; }
    const customId = nome.trim().replace(/[\/\s\.]/g, '_');

    const dati = {
        nome: nome,
        classe: document.getElementById("inputClasse").value,
        formula: document.getElementById("inputFormula").value,
        scadenza: document.getElementById("inputScadenza").value,
        quantita: document.getElementById("inputQuantita").value,
        armadio: arm,
        ripiano: rip,
        quadrante: document.getElementById("inputQuadrante").value,
        link_sicurezza: document.getElementById("inputLink").value
    };

    const btn = document.getElementById("btnSalva");
    btn.innerHTML = "Salvataggio...";
    btn.disabled = true;
    const promesse = [];
    if (idCorrente && idCorrente !== customId) promesse.push(dbCollection.doc(idCorrente).delete());
    promesse.push(dbCollection.doc(customId).set(dati));

    Promise.all(promesse).then(() => {
        chiudiModale(); caricaDati();
    }).catch(err => { alert("Errore salvataggio."); }).finally(() => { btn.innerHTML = "SALVA"; btn.disabled = false; });
}

function eseguiEliminazione() {
    // Usa la funzione di gestione_comune.js
    if (verificaPasswordAdmin()) {
        if (idCorrente) {
            dbCollection.doc(idCorrente).delete().then(() => {
                chiudiModale();
                caricaDati();
            }).catch(err => { alert("Errore: " + err); });
        }
    }
}

function inizializzaArmadi() {
    if (!window.CONFIGURAZIONE) return;
    const sel = document.getElementById("selectArmadio");
    const fil = document.getElementById("filtroArmadio");
    sel.innerHTML = '<option value="">-- Seleziona --</option>';
    fil.innerHTML = '<option value="tutti">Tutti</option>';
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
function filtraComposti() {
    const testo = document.getElementById("cercaComposto").value.toLowerCase();
    const armFiltro = document.getElementById("filtroArmadio").value;
    const filtrati = listaComposti.filter(item => {
        const n = (item.nome || "").toLowerCase();
        const f = (item.formula || "").toLowerCase();
        const matchArmadio = (armFiltro === "tutti") || (item.armadio === armFiltro);
        return (n.includes(testo) || f.includes(testo)) && matchArmadio;
    });
    renderizza(filtrati);
}

window.apriModaleNuovo = apriModaleNuovo;
window.apriModifica = apriModifica;
window.chiudiModale = chiudiModale;
window.salvaComposto = salvaComposto;
window.eseguiEliminazione = eseguiEliminazione;
window.aggiornaRipiani = aggiornaRipiani;
window.filtraComposti = filtraComposti;