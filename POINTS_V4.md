# BirdLeague Punktelogik V4.5

## Grundidee

BirdLeague bewertet nicht nur, wie selten eine Art ist. Entscheidend ist die Schwierigkeit, **eine verwertbare Vogelstimme** zu sammeln. Deshalb besteht jeder reguläre Punktwert aus zwei getrennten Komponenten.

### 1. Regionalbasis

Die Regionalbasis bewertet, wie besonders ein Nachweis der Art **in der konkreten Region und im konkreten Zeitfenster** ist. Eine Art kann deshalb in Norwegen deutlich weniger Punkte geben als in Deutschland oder umgekehrt. Reisen werden weder bestraft noch automatisch belohnt.

Für die Spielbalance ist V4 breiter gespreizt als V3. Die Basisstufen bedeuten grob:

- 1: Alltagsart / praktisch unvermeidbar
- 3: regelmäßig, aber nicht automatisch
- 4: klarer BirdLeague-Fund
- 5: starker Fund
- 6–8: selten bis außergewöhnlich
- 9–10: extrem außergewöhnlich, aber noch regulär
- 15: echte regionale Rarität

### 2. Akustikbonus

Der Akustikbonus fragt: **Wenn ich diese Art tatsächlich antreffe – wie wahrscheinlich ist es, dass ich auch eine brauchbare Lautäußerung erwische?**

- +0 – akustisch dankbar: Stimme ist in der Saison ein typischer Nachweisweg
- +1 – etwas Timing nötig: regelmäßig hörbar, aber nicht bei jeder Begegnung
- +2 – akustisch anspruchsvoll: oft sichtbar, ohne gleichzeitig zu rufen
- +3 – akustische Glückssache: außerhalb enger Verhaltenskontexte oft still

Der Bonus ist ein bewusst handkalibrierter **Spielparameter**. Er ist keine veröffentlichte statistische Rufwahrscheinlichkeit.

### 3. Gesamtwert

`Gesamtpunkte = Regionalbasis + Akustikbonus`

Reguläre Funde sind bei 10 Punkten gedeckelt. 15 Punkte bleiben echten regionalen Raritäten vorbehalten.

## Beispiele aus der aktuellen Liste

- **Feldlerche:** kein Akustikbonus, weil der lange Singflug in der Brutzeit eine sehr typische Nachweisform ist.
- **Rohrdommel:** kein Akustikbonus; der Balzruf ist gerade der klassische Nachweisweg.
- **Mäusebussard:** +1; der Ruf ist auffällig, aber ein Sichtkontakt bedeutet nicht automatisch eine Aufnahme.
- **Turmfalke:** +2; Rufe konzentrieren sich stärker auf Brutplatz, Alarm und Interaktion.
- **Sperber:** +3; abseits des Brutplatzes ist die Art häufig still, weshalb eine Aufnahme deutlich schwieriger als ein Sichtkontakt ist.
- **Waldohreule:** +2; akustische Aktivität ist stark an Balz-, Brut-, Bettel- oder Alarmkontexte gebunden.

## Nicht berücksichtigt

Gefährdungsstatus, persönliche Lieblingsarten oder bloße Reiseentfernung erhöhen den Wert nicht. Entscheidend sind regionales Auftreten und die akustische Aufnahme-Challenge.


## V4.1 Ergänzungen

Ergänzt wurden Zwergtaucher, Steinkauz, Mittelspecht, Gebirgsstelze, Rotkehlpieper, Waldbaumläufer und Fischadler sowie konkrete fehlende Region-/Zeit-Kontexte für Waldkauz, Turmfalke, Eichelhäher, Fichtenkreuzschnabel und Grauschnäpper. Die Grundlogik V4 bleibt unverändert: Regionalbasis + Akustikbonus.


## BirdNET-Regel ab V4.2

Für BirdNET Live gilt der Review-/Bestätigungsstatus nicht als Teilnahmefilter. Jede vom Export aufgezeichnete Vogelart wird zunächst als Nachweis behandelt. Auffälligkeiten werden transparent markiert, insbesondere sehr niedrige Konfidenz, fehlender Fundort oder ein geographisch offensichtlich ungewöhnliches Taxon. Bekannte Nicht-Vogel-Taxa werden nicht gewertet.

Die Warnung ersetzt keine automatische Löschung: Eine auffällige Vogelart bleibt im Import sichtbar und wird nur dann praktisch blockiert, wenn für sie bzw. ihren Region-/Zeit-Kontext noch kein Punktwert festgelegt ist.


## V4.3 Ergänzungen aus BirdNET (September 2026)

Neu bzw. ergänzt wurden die tatsächlich benötigten Kontexte: Dohle (DE-NORTH, Mai–Aug), Wasserralle (DE-NORTH, Sep–Nov), Waldkauz (DE-NORTH, Sep–Nov), Drosselrohrsänger (DE-NORTH, Sep–Nov) und Rotdrossel (DE-NORTH, Sep–Nov).

Die resultierenden Werte sind 2, 4, 3, 7 und 4 Punkte. Beim Drosselrohrsänger ergibt sich die hohe Wertung aus einer regional/saisonal besonderen Beobachtung (Basis 5) plus akustisch anspruchsvoller Nachbrutzeit (+2). Wasserralle und Waldkauz erhalten keinen Akustikbonus, weil die Stimme gerade ein typischer Nachweisweg ist; beim Waldkauz ist der Herbst zudem eine ausgeprägte Rufphase.


## V4.4 Ergänzungen aus Idas eBird-Export

Neu unterstützt wird `FR-BFC` (Bourgogne-Franche-Comté). Für September–November gelten dort **4 Punkte für Zwergtaucher** (Basis 2 + Akustik +2) und **5 Punkte für Steinkauz** (Basis 4 + Akustik +1). Für die **Gebirgsstelze in Deutschland Süd** wurde September–November mit **3 Punkten** ergänzt (Basis 2 + Akustik +1).


## V4.5 – korrekter BirdNET-Bulk-Export

Der aktuelle BirdNET-Live-Bulk-Export kann Session-ZIPs enthalten, die ausschließlich `.selections.txt`, Audio und einen HTML-Report enthalten. V4.5 liest diese Struktur direkt, übernimmt Datum und Fundort aus der Session und überspringt die großen Audiodateien beim Parsen. Reviewstatus bleibt optional. Zusätzlich werden Heimchen, Rotfuchs, Waldgrille und Weinhähnchen als Nicht-Vogel-Taxa ignoriert.

Für den Bulk-Export vom 19.09.2026 wurden die benötigten Kontexte für Schwanzmeise, Eisvogel, Brachpieper, Graureiher, Sumpfohreule, Rohrweihe, Wachtelkönig, Ortolan, Seeadler, Mantelmöwe, Haubentaucher und Rostgans ergänzt. Seltene/auffällige BirdNET-Treffer werden nicht gelöscht, sondern als Prüfhilfe markiert.
