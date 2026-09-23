import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterAvailableTeams, validateScore } from './tournamentEntry.js';

test('muestra equipos más allá de los primeros diez y excluye inscritos', () => {
  const teams = Array.from({ length: 15 }, (_, i) => ({ id: String(i), name: `Equipo ${i}` }));
  assert.equal(filterAvailableTeams(teams, ['0'], '').length, 14);
  assert.equal(filterAvailableTeams(teams, [], 'Equipo 14')[0].id, '14');
});

test('busca nombre, club y ciudad ignorando acentos y mayúsculas', () => {
  const teams = [{ id: 'a', name: 'San Martín', club_name: 'Unión', city: 'Córdoba' }];
  for (const term of ['MARTIN', 'union', 'cordoba']) assert.equal(filterAvailableTeams(teams, [], term).length, 1);
  assert.equal(filterAvailableTeams(teams, ['a'], 'martin').length, 0);
});

test('no confunde campos vacíos con cero ni acepta resultados inválidos', () => {
  for (const pair of [['', '2'], [null, 2], [2, undefined], [' ', 4], [-1, 2], [1.5, 2], [2, 2], ['NaN', 2], [Infinity, 2]]) assert.ok(validateScore(...pair));
  assert.equal(validateScore(0, 20), '');
  assert.equal(validateScore('84', '71'), '');
});
