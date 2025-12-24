import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIGURAZIONE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDjXP6cMEnIJZQdSwz7KE9UVGS65L3p1-I",
    authDomain: "inventario-lab-rainerum.firebaseapp.com",
    projectId: "inventario-lab-rainerum",
    storageBucket: "inventario-lab-rainerum.firebasestorage.app",
    messagingSenderId: "1089947549262",
    appId: "1:1089947549262:web:1d02f48d03cada06994d1f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const dbCollection = collection(db, "inventario"); 

let inventario = [];
let oggettoCorrenteId = null;

// --- AVVIO ---
document.addEventListener("DOMContentLoaded", () => {
    inizializzaSelectArmadi();
});

// --- CARICAMENTO DATI ---
onSnapshot(dbCollection, (snapshot) => {
    inventario = [];
    snapshot.forEach((doc) => {
        const d = doc.data();
        inventario.push({ 
            ...d, 
            id: doc.id,
            // Normalizzazione dati
            categoria: d.categoria || "",
            nome: d.nome || "",
            posizione_armadio: d.posizione_armadio || d.armadio || "",
            posizione_ripiano: String(d.posizione_ripiano || d.ripiano || ""), // Forza stringa
            quantita: Number(d.quantita) || 0,
            capacita: d.capacita || "",
            sensibilita: d.sensibilita || ""
        });
    });
    aggiornaTutto();
});

function aggiornaTutto() {
    popolaFiltri();             
    aggiornaOpzioniCategorie(); 
    applicaFiltri();            
}

// Funzione per pulire stringhe (per stacking)
function normalizza(str) {
    return String(str || "").toLowerCase().trim().replace(/\s+/g, '');
}

// --- CONFIGURAZIONE ARMADI ---
function inizializzaSelectArmadi() {
    const selArmadio = document.getElementById("selectArmadio");
    if(!selArmadio) return;

    selArmadio.innerHTML = '<option value="">Scegli Armadio...</option>';
    
    if(window.CONFIGURAZIONE && window.CONFIGURAZIONE.armadi) {
        window.CONFIGURAZIONE.armadi.forEach(arm => {
            const opt = document.createElement("option");
            opt.value = arm.id;
            opt.textContent = `${arm.id} - ${arm.nome}`;
            selArmadio.appendChild(opt);
        });
    }
}

window.aggiornaRipiani = function() {
    const idArmadio = document.getElementById("selectArmadio").value;
    const selRipiano = document.getElementById("selectRipiano");
    
    selRipiano.innerHTML = '<option value="">Ripiano...</option>';
    selRipiano.disabled = true;

    if (!idArmadio || !window.CONFIGURAZIONE) return;

    const armadio = window.CONFIGURAZIONE.armadi.find(a => a.id === idArmadio);
    
    if (armadio) {
        selRipiano.disabled = false;
        for (let i = 1; i <= armadio.ripiani; i++) {
            const opt = document.createElement("option");
            opt.value = String(i); // Importante: forza stringa
            const etichetta = armadio.tipo === 'cassetto' ? 'Cassetto' : 'Ripiano';
            opt.textContent = `${etichetta} ${i}`;
            selRipiano.appendChild(opt);
        }
    }
}

// --- RENDER ---
function renderizzaOggetti(lista) {
    const contenitore = document.getElementById("listaOggetti");
    contenitore.innerHTML = ""; 

    if (lista.length === 0) {
        contenitore.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Nessun oggetto trovato.</p>';
        return;
    }

    lista.forEach(obj => {
        const card = document.createElement("div");
        card.className = "card";
        
        const catBadge = obj.categoria 
            ? `<span style="background:#e8f8f5; color:#1abc9c; padding:3px 8px; border-radius:4px; font-size:0.8em; font-weight:bold; margin-right:5px; text-transform:uppercase;">${obj.categoria}</span>` 
            : '';

        const posizioneDisplay = `${obj.posizione_armadio}.${obj.posizione_ripiano}`;

        card.innerHTML = `
            <div style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                ${catBadge}
                <span class="location-badge"><i class="fas fa-box-archive"></i> ${posizioneDisplay}</span>
            </div>
            
            <h3 style="margin-top:0;">${obj.nome}</h3>
            <p><strong>Capacità:</strong> ${obj.capacita || "-"}</p>
            <p style="font-size: 1.1em; margin: 10px 0;">Quantità: <strong>${obj.quantita}</strong></p>
            
            <button class="btn-edit" onclick="window.apriModaleModifica('${obj.id}')">
                <i class="fas fa-edit"></i> Gestisci
            </button>
        `;
        contenitore.appendChild(card);
    });
}

// --- FILTRI ---
function popolaFiltri() {
    const selCat = document.getElementById("filtroCategoria");
    const selArm = document.getElementById("filtroArmadio");
    
    const valCat = selCat.value;
    const valArm = selArm.value;

    selCat.innerHTML = '<option value="tutti">Tutte le categorie</option>';
    selArm.innerHTML = '<option value="tutti">Tutti gli armadi</option>';
    
    const categorieUniche = [...new Set(inventario.map(i => i.categoria).filter(c => c))].sort();
    const armadiUnici = [...new Set(inventario.map(i => i.posizione_armadio))].filter(Boolean).sort();
    
    categorieUniche.forEach(c => selCat.innerHTML += `<option value="${c}">${c}</option>`);
    armadiUnici.forEach(a => selArm.innerHTML += `<option value="${a}">${a}</option>`);

    if ([...selCat.options].some(o => o.value == valCat)) selCat.value = valCat;
    if ([...selArm.options].some(o => o.value == valArm)) selArm.value = valArm;
}

function aggiornaOpzioniCategorie() {
    const sel = document.getElementById("selectCategoriaEsistente");
    if(sel) {
        sel.innerHTML = '<option value="">-- Scegli esistente --</option>';
        const categorieUniche = [...new Set(inventario.map(i => i.categoria).filter(c => c))].sort();
        categorieUniche.forEach(c => sel.innerHTML += `<option value="${c}">${c}</option>`);
    }
}

window.copiaCategoria = function() {
    const select = document.getElementById("selectCategoriaEsistente");
    const input = document.getElementById("inputCategoria");
    if (select.value) input.value = select.value;
}

window.applicaFiltri = function() {
    const testo = document.getElementById("cercaNome").value.toLowerCase();
    const fCat = document.getElementById("filtroCategoria").value;
    const fArm = document.getElementById("filtroArmadio").value;

    const lista = inventario.filter(obj => {
        const okNome = obj.nome.toLowerCase().includes(testo);
        const okCat = fCat === "tutti" || obj.categoria === fCat;
        const okArm = fArm === "tutti" || obj.posizione_armadio == fArm;
        return okNome && okArm && okCat;
    });
    renderizzaOggetti(lista);
}

// --- GESTIONE MODALE ---
window.apriModaleNuovo = function() {
    oggettoCorrenteId = null; 
    document.getElementById("titoloModale").innerText = "Nuova Attrezzatura";
    
    document.getElementById("inputCategoria").value = "";
    document.getElementById("selectCategoriaEsistente").value = "";
    document.getElementById("inputNome").value = "";
    document.getElementById("selectArmadio").value = "";
    document.getElementById("selectRipiano").innerHTML = '<option value="">Ripiano...</option>';
    document.getElementById("selectRipiano").disabled = true;
    document.getElementById("inputQuantita").value = 1;
    document.getElementById("inputSensibilita").value = "";
    document.getElementById("inputCapienza").value = "";
    
    document.getElementById("btnElimina").style.display = "none";
    document.getElementById("modalModifica").style.display = "block";
}

window.apriModaleModifica = function(id) {
    const obj = inventario.find(x => x.id === id);
    if (!obj) return;

    oggettoCorrenteId = id;
    document.getElementById("titoloModale").innerText = "Modifica " + obj.nome;
    
    document.getElementById("inputCategoria").value = obj.categoria || "";
    document.getElementById("selectCategoriaEsistente").value = "";
    document.getElementById("inputNome").value = obj.nome;
    document.getElementById("inputQuantita").value = obj.quantita;
    document.getElementById("inputSensibilita").value = obj.sensibilita;
    document.getElementById("inputCapienza").value = obj.capacita;

    const selArm = document.getElementById("selectArmadio");
    const selRip = document.getElementById("selectRipiano");

    selArm.value = obj.posizione_armadio;
    window.aggiornaRipiani();
    setTimeout(() => { selRip.value = String(obj.posizione_ripiano); }, 50);

    document.getElementById("btnElimina").style.display = "block";
    document.getElementById("modalModifica").style.display = "block";
}

window.chiudiModale = function() { document.getElementById("modalModifica").style.display = "none"; }
window.cambiaQuantita = function(d) {
    const i = document.getElementById("inputQuantita");
    i.value = Math.max(0, parseInt(i.value || 0) + d);
}

// --- SALVATAGGIO & ELIMINAZIONE AUTOMATICA ---
window.salvaModifiche = async function() {
    const categoria = document.getElementById("inputCategoria").value.trim();
    const nome = document.getElementById("inputNome").value.trim();
    const armadioId = document.getElementById("selectArmadio").value;
    const ripianoNum = String(document.getElementById("selectRipiano").value);
    const qta = parseInt(document.getElementById("inputQuantita").value) || 0;
    const sens = document.getElementById("inputSensibilita").value.trim();
    const cap = document.getElementById("inputCapienza").value.trim();

    if (!nome || !armadioId) { alert("Inserisci Nome e Armadio!"); return; }

    const btn = document.getElementById("btnSalva");
    btn.innerHTML = "Salvataggio...";
    btn.disabled = true;

    try {
        if (oggettoCorrenteId) {
            // --- MODIFICA ---
            // SE QUANTITA' <= 0 -> ELIMINA
            if (qta <= 0) {
                if(confirm("La quantità è 0. Vuoi eliminare l'oggetto definitivamente?")) {
                    await deleteDoc(doc(db, "inventario", oggettoCorrenteId));
                }
            } else {
                await updateDoc(doc(db, "inventario", oggettoCorrenteId), {
                    categoria, nome, posizione_armadio: armadioId, posizione_ripiano: ripianoNum,
                    quantita: qta, sensibilita: sens, capacita: cap
                });
            }
            window.chiudiModale();
        } else {
            // --- NUOVO (Stacking) ---
            const firmaNuovo = normalizza(nome) + normalizza(armadioId) + normalizza(ripianoNum) + normalizza(cap);
            
            const duplicato = inventario.find(obj => {
                const firmaEsistente = normalizza(obj.nome) + normalizza(obj.posizione_armadio) + normalizza(obj.posizione_ripiano) + normalizza(obj.capacita);
                return firmaEsistente === firmaNuovo;
            });

            if(duplicato) {
                if(confirm(`"${duplicato.nome}" esiste già. Aggiungo +${qta} unità a quello esistente?`)) {
                    await updateDoc(doc(db, "inventario", duplicato.id), { 
                        quantita: Number(duplicato.quantita) + qta 
                    });
                    window.chiudiModale();
                }
            } else {
                if(qta > 0) {
                    await addDoc(dbCollection, {
                        categoria, nome, posizione_armadio: armadioId, posizione_ripiano: ripianoNum,
                        quantita: qta, sensibilita: sens, capacita: cap
                    });
                    window.chiudiModale();
                } else {
                    alert("Quantità deve essere maggiore di 0");
                }
            }
        }
    } catch (e) {
        console.error("Errore:", e);
        alert("Errore salvataggio: " + e.message);
    } finally {
        btn.innerHTML = 'Salva su Cloud';
        btn.disabled = false;
    }
}

// Eliminazione manuale col tasto rosso
window.eliminaOggettoCorrente = async function() {
    if(oggettoCorrenteId && confirm("Eliminare definitivamente?")) {
        await deleteDoc(doc(db, "inventario", oggettoCorrenteId));
        window.chiudiModale();
    }
}

window.onclick = function(e) { if (e.target == document.getElementById("modalModifica")) window.chiudiModale(); }