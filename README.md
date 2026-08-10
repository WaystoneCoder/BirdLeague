# BirdLeague MVP

Eine kostenlose, mobile Website für euer privates Vogelstimmen-Jahresranking.

## Was bereits funktioniert

- Ranking nach einer festen Punkteliste
- eine Vogelart pro Person und Jahr
- 1–10 Punkte plus 15 Punkte für echte Raritäten
- Spielerprofile mit vollständiger Artenliste
- exklusive Arten
- neue Funde seit dem letzten Datenupdate
- Punkteverlauf über das Kalenderjahr
- lokaler CSV-Import-Helfer
- responsive Smartphone-Ansicht
- installierbare Web-App-Grundlage
- kostenloses Hosting über GitHub Pages

Die sichtbaren Spieler und Funde sind Demo-Daten.

## Sofort lokal ansehen

Am einfachsten den Ordner in VS Code öffnen und die Erweiterung **Live Server** nutzen. Alternativ im Terminal:

```bash
python3 -m http.server 8000
```

Dann im Browser öffnen:

```text
http://localhost:8000
```

Ein Doppelklick auf `index.html` funktioniert für fast alles ebenfalls. Für die installierbare Web-App und den Offline-Cache ist ein lokaler Server erforderlich.

## Kostenlos auf GitHub Pages veröffentlichen

1. Bei GitHub ein neues öffentliches Repository namens `birdleague` erstellen.
2. Alle Dateien aus diesem Ordner in das Repository hochladen.
3. Repository öffnen: **Settings → Pages**.
4. Unter **Build and deployment** auswählen:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. Speichern.

Die Seite ist danach ungefähr hier erreichbar:

```text
https://DEIN-GITHUB-NAME.github.io/birdleague/
```

Es gibt keinen Build-Prozess und keine laufenden Hostingkosten.

## Daten pflegen

Die Website liest ihre Daten aus `data.js`.

Dort gibt es drei Bereiche:

- `players`: Mitspieler
- `species`: feste Punkteliste
- `observations`: bestätigte Funde

Eine Beobachtung sieht so aus:

```js
{
  id: "obs-101",
  playerId: "finn",
  speciesId: "waldkauz",
  observedAt: "2026-03-21",
  location: "Hamburg",
  importedAt: "2026-07-20"
}
```

`importedAt` entspricht dem Datenupdate, bei dem der Fund neu auf die Website kam. Dadurch kann BirdLeague „Neue Funde“ und „Punkte im letzten Update“ berechnen.

Doppelte Arten pro Person werden automatisch entfernt. Es zählt der früheste Fund.

## CSV-Import

Unter **Import** kann eine eBird- oder eigene CSV lokal eingelesen werden. Akzeptierte Spaltennamen sind unter anderem:

- `Common Name`, `Art`, `Vogelart`
- `Scientific Name`, `Wissenschaftlicher Name`
- `Date`, `Datum`, `Observation Date`
- `Location`, `Ort`, `Locality`

Semikolon-, Komma- und tab-getrennte Dateien werden erkannt. Die Daten verlassen den Browser nicht.

Der Import erzeugt zunächst eine normalisierte JSON-Datei. Der nächste Entwicklungsschritt ist ein kleines Merge-Werkzeug, das diese Daten automatisch der `data.js` hinzufügt.

## Dateien

- `index.html`: Grundgerüst
- `styles.css`: komplettes Design
- `data.js`: Liga-, Arten- und Funddaten
- `app.js`: Berechnungen, Ansichten und CSV-Import
- `PRODUCT_SPEC.md`: Produktentscheidungen und Ausbaustufen
- `VIBECODING_PROMPT.md`: Prompt für die nächste Coding-Runde
- `data/species-points.csv`: Demo-Punkteliste
- `data/birdleague-import-template.csv`: einfache Importvorlage
