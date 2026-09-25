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
  return { [`${side}_team_id`]: team?.id || '', [`${side}_team_name`]: team?.name || 'Por definir', [`${side}_team_logo`]: team?.logo || team?.logo_url || '' };
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
  // Require every group pairing, not merely the matches that happen to be loaded.
  for (const group of groups) {
    const ids = group.standings.map((t) => t.id);
    for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) {
      const games = matches.filter((m) => m.phase === 'grupos' && m.group_name === group.groupName && [m.home_team_id, m.away_team_id].includes(ids[a]) && [m.home_team_id, m.away_team_id].includes(ids[b]));
      if (!games.length || games.some((m) => !winnerOf(m))) throw new Error('Completá todos los resultados de la fase de grupos antes de generar los cruces.');
    }
  }
  const result = [];
  function add(cup, phase, number, home, away, sources = []) {
    const slot = `${cup}_${phase}_${number}`;
    result.push({ id: playoffId(tournament.id, slot), tournament_id: tournament.id, playoff_slot: slot, cup, phase, ...teamFields('home', home), ...teamFields('away', away), source_match_ids: sources, status: 'programado', home_score: null, away_score: null, date: '', time: '', venue: '', group_name: '', matchday: 0 });
    return playoffId(tournament.id, slot);
  }
  if (category === 'U13') {
    CUPS.forEach((cup, i) => add(cup, 'final', 1, groups[0].standings[i * 2], groups[0].standings[i * 2 + 1]));
  } else {
    const [a, b] = groups.map((g) => g.standings);
    ['oro', 'plata'].forEach((cup, i) => {
      const n = i * 2;
      const first = add(cup, 'semifinal', 1, a[n], b[n + 1]);
      const second = add(cup, 'semifinal', 2, b[n], a[n + 1]);
      add(cup, 'final', 1, null, null, [first, second]);
      add(cup, 'tercer_puesto', 1, null, null, [first, second]);
    });
    add('bronce', 'final', 1, a[4], b[4]);
  }
  return result;
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
