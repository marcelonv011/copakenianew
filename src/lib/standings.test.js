import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateStandingsByGroup } from './standings.js';

const teams = ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id.toUpperCase() }));
const match = (home, away, hs, as, extra = {}) => ({ home_team_id: home, away_team_id: away, home_score: hs, away_score: as, phase: 'grupos', group_name: 'Zona A', status: 'finalizado', ...extra });

test('conserva 2 puntos por victoria, 1 por derrota y el desempate directo de dos equipos', () => {
  const rows = calculateStandingsByGroup([
    match('a', 'b', 60, 59), match('d', 'a', 100, 1), match('b', 'c', 100, 0),
    match('a', 'c', 90, 0, { status: 'programado' }),
    match('b', 'a', 120, 0, { phase: 'final' }),
  ], teams, ['Zona A'])[0].standings;
  assert.deepEqual(rows.map((row) => row.id), ['a', 'b', 'd', 'c']);
  assert.deepEqual(rows.map((row) => row.pts), [3, 3, 2, 1]);
  assert.equal(rows[0].diff, -98);
  assert.equal(rows[0].pj, 2);
});

test('conserva diferencia de puntos en empate de tres equipos y equipos sin jugar', () => {
  const groups = calculateStandingsByGroup([
    match('a', 'b', 60, 50), match('b', 'c', 100, 50), match('c', 'a', 61, 60),
    match('d', 'a', null, null, { status: 'programado' }),
  ], teams, ['Zona A', 'Zona B']);
  assert.deepEqual(groups[0].standings.map((row) => row.id), ['b', 'a', 'c', 'd']);
  assert.equal(groups[0].standings[3].pts, 0);
  assert.deepEqual(groups[1].standings, []);
});
