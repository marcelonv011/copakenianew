import { calculateStandingsByGroup } from './standings.js';
import { FEMALE_TOURNAMENTS } from './femaleTournaments.js';
import { validateScore } from './tournamentEntry.js';

export const CUPS = ['oro', 'plata', 'bronce'];
export const playoffId = (id, slot) => `${id}_playoff_${slot}`;
export const playoffFormat = (id) => FEMALE_TOURNAMENTS.find((cup) => cup.id === id)?.category;
export function winnerOf(match) {
  if (!match || match.status !== 'finalizado' || validateScore(match.home_score, match.away_score)) return null;
  const side = match.home_score > match.away_score ? 'home' : 'away';
  return { id: match[`${side}_team_id`], name: match[`${side}_team_name`], logo: match[`${side}_team_logo`] || '' };
}
export function loserOf(match) {
  if (!match || match.status !== 'finalizado' || validateScore(match.home_score, match.away_score)) return null;
  const side = match.home_score < match.away_score ? 'home' : 'away';
  return { id: match[`${side}_team_id`], name: match[`${side}_team_name`], logo: match[`${side}_team_logo`] || '' };
}
export function teamFields(side, team) {
  return { [`${side}_team_id`]: team?.id || '', [`${side}_team_name`]: team?.name || 'Resta confirmar', [`${side}_team_logo`]: team?.logo || team?.logo_url || '' };
}

function standingsScenarios(tournament, matches, teams, groups) {
  const unresolved = [];
  for (const group of groups) {
    const ids = group.standings.map((team) => team.id);
    for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) {
      const games = matches.filter((match) => match.phase === 'grupos' && match.group_name === group.groupName &&
        [match.home_team_id, match.away_team_id].includes(ids[a]) && [match.home_team_id, match.away_team_id].includes(ids[b]));
      if (!games.length || !games.some((match) => winnerOf(match))) {
        unresolved.push({ groupName: group.groupName, homeId: ids[a], awayId: ids[b], games });
      }
    }
  }
  if (unresolved.length > 1) throw new Error('Completá los resultados de la fase de grupos hasta que quede como máximo un partido pendiente.');
  if (!unresolved.length) return [groups];

  const pending = unresolved[0];
  const pendingIds = new Set(pending.games.map((match) => match.id));
  const baseMatches = matches.filter((match) => !pendingIds.has(match.id));
  const teamMap = Object.fromEntries(teams.map((team) => [team.id, team]));
  // Incluye victorias cortas y amplias para no dar por confirmado un puesto que
  // todavía podría cambiar por diferencia o puntos a favor.
  const scores = [[1, 0], [1000, 999], [1000, 0], [0, 1], [999, 1000], [0, 1000]];
  return scores.map(([homeScore, awayScore], index) => calculateStandingsByGroup([
    ...baseMatches,
    {
      id: `pending-scenario-${index}`,
      phase: 'grupos',
      group_name: pending.groupName,
      home_team_id: pending.homeId,
      away_team_id: pending.awayId,
      home_team_name: teamMap[pending.homeId]?.name || '',
      away_team_name: teamMap[pending.awayId]?.name || '',
      status: 'finalizado',
      home_score: homeScore,
      away_score: awayScore,
    },
  ], teams.filter((team) => tournament.team_ids?.includes(team.id)), tournament.group_config?.groupNames || ['Zona A']).filter((group) => group.standings.length));
}

export function planPlacementMatches(tournament, matches) {
  if (playoffFormat(tournament.id) === 'U13') return [];
  return ['oro', 'plata'].flatMap((cup) => {
    const slot = `${cup}_tercer_puesto_1`;
    if (matches.some((match) => match.playoff_slot === slot)) return [];
    const semis = matches.filter((match) => match.cup === cup && match.phase === 'semifinal').sort((a, b) => a.playoff_slot.localeCompare(b.playoff_slot));
    if (semis.length !== 2) return [];
    return [{ id: playoffId(tournament.id, slot), tournament_id: tournament.id, playoff_slot: slot, cup, phase: 'tercer_puesto', ...teamFields('home'), ...teamFields('away'), source_match_ids: semis.map((match) => match.id), status: 'programado', home_score: null, away_score: null, date: '', time: '', venue: '', group_name: '', matchday: 0 }];
  });
}

export function planPlayoffs(tournament, matches, teams) {
  const category = playoffFormat(tournament.id);
  if (!category) throw new Error('Este torneo no tiene una forma de disputa configurada.');
  if (matches.some((m) => m.phase !== 'grupos')) throw new Error('Ya hay cruces cargados. No se generarán duplicados.');
  const groups = calculateStandingsByGroup(matches, teams.filter((t) => tournament.team_ids?.includes(t.id)), tournament.group_config?.groupNames || ['Zona A']).filter((g) => g.standings.length);
  if (groups.length !== (category === 'U13' ? 1 : 2) || groups.some((g) => g.standings.length !== (category === 'U13' ? 7 : 5))) throw new Error(category === 'U13' ? 'U13 necesita una zona con 7 equipos.' : 'Esta copa necesita dos zonas de 5 equipos.');
  const scenarios = standingsScenarios(tournament, matches, teams, groups);
  const seed = (groupIndex, position) => {
    const candidates = scenarios.map((scenario) => scenario[groupIndex]?.standings[position]);
    return candidates[0] && candidates.every((candidate) => candidate?.id === candidates[0].id) ? candidates[0] : null;
  };
  const seedSource = (groupIndex, position) => ({ group: groups[groupIndex].groupName, position });
  const result = [];
  function add(cup, phase, number, home, away, sources = [], homeSeed = null, awaySeed = null) {
    const slot = `${cup}_${phase}_${number}`;
    result.push({ id: playoffId(tournament.id, slot), tournament_id: tournament.id, playoff_slot: slot, cup, phase, ...teamFields('home', home), ...teamFields('away', away), source_match_ids: sources, home_seed: homeSeed, away_seed: awaySeed, status: 'programado', home_score: null, away_score: null, date: '', time: '', venue: '', group_name: '', matchday: 0 });
    return playoffId(tournament.id, slot);
  }
  if (category === 'U13') {
    CUPS.forEach((cup, i) => add(cup, 'final', 1, seed(0, i * 2), seed(0, i * 2 + 1), [], seedSource(0, i * 2), seedSource(0, i * 2 + 1)));
  } else {
    ['oro', 'plata'].forEach((cup, i) => {
      const n = i * 2;
      const first = add(cup, 'semifinal', 1, seed(0, n), seed(1, n + 1), [], seedSource(0, n), seedSource(1, n + 1));
      const second = add(cup, 'semifinal', 2, seed(1, n), seed(0, n + 1), [], seedSource(1, n), seedSource(0, n + 1));
      add(cup, 'final', 1, null, null, [first, second]);
      add(cup, 'tercer_puesto', 1, null, null, [first, second]);
    });
    add('bronce', 'final', 1, seed(0, 4), seed(1, 4), [], seedSource(0, 4), seedSource(1, 4));
  }
  return result;
}

export function qualificationUpdates(tournament, matches, teams) {
  const seededMatches = matches.filter((match) => match.playoff_slot && (match.home_seed || match.away_seed));
  if (!seededMatches.length) return [];
  const groupMatches = matches.filter((match) => match.phase === 'grupos');
  const groups = calculateStandingsByGroup(groupMatches, teams.filter((team) => tournament.team_ids?.includes(team.id)), tournament.group_config?.groupNames || ['Zona A']).filter((group) => group.standings.length);
  for (const group of groups) {
    const ids = group.standings.map((team) => team.id);
    for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) {
      const completed = groupMatches.some((match) => match.group_name === group.groupName && winnerOf(match) &&
        [match.home_team_id, match.away_team_id].includes(ids[a]) && [match.home_team_id, match.away_team_id].includes(ids[b]));
      if (!completed) return [];
    }
  }
  const standings = Object.fromEntries(groups.map((group) => [group.groupName, group.standings]));
  return seededMatches.flatMap((match) => {
    const fields = {};
    for (const side of ['home', 'away']) {
      const source = match[`${side}_seed`];
      if (!match[`${side}_team_id`] && source) Object.assign(fields, teamFields(side, standings[source.group]?.[source.position]));
    }
    if (!Object.keys(fields).length) return [];
    if (match.status !== 'programado' || match.home_score != null || match.away_score != null) throw new Error('El cruce pendiente ya tiene actividad. Corregilo antes de confirmar la clasificación.');
    return [{ id: match.id, ...fields }];
  });
}

export function advancementUpdates(matches) {
  return matches.filter((m) => m.source_match_ids?.length).flatMap((match) => {
    const qualifier = match.phase === 'tercer_puesto' ? loserOf : winnerOf;
    const qualifiers = match.source_match_ids.map((id) => qualifier(matches.find((m) => m.id === id)));
    const fields = { ...teamFields('home', qualifiers[0]), ...teamFields('away', qualifiers[1]) };
    if (fields.home_team_id === match.home_team_id && fields.away_team_id === match.away_team_id) return [];
    if (match.status !== 'programado' || match.home_score != null || match.away_score != null) throw new Error('El partido de destino ya tiene actividad. No se puede cambiar su clasificación; corregilo primero.');
    return [{ id: match.id, ...fields }];
  });
}
