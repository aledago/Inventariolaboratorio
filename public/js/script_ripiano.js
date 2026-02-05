// script_ripiano.js

const dbAttrezzature = db.collection("attrezzature");
const dbComposti = db.collection("composti");

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const armadioId = urlParams.get('armadio');
    const ripianoNum = urlParams.get('ripiano');

    if (!armadioId || !ripianoNum) {
        document.getElementById("titoloRipiano").innerText = "Errore";
        document.getElementById("descrizioneRipiano").innerText = "Parametri mancanti.";
        return;
    }

    caricaDatiRipiano(armadioId, ripianoNum);
    impostaIntestazione(armadioId, ripianoNum);
});

function impostaIntestazione(armId, ripId) {
    if (window.CONFIGURAZIONE && window.CONFIGURAZIONE.armadi) {
        const arm = window.CONFIGURAZIONE.armadi.find(a => a.id === armId);
        const nomeArmadio = arm ? arm.nome : "Sconosciuto";
        document.getElementById("titoloRipiano").innerText = `Armadio ${armId} - Ripiano ${ripId}`;
        document.getElementById("descrizioneRipiano").innerText = `${nomeArmadio}`;

        // Colore di sfondo header in base all'armadio
        if (arm && arm.colore) {
            const hex = arm.colore;
            // Semplice versione opacizzata o gradiente
            document.getElementById("shelfInfo").style.background = `linear-gradient(135deg, ${hex} 0%, ${adjustColor(hex, -20)} 100%)`;
        }
    } else {
        document.getElementById("titoloRipiano").innerText = `Armadio ${armId} - Ripiano ${ripId}`;
    }
}

async function caricaDatiRipiano(armId, ripId) {
    const grid = document.getElementById("contenutoRipiano");
    grid.innerHTML = '<p style="text-align:center; width:100%;">Caricamento oggetti...</p>';

    try {
        // Query Attrezzature
        const qAttr = await dbAttrezzature
            .where("armadio", "==", armId)
            //.where("ripiano", "==", ripId) // Attenzione: ripiano salvato come stringa o numero? Solitamente stringa nei form HTML
            .get();

        // Query Composti
        const qComp = await dbComposti
            .where("armadio", "==", armId)
            //.where("ripiano", "==", ripId)
            .get();

        let items = [];

        qAttr.forEach(doc => {
            const d = doc.data();
            // Filtro manuale per ripiano se necessario (per sicurezza sui tipi)
            if (String(d.ripiano) === String(ripId)) {
                items.push({ type: 'attrezzo', id: doc.id, ...d });
            }
        });

        qComp.forEach(doc => {
            const d = doc.data();
            if (String(d.ripiano) === String(ripId)) {
                items.push({ type: 'composto', id: doc.id, ...d });
            }
        });

        // Ordinamento per posizione (decrescente: da destra verso sinistra... aspetta, l'utente ha detto "da destra verso sinistra a partire da 1")
        // Se 1 è a destra, e noi leggiamo da sinistra a destra, l'ordine visivo classico (1, 2, 3) mostra 1 a sinistra.
        // Se l'utente intende che fisicamente sullo scaffale l'1 è a destra, allora l'ordine di visualizzazione dipende da come vogliamo mostrarli.
        // Solitamente le liste si leggono 1..N. Se visualizzo 1, 2, 3, l'utente troverà l'1 (che è a destra) come primo elemento della lista (in alto a sinistra).
        // Manteniamo ordinamento crescente di posizione.
        items.sort((a, b) => {
            const pA = a.posizione || 9999;
            const pB = b.posizione || 9999;
            return pA - pB;
        });

        renderizzaItems(items, grid);

    } catch (error) {
        console.error("Errore caricamento:", error);
        grid.innerHTML = `<p style="color:red; text-align:center;">Errore nel caricamento dei dati: ${error.message}</p>`;
    }
}

function renderizzaItems(items, container) {
    container.innerHTML = "";
    if (items.length === 0) {
        container.innerHTML = '<div style="text-align:center; width:100%; padding:20px; color:#6b7280; background:#f9fafb; border-radius:8px;">Questo ripiano è vuoto.</div>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.position = "relative"; // Per badge posizione

        const posDisplay = item.posizione ? `<div class="position-badge">${item.posizione}</div>` : '';

        let icona = item.type === 'attrezzo' ? 'fa-flask' : 'fa-vial';
        let subInfo = "";

        if (item.type === 'attrezzo') {
            subInfo = `<div style="font-size:0.9em; color:#555;"><i class="fas fa-cubes"></i> Qta: <b>${item.quantita}</b></div>`;
        } else {
            subInfo = `<div style="font-size:0.9em; color:#555;"><i class="fas fa-cubes"></i> Qta: <b>${item.quantita}</b></div>
                       <div style="font-size:0.8em; color:#059669;">${item.formula || ''}</div>`;
        }

        const classeInfo = item.classe ? `<div style="margin-top:5px; font-size:0.8em; color:#4f46e5; background:#eef2ff; padding:2px 5px; border-radius:4px; display:inline-block;">Class: ${item.classe}</div>` : '';

        card.innerHTML = `
            ${posDisplay}
            <div style="margin-right:40px;"> <!-- Spazio per badge -->
                <h3 style="margin: 0 0 5px 0; font-size:1.1rem; color:#1f2937;">${item.nome}</h3>
                <span class="badge-cat" style="font-size:0.7em;">${item.type === 'attrezzo' ? (item.categoria || 'Attrezzo') : 'Composto'}</span>
            </div>
            <div style="margin-top:10px;">
                ${subInfo}
                ${classeInfo}
            </div>
        `;
        container.appendChild(card);
    });
}

// Helper per scurire colore
function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}
