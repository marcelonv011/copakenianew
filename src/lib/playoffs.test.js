import test from 'node:test';
import assert from 'node:assert/strict';
import { planPlayoffs, planPlacementMatches, advancementUpdates } from './playoffs.js';
import { FEMALE_TOURNAMENTS } from './femaleTournaments.js';

function fixture(index) {
  const cup = FEMALE_TOURNAMENTS[index];
  const names = index === 0 ? ['Zona A'] : ['Zona A', 'Zona B'];
  const size = index === 0 ? 7 : 5;
  const teams = names.flatMap((group, g) => Array.from({ length: size }, (_, n) => ({ id: `${g}-${n}`, name: `Equipo ${g}-${n}` })));
  const matches = names.flatMap((group, g) => teams.slice(g * size, g * size + size).flatMap((home, i, all) => all.slice(i + 1).map((away) => ({ id: `${home.id}_${away.id}`, home_team_id: home.id, away_team_id: away.id, home_team_name: home.name, away_team_name: away.name, phase: 'grupos', group_name: group, status: 'finalizado', home_score: 70, away_score: 60 }))));
  return { tournament: { ...cup, team_ids: teams.map((t) => t.id), group_config: { groupNames: names } }, matches, teams };
}
test('U13 genera tres finales y deja afuera al séptimo, sin tocar grupos', () => {
  const { tournament, matches, teams } = fixture(0);
  const original = JSON.stringify(matches);
  const planned = planPlayoffs(tournament, matches, teams);
  assert.equal(planned.length, 3);
  assert.deepEqual(planned.map((m) => [m.cup, m.home_team_id, m.away_team_id]), [['oro', '0-0', '0-1'], ['plata', '0-2', '0-3'], ['bronce', '0-4', '0-5']]);
  assert.equal(JSON.stringify(matches), original);
});
test('U15 y U17 cruzan zonas para oro y plata con tercer puesto; bronce tiene final directa', () => {
  for (const index of [1, 2]) {
    const { tournament, matches, teams } = fixture(index);
    const planned = planPlayoffs(tournament, matches, teams);
    assert.equal(planned.length, 9);
    assert.deepEqual(planned.filter((m) => m.phase === 'semifinal').map((m) => [m.home_team_id, m.away_team_id]), [['0-0', '1-1'], ['1-0', '0-1'], ['0-2', '1-3'], ['1-2', '0-3']]);
    assert.deepEqual(planned.filter((m) => m.cup === 'bronce').map((m) => [m.home_team_id, m.away_team_id]), [['0-4', '1-4']]);
    assert.equal(planned.find((m) => m.cup === 'oro' && m.phase === 'final').source_match_ids.length, 2);
    assert.equal(planned.find((m) => m.cup === 'oro' && m.phase === 'tercer_puesto').source_match_ids.length, 2);
    assert.equal(planned.find((m) => m.cup === 'plata' && m.phase === 'tercer_puesto').source_match_ids.length, 2);
  }
});
test('no genera con resultados incompletos, partidos faltantes o playoffs existentes', () => {
  const { tournament, matches, teams } = fixture(0);
  assert.throws(() => planPlayoffs(tournament, matches.slice(1), teams), /Completá/);
  assert.throws(() => planPlayoffs(tournament, [{ ...matches[0], status: 'programado' }, ...matches.slice(1)], teams), /Completá/);
  assert.throws(() => planPlayoffs(tournament, [{ ...matches[0], away_score: null }, ...matches.slice(1)], teams), /Completá/);
  assert.throws(() => planPlayoffs(tournament, [...matches, { phase: 'final' }], teams), /duplicados/);
});
test('avanzan ganadores a la final y perdedores al tercer puesto', () => {
  const { tournament, matches, teams } = fixture(1);
  const planned = planPlayoffs(tournament, matches, teams);
  const semi = planned.find((m) => m.playoff_slot === 'oro_semifinal_1');
  semi.status = 'finalizado'; semi.home_score = 90; semi.away_score = 70;
  const final = planned.find((m) => m.playoff_slot === 'oro_final_1');
  const third = planned.find((m) => m.playoff_slot === 'oro_tercer_puesto_1');
  let updates = advancementUpdates(planned);
  const finalUpdate = updates.find((update) => update.id === final.id);
  const thirdUpdate = updates.find((update) => update.id === third.id);
  assert.equal(finalUpdate.home_team_id, semi.home_team_id);
  assert.equal(finalUpdate.away_team_id, '');
  assert.equal(thirdUpdate.home_team_id, semi.away_team_id);
  assert.equal(thirdUpdate.away_team_id, '');
  Object.assign(final, finalUpdate);
  Object.assign(third, thirdUpdate);
  assert.deepEqual(advancementUpdates(planned), []);
  semi.away_score = 100;
  updates = advancementUpdates(planned);
  assert.equal(updates.find((update) => update.id === final.id).home_team_id, semi.away_team_id);
  assert.equal(updates.find((update) => update.id === third.id).home_team_id, semi.home_team_id);
  final.status = 'en_curso';
  assert.throws(() => advancementUpdates(planned), /destino ya tiene actividad/);
});
test('agrega los partidos de tercer puesto a cuadros anteriores sin duplicarlos', () => {
  const { tournament, matches, teams } = fixture(1);
  const legacy = planPlayoffs(tournament, matches, teams).filter((match) => match.phase !== 'tercer_puesto');
  const placements = planPlacementMatches(tournament, legacy);
  assert.deepEqual(placements.map((match) => match.playoff_slot), ['oro_tercer_puesto_1', 'plata_tercer_puesto_1']);
  assert.deepEqual(placements[0].source_match_ids, ['HSdtj05khaRuTnTi6EUk_playoff_oro_semifinal_1', 'HSdtj05khaRuTnTi6EUk_playoff_oro_semifinal_2']);
  assert.deepEqual(planPlacementMatches(tournament, [...legacy, ...placements]), []);
});
