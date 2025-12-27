# Report di Sicurezza e Gestione Password

Questo documento analizza lo stato attuale della sicurezza del progetto e fornisce linee guida per migliorare la gestione delle credenziali.

## 🚨 Vulnerabilità Identificata: Password Hardcoded

Attualmente, il file `public/gestione_comune.js` contiene la seguente riga:

```javascript
const PASSWORD_ADMIN = "1234"; // La cambi qui e vale per TUTTI
```

### Perché è un problema?
1.  **Visibilità Pubblica**: Poiché il codice JavaScript viene eseguito sul lato client (nel browser dell'utente), **chiunque** può visualizzare questa password semplicemente usando la funzione "Ispeziona Elemento" o visualizzando il sorgente della pagina.
2.  **Mancanza di Controllo**: Non c'è modo di revocare l'accesso a una singola persona senza cambiare la password per tutti e ridistribuire l'applicazione.

## 🔒 Soluzione Consigliata: Firebase Authentication

Per rendere l'applicazione sicura, si raccomanda di passare a **Firebase Authentication**.

### Vantaggi
*   **Sicurezza Reale**: Le password non sono mai esposte nel codice client.
*   **Gestione Utenti**: Puoi sapere esattamente CHI sta facendo modifiche.
*   **Permessi Granulari**: Puoi decidere chi può solo leggere e chi può scrivere.

### Come Implementarlo

1.  **Attiva Auth nella Console Firebase**:
    *   Vai su *Authentication* > *Sign-in method*.
    *   Attiva "Email/Password" o "Google".

2.  **Modifica il Codice**:
    Invece di controllare `PASSWORD_ADMIN`, userai l'SDK di Firebase:

    ```javascript
    // Login
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Loggato con successo
      })
      .catch((error) => {
        // Errore
      });
    
    // Verifica stato auth prima di azioni critiche
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // Utente loggato, mostra tasti elimina/modifica
      } else {
        // Utente non loggato, nascondi funzionalità admin
      }
    });
    ```

3.  **Aggiorna le Regole di Sicurezza (Firestore Rules)**:
    Nella console Firebase > Firestore > Rules:

    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read: if true; // Chiunque può leggere
          allow write: if request.auth != null; // Solo chi è loggato può modificare
        }
      }
    }
    ```

## 🛠 Gestione Segreti (GitHub Actions)

Per il deploy automatico, abbiamo configurato un Workflow GitHub. È fondamentale che il `FIREBASE_SERVICE_ACCOUNT` sia mantenuto segreto.

*   Viene salvato in **Settings > Secrets and variables > Actions** su GitHub.
*   Non committare mai file `.env` o chiavi private direttamente nel repository.
