import { test } from 'node:test';
import assert from 'node:assert/strict';
import { displayDate, matchDisplay, orderedMatches, textLines, POSTER_PAGE_SIZE } from './poster.js';

test('muestra horario hasta finalizar y después los dos marcadores, incluido cero', () => {
  const pending = { time: '14:30', status: 'programado', home_score: 0, away_score: 20 };
  assert.equal(matchDisplay(pending).result, null);
  assert.equal(matchDisplay(pending).time, '14:30');
  assert.equal(matchDisplay({ ...pending, status: 'en_curso' }).label, 'EN CURSO');
  assert.equal(matchDisplay({ ...pending, status: 'finalizado' }).result, '0 – 20');
  assert.equal(matchDisplay({ status: 'finalizado', home_score: null }).result, null);
  assert.equal(matchDisplay({}).time, 'A confirmar');
});

test('filtra por fecha, ordena sin mutar y permite paginar todos los partidos', () => {
  const matches = Array.from({ length: 19 }, (_, i) => ({ id: String(i), date: i < 10 ? '2026-09-23' : '2026-09-24', time: `${String(23 - i).padStart(2, '0')}:00` }));
  const sorted = orderedMatches(matches);
  assert.equal(sorted.length, 19);
  assert.equal(Math.ceil(sorted.length / POSTER_PAGE_SIZE), 3);
  assert.equal(orderedMatches(matches, '2026-09-23').length, 10);
  assert.equal(matches[0].id, '0');
  assert.equal(sorted[0].time, '14:00');
});

test('fechas locales y nombres extensos mantienen un afiche legible', () => {
  assert.equal(displayDate('2026-09-23'), '23/09');
  assert.equal(displayDate(''), 'Fecha a confirmar');
  const lines = textLines('Club deportivo de nombre extremadamente largo para este espacio', 17);
  assert.equal(lines.length, 2);
  assert.ok(lines.every((line) => line.length <= 17));
});
