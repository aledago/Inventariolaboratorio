// --- CONFIGURAZIONE ---
const PASSWORD_ADMIN = "1234";

// Link base alla cartella "chimica"
const BASE_URL_DB = "https://console.firebase.google.com/project/inventario-lab-rainerum/firestore/databases/-default-/data/~2Fchimica";

const firebaseConfig = {
    apiKey: "AIzaSyDjXP6cMEnIJZQdSwz7KE9UVGS65L3p1-I",
    authDomain: "inventario-lab-rainerum.firebaseapp.com",
    projectId: "inventario-lab-rainerum",
    storageBucket: "inventario-lab-rainerum.firebasestorage.app",
    messagingSenderId: "1089947549262",
    appId: "1:1089947549262:web:1d02f48d03cada06994d1f"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const dbCollection = db.collection("chimica"); 

let listaComposti = [];
let idCorrente = null;

document.addEventListener("DOMContentLoaded", () => {
    inizializzaArmadi();
    window.onclick = function(e) { 
        if(e.target == document.getElementById("modalChimico")) chiudiModale(); 
    }
});

// --- FUNZIONI UI & LOGICA PASSWORD ---

function mostraPanelElimina() {
    document.getElementById("footerNormal").style.display = "none";
    document.getElementById("panelPassword").style.display = "block";
    document.getElementById("inputPassDelete").value = "";
    document.getElementById("inputPassDelete").focus();
}

function annullaEliminazione() {
    document.getElementById("panelPassword").style.display = "none";
    document.getElementById("footerNormal").style.display = "flex";
}

function eseguiEliminazione() {
    const pass = document.getElementById("inputPassDelete").value;

    if (pass === PASSWORD_ADMIN) {
        if (idCorrente) {
            const linkFinale = BASE_URL_DB + "~2F" + idCorrente;
            alert("✅ Password corretta! Apro il database per: " + idCorrente);
            window.location.href = linkFinale;
        } else {
            alert("Errore: Nessun ID prodotto selezionato.");
        }
    } else {
        alert("⛔ Password Errata!");
        document.getElementById("inputPassDelete").value = "";
    }
}

// --- STANDARD FIREBASE ---

function inizializzaArmadi() {
    const sel = document.getElementById("selectArmadio");
    const fil = document.getElementById("filtroArmadioRapido");
    if(!sel) return;
    sel.innerHTML = '<option value="">Scegli Armadio...</option>';
    if(fil) fil.innerHTML = '<option value="tutti">Tutti gli Armadi</option>';
    if(window.CONFIGURAZIONE && window.CONFIGURAZIONE.armadi) {
        window.CONFIGURAZIONE.armadi.forEach(arm => {
            sel.innerHTML += `<option value="${arm.id}">${arm.id} - ${arm.nome}</option>`;
            if(fil) fil.innerHTML += `<option value="${arm.id}">Armadio ${arm.id}</option>`;
        });
    }
}

dbCollection.onSnapshot((snapshot) => {
    listaComposti = [];
    snapshot.forEach((doc) => {
        listaComposti.push({ ...doc.data(), id: doc.id });
    });
    renderizza(listaComposti);
});

function renderizza(lista) {
    const container = document.getElementById("listaChimici");
    container.innerHTML = "";
    if(lista.length === 0) {
        container.innerHTML = "<p style='text-align:center'>Nessun composto.</p>";
        return;
    }
    
    // Ordine alfabetico
    lista.sort((a,b) => (a.nome || "").toLowerCase().localeCompare((b.nome || "").toLowerCase()));

    lista.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";
        let linkHtml = "";
        if(item.link_sicurezza) linkHtml = `<a href="${item.link_sicurezza}" target="_blank" class="btn-link">📄 Scheda</a>`;
        div.innerHTML = `
            <h3>${item.nome}</h3>
            <div style="font-size:0.9em; color:#666; margin-bottom:5px;">
                Pos: <b>${item.armadio}.${item.ripiano}</b> (Q.${item.quadrante})
            </div>
            <div style="margin-bottom:10px;">Qta: <strong>${item.quantita}</strong></div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                ${linkHtml}
                <button class="btn-edit" onclick="apriModifica('${item.id}')">Gestisci</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function aggiornaRipiani() {
    const id = document.getElementById("selectArmadio").value;
    const r = document.getElementById("selectRipiano");
    r.innerHTML = "<option value=''>Ripiano...</option>"; 
    r.disabled = true;
    if(!window.CONFIGURAZIONE) return;
    const arm = window.CONFIGURAZIONE.armadi.find(a => a.id === id);
    if(arm) {
        r.disabled = false;
        for(let i=1; i<=arm.ripiani; i++) {
            r.innerHTML += `<option value="${i}">Ripiano ${i}</option>`;
        }
    }
}

function apriModaleNuovo() {
    idCorrente = null;
    document.getElementById("titoloModale").innerText = "Nuovo Chimico";
    document.getElementById("inputNome").value = "";
    document.getElementById("inputFormula").value = "";
    document.getElementById("inputQuantita").value = "";
    document.getElementById("inputQuadrante").value = "";
    document.getElementById("inputLink").value = "";
    document.getElementById("selectArmadio").value = "";
    document.getElementById("selectRipiano").innerHTML = "<option value=''>Ripiano...</option>";
    document.getElementById("selectRipiano").disabled = true;

    document.getElementById("panelPassword").style.display = "none";
    document.getElementById("footerNormal").style.display = "flex";
    document.getElementById("btnMostraPanel").style.display = "none"; 
    document.getElementById("modalChimico").style.display = "block";
}

function apriModifica(id) {
    idCorrente = id;
    const obj = listaComposti.find(x => x.id === id);
    if(!obj) return;

    document.getElementById("titoloModale").innerText = "Modifica " + obj.nome;
    document.getElementById("inputNome").value = obj.nome;
    document.getElementById("inputFormula").value = obj.formula;
    document.getElementById("inputQuantita").value = obj.quantita;
    document.getElementById("inputQuadrante").value = obj.quadrante;
    document.getElementById("inputLink").value = obj.link_sicurezza;
    document.getElementById("selectArmadio").value = obj.armadio;
    aggiornaRipiani();
    setTimeout(() => { document.getElementById("selectRipiano").value = obj.ripiano; }, 50);

    document.getElementById("panelPassword").style.display = "none";
    document.getElementById("footerNormal").style.display = "flex";
    document.getElementById("btnMostraPanel").style.display = "block"; 
    document.getElementById("modalChimico").style.display = "block";
}

function chiudiModale() {
    document.getElementById("modalChimico").style.display = "none";
}

// FORMATTAZIONE NOME (Maiuscole automatiche)
function formattaNome(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/(^|\s)\S/g, function(lettera) {
        return lettera.toUpperCase();
    });
}

// *** FUNZIONE SALVA AGGIORNATA CON IL BLOCCO PER I NUOVI DUPLICATI ***
function salvaChimico() {
    let nomeGrezzo = document.getElementById("inputNome").value.trim();
    const nome = formattaNome(nomeGrezzo); 
    const formula = document.getElementById("inputFormula").value.trim(); 
    const arm = document.getElementById("selectArmadio").value;
    const rip = String(document.getElementById("selectRipiano").value);
    const quad = document.getElementById("inputQuadrante").value.trim();
    const qta = document.getElementById("inputQuantita").value.trim();
    const link = document.getElementById("inputLink").value.trim();

    if(!nome || !arm || !rip) { alert("Dati mancanti!"); return; }

    const btn = document.getElementById("btnSalva");
    btn.innerHTML = "Attendi..."; btn.disabled = true;
    
    // Genera ID standardizzato
    const customID = generaID(nome, arm, rip, quad);
    const docRef = dbCollection.doc(customID);

    docRef.get().then((docSnap) => {
        // Controllo esistenza robusto
        let esiste = false;
        if (typeof docSnap.exists === 'function') {
            esiste = docSnap.exists(); 
        } else {
            esiste = docSnap.exists;   
        }

        if (esiste) {
            // CASO 1: È UN NUOVO INSERIMENTO (idCorrente è null)
            // L'utente sta provando a creare un doppione -> BLOCCIAMO!
            if (!idCorrente) {
                alert(`⛔ ATTENZIONE: "${nome}" ESISTE GIÀ!\n\nÈ già presente nell'Armadio ${arm}, Ripiano ${rip}.\n\nNon creare un doppione: cerca il prodotto esistente nella lista e usa "Gestisci" per modificare la quantità.`);
                return; // STOP: Non salva nulla.
            }

            // CASO 2: È UNA MODIFICA (idCorrente esiste)
            // L'utente sta spostando un prodotto sopra un altro -> CHIEDIAMO UNIONE
            if (idCorrente !== customID) {
                 if(confirm(`Spostando questo prodotto, andrà a unirsi a un "${nome}" già presente in quella posizione.\n\nVuoi unire le quantità e aggiornare i dati?`)) {
                    return docRef.update({ 
                        quantita: docSnap.data().quantita + " + " + qta,
                        nome: nome,
                        formula: formula 
                    }).then(() => {
                        // Cancelliamo il vecchio perché l'abbiamo unito al nuovo
                        if(idCorrente) return dbCollection.doc(idCorrente).delete();
                    });
                } else {
                    throw new Error("Annullato");
                }
            }
        } 
        
        // CASO 3: NON ESISTE (oppure è la modifica dello stesso ID) -> SALVA NORMALE
        if (!esiste || (esiste && idCorrente === customID)) {
            const promesse = [];
            // Se stiamo rinominando/spostando su uno slot vuoto, cancelliamo il vecchio ID
            if(idCorrente && idCorrente !== customID) promesse.push(dbCollection.doc(idCorrente).delete());
            
            promesse.push(docRef.set({
                nome: nome, 
                formula, armadio: arm, ripiano: rip, quadrante: quad, 
                quantita: qta, link_sicurezza: link
            }));
            return Promise.all(promesse);
        }

    }).then(() => { 
        // Se siamo arrivati qui senza errori o "return", chiudiamo
        if(btn.innerHTML !== "Salva") chiudiModale(); 
    }).catch((e) => {
        if(e.message !== "Annullato") alert("Errore o Annullato: " + e.message);
    }).finally(() => { btn.innerHTML = "Salva"; btn.disabled = false; });
}

function generaID(nome, armadio, ripiano, quadrante) {
    const n = String(nome || "").toLowerCase().trim().replace(/\s+/g, '');
    const a = String(armadio || "").toLowerCase().trim().replace(/\s+/g, '');
    const r = String(ripiano || "").toLowerCase().trim().replace(/\s+/g, '');
    const q = String(quadrante || "").toLowerCase().trim().replace(/\s+/g, '');
    return `${n}_${a}_${r}_${q}`;
}

function applicaFiltri() {
    const testo = document.getElementById("cercaChimico").value.toLowerCase();
    const filtroArm = document.getElementById("filtroArmadioRapido").value;
    const filtrati = listaComposti.filter(i => {
        return ((i.nome||"").toLowerCase().includes(testo)) && (filtroArm === "tutti" || i.armadio === filtroArm);
    });
    renderizza(filtrati);
}

// Globali
window.apriModaleNuovo = apriModaleNuovo;
window.apriModifica = apriModifica;
window.chiudiModale = chiudiModale;
window.salvaChimico = salvaChimico;
window.aggiornaRipiani = aggiornaRipiani;
window.applicaFiltri = applicaFiltri;
window.mostraPanelElimina = mostraPanelElimina;
window.annullaEliminazione = annullaEliminazione;
window.eseguiEliminazione = eseguiEliminazione;