/*
  BIRDLEAGUE-DATEN
  ----------------
  Hier werden für das MVP Spieler, Punkteliste und bestätigte Funde gepflegt.
  Die Demo-Daten können später direkt ersetzt oder durch ein Importskript erzeugt werden.
*/

window.BIRDLEAGUE_DATA = {
  leagueName: "BirdLeague",
  season: 2026,
  updatedAt: "2026-07-20",

  players: [
    { id: "finn", name: "Finn", initials: "FI" },
    { id: "anna", name: "Anna", initials: "AN" },
    { id: "paul", name: "Paul", initials: "PA" }
  ],

  species: [
    { id: "amsel", germanName: "Amsel", scientificName: "Turdus merula", points: 1 },
    { id: "kohlmeise", germanName: "Kohlmeise", scientificName: "Parus major", points: 1 },
    { id: "blaumeise", germanName: "Blaumeise", scientificName: "Cyanistes caeruleus", points: 1 },
    { id: "rotkehlchen", germanName: "Rotkehlchen", scientificName: "Erithacus rubecula", points: 1 },
    { id: "buchfink", germanName: "Buchfink", scientificName: "Fringilla coelebs", points: 2 },
    { id: "kleiber", germanName: "Kleiber", scientificName: "Sitta europaea", points: 3 },
    { id: "buntspecht", germanName: "Buntspecht", scientificName: "Dendrocopos major", points: 3 },
    { id: "kranich", germanName: "Kranich", scientificName: "Grus grus", points: 4 },
    { id: "eisvogel", germanName: "Eisvogel", scientificName: "Alcedo atthis", points: 5 },
    { id: "waldkauz", germanName: "Waldkauz", scientificName: "Strix aluco", points: 6 },
    { id: "pirol", germanName: "Pirol", scientificName: "Oriolus oriolus", points: 8 },
    { id: "wendehals", germanName: "Wendehals", scientificName: "Jynx torquilla", points: 9 },
    { id: "sperlingskauz", germanName: "Sperlingskauz", scientificName: "Glaucidium passerinum", points: 10 },
    { id: "zwergadler", germanName: "Zwergadler", scientificName: "Hieraaetus pennatus", points: 15 }
  ],

  observations: [
    { id: "obs-1", playerId: "finn", speciesId: "amsel", observedAt: "2026-01-03", location: "Hamburg", importedAt: "2026-06-20" },
    { id: "obs-2", playerId: "finn", speciesId: "kohlmeise", observedAt: "2026-01-03", location: "Hamburg", importedAt: "2026-06-20" },
    { id: "obs-3", playerId: "finn", speciesId: "rotkehlchen", observedAt: "2026-01-05", location: "Hamburg", importedAt: "2026-06-20" },
    { id: "obs-4", playerId: "finn", speciesId: "kleiber", observedAt: "2026-01-29", location: "Sachsenwald", importedAt: "2026-06-20" },
    { id: "obs-5", playerId: "finn", speciesId: "kranich", observedAt: "2026-03-02", location: "Duvenstedter Brook", importedAt: "2026-06-20" },
    { id: "obs-6", playerId: "finn", speciesId: "waldkauz", observedAt: "2026-03-21", location: "Hamburg", importedAt: "2026-06-20" },
    { id: "obs-7", playerId: "finn", speciesId: "pirol", observedAt: "2026-05-18", location: "Lüneburger Heide", importedAt: "2026-06-20" },
    { id: "obs-8", playerId: "finn", speciesId: "wendehals", observedAt: "2026-06-06", location: "Elbtalaue", importedAt: "2026-07-20" },

    { id: "obs-9", playerId: "anna", speciesId: "amsel", observedAt: "2026-01-01", location: "Hamburg", importedAt: "2026-06-20" },
    { id: "obs-10", playerId: "anna", speciesId: "blaumeise", observedAt: "2026-01-06", location: "Hamburg", importedAt: "2026-06-20" },
    { id: "obs-11", playerId: "anna", speciesId: "buchfink", observedAt: "2026-01-18", location: "Wedel", importedAt: "2026-06-20" },
    { id: "obs-12", playerId: "anna", speciesId: "buntspecht", observedAt: "2026-02-02", location: "Klövensteen", importedAt: "2026-06-20" },
    { id: "obs-13", playerId: "anna", speciesId: "eisvogel", observedAt: "2026-02-16", location: "Alsterlauf", importedAt: "2026-06-20" },
    { id: "obs-14", playerId: "anna", speciesId: "kranich", observedAt: "2026-03-10", location: "Duvenstedter Brook", importedAt: "2026-07-20" },
    { id: "obs-15", playerId: "anna", speciesId: "sperlingskauz", observedAt: "2026-04-12", location: "Harz", importedAt: "2026-07-20" },

    { id: "obs-16", playerId: "paul", speciesId: "amsel", observedAt: "2026-01-02", location: "Hamburg", importedAt: "2026-06-20" },
    { id: "obs-17", playerId: "paul", speciesId: "kohlmeise", observedAt: "2026-01-04", location: "Hamburg", importedAt: "2026-06-20" },
    { id: "obs-18", playerId: "paul", speciesId: "blaumeise", observedAt: "2026-01-04", location: "Hamburg", importedAt: "2026-06-20" },
    { id: "obs-19", playerId: "paul", speciesId: "buchfink", observedAt: "2026-01-25", location: "Hamburg", importedAt: "2026-06-20" },
    { id: "obs-20", playerId: "paul", speciesId: "kleiber", observedAt: "2026-02-11", location: "Sachsenwald", importedAt: "2026-06-20" },
    { id: "obs-21", playerId: "paul", speciesId: "buntspecht", observedAt: "2026-02-12", location: "Sachsenwald", importedAt: "2026-06-20" },
    { id: "obs-22", playerId: "paul", speciesId: "eisvogel", observedAt: "2026-03-16", location: "Boberger Niederung", importedAt: "2026-07-20" },
    { id: "obs-23", playerId: "paul", speciesId: "zwergadler", observedAt: "2026-06-22", location: "Südschweden", importedAt: "2026-07-20" }
  ]
};
