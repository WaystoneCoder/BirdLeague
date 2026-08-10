# BirdLeague

BirdLeague ist eine statische, kostenlose GitHub-Pages-Website für euer Vogelstimmen-Spiel.

## Datenprinzip

- `data.js` = veröffentlichte Spieler und Funde.
- `points.js` = Master-Punkteliste, wissenschaftlicher Name als stabiler Schlüssel.
- `taxonomy-de.js` = deutsche Anzeigenamen.
- `data/species-points.xlsx/csv/json` = editierbare bzw. austauschbare Master-Punkteliste.

Die aktuelle Masterliste umfasst die 87 Arten aus Finns eBird-Export. Alle 87 sind bewertet; Finns aktueller Stand beträgt 250 Punkte.

## Punktelogik

Referenz ist Deutschland/Norddeutschland. Der Punktwert bleibt anschließend unabhängig vom Fundort gleich. Die Skala berücksichtigt Häufigkeit, regionale Bindung, Saisonalität und den praktischen BirdLeague-Schwierigkeitsgrad. 15 Punkte sind für echte Raritäten reserviert.

## CSV-Import

1. BirdLeague öffnen → **Import**.
2. Spielernamen eingeben.
3. eBird-CSV auswählen.
4. BirdLeague reduziert auf eine Art pro Spieler/Jahr und prüft jede Art gegen `points.js`.
5. Nur wenn alle Arten bewertet sind, kann der Import übernommen bzw. als `data.js` exportiert werden.
6. Fehlt eine Art, wird sie mit wissenschaftlichem Namen aufgelistet. Dann zuerst Master-Punkteliste ergänzen.
7. Neue `data.js` in GitHub ersetzen.

## Künftige neue Arten

Wenn ein Spieler eine Art findet, die noch nicht in der Punkteliste steht, ist der saubere Workflow:

1. eBird-Export / Liste hier hochladen.
2. Neue Arten bewerten und `species-points.xlsx/json` ergänzen.
3. Daraus neue `points.js` erzeugen.
4. `points.js` auf GitHub ersetzen.
5. CSV erneut importieren; der Check muss 100 % bewertet anzeigen.

## GitHub Pages

Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
