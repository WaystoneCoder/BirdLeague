# BirdLeague Punktelogik V3

## Grundprinzip
V3 bewertet nicht mehr nur die Vogelart, sondern den konkreten Fundkontext:

**Art × BirdLeague-Region × Zeitfenster = Punkte**

Damit kann dieselbe Art in Norwegen, Dänemark, Südschweden oder Deutschland unterschiedlich viele Punkte bringen.

## Skala
- 1: sehr häufig
- 2: häufig / gut erwartbar
- 3: regelmäßig, aber habitat- oder saisongebunden
- 4: ungewöhnlich / lokal
- 5: selten
- 6: selten, aber regelmäßig
- 7: sehr selten, aber noch regelmäßig
- 8: außergewöhnlich
- 9: nationale Seltenheit
- 10: extrem selten
- 15: echte Rarität

Gefährdungsstatus und Suchaufwand sind nicht dasselbe wie Seltenheit und erhöhen den Wert nicht automatisch.

## Regionen
Deutschland Nord, Deutschland Mitte, Deutschland Süd, Dänemark, Südschweden,
Mittelschweden, Nordschweden, Norwegen und Japan/Tokio. `OTHER` bleibt als Fallback.

## Zeitfenster
Mai–August, September–November, Dezember–Februar, März–April.

Aktuell sind nur die tatsächlich benötigten **Mai–August-2026**-Kombinationen bewertet.
Das ist Absicht: Ein späterer Herbst-/Winterfund oder eine neue Region wird beim Import
markiert und muss einmalig bewertet werden, statt einen unpassenden Defaultwert zu erben.

## Aktueller Stand
1. Bengt – 111 Arten – 232 Punkte
2. Ida – 113 Arten – 230 Punkte
3. Finn – 87 Arten – 172 Punkte

Besonders wichtige Korrektur gegenüber V2:
`Lagopus lagopus` (Moorschneehuhn/Lirype) in Norwegen Mai–August = 2 Punkte, nicht 15.
