// script_mappa.js

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("mappaLaboratorio");
    const conf = window.CONFIGURAZIONE;

    if (!conf) {
        grid.innerHTML = "Errore: config_lab.js non caricato.";
        return;
    }

    // Imposta righe e colonne
    grid.style.gridTemplateColumns = `repeat(${conf.cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${conf.rows}, 70px)`;

    conf.armadi.forEach(arm => {
        const div = document.createElement("div");
        div.className = "grid-item";
        div.style.backgroundColor = arm.colore;

        // Posizionamento CSS Grid
        const w = arm.larghezza || 1;
        const h = arm.altezza || 1;
        div.style.gridColumn = `${arm.pos_x} / span ${w}`;
        div.style.gridRow = `${arm.pos_y} / span ${h}`;

        div.innerHTML = `
            <i class="fas fa-${arm.tipo === 'cassetto' ? 'layer-group' : 'door-closed'}" style="font-size:1.1em; margin-bottom:2px;"></i>
            <span style="font-size:0.85em;">${arm.id}</span>
            <small style="font-size:0.55em; line-height:1.1;">${arm.nome}</small>
        `;

        div.onclick = () => {
            // alert(`Hai cliccato su ${arm.nome}.`);
            window.location.href = `armadio.html?id=${arm.id}`;
        };

        grid.appendChild(div);
    });
});