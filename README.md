# BirdLeague V4

BirdLeague ist eine statische GitHub-Pages-App für eine private Vogelstimmen-Liga. Pro Person zählt jede Art innerhalb der Saison Mai–Mai genau einmal; bei BirdNET Live gilt jede aufgezeichnete Vogelart unabhängig vom Reviewstatus als Nachweis.

## V4-Punktelogik

V4 trennt **Regionalbasis** und **Akustikbonus**.

- Regionalbasis: Wie besonders ist die Art in der Fundregion und im jeweiligen Zeitfenster?
- Akustikbonus: +0 bis +3 dafür, wie schwierig es typischerweise ist, bei einer Begegnung tatsächlich eine brauchbare Lautäußerung aufzunehmen.
- Gesamtwert: Regionalbasis + Akustikbonus, regulär maximal 10 Punkte.
- 15 Punkte: ausschließlich echte regionale Raritäten.
- Gefährdungsstatus oder Reiseentfernung erzeugen keinen automatischen Bonus.

Aktuelle Regionen: Deutschland Nord/Mitte/Süd, Dänemark, Süd-/Mittel-/Nordschweden, Norwegen, Frankreich – Bourgogne-Franche-Comté, Tokio sowie OTHER als nicht bewerteter Fallback.

Aktuelle Zeitfenster: Mai–August, September–November, Dezember–Februar, März–April. Aktuell sind die tatsächlich benötigten Mai–August-Kombinationen bewertet; neue Kombinationen blockieren den Import bis zur bewussten Bewertung.

## Dateien

- `points.js` – V4-Masterdaten mit Regionalbasis, Akustikprofil und Gesamtpunkten.
- `data.js` – veröffentlichte Spieler und Funde.
- `data/species-points.json` – maschinenlesbare V4-Masterliste.
- `data/species-points.csv` – flache Prüf-/Bearbeitungstabelle.
- `POINTS_V4.md` – Regeln und Kalibrierungsprinzipien.

## Import

Der Import akzeptiert eBird CSV sowie BirdNET Live ZIP/JSON/CSV. BirdNET übernimmt grundsätzlich alle aufgezeichneten Vogelarten unabhängig von `confirmed` bzw. `reviewStatus`. Dedupliziert wird pro Spieler, Art und Saison; der früheste Fund gewinnt. Auffällige BirdNET-Erkennungen werden im Import als Hinweis angezeigt, aber nicht allein wegen eines fehlenden manuellen Reviews verworfen.

Wenn Regionalbasis oder Akustikprofil für den Fundkontext fehlen, wird der Import blockiert. Dadurch werden neue Reiseziele oder Jahreszeiten nicht mit einem unpassenden Standardwert bewertet.


## BirdNET Live Bulk-Export (V4.1)

Der Import akzeptiert auch den BirdNET-Live **Bulk Export** als ZIP, also ein ZIP mit mehreren Session-ZIPs. Die Sessions werden im Browser einzeln gelesen und anschließend zusammengeführt. `confirmed` und `reviewStatus` werden nur noch als Metadaten angezeigt; sie filtern keine Vogelart mehr aus. Bekannte Nicht-Vogel-Taxa werden ignoriert. Niedrige Konfidenzwerte, fehlende Fundorte und offensichtlich geographisch auffällige BirdNET-Treffer werden als Warnhinweis ausgegeben.

Für bekannte BirdNET-Orte kann die Region direkt aus `locationName` ermittelt werden (u. a. Hamburg sowie die im aktuellen Export vorkommenden schwedischen Kommunen). Wenn keine Region ermittelbar ist, bleibt die Fallback-Region verfügbar.


## V4.3 – BirdNET-Vertrauensregel und bereinigter Bulk-Import

- BirdNET-Reviewstatus ist kein Filter: aufgezeichnete Vogelarten werden grundsätzlich als Nachweis behandelt.
- Bekannte Nicht-Vogel-Taxa werden ignoriert.
- Drei im europäischen Bulk-Export eindeutig unplausible nordamerikanische Fehlklassifikationen (`Certhia americana`, `Vireo bellii`, `Spinus pinus`) werden automatisch ausgeschlossen.
- Niedrige Konfidenz oder andere Auffälligkeiten führen nur zu einem Warnhinweis.
- Fehlt bei einer BirdNET-Session der Standort, versucht BirdLeague zunächst, für dieselbe Art am selben Datum einen anderen Eintrag mit Standort zu verwenden. Wenn das nicht möglich ist, bleibt die Fallback-Region notwendig.
- Der aktuelle bereinigte Import für Finn enthält manuell bestätigte Ortszuordnungen: 14.09. Alt Schwerin; 05.08., 13.08. und 19.08. Hamburg.


## V4.4 – Ida / Frankreich und Herbstkontexte

- Neue Region `FR-BFC`: Frankreich – Bourgogne-Franche-Comté. eBird-Code `FR-BFC` wird automatisch erkannt.
- Zwergtaucher in `FR-BFC`, September–November: Basis 2 + Akustik +2 = **4 Punkte**.
- Steinkauz in `FR-BFC`, September–November: Basis 4 + Akustik +1 = **5 Punkte**.
- Gebirgsstelze in `DE-SOUTH`, September–November: Basis 2 + Akustik +1 = **3 Punkte**.
- Der aktualisierte Ida-eBird-Export ist damit vollständig bewertbar: 120 Jahresarten.
