// --- CONFIGURAZIONE ---
const PASSWORD_ADMIN = "1234";
const BASE_URL_DB = "https://console.firebase.google.com/project/inventario-lab-rainerum/firestore/databases/-default-/data/~2Fattrezzature";

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
const dbCollection = db.collection("attrezzature"); 

let listaAttrezzi = [];
let idCorrente = null;

document.addEventListener("DOMContentLoaded", () => {
    inizializzaArmadi();
    window.onclick = function(e) { 
        if(e.target == document.getElementById("modalAttrezzo")) chiudiModale(); 
    }
});

// --- UI & PASSWORD ---
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
            alert("✅ Password corretta! Apro il database.");
            window.location.href = BASE_URL_DB + "~2F" + idCorrente;
        } else {
            alert("Errore: Nessun ID selezionato.");
        }
    } else {
        alert("⛔ Password Errata!");
        document.getElementById("inputPassDelete").value = "";
    }
}

// --- LOGICA CATEGORIE ---
function copiaCategoria() {
    const sel = document.getElementById("selectCategoriaEsistente");
    const inp = document.getElementById("inputCategoria");
    if(sel.value) inp.value = sel.value;
}

function aggiornaOpzioniCategorie() {
    const sel = document.getElementById("selectCategoriaEsistente");
    if(!sel) return;
    sel.innerHTML = '<option value="">-- Scegli esistente --</option>';
    const categorie = [...new Set(listaAttrezzi.map(i => i.categoria).filter(c => c))].sort();
    categorie.forEach(c => {
        sel.innerHTML += `<option value="${c}">${c}</option>`;
    });
}

// --- FIREBASE ---
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
    listaAttrezzi = [];
    snapshot.forEach((doc) => {
        listaAttrezzi.push({ ...doc.data(), id: doc.id });
    });
    renderizza(listaAttrezzi);
});

function renderizza(lista) {
    const container = document.getElementById("listaAttrezzi");
    container.innerHTML = "";
    
    aggiornaOpzioniCategorie();

    if(lista.length === 0) {
        container.innerHTML = "<p style='text-align:center'>Nessuna attrezzatura trovata.</p>";
        return;
    }
    
    // Ordina A-Z
    lista.sort((a,b) => (a.nome || "").toLowerCase().localeCompare((b.nome || "").toLowerCase()));

    lista.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";
        
        let catHtml = "";
        if(item.categoria) {
            catHtml = `<span class="badge-cat">${item.categoria}</span>`;
        }

        // Mostra Capienza e Sensibilità se presenti
        let techHtml = "";
        if(item.capienza || item.sensibilita) {
            let parts = [];
            if(item.capienza) parts.push(`Cap: <b>${item.capienza}</b>`);
            if(item.sensibilita) parts.push(`Sens: <b>${item.sensibilita}</b>`);
            techHtml = `<div class="tech-details">${parts.join(" - ")}</div>`;
        }

        div.innerHTML = `
            <h3>${item.nome}</h3>
            ${catHtml}
            ${techHtml}
            <div style="font-size:0.9em; color:#666; margin-bottom:5px;">
                Pos: <b>${item.armadio}.${item.ripiano}</b> (Q.${item.quadrante})
            </div>
            <div style="margin-bottom:10px;">Qta: <strong>${item.quantita}</strong></div>
            <div style="display:flex; justify-content:flex-end; align-items:center;">
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
    document.getElementById("titoloModale").innerText = "Nuova Attrezzatura";
    document.getElementById("inputNome").value = "";
    document.getElementById("inputCategoria").value = ""; 
    document.getElementById("selectCategoriaEsistente").value = "";
    document.getElementById("inputQuantita").value = "";
    document.getElementById("inputQuadrante").value = "";
    
    // Reset Nuovi Campi
    document.getElementById("inputCapienza").value = "";
    document.getElementById("inputSensibilita").value = "";

    document.getElementById("selectArmadio").value = "";
    document.getElementById("selectRipiano").innerHTML = "<option value=''>Ripiano...</option>";
    document.getElementById("selectRipiano").disabled = true;

    document.getElementById("panelPassword").style.display = "none";
    document.getElementById("footerNormal").style.display = "flex";
    document.getElementById("btnMostraPanel").style.display = "none"; 
    document.getElementById("modalAttrezzo").style.display = "block";
}

function apriModifica(id) {
    idCorrente = id;
    const obj = listaAttrezzi.find(x => x.id === id);
    if(!obj) return;

    document.getElementById("titoloModale").innerText = "Modifica " + obj.nome;
    document.getElementById("inputNome").value = obj.nome;
    
    document.getElementById("inputCategoria").value = obj.categoria || ""; 
    document.getElementById("selectCategoriaEsistente").value = ""; 

    document.getElementById("inputQuantita").value = obj.quantita;
    document.getElementById("inputQuadrante").value = obj.quadrante;
    
    // Carica Nuovi Campi
    document.getElementById("inputCapienza").value = obj.capienza || "";
    document.getElementById("inputSensibilita").value = obj.sensibilita || "";

    document.getElementById("selectArmadio").value = obj.armadio;
    aggiornaRipiani();
    setTimeout(() => { document.getElementById("selectRipiano").value = obj.ripiano; }, 50);

    document.getElementById("panelPassword").style.display = "none";
    document.getElementById("footerNormal").style.display = "flex";
    document.getElementById("btnMostraPanel").style.display = "block"; 
    document.getElementById("modalAttrezzo").style.display = "block";
}

function chiudiModale() {
    document.getElementById("modalAttrezzo").style.display = "none";
}

function formattaNome(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/(^|\s)\S/g, function(lettera) {
        return lettera.toUpperCase();
    });
}

function salvaAttrezzatura() {
    let nomeGrezzo = document.getElementById("inputNome").value.trim();
    const nome = formattaNome(nomeGrezzo); 
    const categoria = document.getElementById("inputCategoria").value.trim(); 

    const arm = document.getElementById("selectArmadio").value;
    const rip = String(document.getElementById("selectRipiano").value);
    const quad = document.getElementById("inputQuadrante").value.trim();
    const qta = document.getElementById("inputQuantita").value.trim();
    
    // Nuovi valori
    const cap = document.getElementById("inputCapienza").value.trim();
    const sens = document.getElementById("inputSensibilita").value.trim();

    if(!nome || !arm || !rip) { alert("Dati mancanti!"); return; }

    const btn = document.getElementById("btnSalva");
    btn.innerHTML = "Attendi..."; btn.disabled = true;
    
    const customID = generaID(nome, arm, rip, quad);
    const docRef = dbCollection.doc(customID);

    docRef.get().then((docSnap) => {
        let esiste = false;
        if(typeof docSnap.exists === 'function') esiste = docSnap.exists();
        else esiste = docSnap.exists;

        if (esiste) {
            if (!idCorrente) {
                alert(`⛔ ATTENZIONE: "${nome}" ESISTE GIÀ!\n\nSi trova nell'Armadio ${arm}, Ripiano ${rip}.`);
                return; 
            }
            if (idCorrente !== customID) {
                 if(confirm(`Spostando questo oggetto, andrà a unirsi a un "${nome}" già presente.\n\nVuoi unire le quantità?`)) {
                    return docRef.update({ 
                        quantita: docSnap.data().quantita + " + " + qta,
                        nome: nome,
                        categoria: categoria,
                        capienza: cap,       // Aggiorna anche questi dati
                        sensibilita: sens
                    }).then(() => {
                        if(idCorrente) return dbCollection.doc(idCorrente).delete();
                    });
                } else { throw new Error("Annullato"); }
            }
        } 
        
        if (!esiste || (esiste && idCorrente === customID)) {
            const promesse = [];
            if(idCorrente && idCorrente !== customID) promesse.push(dbCollection.doc(idCorrente).delete());
            
            promesse.push(docRef.set({
                nome: nome, 
                categoria: categoria,
                armadio: arm, ripiano: rip, quadrante: quad, 
                quantita: qta,
                capienza: cap,      // Salva nuovi dati
                sensibilita: sens
            }));
            return Promise.all(promesse);
        }
    }).then(() => { 
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
    const testo = document.getElementById("cercaAttrezzo").value.toLowerCase();
    const filtroArm = document.getElementById("filtroArmadioRapido").value;
    const filtrati = listaAttrezzi.filter(i => {
        const matchTesto = (i.nome||"").toLowerCase().includes(testo) || 
                           (i.categoria||"").toLowerCase().includes(testo); 
        return matchTesto && (filtroArm === "tutti" || i.armadio === filtroArm);
    });
    renderizza(filtrati);
}

// Globali
window.apriModaleNuovo = apriModaleNuovo;
window.apriModifica = apriModifica;
window.chiudiModale = chiudiModale;
window.salvaAttrezzatura = salvaAttrezzatura;
window.aggiornaRipiani = aggiornaRipiani;
window.applicaFiltri = applicaFiltri;
window.mostraPanelElimina = mostraPanelElimina;
window.annullaEliminazione = annullaEliminazione;
window.eseguiEliminazione = eseguiEliminazione;
window.copiaCategoria = copiaCategoria;