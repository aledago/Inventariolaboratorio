# 🧪 Collaudo Finale - Laboratorio Rainerum

## 🗺️ 1. Test Mappa (La novità)
- [ ] **Caricamento:** Apri `mappa.html`. La griglia appare o rimane bianca?
- [ ] **Armadi:** Vedi i rettangoli colorati al posto giusto?
- [ ] **Interazione:** Clicca su un armadio. Appare l'alert con il nome?
- [ ] **Coerenza:** I colori sono giusti (es. Rosso=Infiammabili)?

## 📦 2. Test Attrezzatura
- [ ] **Aggiunta:** Crea "Becher Test", Armadio A, Ripiano 1. Appare in lista?
- [ ] **Modifica:** Rinominalo in "Becher Modificato". Il nome cambia?
- [ ] **Filtro:** Cerca "Becher". La lista mostra solo lui?
- [ ] **Tendine:** Se cambi Armadio (es. da A a B), i ripiani si aggiornano?

## ☣️ 3. Test Chimica
- [ ] **Aggiunta:** Crea "Acido Test", Formula `H2O`. Si vede bene?
- [ ] **Scadenza:** Metti una data passata (es. 2020). Appare la scritta **SCADUTO**?
- [ ] **Formula:** La scritta `H2O` ha il font tecnico diverso dagli altri?

## 🔐 4. Test "Admin" e Cancellazione
- [ ] **Protezione:** Prova a eliminare un oggetto con password sbagliata. (Deve dare Errore).
- [ ] **Eliminazione:** Riprova con la password giusta (es. `Au79`). (L'oggetto deve sparire).
- [ ] **Verifica:** Ricarica la pagina. L'oggetto è sparito davvero?

## 🔄 5. Test Persistenza
- [ ] **Chiusura:** Chiudi completamente il browser e riapri `index.html`.
- [ ] **Risultato:** I dati inseriti (non cancellati) sono ancora lì?