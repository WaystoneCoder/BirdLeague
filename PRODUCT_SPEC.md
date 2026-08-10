# BirdLeague – Produktkonzept

## Kernidee

BirdLeague ist eine private Jahresliga für bestätigte Vogelstimmenfunde aus Merlin. Die Website ersetzt Merlin nicht, sondern macht aus den bestätigten Funden ein gemeinsames Spiel.

## Festgelegte Regeln

1. Eine Vogelart zählt pro Person und Kalenderjahr genau einmal.
2. Es werden nur von den Spielern bestätigte Funde übernommen.
3. Jede Art besitzt einen festen Punktwert von 1 bis 10.
4. Echte Raritäten können 15 Punkte erhalten.
5. Bei Mehrfachfunden wird das früheste Funddatum gespeichert.
6. Exklusive Arten werden hervorgehoben, bringen aber keine Bonuspunkte.
7. Das Ranking wird in unregelmäßigen Datenwellen aktualisiert.

## MVP-Ansichten

### Übersicht

- aktuelle Führung
- Gesamtranking
- Punkte, Artenzahl und exklusive Arten pro Person
- neue Punkte seit dem letzten Import
- neue Funde
- letzter Datenstand

### Spielerprofil

- Rang und Gesamtpunkte
- Artenzahl
- vollständige Artenliste
- Punkte und Erstfunddatum je Art
- Fundort, sofern vorhanden
- exklusive Arten

### Statistiken

- kumulierter Punkteverlauf pro Monat
- exklusive Arten
- wertvollste Arten der Saison

### Regeln

- kompakte und für alle zugängliche Darstellung des Regelwerks

### Import

- Spielername eingeben
- CSV lokal auswählen
- Spalten automatisch erkennen
- doppelte Arten auf den frühesten Fund reduzieren
- normalisierte JSON-Datei herunterladen

## Datenprozess im Freundeskreis

1. Alle Spieler bestätigen ihre relevanten Funde in Merlin/eBird.
2. Alle paar Wochen schicken sie ihren Export an den Administrator.
3. Der Administrator importiert und prüft die Dateien.
4. Unbekannte Arten werden mit der Punkteliste abgeglichen.
5. Der neue Import erhält ein gemeinsames `importedAt`-Datum.
6. `data.js` wird aktualisiert und zu GitHub hochgeladen.
7. GitHub Pages veröffentlicht den neuen Stand.

## Datenschutz

Für die Liga reichen Art, Spieler, Datum und optional ein grober Ort. Exakte GPS-Daten und Audiodateien müssen nicht öffentlich gespeichert werden. Bei sensiblen Raritäten sollte der Ort vergröbert oder verborgen werden.

## Phase 2

- automatisches Zusammenführen mehrerer CSV-Dateien
- Prüfbericht mit unbekannten Arten und Dubletten
- Importhistorie/Snapshots
- stärkster Monat und Aufholjagd
- Arten, die alle außer einer Person gefunden haben
- Heimat- und Gesamtwertung
- optional passwortgeschützte Seite

## Phase 3

Erst bei echtem Bedarf:

- Supabase-Datenbank
- Spieler-Logins
- eigener Upload pro Person
- Admin-Freigabe
- Nachweislink für 15-Punkte-Arten
