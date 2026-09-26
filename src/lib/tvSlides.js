import { calculateStandingsByGroup } from './standings.js';
import { orderedMatches } from './poster.js';
import { FEMALE_TOURNAMENTS } from './femaleTournaments.js';
import { CUPS } from './playoffs.js';

export function localDay(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function slideSeconds(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 5 && n <= 120 ? n : 15;
}

export function buildTvSlides(entries, date) {
  return FEMALE_TOURNAMENTS.flatMap((cup) => {
    const entry = entries[cup.id];
    const base = { cup, cached: entry?.cached, received: entry?.received };
    if (entry?.error) return [{ ...base, key: `${cup.id}-error`, type: 'message', message: 'No se pudieron actualizar los datos de esta copa.' }];
    if (!entry || entry.matches == null || entry.teams == null || entry.tournament === undefined) return [{ ...base, key: `${cup.id}-loading`, type: 'message', message: 'Cargando cartelera…' }];
    if (!entry.tournament) return [{ ...base, key: `${cup.id}-missing`, type: 'message', message: 'Torneo no disponible.' }];
    const playoffs = entry.matches.filter((m) => m.phase && m.phase !== 'grupos');
    if (playoffs.length) {
      const cups = [...CUPS, ...new Set(playoffs.map((m) => m.cup || 'playoffs').filter((name) => !CUPS.includes(name)))];
      return cups.flatMap((tier) => {
        const bracket = playoffs.filter((m) => (m.cup || 'playoffs') === tier);
        if (!bracket.length) return [];
        const rows = orderedMatches(bracket, date);
        const pages = Math.max(1, Math.ceil(rows.length / 3));
        return Array.from({ length: pages }, (_, page) => ({ ...base, key: `${cup.id}-${tier}-${page}`, type: 'playoffs', tier, bracket, rows: rows.slice(page * 3, page * 3 + 3), page: page + 1, pages }));
      });
    }
    const fixture = orderedMatches(entry.matches, date);
    const fixturePages = Math.max(1, Math.ceil(fixture.length / 6));
    const slides = Array.from({ length: fixturePages }, (_, page) => ({ ...base, key: `${cup.id}-fixture-${page}`, type: 'fixture', rows: fixture.slice(page * 6, page * 6 + 6), page: page + 1, pages: fixturePages }));
    const groups = calculateStandingsByGroup(entry.matches, entry.teams.filter((team) => entry.tournament.team_ids?.includes(team.id)), entry.tournament.group_config?.groupNames?.length ? entry.tournament.group_config.groupNames : ['Zona A']);
    const populated = groups.filter((group) => group.standings.length);
    if (!populated.length) slides.push({ ...base, key: `${cup.id}-standings-empty`, type: 'standings', rows: [], page: 1, pages: 1, group: '' });
    for (const group of populated) {
      const pages = Math.ceil(group.standings.length / 8);
      for (let page = 0; page < pages; page++) slides.push({ ...base, key: `${cup.id}-${group.groupName}-${page}`, type: 'standings', group: group.groupName, rows: group.standings.slice(page * 8, page * 8 + 8), offset: page * 8, page: page + 1, pages });
    }
    return slides;
  });
}
