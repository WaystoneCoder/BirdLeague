# BirdLeague V3 – regionale Punktelogik

BirdLeague bewertet ab V3 **Art × Region × Zeitfenster** statt jeder Art überall denselben Wert zu geben.

## Aktueller Datenstand
- Bengt: 111 Jahresarten / 232 Punkte
- Ida: 113 Jahresarten / 230 Punkte
- Finn: 87 Jahresarten / 172 Punkte
- 137 verschiedene Arten in der Liga
- alle aktuellen Funde (Mai–August 2026) bewertet

## Regionen
- DE-NORTH – Deutschland Nord
- DE-CENTRAL – Deutschland Mitte
- DE-SOUTH – Deutschland Süd
- DK – Dänemark
- SE-SOUTH – Südschweden
- SE-CENTRAL – Mittelschweden
- SE-NORTH – Nordschweden
- NO – Norwegen
- JP-TOKYO – Japan / Tokio
- OTHER – Fallback für neue Gebiete

## Zeitfenster
- may_aug – Mai bis August
- sep_nov – September bis November
- dec_feb – Dezember bis Februar
- mar_apr – März bis April

Die Masterliste enthält bewusst nur bereits benötigte Region-/Zeit-Kombinationen. Eine neue Kombination wird beim Import als unbewertet markiert und blockiert die Veröffentlichung, bis ein Wert festgelegt wurde.

## GitHub-Update
Für die laufende Website insbesondere ersetzen:
- `app.js`
- `points.js`
- `data.js`
- `styles.css`
- `sw.js`
- `data/species-points.json`

Nach dem Commit GitHub Pages/Actions abwarten und ggf. hart neu laden.
