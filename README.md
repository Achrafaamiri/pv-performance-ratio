# Performance Ratio — monitoraggio fotovoltaico

App Angular che scarica i dati orari di un impianto fotovoltaico da un'API di
monitoraggio e ne calcola il Performance Ratio, giornaliero e sul periodo.

Il Performance Ratio è l'indice di efficienza di un impianto: quanto ha prodotto
davvero, rapportato a quanto avrebbe prodotto con quell'irraggiamento in
condizioni ideali.

## Esecuzione

```bash
npm install
npm start
```

`http://localhost:4200` → incolla il Web API Token → *Carica*.

## Calcolo

```
PR[%] = E_real / E_module × 100

E_real   = max − min del contatore "Energia" nel giorno
E_module = P_nom × Σ (Irr_j / Irr_std) × Δt_j      P_nom = 4 kW, Irr_std = 1000 W/m²
```

Il calcolo sta in `src/app/pr.ts`: funzioni pure, senza dipendenze da Angular o
dalla rete. Autenticazione e chiamate HTTP sono isolate in un service separato,
così la logica resta testabile da sola.

## Scelte

- **Finestra 18–25 settembre 2026.** Il periodo più recente restituisce
  `data: []`: ho individuato con `/getLastValue` dove finiscono effettivamente i
  dati e spostato la finestra lì.
- **Autenticazione in due passi.** Il token inserito dall'utente è un `apiToken`,
  da scambiare su `/authenticate` per il token di sessione usato nelle chiamate.
- **ID impianto/device/log fissi**, ricavati per nome dal portale: riduce le
  chiamate da 5 a 2.
- **Nessun proxy.** Verificato che l'API espone `access-control-allow-origin: *`
  e accetta il preflight con header `authorization`.
- **Giorni in UTC.** I timestamp dell'API hanno l'offset già incorporato
  (verificato: picco di irraggiamento a metà giornata, "Energia giornaliera" che
  si azzera alle 00:00), quindi UTC restituisce il giorno locale dell'impianto.
- **Dati mancanti** in tre forme — riga assente, `null`, codici di errore stringa
  (`"#E2"`) — normalizzati a `null` in un punto solo.
- **Δt misurato dai timestamp**, non assunto. Intervalli oltre le 2 ore esclusi da
  `E_module`: comporta una leggera sovrastima del PR nei giorni con interruzioni.
- **P_nom = 4 kW da specifica.** Il segnale "PR oggi" esposto dal portale
  differisce perché la sua produzione teorica implica un impianto da circa 9 kW.
- **`fixture.json`** è una risposta reale dell'API salvata durante lo sviluppo:
  serve da riferimento per la struttura di `items`/`data` e per rifare i conti
  a mano senza ripetere le chiamate.

## Verifica

`E_real` del 18/09 vale **12.9 kWh**, identico al segnale "Energia giornaliera"
esposto dal portale. Quel giorno: E_module 16.95 kWh, **PR 76.1 %**.
I PR giornalieri stanno fra 74.5 % e 78.2 %, il periodo a 76.4 %.

`totalPR` è il rapporto fra le somme, non la media dei PR giornalieri.

## Limiti

Nessun test automatico; solo tabelle, nessun grafico; il token di sessione non
viene rinnovato.

## Uso di strumenti AI

Sviluppato con l'assistenza di Claude (Anthropic), per la ricognizione dell'API e
per il supporto e la spiegazione. Ogni informazione sull'API è stata verificata
direttamente sul portale e il codice è stato rivisto riga per riga: comprendo e
sottoscrivo l'intero contenuto del progetto.
