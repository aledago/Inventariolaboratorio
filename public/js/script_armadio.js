// script_armadio.js

const dbAttrezzature = db.collection("attrezzature");
const dbComposti = db.collection("composti");

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const armadioId = urlParams.get('id');

    if (!armadioId) {
        document.getElementById("loading").innerText = "ID Armadio mancante.";
        return;
    }

    document.getElementById("pageTitle").innerText = `Armadio ${armadioId}`;
    caricaTuttoArmadio(armadioId);
});

async function caricaTuttoArmadio(armId) {
    const container = document.getElementById("armadioContent");
    const loading = document.getElementById("loading");

    try {
        // Parallel queries
        const [snapAttr, snapComp] = await Promise.all([
            dbAttrezzature.where("armadio", "==", armId).get(),
            dbComposti.where("armadio", "==", armId).get()
        ]);

        let items = [];

        snapAttr.forEach(doc => {
            items.push({ type: 'attrezzo', id: doc.id, ...doc.data() });
        });

        snapComp.forEach(doc => {
            items.push({ type: 'composto', id: doc.id, ...doc.data() });
        });

        loading.style.display = 'none';

        if (items.length === 0) {
            container.innerHTML = '<p style="text-align:center;">Nessun oggetto in questo armadio.</p>';
            return;
        }

        // Raggruppa per ripiano
        const raggruppati = {};
        items.forEach(item => {
            const rip = item.ripiano || 'ND'; // 'ND' se mancante (non dovrebbe)
            if (!raggruppati[rip]) raggruppati[rip] = [];
            raggruppati[rip].push(item);
        });

        // Ordina le chiavi (ripiani)
        // Se numerici 1..N, li ordiniamo numericamente.
        const ripianiOrdinati = Object.keys(raggruppati).sort((a, b) => {
            const nA = parseInt(a);
            const nB = parseInt(b);
            if (!isNaN(nA) && !isNaN(nB)) return nA - nB;
            return a.localeCompare(b);
        });

        // Renderizza
        container.innerHTML = "";
        ripianiOrdinati.forEach(rip => {
            const shelfItems = raggruppati[rip];

            // Ordina items per posizione nel ripiano
            shelfItems.sort((a, b) => {
                const pA = parseInt(a.posizione) || 999;
                const pB = parseInt(b.posizione) || 999;
                return pA - pB;
            });

            const section = document.createElement("div");
            section.className = "shelf-section";

            const title = document.createElement("div");
            title.className = "shelf-title";
            title.innerHTML = `<i class="fas fa-layer-group"></i> Ripiano ${rip}`;
            section.appendChild(title);

            const grid = document.createElement("div");
            grid.className = "grid-container";

            shelfItems.forEach(item => {
                grid.appendChild(createItemCard(item));
            });

            section.appendChild(grid);
            container.appendChild(section);
        });

    } catch (e) {
        console.error(e);
        loading.innerHTML = `<p style="color:red">Errore: ${e.message}</p>`;
    }
}

function createItemCard(item) {
    const card = document.createElement("div");
    card.className = "card";

    const pos = item.posizione ? `<div class="position-badge" title="Posizione">${item.posizione}</div>` : '';

    let icona = item.type === 'attrezzo' ? 'fa-flask' : 'fa-vial';
    let subInfo = "";
    let badge = `<span class="badge-cat" style="font-size:0.75em; background:#eef2ff; color:#4338ca; padding:2px 6px; border-radius:4px;">${item.type === 'attrezzo' ? 'Attrezzo' : 'Composto'}</span>`;

    if (item.type === 'attrezzo') {
        subInfo = `<div style="font-size:0.9em; color:#555;">Qta: <b>${item.quantita}</b></div>`;
        if (item.categoria) badge += ` <span style="font-size:0.75em; border:1px solid #ddd; padding:2px 4px; border-radius:4px; margin-left:5px;">${item.categoria}</span>`;
    } else {
        subInfo = `<div style="font-size:0.9em; color:#555;">Qta: <b>${item.quantita}</b></div>
                   <div style="font-size:0.85em; color:#059669; font-family:monospace;">${item.formula || ''}</div>`;
        if (item.classe) badge += ` <span style="font-size:0.75em; border:1px solid #fecaca; background:#fef2f2; color:#b91c1c; padding:2px 4px; border-radius:4px; margin-left:5px;">${item.classe}</span>`;
    }

    card.innerHTML = `
        ${pos}
        <div style="margin-right:35px;">
            <h4 style="margin:0 0 5px; font-size:1.1rem; color:#111827;">${item.nome}</h4>
            ${badge}
        </div>
        <div style="margin-top:10px;">
            ${subInfo}
        </div>
    `;
    return card;
}
