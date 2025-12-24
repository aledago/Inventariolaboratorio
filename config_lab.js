// config_lab.js
// Assegniamo la configurazione alla finestra globale (window)
window.CONFIGURAZIONE = {
    // Dimensioni della griglia (Righe e Colonne)
    rows: 3, 
    cols: 4, 

    // Elenco degli armadi
    armadi: [
        { 
            id: "A", 
            nome: "placeholder", 
            tipo: "armadio", 
            ripiani: 4,      
            colore: "#e74c3c", 
            pos_x: 1, pos_y: 1 
        },
        { 
            id: "B", 
            nome: "placeholder", 
            tipo: "armadio",
            ripiani: 5, 
            colore: "#3498db", 
            pos_x: 2, pos_y: 1 
        },
        { 
            id: "C", 
            nome: "placeholder", 

            tipo: "cassetto",
            ripiani: 8, 
            colore: "#f1c40f", 
            pos_x: 4, pos_y: 1 
        },
        { 
            id: "D", 
            nome: "placeholder", 
            tipo: "sportello",
            ripiani: 2, 
            colore: "#95a5a6", // Grigio
            pos_x: 1, pos_y: 3 
        },
        { 
            id: "F", 
            nome: "Composti", 
            tipo: "armadio", 
            ripiani: 3,      
            colore: "#7bb369", 
            pos_x: 1, pos_y: 2 
        },
    ]
};