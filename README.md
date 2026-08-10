# BirdLeague

BirdLeague ist eine statische, kostenlose GitHub-Pages-Website für euer Vogelstimmen-Spiel.

## Aktueller Stand

- Finns importierte Jahresarten 2026 sind bereits in `data.js` gespeichert.
- Anzeigenamen sind auf Deutsch.
- Der wissenschaftliche Name bleibt der stabile Schlüssel für zukünftige CSV-Importe.
- Demo-Spieler und Demo-Funde wurden entfernt.
- Noch nicht festgelegte Punktwerte werden als `–` / „unbewertet“ angezeigt.
- CSV-Importe können lokal übernommen und als neue `data.js` für GitHub exportiert werden.

## Update in dein bestehendes GitHub-Repository einspielen

Am einfachsten lädst du den kompletten Inhalt dieses Ordners erneut in dein bestehendes Repository `birdleague` hoch. Dateien mit gleichem Namen werden ersetzt; `taxonomy-de.js` kommt neu hinzu.

Besonders wichtig sind:

- `index.html`
- `app.js`
- `data.js`
- `taxonomy-de.js`
- `styles.css`
- `sw.js`

Danach aktualisiert GitHub Pages die Website automatisch.

## Künftiger CSV-Import

1. BirdLeague öffnen.
2. Zu **Import** wechseln.
3. Spielernamen eingeben.
4. CSV auswählen.
5. Die Vorschau zeigt bekannte Vogelarten bereits auf Deutsch.
6. **Lokal übernehmen** speichert den Stand nur in diesem Browser.
7. **data.js für GitHub herunterladen** erzeugt den zusammengeführten öffentlichen Datenstand.
8. Diese `data.js` anschließend im GitHub-Repository ersetzen.

Wichtig: GitHub Pages ist statisch. Eine Website kann deshalb ohne Backend oder GitHub-Zugang nicht selbst dauerhaft in das Repository schreiben. Der kleine `data.js`-Zwischenschritt hält das Projekt kostenlos und ohne Zugangstokens.

## Punkteliste

Die Arten stehen zusätzlich in:

`data/species-points.csv`

Nicht bekannte Punktwerte sind dort leer. Sobald die vollständige feste BirdLeague-Punkteliste vorliegt, können die Werte in `data.js` übernommen werden.

## Deutsche Sicherung

`data/birdleague-finn-de.json` enthält Finns aktuellen Import noch einmal als gut lesbare deutsche JSON-Datei.

## Hosting

GitHub Pages:

- Settings
- Pages
- Source: Deploy from a branch
- Branch: `main`
- Ordner: `/ (root)`

