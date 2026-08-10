# Nächster Vibecoding-Prompt

Arbeite an der vorhandenen statischen Website „BirdLeague“. Verändere nicht das Grundprinzip des kostenlosen Hostings über GitHub Pages und führe ohne ausdrücklichen Grund keinen Build-Prozess und kein Backend ein.

## Ziel dieser Iteration

Baue aus dem vorhandenen lokalen CSV-Import einen vollständigen Admin-Workflow für Datenupdates.

## Vorhandene Dateien

- `index.html`
- `styles.css`
- `data.js`
- `app.js`

## Anforderungen

1. Auf der Import-Seite sollen mehrere CSV-Dateien nacheinander oder gleichzeitig ausgewählt werden können.
2. Für jede Datei muss ein Spieler zugeordnet werden können. Schlage den Spielernamen anhand des Dateinamens vor.
3. Unterstütze mindestens diese Spalten:
   - Common Name / Art / Vogelart
   - Scientific Name / Wissenschaftlicher Name
   - Date / Datum / Observation Date
   - Location / Ort / Locality
4. Ordne importierte Arten zuerst über den wissenschaftlichen Namen, danach über den deutschen Namen der vorhandenen Punkteliste zu.
5. Zeige einen Prüfbericht:
   - eingelesene Zeilen
   - erkannte Arten
   - neue Jahresarten
   - bereits vorhandene Arten
   - unbekannte Arten
   - fehlende Datumswerte
6. Unbekannte Arten dürfen nicht still verworfen werden.
7. Biete für unbekannte Arten eine Auswahl aus der Punkteliste oder das Anlegen eines neuen Eintrags mit 1–10 beziehungsweise 15 Punkten an.
8. Erzeuge nach Bestätigung eine vollständig aktualisierte `data.js` als Download.
9. Vergib eindeutige Observation-IDs.
10. Setze für alle neuen Funde ein vom Administrator gewähltes gemeinsames `importedAt`-Datum.
11. Vor dem Download soll eine Zusammenfassung erscheinen, wie sich das Ranking verändern würde.
12. Die Verarbeitung bleibt vollständig lokal im Browser. Es werden keine Daten versendet.
13. Erhalte das bestehende visuelle Design und die mobile Nutzbarkeit.
14. Schreibe gut lesbaren Vanilla-JavaScript-Code ohne Framework und ohne externe Bibliotheken.
15. Ergänze verständliche Fehlermeldungen und Kommentare an komplexen Stellen.

## Akzeptanzkriterien

- Eine CSV mit mehrfacher Amsel für dieselbe Person erzeugt nur einen Jahresfund.
- Ein früheres Funddatum ersetzt ein späteres Funddatum derselben Art.
- Eine bereits vorhandene Art wird nicht erneut als neuer Fund gewertet.
- Eine unbekannte Art erscheint im Prüfbericht.
- Die heruntergeladene `data.js` kann die vorhandene Datei ersetzen und die Website zeigt danach das neue Ranking.
