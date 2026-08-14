# BirdLeague

## UI-Update: Logo & Jahresverlauf

- Das neue Eisvogel-Motiv ist als BirdLeague-Logo und PWA-Icon eingebunden.
- Ein Klick auf das BirdLeague-Logo oben links führt immer zurück zur Übersicht.
- Der Punkteverlauf zeigt in der laufenden Saison nur Monate bis einschließlich des aktuellen Monats; abgeschlossene Saisons zeigen weiterhin alle 12 Monate.


BirdLeague ist eine statische, kostenlose GitHub-Pages-Website für euer Vogelstimmen-Spiel.

## Datenprinzip

- `data.js` = veröffentlichte Spieler und Funde.
- `points.js` = Master-Punkteliste, wissenschaftlicher Name als stabiler Schlüssel.
- `taxonomy-de.js` = deutsche Anzeigenamen.
- `data/species-points.xlsx/csv/json` = editierbare bzw. austauschbare Master-Punkteliste.

Die aktuelle Masterliste umfasst die 87 Arten aus Finns eBird-Export. Alle 87 sind bewertet; Finns aktueller Stand beträgt 250 Punkte.

## Punktelogik

Referenz ist Deutschland/Norddeutschland. Der Punktwert bleibt anschließend unabhängig vom Fundort gleich. Die Skala berücksichtigt Häufigkeit, regionale Bindung, Saisonalität und den praktischen BirdLeague-Schwierigkeitsgrad. 15 Punkte sind für echte Raritäten reserviert.

## Import: eBird und BirdNET Live

1. BirdLeague öffnen → **Import**.
2. Spielername eingeben.
3. Eine oder mehrere Dateien auswählen:
   - eBird: CSV
   - BirdNET Live: komplette ZIP-Datei, JSON oder CSV
4. BirdNET Live: Nur `confirmed = true` wird berücksichtigt. Unbestätigte Detektionen werden automatisch ignoriert und gezählt.
5. Es werden nur Funde der BirdLeague-Saison **Mai des Saisonjahres bis einschließlich Mai des Folgejahres** berücksichtigt.
6. Mehrfachfunde derselben Art werden zusammengeführt; es zählt der früheste Fund.
7. Die Arten werden über den wissenschaftlichen Namen gegen die Master-Punkteliste geprüft.
8. Nur wenn alle neuen Arten bewertet sind, kann der Import übernommen bzw. als `data.js` exportiert werden.

BirdNET-Live-ZIPs werden direkt im Browser gelesen; die enthaltenen Audio-Clips werden nicht hochgeladen oder verarbeitet.

## Künftige neue Arten

Wenn ein Spieler eine Art findet, die noch nicht in der Punkteliste steht, ist der saubere Workflow:

1. eBird-Export / Liste hier hochladen.
2. Neue Arten bewerten und `species-points.xlsx/json` ergänzen.
3. Daraus neue `points.js` erzeugen.
4. `points.js` auf GitHub ersetzen.
5. CSV erneut importieren; der Check muss 100 % bewertet anzeigen.

## GitHub Pages

Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
