import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeEmergencyResults } from './emergencyResults.js';

test('los resultados de emergencia reemplazan el partido y se contabilizan como finalizados', () => {
  const remote = [{ id: 'm1', home_team_id: 'a', away_team_id: 'b', status: 'programado', home_score: null, away_score: null }];
  const entries = [{ match: { ...remote[0], status: 'finalizado', home_score: 80, away_score: 70 } }];
  const [match] = mergeEmergencyResults(remote, entries);
  assert.equal(match.status, 'finalizado');
  assert.equal(match.home_score, 80);
  assert.equal(match.away_score, 70);
  assert.equal(match.emergency_pending, true);
});

test('conserva resultados locales aunque la consulta remota no cargue', () => {
  const entries = [{ match: { id: 'm2', status: 'finalizado', home_score: 55, away_score: 50 } }];
  assert.deepEqual(mergeEmergencyResults([], entries).map((match) => match.id), ['m2']);
});
