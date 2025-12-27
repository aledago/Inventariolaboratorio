# Inventario Laboratorio Rainerum

Progetto per la gestione dell'inventario del laboratorio, ottimizzato per Firebase Hosting.

## 📁 Struttura del Progetto

- `/public`: Contiene tutti i file statici del sito.
  - `/css`: Fogli di stile.
  - `/js`: Logica JavaScript e configurazioni.
- `.github/workflows`: Configurazione per il deploy automatico su Firebase.
- `REPORT_SICUREZZA.md`: Analisi sulla sicurezza delle password.

## 🛠 Sviluppo Locale con Firebase Emulator

Per testare le modifiche in locale senza influenzare i dati reali su Firebase, è consigliato usare la suite di emulatori di Firebase.

### 1. Prerequisiti
Assicurati di avere [Node.js](https://nodejs.org/) installato e installa i Firebase Tools globalmente:

```bash
npm install -g firebase-tools
```

### 2. Login e Inizializzazione
Effettua il login al tuo account Google associato a Firebase:

```bash
firebase login
```

### 3. Avviare gli Emulatori
Puoi avviare l'emulatore di Hosting (e Firestore se configurato) con il seguente comando:

```bash
firebase emulators:start
```

- **Hosting**: Solitamente disponibile su [http://localhost:5000](http://localhost:5000)
- **Emulator UI**: Disponibile su [http://localhost:4000](http://localhost:4000), permette di vedere i log e gestire i dati simulati.

### 4. Testare solo l'Hosting
Se vuoi solo vedere come appare il sito senza emulare il database:

```bash
firebase serve
```

## 🚀 Deploy
Il progetto è configurato per il deploy automatico ogni volta che viene fatto un `push` sul branch `main`.

Per farlo manualmente:
```bash
firebase deploy --only hosting
```

---
*Nota: Leggi `REPORT_SICUREZZA.md` per informazioni importanti sulla gestione delle password admin.*
