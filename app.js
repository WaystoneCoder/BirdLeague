"use strict";

const publishedData = JSON.parse(JSON.stringify(window.BIRDLEAGUE_DATA));
const storedDataRaw = localStorage.getItem("birdleague-data-v1");
if (storedDataRaw) {
  try {
    const storedData = JSON.parse(storedDataRaw);
    if ((storedData.updatedAt || "") > (publishedData.updatedAt || "")) {
      window.BIRDLEAGUE_DATA = storedData;
    } else {
      localStorage.removeItem("birdleague-data-v1");
    }
  } catch (_) {
    localStorage.removeItem("birdleague-data-v1");
  }
}

const data = window.BIRDLEAGUE_DATA;
const germanNames = window.BIRDLEAGUE_GERMAN_NAMES || {};
const app = document.getElementById("app");
const sidebar = document.getElementById("sidebar");
const navigation = document.getElementById("navigation");
const pageTitle = document.getElementById("page-title");
const menuButton = document.getElementById("menu-button");

const state = {
  view: "overview",
  selectedPlayerId: data.players[0]?.id || "",
  importedRows: [],
  importPlayer: ""
};

const viewLabels = {
  overview: "Übersicht",
  players: "Spieler",
  stats: "Statistiken",
  rules: "Regeln",
  import: "Import"
};

const formatDate = (isoDate) => new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "long",
  year: "numeric"
}).format(new Date(`${isoDate}T12:00:00`));

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const hasPointValue = (value) => typeof value === "number" && Number.isFinite(value);
const getPointValue = (species) => hasPointValue(species?.points) ? species.points : 0;
const pointLabel = (value) => hasPointValue(value) ? String(value) : "–";
const pointText = (value) => hasPointValue(value) ? `${value} Punkte` : "noch unbewertet";

function slugify(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function initialsFor(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map((part) => part[0]).join("") || "BL").toUpperCase();
}

function uniqueObservations() {
  const earliest = new Map();
  data.observations.forEach((observation) => {
    const key = `${observation.playerId}:${observation.speciesId}`;
    const current = earliest.get(key);
    if (!current || observation.observedAt < current.observedAt) earliest.set(key, observation);
  });
  return [...earliest.values()];
}

function getSpeciesMap() {
  return new Map(data.species.map((species) => [species.id, species]));
}

function getPlayerMap() {
  return new Map(data.players.map((player) => [player.id, player]));
}

function getOwners() {
  const owners = new Map();
  uniqueObservations().forEach((observation) => {
    if (!owners.has(observation.speciesId)) owners.set(observation.speciesId, new Set());
    owners.get(observation.speciesId).add(observation.playerId);
  });
  return owners;
}

function getStandings() {
  const speciesMap = getSpeciesMap();
  const owners = getOwners();
  const observations = uniqueObservations();

  return data.players.map((player) => {
    const playerObservations = observations.filter((item) => item.playerId === player.id);
    const points = playerObservations.reduce((sum, item) => sum + getPointValue(speciesMap.get(item.speciesId)), 0);
    const latestPoints = playerObservations
      .filter((item) => item.importedAt === data.updatedAt)
      .reduce((sum, item) => sum + getPointValue(speciesMap.get(item.speciesId)), 0);
    const unratedCount = playerObservations.filter((item) => !hasPointValue(speciesMap.get(item.speciesId)?.points)).length;

    return {
      player,
      points,
      latestPoints,
      unratedCount,
      pointsComplete: unratedCount === 0,
      speciesCount: playerObservations.length,
      exclusiveCount: playerObservations.filter((item) => owners.get(item.speciesId)?.size === 1).length,
      rarityCount: playerObservations.filter((item) => speciesMap.get(item.speciesId)?.points === 15).length
    };
  }).sort((a, b) => b.points - a.points || b.speciesCount - a.speciesCount);
}

function getRecentFinds() {
  const speciesMap = getSpeciesMap();
  const playerMap = getPlayerMap();
  return uniqueObservations()
    .filter((item) => item.importedAt === data.updatedAt)
    .map((item) => ({ ...item, species: speciesMap.get(item.speciesId), player: playerMap.get(item.playerId) }))
    .filter((item) => item.species && item.player)
    .sort((a, b) => b.observedAt.localeCompare(a.observedAt));
}

function getPlayerObservations(playerId) {
  const speciesMap = getSpeciesMap();
  return uniqueObservations()
    .filter((item) => item.playerId === playerId)
    .map((item) => ({ ...item, species: speciesMap.get(item.speciesId) }))
    .filter((item) => item.species)
    .sort((a, b) => getPointValue(b.species) - getPointValue(a.species) || a.observedAt.localeCompare(b.observedAt));
}

function getExclusiveSpecies() {
  const owners = getOwners();
  const speciesMap = getSpeciesMap();
  return uniqueObservations()
    .filter((item) => owners.get(item.speciesId)?.size === 1)
    .map((item) => ({ ...item, species: speciesMap.get(item.speciesId) }))
    .filter((item) => item.species)
    .sort((a, b) => getPointValue(b.species) - getPointValue(a.species));
}

function getTimeline() {
  const observations = uniqueObservations().sort((a, b) => a.observedAt.localeCompare(b.observedAt));
  const speciesMap = getSpeciesMap();
  const running = new Map(data.players.map((player) => [player.id, 0]));

  return Array.from({ length: 12 }, (_, index) => {
    const month = `${data.season}-${String(index + 1).padStart(2, "0")}`;
    observations.filter((item) => item.observedAt.startsWith(month)).forEach((item) => {
      running.set(item.playerId, (running.get(item.playerId) || 0) + getPointValue(speciesMap.get(item.speciesId)));
    });
    return {
      month: new Intl.DateTimeFormat("de-DE", { month: "short" }).format(new Date(`${month}-01T12:00:00`)),
      values: Object.fromEntries(data.players.map((player) => [player.id, running.get(player.id) || 0]))
    };
  });
}

function statCard(eyebrow, value, detail, symbol) {
  return `<article class="stat-card">
    <div class="stat-icon">${symbol}</div>
    <div><p class="eyebrow">${escapeHtml(eyebrow)}</p><strong>${escapeHtml(value)}</strong><span>${escapeHtml(detail)}</span></div>
  </article>`;
}

function rankingTable() {
  return `<div class="table-shell"><table>
    <thead><tr><th>Rang</th><th>Spieler</th><th>Punkte</th><th>Arten</th><th>Exklusiv</th><th>Neues Update</th></tr></thead>
    <tbody>${getStandings().map((standing, index) => `<tr data-player="${standing.player.id}">
      <td><span class="rank rank-${index + 1}">${index + 1}</span></td>
      <td><div class="player-cell"><span class="avatar">${standing.player.initials}</span><div><strong>${escapeHtml(standing.player.name)}</strong>${standing.rarityCount ? '<small>◆ Raritätenfund</small>' : ''}</div></div></td>
      <td><strong class="points-value">${standing.points}${standing.unratedCount ? "*" : ""}</strong>${standing.unratedCount ? `<small>${standing.unratedCount} unbewertet</small>` : ""}</td>
      <td>${standing.speciesCount}</td><td>${standing.exclusiveCount}</td>
      <td><span class="gain">↗ ${standing.latestPoints}</span></td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

function renderOverview() {
  const standings = getStandings();
  const leader = standings[0];
  const recentFinds = getRecentFinds();
  const totalSpecies = new Set(uniqueObservations().map((item) => item.speciesId)).size;
  const rarityFinds = uniqueObservations().filter((item) => getSpeciesMap().get(item.speciesId)?.points === 15).length;
  const unratedSpecies = data.species.filter((species) => !hasPointValue(species.points)).length;

  app.innerHTML = `<section class="page-content">
    <article class="hero-card">
      <div><span class="season-tag">BirdLeague ${data.season}</span><h2>Wer hört den Unterschied?</h2>
      <p>Bestätigte Vogelstimmen sammeln, seltene Arten entdecken und das Jahresranking gewinnen.</p>
      <button class="primary-button" data-action="show-players">Liga ansehen →</button></div>
      <div class="leader-card"><span class="crown">♛</span><span>Aktuelle Führung</span><strong>${escapeHtml(leader.player.name)}</strong><b>${leader.points}${leader.unratedCount ? "*" : ""} Punkte</b><small>${leader.speciesCount} bestätigte Arten${leader.unratedCount ? ` · ${leader.unratedCount} noch unbewertet` : ""}</small></div>
    </article>
    <div class="stats-grid">
      ${statCard("Arten in der Liga", totalSpecies, "einzigartige Vogelarten", "B")}
      ${statCard("Spieler", data.players.length, "jagen den Titel", "◎")}
      ${statCard("Raritäten", rarityFinds, "15-Punkte-Funde", "◆")}
      ${statCard("Neues Update", recentFinds.length, "neue Jahresarten", "✦")}
      ${unratedSpecies ? statCard("Bewertung offen", unratedSpecies, "Arten ohne Punktwert", "…") : ""}
    </div>
    <div class="content-grid content-grid-wide">
      <article class="panel panel-span-2"><div class="panel-heading"><div><p class="eyebrow">Live-Tabelle</p><h3>Aktuelles Ranking</h3></div><span>♛</span></div>${rankingTable()}</article>
      <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Letzter Import</p><h3>Neue Funde</h3></div><span>✦</span></div>
        <div class="find-list">${recentFinds.map((find) => `<button data-player="${find.player.id}"><span class="points-badge ${find.species.points === 15 ? 'rarity' : ''}">${hasPointValue(find.species.points) ? `+${find.species.points}` : "–"}</span><div><strong>${escapeHtml(find.species.germanName)}</strong><small>${escapeHtml(find.player.name)} · ${escapeHtml(find.location || "Ort unbekannt")}</small></div></button>`).join("")}</div>
      </article>
    </div>
  </section>`;
}

function renderPlayers() {
  const standings = getStandings();
  const selectedPlayer = data.players.find((player) => player.id === state.selectedPlayerId) || data.players[0];
  const standing = standings.find((item) => item.player.id === selectedPlayer.id);
  const observations = getPlayerObservations(selectedPlayer.id);
  const exclusive = getExclusiveSpecies().filter((item) => item.playerId === selectedPlayer.id);

  app.innerHTML = `<section class="page-content">
    <div class="player-tabs">${standings.map((item) => `<button class="${item.player.id === selectedPlayer.id ? 'active' : ''}" data-player="${item.player.id}"><span class="avatar">${item.player.initials}</span>${escapeHtml(item.player.name)}</button>`).join("")}</div>
    <article class="profile-hero"><div class="profile-avatar">${selectedPlayer.initials}</div><div><p class="eyebrow">Spielerprofil</p><h2>${escapeHtml(selectedPlayer.name)}</h2><p>Platz ${standings.findIndex((item) => item.player.id === selectedPlayer.id) + 1} in der BirdLeague ${data.season}</p></div><div class="profile-score"><strong>${standing.points}${standing.unratedCount ? "*" : ""}</strong><span>${standing.unratedCount ? `${standing.unratedCount} Arten unbewertet` : "Punkte"}</span></div></article>
    <div class="content-grid">
      <article class="panel panel-span-2"><div class="panel-heading"><div><p class="eyebrow">Sammlung</p><h3>${observations.length} Jahresarten</h3></div><span>B</span></div>
        <div class="species-table">${observations.map((item) => `<div><span class="points-badge ${item.species.points === 15 ? 'rarity' : ''}">${pointLabel(item.species.points)}</span><div><strong>${escapeHtml(item.species.germanName)}</strong><small><em>${escapeHtml(item.species.scientificName)}</em> · ${formatDate(item.observedAt)}${item.location ? ` · ${escapeHtml(item.location)}` : ''}</small></div></div>`).join("")}</div>
      </article>
      <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Besonders</p><h3>Exklusive Arten</h3></div><span>★</span></div>
        <div class="exclusive-list">${exclusive.length ? exclusive.map((item) => `<div><strong>${escapeHtml(item.species.germanName)}</strong><span>${pointText(item.species.points)}</span></div>`).join("") : '<p class="muted">Aktuell keine exklusive Art.</p>'}</div>
      </article>
    </div>
  </section>`;
}

function buildTimelineSvg() {
  const timeline = getTimeline();
  const standings = getStandings();
  const max = Math.max(...standings.map((item) => item.points), 10);
  const width = 900;
  const height = 320;
  const left = 46;
  const right = 20;
  const top = 20;
  const bottom = 40;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const palette = ["#24533d", "#c18b27", "#799582", "#9f5f52", "#4d728b"];

  const grid = Array.from({ length: 5 }, (_, index) => {
    const y = top + (plotHeight * index / 4);
    const value = Math.round(max - (max * index / 4));
    return `<line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" class="chart-grid"/><text x="${left - 10}" y="${y + 4}" text-anchor="end">${value}</text>`;
  }).join("");

  const monthLabels = timeline.map((item, index) => {
    const x = left + (plotWidth * index / 11);
    return `<text x="${x}" y="${height - 12}" text-anchor="middle">${escapeHtml(item.month)}</text>`;
  }).join("");

  const lines = data.players.map((player, playerIndex) => {
    const points = timeline.map((item, index) => {
      const x = left + (plotWidth * index / 11);
      const y = top + plotHeight - ((item.values[player.id] / max) * plotHeight);
      return `${x},${y}`;
    }).join(" ");
    return `<polyline points="${points}" fill="none" stroke="${palette[playerIndex % palette.length]}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("");

  const legend = data.players.map((player, index) => `<span><i style="background:${palette[index % palette.length]}"></i>${escapeHtml(player.name)}</span>`).join("");
  return `<div class="chart-legend">${legend}</div><svg class="timeline-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Punkteverlauf der Spieler"><g>${grid}${monthLabels}${lines}</g></svg>`;
}

function renderStats() {
  const exclusive = getExclusiveSpecies();
  const playerMap = getPlayerMap();
  const valuableSpecies = [...data.species].filter((species) => hasPointValue(species.points)).sort((a, b) => b.points - a.points).slice(0, 6);

  app.innerHTML = `<section class="page-content">
    <div class="content-grid content-grid-wide">
      <article class="panel panel-span-2 chart-panel"><div class="panel-heading"><div><p class="eyebrow">Saisonverlauf</p><h3>Punkte im Jahresverlauf</h3></div><span>↗</span></div>${buildTimelineSvg()}</article>
      <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Nur einmal gehört</p><h3>Exklusive Arten</h3></div><span>★</span></div>
        <div class="exclusive-list">${exclusive.slice(0, 8).map((item) => `<div><span><strong>${escapeHtml(item.species.germanName)}</strong><small>${escapeHtml(playerMap.get(item.playerId)?.name || '')}</small></span><b>${pointLabel(item.species.points)}</b></div>`).join("")}</div>
      </article>
      <article class="panel panel-span-3"><div class="panel-heading"><div><p class="eyebrow">Punktelogik</p><h3>Wertvollste Arten der Saison</h3></div><span>◆</span></div>
        <div class="rarity-grid">${valuableSpecies.length ? valuableSpecies.map((species) => `<div><span class="points-badge ${species.points === 15 ? 'rarity' : ''}">${pointLabel(species.points)}</span><strong>${escapeHtml(species.germanName)}</strong><small>${escapeHtml(species.scientificName)}</small></div>`).join("") : '<p class="muted">Noch keine Arten bewertet.</p>'}</div>
      </article>
    </div>
  </section>`;
}

function renderRules() {
  const rules = [
    ["1", "Eine Art pro Person und Jahr", "Mehrfachaufnahmen derselben Art bringen keine zusätzlichen Punkte. Es zählt der früheste bestätigte Fund."],
    ["2", "Nur bestätigte Funde", "In die Liga kommen ausschließlich Vogelarten, die der Spieler in Merlin bewusst bestätigt hat."],
    ["3", "Feste Punkteliste", "Jede Vogelart hat vorab einen festen Wert zwischen 1 und 10 Punkten."],
    ["15", "Echte Raritäten", "Außergewöhnliche Funde können mit 15 Punkten bewertet werden. Dafür sollte ein Nachweis vorliegen."],
    ["↻", "Updates in Wellen", "Alle paar Wochen werden die CSV-Dateien importiert. Das Ranking zeigt den letzten veröffentlichten Stand."],
    ["★", "Exklusive Arten", "Arten, die nur ein Spieler gefunden hat, werden hervorgehoben – ohne zusätzliche Bonuspunkte."]
  ];

  app.innerHTML = `<section class="page-content rules-page">
    <article class="rules-intro"><span class="big-bird">B</span><div><p class="eyebrow">BirdLeague-Regelwerk</p><h2>Einfach, transparent und ein bisschen nerdig.</h2><p>Diese Version bildet eure festgelegten Grundregeln ab.</p></div></article>
    <div class="rules-grid">${rules.map(([number, title, text]) => `<article><span>${number}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("")}</div>
  </section>`;
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;
  if (tabs > commas && tabs > semicolons) return "\t";
  return semicolons > commas ? ";" : ",";
}

function parseCsv(text) {
  const delimiter = detectDelimiter(text);
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeDate(value = "") {
  const input = String(value).trim();
  if (!input) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  const us = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;

  const german = input.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (german) return `${german[3]}-${german[2].padStart(2, "0")}-${german[1].padStart(2, "0")}`;

  return input;
}

function mapImportedRows(csvText, playerName) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) throw new Error("Die CSV enthält keine Datenzeilen.");
  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const aliases = {
    commonName: ["common name", "deutscher name", "art", "vogelart", "species"],
    scientificName: ["scientific name", "wissenschaftlicher name", "latin name"],
    date: ["date", "datum", "observation date", "erstfund"],
    location: ["location", "ort", "locality", "location name"]
  };
  const indexFor = (names) => headers.findIndex((header) => names.includes(header));
  const indexes = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, indexFor(names)]));
  if (indexes.commonName < 0 && indexes.scientificName < 0) throw new Error("Keine Spalte für Vogelart gefunden.");

  const currentByScientificName = new Map(data.species.map((species) => [species.scientificName.toLowerCase(), species]));

  const mapped = rows.slice(1).map((row) => {
    const commonName = indexes.commonName >= 0 ? (row[indexes.commonName] || "") : "";
    const scientificName = indexes.scientificName >= 0 ? (row[indexes.scientificName] || "").trim() : "";
    const existing = currentByScientificName.get(scientificName.toLowerCase());
    return {
      player: playerName.trim(),
      commonName,
      germanName: existing?.germanName || germanNames[scientificName] || commonName || scientificName,
      scientificName,
      date: normalizeDate(indexes.date >= 0 ? (row[indexes.date] || "") : ""),
      location: indexes.location >= 0 ? (row[indexes.location] || "") : ""
    };
  }).filter((row) => row.commonName || row.scientificName);

  const unique = new Map();
  mapped.forEach((row) => {
    const speciesKey = (row.scientificName || row.commonName).trim().toLowerCase();
    const key = `${row.player.toLowerCase()}:${speciesKey}`;
    const current = unique.get(key);
    if (!current || (row.date && (!current.date || row.date < current.date))) unique.set(key, row);
  });
  return [...unique.values()];
}

function buildMergedData() {
  if (!state.importedRows.length) return JSON.parse(JSON.stringify(data));

  const next = JSON.parse(JSON.stringify(data));
  const playerName = state.importPlayer.trim();
  let player = next.players.find((item) => item.name.toLowerCase() === playerName.toLowerCase());

  if (!player) {
    let playerId = slugify(playerName) || `spieler-${next.players.length + 1}`;
    let suffix = 2;
    while (next.players.some((item) => item.id === playerId)) {
      playerId = `${slugify(playerName)}-${suffix}`;
      suffix += 1;
    }
    player = { id: playerId, name: playerName, initials: initialsFor(playerName) };
    next.players.push(player);
  }

  const speciesByScientific = new Map(next.species.map((species) => [species.scientificName.toLowerCase(), species]));
  const speciesById = new Map(next.species.map((species) => [species.id, species]));
  const today = new Date().toISOString().slice(0, 10);

  state.importedRows.forEach((row) => {
    const scientificName = row.scientificName.trim();
    const scientificKey = scientificName.toLowerCase();
    let species = scientificName ? speciesByScientific.get(scientificKey) : null;

    if (!species) {
      const baseId = slugify(scientificName || row.germanName || row.commonName) || `art-${next.species.length + 1}`;
      let speciesId = baseId;
      let suffix = 2;
      while (speciesById.has(speciesId)) {
        speciesId = `${baseId}-${suffix}`;
        suffix += 1;
      }
      species = {
        id: speciesId,
        germanName: germanNames[scientificName] || row.germanName || row.commonName || scientificName,
        englishName: row.commonName || "",
        scientificName,
        points: null
      };
      next.species.push(species);
      speciesById.set(species.id, species);
      if (scientificName) speciesByScientific.set(scientificKey, species);
    } else {
      const translated = germanNames[scientificName];
      if (translated) species.germanName = translated;
      if (!species.englishName && row.commonName) species.englishName = row.commonName;
    }

    const existingObservation = next.observations.find((item) => item.playerId === player.id && item.speciesId === species.id);
    if (existingObservation) {
      if (row.date && (!existingObservation.observedAt || row.date < existingObservation.observedAt)) {
        existingObservation.observedAt = row.date;
        existingObservation.location = row.location || existingObservation.location;
      }
      return;
    }

    next.observations.push({
      id: `obs-${player.id}-${String(next.observations.length + 1).padStart(3, "0")}`,
      playerId: player.id,
      speciesId: species.id,
      observedAt: row.date || `${next.season}-01-01`,
      location: row.location || "",
      importedAt: today
    });
  });

  next.updatedAt = today;
  return next;
}

function serializeDataJs(nextData) {
  return `/* BirdLeague – veröffentlichter Datenstand */\nwindow.BIRDLEAGUE_DATA = ${JSON.stringify(nextData, null, 2)};\n`;
}

function downloadTextFile(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadMergedDataJs() {
  const next = buildMergedData();
  downloadTextFile("data.js", serializeDataJs(next), "text/javascript");
}

function applyImportedRowsLocally() {
  const next = buildMergedData();
  Object.keys(data).forEach((key) => delete data[key]);
  Object.assign(data, next);
  localStorage.setItem("birdleague-data-v1", JSON.stringify(next));
  state.selectedPlayerId = next.players.find((item) => item.name.toLowerCase() === state.importPlayer.trim().toLowerCase())?.id || state.selectedPlayerId;
  state.importedRows = [];
  document.getElementById("updated-at").textContent = `Stand ${formatDate(data.updatedAt)}`;
  document.getElementById("brand-season").textContent = `Saison ${data.season}`;
  renderImport("Import lokal gespeichert. Für alle sichtbar wird er erst, wenn du die neue data.js in GitHub ersetzt.");
}

function resetLocalData() {
  localStorage.removeItem("birdleague-data-v1");
  location.reload();
}

function renderImport(message = "") {
  const hasLocalDraft = Boolean(localStorage.getItem("birdleague-data-v1"));
  app.innerHTML = `<section class="page-content import-page"><article class="panel import-panel">
    <div class="panel-heading"><div><p class="eyebrow">BirdLeague-Verwaltung</p><h3>CSV importieren & veröffentlichen</h3></div><span>⇧</span></div>
    <p>Die CSV wird nur in deinem Browser verarbeitet. Vogelarten werden über den wissenschaftlichen Namen abgeglichen und – sofern bekannt – automatisch auf Deutsch angezeigt.</p>
    <label>Spielername<input id="import-player" value="${escapeHtml(state.importPlayer)}" placeholder="z. B. Finn"></label>
    <label class="dropzone"><span class="upload-symbol">⇧</span><strong>CSV auswählen</strong><span>Unterstützt: Common Name/Art, Scientific Name, Date/Datum, Location/Ort</span><input id="csv-file" type="file" accept=".csv,text/csv"></label>
    ${message ? `<div class="import-message">${escapeHtml(message)}</div>` : ""}
    ${state.importedRows.length ? `<div class="import-preview">${state.importedRows.slice(0, 8).map((row) => `<div><strong>${escapeHtml(row.germanName || row.commonName || row.scientificName)}</strong><span><em>${escapeHtml(row.scientificName)}</em> · ${escapeHtml(row.date || "ohne Datum")} · ${escapeHtml(row.location || "ohne Ort")}</span></div>`).join("")}</div>
      <div class="import-actions">
        <button class="primary-button" data-action="apply-import">Lokal übernehmen</button>
        <button class="secondary-button" data-action="download-datajs">data.js für GitHub herunterladen</button>
      </div>` : ""}
    <hr>
    <div class="import-actions">
      <button class="secondary-button" data-action="download-current-datajs">Aktuellen Stand als data.js herunterladen</button>
      ${hasLocalDraft ? '<button class="secondary-button" data-action="reset-local">Lokale Vorschau zurücksetzen</button>' : ""}
    </div>
    <p class="muted"><strong>Dauerhaft für alle:</strong> Lade die erzeugte <code>data.js</code> in deinem GitHub-Repository hoch und ersetze dort die bisherige Datei. GitHub Pages veröffentlicht den neuen Stand anschließend automatisch.</p>
  </article></section>`;
}

function render() {
  pageTitle.textContent = viewLabels[state.view];
  navigation.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
  if (state.view === "overview") renderOverview();
  if (state.view === "players") renderPlayers();
  if (state.view === "stats") renderStats();
  if (state.view === "rules") renderRules();
  if (state.view === "import") renderImport();
}

navigation.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-view]");
  if (!button) return;
  state.view = button.dataset.view;
  sidebar.classList.remove("sidebar-open");
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

menuButton.addEventListener("click", () => sidebar.classList.toggle("sidebar-open"));

app.addEventListener("click", (event) => {
  const playerTarget = event.target.closest("[data-player]");
  if (playerTarget) {
    state.selectedPlayerId = playerTarget.dataset.player;
    state.view = "players";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "show-players") {
    state.view = "players";
    render();
  }
  if (action === "apply-import") applyImportedRowsLocally();
  if (action === "download-datajs") downloadMergedDataJs();
  if (action === "download-current-datajs") downloadTextFile("data.js", serializeDataJs(data), "text/javascript");
  if (action === "reset-local") resetLocalData();
});

app.addEventListener("input", (event) => {
  if (event.target.id === "import-player") state.importPlayer = event.target.value;
});

app.addEventListener("change", (event) => {
  if (event.target.id !== "csv-file") return;
  const file = event.target.files?.[0];
  if (!state.importPlayer.trim()) {
    renderImport("Bitte zuerst einen Spielernamen eingeben.");
    return;
  }
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state.importedRows = mapImportedRows(String(reader.result || ""), state.importPlayer);
      renderImport(`${state.importedRows.length} eindeutige Jahresarten erkannt. Vorschau auf Deutsch erstellt – noch nicht veröffentlicht.`);
    } catch (error) {
      state.importedRows = [];
      renderImport(error.message || "Die Datei konnte nicht gelesen werden.");
    }
  };
  reader.onerror = () => renderImport("Die Datei konnte nicht gelesen werden.");
  reader.readAsText(file);
});

document.getElementById("brand-season").textContent = `Saison ${data.season}`;
document.getElementById("updated-at").textContent = `Stand ${formatDate(data.updatedAt)}`;

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

render();
