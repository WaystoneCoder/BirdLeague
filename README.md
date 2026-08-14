# BirdLeague V4

BirdLeague ist eine statische GitHub-Pages-App für eine private Vogelstimmen-Liga. Pro Person zählt jede Art innerhalb der Saison Mai–Mai genau einmal; nur bestätigte Nachweise zählen.

## V4-Punktelogik

V4 trennt **Regionalbasis** und **Akustikbonus**.

- Regionalbasis: Wie besonders ist die Art in der Fundregion und im jeweiligen Zeitfenster?
- Akustikbonus: +0 bis +3 dafür, wie schwierig es typischerweise ist, bei einer Begegnung tatsächlich eine brauchbare Lautäußerung aufzunehmen.
- Gesamtwert: Regionalbasis + Akustikbonus, regulär maximal 10 Punkte.
- 15 Punkte: ausschließlich echte regionale Raritäten.
- Gefährdungsstatus oder Reiseentfernung erzeugen keinen automatischen Bonus.

Aktuelle Regionen: Deutschland Nord/Mitte/Süd, Dänemark, Süd-/Mittel-/Nordschweden, Norwegen, Tokio sowie OTHER als nicht bewerteter Fallback.

Aktuelle Zeitfenster: Mai–August, September–November, Dezember–Februar, März–April. Aktuell sind die tatsächlich benötigten Mai–August-Kombinationen bewertet; neue Kombinationen blockieren den Import bis zur bewussten Bewertung.

## Dateien

- `points.js` – V4-Masterdaten mit Regionalbasis, Akustikprofil und Gesamtpunkten.
- `data.js` – veröffentlichte Spieler und Funde.
- `data/species-points.json` – maschinenlesbare V4-Masterliste.
- `data/species-points.csv` – flache Prüf-/Bearbeitungstabelle.
- `POINTS_V4.md` – Regeln und Kalibrierungsprinzipien.

## Import

Der Import akzeptiert eBird CSV sowie BirdNET Live ZIP/JSON/CSV. BirdNET übernimmt ausschließlich bestätigte Detektionen. Dedupliziert wird pro Spieler, Art und Saison; der früheste bestätigte Fund gewinnt.

Wenn Regionalbasis oder Akustikprofil für den Fundkontext fehlen, wird der Import blockiert. Dadurch werden neue Reiseziele oder Jahreszeiten nicht mit einem unpassenden Standardwert bewertet.
