"use strict";

const publishedData = JSON.parse(JSON.stringify(window.BIRDLEAGUE_DATA));
const storageKey = "birdleague-data-v4";
const storedDataRaw = localStorage.getItem(storageKey);
if (storedDataRaw) {
  try {
    const storedData = JSON.parse(storedDataRaw);
    if ((storedData.schemaVersion || 0) === 4 && (storedData.updatedAt || "") > (publishedData.updatedAt || "")) {
      window.BIRDLEAGUE_DATA = storedData;
    } else {
      localStorage.removeItem(storageKey);
    }
  } catch (_) {
    localStorage.removeItem(storageKey);
  }
}

const data = window.BIRDLEAGUE_DATA;
const germanNames = window.BIRDLEAGUE_GERMAN_NAMES || {};
const pointCatalog = window.BIRDLEAGUE_POINTS || {};
const regionLabels = window.BIRDLEAGUE_REGIONS || {};
const scoreWindowLabels = window.BIRDLEAGUE_SCORE_WINDOWS || {};

function regionFromStateProvince(value = "") {
  const code = String(value || "").trim().toUpperCase();
  const deNorth = new Set(["DE-SH", "DE-HH", "DE-NI", "DE-HB", "DE-MV"]);
  const deCentral = new Set(["DE-NW", "DE-HE", "DE-RP", "DE-SL", "DE-ST", "DE-TH", "DE-SN", "DE-BB", "DE-BE"]);
  const deSouth = new Set(["DE-BY", "DE-BW"]);
  const seSouth = new Set(["SE-M", "SE-K", "SE-N", "SE-G", "SE-H", "SE-F", "SE-O", "SE-I"]);
  const seCentral = new Set(["SE-AB", "SE-C", "SE-D", "SE-E", "SE-S", "SE-T", "SE-U", "SE-W", "SE-X"]);
  const seNorth = new Set(["SE-Y", "SE-Z", "SE-AC", "SE-BD"]);
  if (deNorth.has(code)) return "DE-NORTH";
  if (deCentral.has(code)) return "DE-CENTRAL";
  if (deSouth.has(code)) return "DE-SOUTH";
  if (code.startsWith("DK-")) return "DK";
  if (seSouth.has(code)) return "SE-SOUTH";
  if (seCentral.has(code)) return "SE-CENTRAL";
  if (seNorth.has(code)) return "SE-NORTH";
  if (code.startsWith("NO-")) return "NO";
  if (code === "JP-13") return "JP-TOKYO";
  return "OTHER";
}

function scoreWindowFromDate(value = "") {
  const normalized = normalizeDate(value);
  const month = Number(normalized.slice(5, 7));
  if ([5, 6, 7, 8].includes(month)) return "may_aug";
  if ([9, 10, 11].includes(month)) return "sep_nov";
  if ([12, 1, 2].includes(month)) return "dec_feb";
  if ([3, 4].includes(month)) return "mar_apr";
  return "";
}

function scoreBreakdown(scientificName, region, scoreWindow) {
  const entry = pointCatalog?.[scientificName];
  const base = entry?.baseScores?.[region]?.[scoreWindow];
  const acoustic = entry?.acoustic?.[scoreWindow];
  const score = entry?.scores?.[region]?.[scoreWindow];
  if (![base, score].every((value) => typeof value === "number" && Number.isFinite(value)) || !acoustic || typeof acoustic.bonus !== "number") return null;
  return { base, acousticBonus: acoustic.bonus, acousticClass: acoustic.class || "", acousticReason: acoustic.reason || "", score };
}

function masterScore(scientificName, region, scoreWindow) {
  return scoreBreakdown(scientificName, region, scoreWindow)?.score ?? null;
}

function scoreBreakdownText(scientificName, region, scoreWindow) {
  const detail = scoreBreakdown(scientificName, region, scoreWindow);
  if (!detail) return "";
  return `Basis ${detail.base} + Akustik +${detail.acousticBonus}`;
}

function applyMasterData(targetData) {
  const speciesMap = new Map((targetData.species || []).map((species) => [species.id, species]));
  (targetData.species || []).forEach((species) => {
    const master = pointCatalog[species.scientificName];
    if (master?.germanName) species.germanName = master.germanName;
    if (master?.englishName && !species.englishName) species.englishName = master.englishName;
    delete species.points;
  });
  (targetData.observations || []).forEach((observation) => {
    const species = speciesMap.get(observation.speciesId);
    if (!observation.region && observation.stateProvince) observation.region = regionFromStateProvince(observation.stateProvince);
    if (!observation.scoreWindow && observation.observedAt) observation.scoreWindow = scoreWindowFromDate(observation.observedAt);
    const detail = species ? scoreBreakdown(species.scientificName, observation.region, observation.scoreWindow) : null;
    observation.basePoints = detail?.base ?? null;
    observation.acousticBonus = detail?.acousticBonus ?? null;
    observation.points = detail?.score ?? null;
  });
}

applyMasterData(data);

const app = document.getElementById("app");
const sidebar = document.getElementById("sidebar");
const navigation = document.getElementById("navigation");
const pageTitle = document.getElementById("page-title");
const menuButton = document.getElementById("menu-button");
const brandHome = document.getElementById("brand-home");

const state = {
  view: "overview",
  selectedPlayerId: data.players[0]?.id || "",
  importedRows: [],
  importPlayer: "",
  importRegion: "",
  importMeta: null
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
const getObservationPointValue = (observation) => hasPointValue(observation?.points) ? observation.points : 0;
const pointLabel = (value) => hasPointValue(value) ? String(value) : "–";
const pointText = (value) => hasPointValue(value) ? `${value} Punkte` : "noch unbewertet";
const regionLabel = (code) => regionLabels[code] || code || "Region unbekannt";
const scoreWindowLabel = (code) => scoreWindowLabels[code] || code || "Zeitfenster unbekannt";

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
  const owners = getOwners();
  const observations = uniqueObservations();

  return data.players.map((player) => {
    const playerObservations = observations.filter((item) => item.playerId === player.id);
    const points = playerObservations.reduce((sum, item) => sum + getObservationPointValue(item), 0);
    const latestPoints = playerObservations
      .filter((item) => item.importedAt === data.updatedAt)
      .reduce((sum, item) => sum + getObservationPointValue(item), 0);
    const unratedCount = playerObservations.filter((item) => !hasPointValue(item.points)).length;

    return {
      player,
      points,
      latestPoints,
      unratedCount,
      pointsComplete: unratedCount === 0,
      speciesCount: playerObservations.length,
      exclusiveCount: playerObservations.filter((item) => owners.get(item.speciesId)?.size === 1).length,
      rarityCount: playerObservations.filter((item) => item.points === 15).length
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
    .sort((a, b) => getObservationPointValue(b) - getObservationPointValue(a) || a.observedAt.localeCompare(b.observedAt));
}

function getExclusiveSpecies() {
  const owners = getOwners();
  const speciesMap = getSpeciesMap();
  return uniqueObservations()
    .filter((item) => owners.get(item.speciesId)?.size === 1)
    .map((item) => ({ ...item, species: speciesMap.get(item.speciesId) }))
    .filter((item) => item.species)
    .sort((a, b) => getObservationPointValue(b) - getObservationPointValue(a));
}

function getTimeline() {
  const observations = uniqueObservations().sort((a, b) => a.observedAt.localeCompare(b.observedAt));
  const running = new Map(data.players.map((player) => [player.id, 0]));
  const now = new Date();
  const season = Number(data.season);

  // BirdLeague läuft von Mai des Saisonjahres bis einschließlich Mai des Folgejahres.
  const seasonMonths = Array.from({ length: 13 }, (_, index) => {
    const zeroBasedMonth = 4 + index;
    const year = season + Math.floor(zeroBasedMonth / 12);
    const monthIndex = zeroBasedMonth % 12;
    return { year, monthIndex };
  });

  const currentKey = now.getFullYear() * 12 + now.getMonth();
  const startKey = season * 12 + 4;
  const endKey = (season + 1) * 12 + 4;
  const visibleEndKey = Math.min(Math.max(currentKey, startKey - 1), endKey);
  const visibleMonths = seasonMonths.filter(({ year, monthIndex }) => year * 12 + monthIndex <= visibleEndKey);

  return visibleMonths.map(({ year, monthIndex }, index) => {
    const monthNumber = monthIndex + 1;
    const monthKey = `${year}-${String(monthNumber).padStart(2, "0")}`;
    observations.filter((item) => item.observedAt.startsWith(monthKey)).forEach((item) => {
      running.set(item.playerId, (running.get(item.playerId) || 0) + getObservationPointValue(item));
    });

    const baseLabel = new Intl.DateTimeFormat("de-DE", { month: "short" })
      .format(new Date(year, monthIndex, 1));
    const isBoundaryMay = monthIndex === 4 && (index === 0 || year === season + 1);

    return {
      month: isBoundaryMay ? `${baseLabel} ${String(year).slice(-2)}` : baseLabel,
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
  const rarityFinds = uniqueObservations().filter((item) => item.points === 15).length;
  const unratedFinds = uniqueObservations().filter((item) => !hasPointValue(item.points)).length;

  app.innerHTML = `<section class="page-content">
    <article class="hero-card">
      <div><span class="season-tag">BirdLeague ${data.season}</span><h2>Wer hört den Unterschied?</h2>
      <p>Bestätigte Vogelstimmen sammeln, regional besondere Arten entdecken und das Saisonranking gewinnen.</p>
      <button class="primary-button" data-action="show-players">Liga ansehen →</button></div>
      <div class="leader-card"><span class="crown">♛</span><span>Aktuelle Führung</span><strong>${escapeHtml(leader.player.name)}</strong><b>${leader.points}${leader.unratedCount ? "*" : ""} Punkte</b><small>${leader.speciesCount} bestätigte Arten${leader.unratedCount ? ` · ${leader.unratedCount} noch unbewertet` : ""}</small></div>
    </article>
    <div class="stats-grid">
      ${statCard("Arten in der Liga", totalSpecies, "einzigartige Vogelarten", "B")}
      ${statCard("Spieler", data.players.length, "jagen den Titel", "◎")}
      ${statCard("Raritäten", rarityFinds, "15-Punkte-Funde", "◆")}
      ${statCard("Neues Update", recentFinds.length, "neue Jahresarten", "✦")}
      ${unratedFinds ? statCard("Bewertung offen", unratedFinds, "Funde ohne V4-Wertung", "…") : ""}
    </div>
    <div class="content-grid content-grid-wide">
      <article class="panel panel-span-2"><div class="panel-heading"><div><p class="eyebrow">Live-Tabelle</p><h3>Aktuelles Ranking</h3></div><span>♛</span></div>${rankingTable()}</article>
      <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Letzter Import</p><h3>Neue Funde</h3></div><span>✦</span></div>
        <div class="find-list">${recentFinds.slice(0, 10).map((find) => `<button data-player="${find.player.id}"><span class="points-badge ${find.points === 15 ? 'rarity' : ''}">${hasPointValue(find.points) ? `+${find.points}` : "–"}</span><div><strong>${escapeHtml(find.species.germanName)}</strong><small>${escapeHtml(find.player.name)} · ${escapeHtml(regionLabel(find.region))}</small></div></button>`).join("")}</div>
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
    <article class="profile-hero"><div class="profile-avatar">${selectedPlayer.initials}</div><div><p class="eyebrow">Spielerprofil</p><h2>${escapeHtml(selectedPlayer.name)}</h2><p>Platz ${standings.findIndex((item) => item.player.id === selectedPlayer.id) + 1} in der BirdLeague ${data.season}</p></div><div class="profile-score"><strong>${standing.points}${standing.unratedCount ? "*" : ""}</strong><span>${standing.unratedCount ? `${standing.unratedCount} Funde unbewertet` : "Punkte"}</span></div></article>
    <div class="content-grid">
      <article class="panel panel-span-2"><div class="panel-heading"><div><p class="eyebrow">Sammlung</p><h3>${observations.length} Jahresarten</h3></div><span>B</span></div>
        <div class="species-table">${observations.map((item) => `<div><span class="points-badge ${item.points === 15 ? 'rarity' : ''}">${pointLabel(item.points)}</span><div><strong>${escapeHtml(item.species.germanName)}</strong><small><em>${escapeHtml(item.species.scientificName)}</em> · ${formatDate(item.observedAt)} · ${escapeHtml(regionLabel(item.region))}${item.location ? ` · ${escapeHtml(item.location)}` : ''} · <span class="score-breakdown">${escapeHtml(scoreBreakdownText(item.species.scientificName, item.region, item.scoreWindow))}</span></small></div></div>`).join("")}</div>
      </article>
      <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Besonders</p><h3>Exklusive Arten</h3></div><span>★</span></div>
        <div class="exclusive-list">${exclusive.length ? exclusive.map((item) => `<div><strong>${escapeHtml(item.species.germanName)}</strong><span>${pointText(item.points)}</span></div>`).join("") : '<p class="muted">Aktuell keine exklusive Art.</p>'}</div>
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

  const xDivisor = Math.max(timeline.length - 1, 1);
  const monthLabels = timeline.map((item, index) => {
    const x = timeline.length === 1 ? left : left + (plotWidth * index / xDivisor);
    return `<text x="${x}" y="${height - 12}" text-anchor="middle">${escapeHtml(item.month)}</text>`;
  }).join("");

  const lines = data.players.map((player, playerIndex) => {
    const points = timeline.map((item, index) => {
      const x = timeline.length === 1 ? left : left + (plotWidth * index / xDivisor);
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
  const speciesMap = getSpeciesMap();
  const seen = new Set();
  const valuableFinds = uniqueObservations()
    .map((item) => ({ ...item, species: speciesMap.get(item.speciesId), player: playerMap.get(item.playerId) }))
    .filter((item) => item.species && hasPointValue(item.points))
    .sort((a, b) => b.points - a.points || a.species.germanName.localeCompare(b.species.germanName))
    .filter((item) => {
      const key = `${item.speciesId}:${item.region}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);

  app.innerHTML = `<section class="page-content">
    <div class="content-grid content-grid-wide">
      <article class="panel panel-span-2 chart-panel"><div class="panel-heading"><div><p class="eyebrow">Saisonverlauf</p><h3>Punkte im Saisonverlauf</h3><small>Mai ${data.season} – Mai ${Number(data.season) + 1}</small></div><span>↗</span></div>${buildTimelineSvg()}</article>
      <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Nur einmal gehört</p><h3>Exklusive Arten</h3></div><span>★</span></div>
        <div class="exclusive-list">${exclusive.slice(0, 8).map((item) => `<div><span><strong>${escapeHtml(item.species.germanName)}</strong><small>${escapeHtml(playerMap.get(item.playerId)?.name || '')} · ${escapeHtml(regionLabel(item.region))}</small></span><b>${pointLabel(item.points)}</b></div>`).join("")}</div>
      </article>
      <article class="panel panel-span-3"><div class="panel-heading"><div><p class="eyebrow">Regionale Punktelogik</p><h3>Wertvollste Funde der Saison</h3></div><span>◆</span></div>
        <div class="rarity-grid">${valuableFinds.length ? valuableFinds.map((item) => `<div><span class="points-badge ${item.points === 15 ? 'rarity' : ''}">${pointLabel(item.points)}</span><strong>${escapeHtml(item.species.germanName)}</strong><small>${escapeHtml(regionLabel(item.region))} · ${escapeHtml(item.player.name)}</small></div>`).join("") : '<p class="muted">Noch keine Funde bewertet.</p>'}</div>
      </article>
    </div>
  </section>`;
}

function renderRules() {
  const rules = [
    ["1", "Eine Art pro Person und Saison", "Mehrfachaufnahmen derselben Art bringen keine zusätzlichen Punkte. Es zählt der früheste bestätigte Fund zwischen Mai und Mai."],
    ["2", "Nur bestätigte Funde", "In die Liga kommen ausschließlich bewusst bestätigte Vogelarten – egal ob aus Merlin/eBird oder BirdNET Live."],
    ["R", "Regionalbasis", "Zuerst zählt, wie besonders die Art in der Fundregion und im jeweiligen Zeitfenster ist. Lokal häufige Reisearten werden dadurch nicht künstlich aufgewertet."],
    ["+", "Akustikbonus", "Zusätzlich gibt es 0 bis 3 Punkte dafür, wie schwierig es typischerweise ist, bei einer Begegnung tatsächlich eine brauchbare Lautäußerung zu erwischen."],
    ["10", "Regulärer Deckel", "Regionalbasis und Akustikbonus werden addiert; normale Funde sind bei 10 Punkten gedeckelt."],
    ["15", "Echte Raritäten", "15 Punkte sind außergewöhnlichen regionalen Raritäten vorbehalten. Gefährdungsstatus allein reicht dafür nicht."],
    ["↻", "Neue Kombinationen werden geprüft", "Taucht eine Art erstmals in einer neuen Region oder Jahreszeit auf, blockiert der Import, bis Regionalbasis und Akustikprofil festgelegt sind."],
    ["★", "Exklusive Arten", "Arten, die nur ein Spieler gefunden hat, werden hervorgehoben – ohne zusätzliche Bonuspunkte."]
  ];

  app.innerHTML = `<section class="page-content rules-page">
    <article class="rules-intro"><span class="big-bird"><img src="logo-birdleague.png" alt=""></span><div><p class="eyebrow">BirdLeague-Regelwerk</p><h2>Seltenheit trifft Aufnahme-Challenge.</h2><p>V4 trennt regionale Besonderheit und akustische Schwierigkeit – und macht damit aus einem Sichtfund noch nicht automatisch einen starken BirdLeague-Fund.</p></div></article>
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
  if (/^\d{4}-\d{2}-\d{2}T/.test(input)) return input.slice(0, 10);

  const us = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;

  const german = input.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (german) return `${german[3]}-${german[2].padStart(2, "0")}-${german[1].padStart(2, "0")}`;

  return input;
}

function seasonBounds() {
  const season = Number(data.season);
  return {
    start: `${season}-05-01`,
    end: `${season + 1}-05-31`
  };
}

function isDateInSeason(date) {
  if (!date) return true;
  const normalized = normalizeDate(date);
  const { start, end } = seasonBounds();
  return normalized >= start && normalized <= end;
}

function isConfirmedValue(value) {
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "ja", "confirmed", "bestätigt"].includes(String(value ?? "").trim().toLowerCase());
}

function dedupeImportedRows(rows) {
  const unique = new Map();
  rows.forEach((row) => {
    const speciesKey = (row.scientificName || row.commonName).trim().toLowerCase();
    if (!speciesKey) return;
    const key = `${row.player.toLowerCase()}:${speciesKey}`;
    const current = unique.get(key);
    if (!current || (row.date && (!current.date || row.date < current.date))) unique.set(key, row);
  });
  return [...unique.values()];
}

function mapImportedRows(csvText, playerName, sourceName = "CSV") {
  const rows = parseCsv(csvText);
  if (rows.length < 2) throw new Error("Die CSV enthält keine Datenzeilen.");
  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const aliases = {
    commonName: ["common name", "deutscher name", "art", "vogelart", "species"],
    scientificName: ["scientific name", "wissenschaftlicher name", "latin name"],
    date: ["date", "datum", "observation date", "erstfund", "timestamp (utc)", "timestamp"],
    location: ["location", "ort", "locality", "location name"],
    stateProvince: ["state/province", "state province", "state", "province", "region code", "bundesland"],
    confirmed: ["confirmed", "bestätigt", "confirmed?", "verified"]
  };
  const indexFor = (names) => headers.findIndex((header) => names.includes(header));
  const indexes = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, indexFor(names)]));
  if (indexes.commonName < 0 && indexes.scientificName < 0) throw new Error("Keine Spalte für Vogelart gefunden.");

  const currentByScientificName = new Map(data.species.map((species) => [species.scientificName.toLowerCase(), species]));
  const hasConfirmationColumn = indexes.confirmed >= 0;
  let unconfirmedIgnored = 0;
  let outOfSeasonIgnored = 0;
  let detectionCount = 0;
  const mapped = [];

  rows.slice(1).forEach((row) => {
    detectionCount += 1;
    if (hasConfirmationColumn && !isConfirmedValue(row[indexes.confirmed])) {
      unconfirmedIgnored += 1;
      return;
    }
    const commonName = indexes.commonName >= 0 ? (row[indexes.commonName] || "") : "";
    const scientificName = indexes.scientificName >= 0 ? (row[indexes.scientificName] || "").trim() : "";
    const existing = currentByScientificName.get(scientificName.toLowerCase());
    const date = normalizeDate(indexes.date >= 0 ? (row[indexes.date] || "") : "");
    if (date && !isDateInSeason(date)) {
      outOfSeasonIgnored += 1;
      return;
    }
    const stateProvince = indexes.stateProvince >= 0 ? (row[indexes.stateProvince] || "").trim() : "";
    const automaticRegion = stateProvince ? regionFromStateProvince(stateProvince) : "";
    const region = automaticRegion && automaticRegion !== "OTHER" ? automaticRegion : (state.importRegion || automaticRegion || "");
    mapped.push({
      player: playerName.trim(),
      commonName,
      germanName: existing?.germanName || pointCatalog[scientificName]?.germanName || germanNames[scientificName] || commonName || scientificName,
      scientificName,
      date,
      location: indexes.location >= 0 ? (row[indexes.location] || "") : "",
      stateProvince,
      region,
      scoreWindow: scoreWindowFromDate(date),
      source: sourceName
    });
  });

  return {
    rows: dedupeImportedRows(mapped.filter((row) => row.commonName || row.scientificName)),
    meta: {
      files: 1,
      detections: detectionCount,
      confirmed: mapped.length,
      unconfirmedIgnored,
      outOfSeasonIgnored,
      birdnetFiles: hasConfirmationColumn ? 1 : 0,
      ebirdFiles: hasConfirmationColumn ? 0 : 1
    }
  };
}

function birdNetSessionDate(payload) {
  const localId = payload?.meta?.session?.id || payload?.session || "";
  const match = String(localId).match(/(\d{4}-\d{2}-\d{2})/);
  return match?.[1] || normalizeDate(payload?.startTime || payload?.meta?.session?.startTime || "");
}

function birdNetLocation(payload) {
  const named = payload?.locationName || payload?.meta?.session?.locationName;
  if (named) return String(named);
  const lat = payload?.latitude ?? payload?.meta?.session?.latitude;
  const lon = payload?.longitude ?? payload?.meta?.session?.longitude;
  if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lon))) return `${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`;
  return "";
}

function mapBirdNetJson(jsonText, playerName, sourceName = "BirdNET Live") {
  const payload = JSON.parse(jsonText);
  if (!Array.isArray(payload?.detections)) throw new Error("Die JSON-Datei ist kein erkannter BirdNET-Live-Export.");

  const sessionDate = birdNetSessionDate(payload);
  const location = birdNetLocation(payload);
  let unconfirmedIgnored = 0;
  let outOfSeasonIgnored = 0;
  const mapped = [];

  payload.detections.forEach((detection) => {
    if (!isConfirmedValue(detection.confirmed)) {
      unconfirmedIgnored += 1;
      return;
    }
    const date = sessionDate || normalizeDate(detection.timestamp || "");
    if (date && !isDateInSeason(date)) {
      outOfSeasonIgnored += 1;
      return;
    }
    const scientificName = String(detection.scientificName || "").trim();
    const commonName = String(detection.commonName || "").trim();
    mapped.push({
      player: playerName.trim(),
      commonName,
      germanName: pointCatalog[scientificName]?.germanName || germanNames[scientificName] || commonName || scientificName,
      scientificName,
      date,
      location,
      stateProvince: "",
      region: state.importRegion || "",
      scoreWindow: scoreWindowFromDate(date),
      source: sourceName
    });
  });

  return {
    rows: dedupeImportedRows(mapped),
    meta: {
      files: 1,
      detections: payload.detections.length,
      confirmed: mapped.length,
      unconfirmedIgnored,
      outOfSeasonIgnored,
      birdnetFiles: 1,
      ebirdFiles: 0
    }
  };
}

function mergeImportResults(results) {
  const rows = dedupeImportedRows(results.flatMap((result) => result.rows));
  const meta = results.reduce((sum, result) => {
    Object.keys(sum).forEach((key) => { sum[key] += Number(result.meta?.[key] || 0); });
    return sum;
  }, { files: 0, detections: 0, confirmed: 0, unconfirmedIgnored: 0, outOfSeasonIgnored: 0, birdnetFiles: 0, ebirdFiles: 0 });
  meta.uniqueSpecies = rows.length;
  return { rows, meta };
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream === "undefined") throw new Error("ZIP-Import wird von diesem Browser nicht unterstützt. Bitte die ZIP entpacken und die JSON-Datei auswählen.");
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function extractBirdNetTextFromZip(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder("utf-8");
  let eocd = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) { eocd = offset; break; }
  }
  if (eocd < 0) throw new Error("Die ZIP-Datei konnte nicht gelesen werden.");

  const entries = view.getUint16(eocd + 10, true);
  let cursor = view.getUint32(eocd + 16, true);
  const candidates = [];

  for (let index = 0; index < entries; index += 1) {
    if (view.getUint32(cursor, true) !== 0x02014b50) throw new Error("Ungültige ZIP-Struktur.");
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const filenameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const filename = decoder.decode(bytes.slice(cursor + 46, cursor + 46 + filenameLength));
    if ((filename.endsWith(".json") && !filename.endsWith(".metadata.json")) || filename.endsWith(".csv")) {
      candidates.push({ filename, method, compressedSize, localOffset });
    }
    cursor += 46 + filenameLength + extraLength + commentLength;
  }

  const candidate = candidates.find((entry) => entry.filename.endsWith(".json")) || candidates.find((entry) => entry.filename.endsWith(".csv"));
  if (!candidate) throw new Error("In der BirdNET-ZIP wurde keine JSON- oder CSV-Datei gefunden.");
  if (view.getUint32(candidate.localOffset, true) !== 0x04034b50) throw new Error("Ungültiger ZIP-Dateieintrag.");
  const localNameLength = view.getUint16(candidate.localOffset + 26, true);
  const localExtraLength = view.getUint16(candidate.localOffset + 28, true);
  const start = candidate.localOffset + 30 + localNameLength + localExtraLength;
  const compressed = bytes.slice(start, start + candidate.compressedSize);
  let plain;
  if (candidate.method === 0) plain = compressed;
  else if (candidate.method === 8) plain = await inflateRaw(compressed);
  else throw new Error(`ZIP-Kompressionsmethode ${candidate.method} wird nicht unterstützt.`);
  return { filename: candidate.filename, text: decoder.decode(plain) };
}

async function parseImportFile(file, playerName) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".zip")) {
    const extracted = await extractBirdNetTextFromZip(file);
    if (extracted.filename.toLowerCase().endsWith(".json")) return mapBirdNetJson(extracted.text, playerName, file.name);
    return mapImportedRows(extracted.text, playerName, file.name);
  }
  const text = await file.text();
  if (name.endsWith(".json")) return mapBirdNetJson(text, playerName, file.name);
  if (name.endsWith(".csv")) return mapImportedRows(text, playerName, file.name);
  throw new Error(`Dateityp von ${file.name} wird nicht unterstützt.`);
}

function getImportAudit() {
  const playerName = state.importPlayer.trim().toLowerCase();
  const player = data.players.find((item) => item.name.toLowerCase() === playerName);
  const speciesMap = getSpeciesMap();
  const alreadyOwned = new Set(
    uniqueObservations()
      .filter((item) => item.playerId === player?.id)
      .map((item) => speciesMap.get(item.speciesId)?.scientificName?.toLowerCase())
      .filter(Boolean)
  );

  const missing = [];
  const rated = [];
  let alreadyPresentCount = 0;
  let newCount = 0;

  state.importedRows.forEach((row) => {
    const sci = (row.scientificName || "").trim();
    const point = masterScore(sci, row.region, row.scoreWindow);
    if (hasPointValue(point)) {
      rated.push({ ...row, points: point });
    } else {
      let missingReason = "Punktwert fehlt";
      if (!row.region || row.region === "OTHER") missingReason = "Region fehlt/ist noch nicht unterstützt";
      else if (!row.scoreWindow) missingReason = "Zeitfenster fehlt";
      else if (!pointCatalog[sci]) missingReason = "Art fehlt in der Masterliste";
      else if (!pointCatalog[sci]?.baseScores?.[row.region]?.[row.scoreWindow]) missingReason = `${regionLabel(row.region)} · ${scoreWindowLabel(row.scoreWindow)}: Regionalbasis fehlt`;
      else if (!pointCatalog[sci]?.acoustic?.[row.scoreWindow]) missingReason = `${scoreWindowLabel(row.scoreWindow)}: Akustikprofil fehlt`;
      else missingReason = `${regionLabel(row.region)} · ${scoreWindowLabel(row.scoreWindow)} noch nicht vollständig bewertet`;
      missing.push({ ...row, missingReason });
    }
    if (alreadyOwned.has(sci.toLowerCase())) alreadyPresentCount += 1;
    else newCount += 1;
  });

  return {
    total: state.importedRows.length,
    ratedCount: rated.length,
    missing,
    alreadyPresentCount,
    newCount,
    complete: missing.length === 0
  };
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
        germanName: pointCatalog[scientificName]?.germanName || germanNames[scientificName] || row.germanName || row.commonName || scientificName,
        englishName: row.commonName || pointCatalog[scientificName]?.englishName || "",
        scientificName
      };
      next.species.push(species);
      speciesById.set(species.id, species);
      if (scientificName) speciesByScientific.set(scientificKey, species);
    } else {
      const translated = pointCatalog[scientificName]?.germanName || germanNames[scientificName];
      if (translated) species.germanName = translated;
      if (!species.englishName && row.commonName) species.englishName = row.commonName;
    }

    const rowPoint = masterScore(scientificName, row.region, row.scoreWindow);
    const existingObservation = next.observations.find((item) => item.playerId === player.id && item.speciesId === species.id);
    if (existingObservation) {
      if (row.date && (!existingObservation.observedAt || row.date < existingObservation.observedAt)) {
        existingObservation.observedAt = row.date;
        existingObservation.location = row.location || existingObservation.location;
        existingObservation.stateProvince = row.stateProvince || "";
        existingObservation.region = row.region || "";
        existingObservation.scoreWindow = row.scoreWindow || scoreWindowFromDate(row.date);
        const detail = scoreBreakdown(scientificName, row.region, row.scoreWindow);
        existingObservation.basePoints = detail?.base ?? null;
        existingObservation.acousticBonus = detail?.acousticBonus ?? null;
        existingObservation.points = rowPoint;
        existingObservation.importedAt = today;
      }
      return;
    }

    next.observations.push({
      id: `obs-${player.id}-${String(next.observations.length + 1).padStart(3, "0")}`,
      playerId: player.id,
      speciesId: species.id,
      observedAt: row.date || `${next.season}-05-01`,
      location: row.location || "",
      stateProvince: row.stateProvince || "",
      region: row.region || "",
      scoreWindow: row.scoreWindow || scoreWindowFromDate(row.date),
      basePoints: scoreBreakdown(scientificName, row.region, row.scoreWindow)?.base ?? null,
      acousticBonus: scoreBreakdown(scientificName, row.region, row.scoreWindow)?.acousticBonus ?? null,
      points: rowPoint,
      importedAt: today
    });
  });

  next.schemaVersion = 4;
  next.updatedAt = today;
  applyMasterData(next);
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
  const audit = getImportAudit();
  if (!audit.complete) {
    renderImport(`${audit.missing.length} Fundkontext(e) haben noch keine vollständige V4-Wertung. Bitte zuerst die V4-Masterliste ergänzen.`);
    return;
  }
  const next = buildMergedData();
  downloadTextFile("data.js", serializeDataJs(next), "text/javascript");
}

function applyImportedRowsLocally() {
  const audit = getImportAudit();
  if (!audit.complete) {
    renderImport(`${audit.missing.length} Fundkontext(e) haben noch keine vollständige V4-Wertung. Import wurde nicht übernommen.`);
    return;
  }
  const next = buildMergedData();
  Object.keys(data).forEach((key) => delete data[key]);
  Object.assign(data, next);
  localStorage.setItem(storageKey, JSON.stringify(next));
  state.selectedPlayerId = next.players.find((item) => item.name.toLowerCase() === state.importPlayer.trim().toLowerCase())?.id || state.selectedPlayerId;
  state.importedRows = [];
  state.importMeta = null;
  document.getElementById("updated-at").textContent = `Stand ${formatDate(data.updatedAt)}`;
  document.getElementById("brand-season").textContent = `Mai ${data.season} – Mai ${Number(data.season) + 1}`;
  renderImport("Import lokal gespeichert. Für alle sichtbar wird er erst, wenn du die neue data.js in GitHub ersetzt.");
}

function resetLocalData() {
  localStorage.removeItem(storageKey);
  location.reload();
}

function renderImport(message = "") {
  const hasLocalDraft = Boolean(localStorage.getItem(storageKey));
  const audit = state.importedRows.length ? getImportAudit() : null;
  const meta = state.importMeta;
  const missingHtml = audit?.missing.length ? `<div class="audit-warning"><strong>Fehlende Region-/Zeit-Bewertungen</strong>${audit.missing.map((row) => `<div><span>${escapeHtml(row.germanName || row.commonName || row.scientificName)}</span><em>${escapeHtml(row.missingReason)}${row.scientificName ? ` · ${escapeHtml(row.scientificName)}` : ""}</em></div>`).join("")}<p>BirdLeague übernimmt neue Art-/Region-/Zeit-Kombinationen bewusst nicht automatisch. Ergänze sie zuerst in der V4-Masterliste und aktualisiere anschließend <code>points.js</code>.</p></div>` : "";
  const readyHtml = audit?.complete ? `<div class="audit-ready">✓ ${audit.ratedCount}/${audit.total} Arten haben für Fundregion und Zeitfenster einen Punktwert. Import ist bereit.</div>` : "";
  const sourceHtml = meta ? `<div class="import-source-summary">
      <strong>${meta.files} Datei${meta.files === 1 ? "" : "en"} verarbeitet</strong>
      <span>${meta.detections} Beobachtungen/Detektionen gelesen</span>
      ${meta.birdnetFiles ? `<span>${meta.confirmed} bestätigte BirdNET-Detektionen berücksichtigt</span><span>${meta.unconfirmedIgnored} unbestätigte BirdNET-Detektionen ignoriert</span>` : ""}
      ${meta.outOfSeasonIgnored ? `<span>${meta.outOfSeasonIgnored} außerhalb Mai ${data.season} – Mai ${Number(data.season) + 1} ignoriert</span>` : ""}
    </div>` : "";
  const regionOptions = Object.entries(regionLabels)
    .filter(([code]) => code !== "OTHER")
    .map(([code, label]) => `<option value="${escapeHtml(code)}" ${state.importRegion === code ? "selected" : ""}>${escapeHtml(label)}</option>`)
    .join("");

  app.innerHTML = `<section class="page-content import-page"><article class="panel import-panel">
    <div class="panel-heading"><div><p class="eyebrow">BirdLeague-Verwaltung</p><h3>Beobachtungen importieren & veröffentlichen</h3></div><span>⇧</span></div>
    <p>eBird-CSV-Dateien werden über <code>State/Province</code> automatisch einer BirdLeague-Region zugeordnet. Für BirdNET Live oder CSVs ohne Regionscode kannst du eine Fallback-Region wählen. Der Punktwert besteht aus Regionalbasis + Akustikbonus. Die Regionalbasis hängt von Art, Region und Zeitfenster ab; der Akustikbonus bewertet, wie schwierig eine brauchbare Lautäußerung typischerweise zu erwischen ist.</p>
    <label>Spielername<input id="import-player" value="${escapeHtml(state.importPlayer)}" placeholder="z. B. Finn"></label>
    <label>Fallback-Region für Dateien ohne Regionscode
      <select id="import-region"><option value="">Bitte wählen, falls nötig</option>${regionOptions}</select>
    </label>
    <label class="dropzone"><span class="upload-symbol">⇧</span><strong>Dateien auswählen</strong><span>eBird: CSV · BirdNET Live: ZIP, JSON oder CSV · Mehrfachauswahl möglich</span><input id="import-file" type="file" accept=".csv,.json,.zip,text/csv,application/json,application/zip" multiple></label>
    ${message ? `<div class="import-message">${escapeHtml(message)}</div>` : ""}
    ${sourceHtml}
    ${audit ? `<div class="audit-grid">
      <div><strong>${audit.total}</strong><span>Jahresarten erkannt</span></div>
      <div><strong>${audit.ratedCount}</strong><span>vollständig bewertet</span></div>
      <div><strong>${audit.newCount}</strong><span>neu für ${escapeHtml(state.importPlayer)}</span></div>
      <div><strong>${audit.alreadyPresentCount}</strong><span>bereits vorhanden</span></div>
    </div>${readyHtml}${missingHtml}` : ""}
    ${state.importedRows.length ? `<div class="import-preview">${state.importedRows.slice(0, 10).map((row) => { const point = masterScore(row.scientificName, row.region, row.scoreWindow); return `<div><strong>${escapeHtml(row.germanName || row.commonName || row.scientificName)}</strong><span><b>${hasPointValue(point) ? `${point} P` : "unbewertet"}</b>${hasPointValue(point) ? ` · ${escapeHtml(scoreBreakdownText(row.scientificName, row.region, row.scoreWindow))}` : ""} · ${escapeHtml(regionLabel(row.region))} · ${escapeHtml(scoreWindowLabel(row.scoreWindow))} · <em>${escapeHtml(row.scientificName)}</em> · ${escapeHtml(row.date || "ohne Datum")}</span></div>`; }).join("")}</div>
      <div class="import-actions">
        <button class="primary-button" data-action="apply-import" ${audit && !audit.complete ? "disabled" : ""}>Lokal übernehmen</button>
        <button class="secondary-button" data-action="download-datajs" ${audit && !audit.complete ? "disabled" : ""}>data.js für GitHub herunterladen</button>
      </div>` : ""}
    <hr>
    <div class="import-actions">
      <a class="secondary-button button-link" href="data/species-points.json" download>V4-Master-Punkteliste als JSON</a>
      <button class="secondary-button" data-action="download-current-datajs">Aktuellen Stand als data.js herunterladen</button>
      ${hasLocalDraft ? '<button class="secondary-button" data-action="reset-local">Lokale Vorschau zurücksetzen</button>' : ""}
    </div>
    <p class="muted"><strong>Dauerhaft für alle:</strong> Lade die erzeugte <code>data.js</code> in deinem GitHub-Repository hoch. Taucht eine neue Region-/Zeit-Kombination auf, wird der Import blockiert, bis sie in der Masterliste bewertet ist.</p>
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

brandHome.addEventListener("click", () => {
  state.view = "overview";
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
  if (event.target.id === "import-region") state.importRegion = event.target.value;
});

app.addEventListener("change", async (event) => {
  if (event.target.id !== "import-file") return;
  const files = [...(event.target.files || [])];
  if (!state.importPlayer.trim()) {
    renderImport("Bitte zuerst einen Spielernamen eingeben.");
    return;
  }
  if (!files.length) return;

  renderImport(`${files.length} Datei${files.length === 1 ? "" : "en"} werden verarbeitet …`);
  try {
    const results = [];
    for (const file of files) results.push(await parseImportFile(file, state.importPlayer));
    const merged = mergeImportResults(results);
    state.importedRows = merged.rows;
    state.importMeta = merged.meta;

    if (!merged.rows.length) {
      const ignored = merged.meta.unconfirmedIgnored;
      renderImport(ignored
        ? `Keine bestätigten Jahresarten gefunden. ${ignored} unbestätigte BirdNET-Detektion${ignored === 1 ? " wurde" : "en wurden"} ignoriert.`
        : "Keine importierbaren Jahresarten in der aktuellen Saison gefunden.");
      return;
    }

    const audit = getImportAudit();
    renderImport(audit.complete
      ? `${audit.total} eindeutige Jahresarten erkannt – alle Fundkontexte sind bewertet.`
      : `${audit.total} eindeutige Jahresarten erkannt – ${audit.missing.length} Region-/Zeit-Bewertungen fehlen noch.`);
  } catch (error) {
    state.importedRows = [];
    state.importMeta = null;
    renderImport(error.message || "Die Datei konnte nicht gelesen werden.");
  }
});

document.getElementById("brand-season").textContent = `Mai ${data.season} – Mai ${Number(data.season) + 1}`;
document.getElementById("updated-at").textContent = `Stand ${formatDate(data.updatedAt)}`;

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

render();
