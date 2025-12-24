// --- CONFIGURAZIONE ---
const PASSWORD_ADMIN = "1234";

// Link Console (Aggiornato a chimica)
const BASE_URL_DB = "https://console.firebase.google.com/project/inventario-lab-rainerum/firestore/databases/-default-/data/~2Fchimica";

const firebaseConfig = {
    apiKey: "AIzaSyDjXP6cMEnIJZQdSwz7KE9UVGS65L3p1-I",
    authDomain: "inventario-lab-rainerum.firebaseapp.com",
    projectId: "inventario-lab-rainerum",
    storageBucket: "inventario-lab-rainerum.firebasestorage.app",
    messagingSenderId: "1089947549262",
    appId: "1:1089947549262:web:1d02f48d03cada06994d1f"
};

// Inizializzazione Classica
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ⚠️ NOME COLLEZIONE CORRETTO: "chimica"
const dbCollection = db.collection("chimica"); 

let listaComposti = [];
let idCorrente = null;

document.addEventListener("DOMContentLoaded", () => {
    inizializzaArmadi();
    window.onclick = function(e) { 
        if(e.target == document.getElementById("modalComposto")) chiudiModale(); 
    }
});

// --- FUNZIONI UI ---

function renderizza(lista) {
    const container = document.getElementById("listaComposti");
    container.innerHTML = "";
    
    if(lista.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#666;'>Nessun composto trovato.</p>";
        return;
    }

    // Ordina A-Z
    lista.sort((a,b) => (a.nome || "").localeCompare(b.nome || ""));

    lista.forEach(item => {
        const oggi = new Date().toISOString().split('T')[0];
        const scaduto = item.scadenza && item.scadenza < oggi;
        
        let htmlScaduto = "";
        if(scaduto) htmlScaduto = `<span class="scaduto-label"><i class="fas fa-exclamation-triangle"></i> SCADUTO</span>`;

        let htmlLink = "";
        if(item.link_sicurezza) {
            htmlLink = `<a href="${item.link_sicurezza}" target="_blank" class="btn-sds"><i class="fas fa-file-pdf"></i> Scheda SDS</a>`;
        }

        const div = document.createElement("div");
        div.className = "card";
        if(scaduto) div.style.borderLeftColor = "#ef4444"; // Rosso se scaduto

        div.innerHTML = `
            ${htmlScaduto}
            <h3>${item.nome}</h3>
            ${item.formula ? `<div class="formula-text">${item.formula}</div>` : ''}
            
            <div style="font-size:0.95em; color:#4b5563; margin: 10px 0;">
                <i class="fas fa-map-marker-alt"></i> 
                Pos: <b>${item.armadio}.${item.ripiano}</b> (Q.${item.quadrante})
            </div>

            <div style="font-size:0.9em; margin-bottom:10px;">
                <i class="far fa-calendar-alt"></i> Scadenza: ${item.scadenza || "N/D"}
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                ${htmlLink}
                <button class="btn-edit" onclick="apriModifica('${item.id}')" style="margin-left:auto;">GESTISCI</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function inizializzaArmadi() {
    const sel = document.getElementById("selectArmadio");
    const fil = document.getElementById("filtroArmadio");
    if(!sel) return;
    
    sel.innerHTML = "<option value=''>Scegli Armadio...</option>";
    if(fil) fil.innerHTML = "<option value='tutti'>Tutti gli Armadi</option>";

    if(window.CONFIGURAZIONE && window.CONFIGURAZIONE.armadi) {
        window.CONFIGURAZIONE.armadi.forEach(arm => {
            sel.innerHTML += `<option value="${arm.id}">${arm.id} - ${arm.nome}</option>`;
            if(fil) fil.innerHTML += `<option value="${arm.id}">Armadio ${arm.id}</option>`;
        });
    }
}

function aggiornaRipiani() {
    const armId = document.getElementById("selectArmadio").value;
    const ripSel = document.getElementById("selectRipiano");
    ripSel.innerHTML = "<option value=''>Ripiano...</option>";
    ripSel.disabled = true;

    if(window.CONFIGURAZIONE) {
        const arm = window.CONFIGURAZIONE.armadi.find(a => a.id === armId);
        if(arm) {
            ripSel.disabled = false;
            for(let i=1; i<=arm.ripiani; i++) {
                ripSel.innerHTML += `<option value="${i}">Ripiano ${i}</option>`;
            }
        }
    }
}

// --- DATABASE ---

dbCollection.onSnapshot((snapshot) => {
    listaComposti = [];
    snapshot.forEach((doc) => {
        listaComposti.push({ ...doc.data(), id: doc.id });
    });
    filtraComposti(); 
}, (error) => {
    console.error("Errore caricamento chimica:", error);
    document.getElementById("listaComposti").innerHTML = "<p style='color:red; text-align:center'>Errore caricamento (Vedi Console)</p>";
});

function apriModaleNuovo() {
    idCorrente = null;
    document.getElementById("titoloModale").innerText = "Nuovo Composto";
    document.getElementById("inputNome").value = "";
    document.getElementById("inputFormula").value = "";
    document.getElementById("inputScadenza").value = "";
    document.getElementById("selectArmadio").value = "";
    document.getElementById("selectRipiano").innerHTML = "<option value=''>Ripiano...</option>";
    document.getElementById("selectRipiano").disabled = true;
    document.getElementById("inputQuadrante").value = "";
    document.getElementById("inputLink").value = "";
    
    document.getElementById("btnElimina").style.display = "none";
    document.getElementById("modalComposto").style.display = "block";
}

function apriModifica(id) {
    idCorrente = id;
    const obj = listaComposti.find(o => o.id === id);
    if(!obj) return;

    document.getElementById("titoloModale").innerText = "Modifica " + obj.nome;
    document.getElementById("inputNome").value = obj.nome;
    document.getElementById("inputFormula").value = obj.formula || "";
    document.getElementById("inputScadenza").value = obj.scadenza || "";
    
    document.getElementById("selectArmadio").value = obj.armadio;
    aggiornaRipiani();
    setTimeout(() => { document.getElementById("selectRipiano").value = obj.ripiano; }, 50);
    
    document.getElementById("inputQuadrante").value = obj.quadrante || "";
    document.getElementById("inputLink").value = obj.link_sicurezza || "";

    document.getElementById("btnElimina").style.display = "block";
    document.getElementById("modalComposto").style.display = "block";
}

function chiudiModale() {
    document.getElementById("modalComposto").style.display = "none";
}

function eliminaComposto() {
    if(confirm("Sei sicuro di voler eliminare questo composto?")) {
         const linkFinale = BASE_URL_DB + "~2F" + idCorrente;
         window.location.href = linkFinale;
    }
}

function generaID(nome, armadio, ripiano, quadrante) {
    const n = String(nome || "").toLowerCase().trim().replace(/\s+/g, '');
    const a = String(armadio || "").toLowerCase().trim().replace(/\s+/g, '');
    const r = String(ripiano || "").toLowerCase().trim().replace(/\s+/g, '');
    const q = String(quadrante || "").toLowerCase().trim().replace(/\s+/g, '');
    return `${n}_${a}_${r}_${q}`;
}

function salvaComposto() {
    const nome = document.getElementById("inputNome").value.trim();
    const formula = document.getElementById("inputFormula").value.trim();
    const scadenza = document.getElementById("inputScadenza").value;
    const arm = document.getElementById("selectArmadio").value;
    const rip = document.getElementById("selectRipiano").value;
    const qua = document.getElementById("inputQuadrante").value.trim();
    const link = document.getElementById("inputLink").value.trim();

    if(!nome || !arm || !rip) {
        alert("Inserisci Nome, Armadio e Ripiano.");
        return;
    }

    const btn = document.getElementById("btnSalva");
    btn.innerHTML = "Attendi..."; btn.disabled = true;

    const customID = generaID(nome, arm, rip, qua);
    const docRef = dbCollection.doc(customID);

    docRef.get().then((docSnap) => {
        let esiste = docSnap.exists;

        if (esiste && (!idCorrente || idCorrente !== customID)) {
             alert(`ATTENZIONE: "${nome}" esiste già in quella posizione.`);
             return;
        }

        const promesse = [];
        if(idCorrente && idCorrente !== customID) promesse.push(dbCollection.doc(idCorrente).delete());

        promesse.push(docRef.set({
            nome, formula, scadenza, 
            armadio: arm, ripiano: rip, quadrante: qua,
            link_sicurezza: link
        }));

        return Promise.all(promesse);
    }).then((res) => {
        if(res) chiudiModale();
    }).catch(e => {
        alert("Errore: " + e.message);
    }).finally(() => {
        btn.innerHTML = "SALVA"; btn.disabled = false;
    });
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

// Export Globale
window.apriModaleNuovo = apriModaleNuovo;
window.apriModifica = apriModifica;
window.chiudiModale = chiudiModale;
window.salvaComposto = salvaComposto;
window.eliminaComposto = eliminaComposto;
window.aggiornaRipiani = aggiornaRipiani;
window.filtraComposti = filtraComposti;