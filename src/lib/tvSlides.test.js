import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTvSlides, localDay, slideSeconds } from './tvSlides.js';
import { FEMALE_TOURNAMENTS } from './femaleTournaments.js';

test('recorre las tres copas con fixture paginado y posiciones acumuladas completas', () => {
  const entries = Object.fromEntries(FEMALE_TOURNAMENTS.map((cup) => {
    const teams = Array.from({ length: 14 }, (_, i) => ({ id: String(i), name: `Equipo ${i}` }));
    const matches = Array.from({ length: 7 }, (_, i) => ({ id: `m${i}`, home_team_id: String(i * 2), away_team_id: String(i * 2 + 1), phase: 'grupos', group_name: 'Zona A', date: '2026-09-23', status: 'finalizado', home_score: 80, away_score: 70 }));
    return [cup.id, { tournament: { team_ids: teams.map((t) => t.id) }, teams, matches }];
  }));
  const slides = buildTvSlides(entries, '2026-09-23');
  assert.equal(slides.length, 12);
  for (let i = 0; i < 3; i++) {
    assert.deepEqual(slides.slice(i * 4, i * 4 + 4).map((s) => s.type), ['fixture', 'fixture', 'standings', 'standings']);
    assert.deepEqual(slides.slice(i * 4, i * 4 + 4).map((s) => s.rows.length), [6, 1, 8, 6]);
    assert.equal(slides[i * 4].cup.id, FEMALE_TOURNAMENTS[i].id);
  }
  const anotherDay = buildTvSlides(entries, '2026-09-24');
  assert.equal(anotherDay[0].rows.length, 0);
  assert.equal(anotherDay[1].rows[0].pts, 2);
});

test('mantiene diapositivas para carga, error y torneos sin datos', () => {
  assert.equal(buildTvSlides({}, '2026-09-23').length, 3);
  assert.equal(buildTvSlides({ [FEMALE_TOURNAMENTS[0].id]: { error: true } }, '2026-09-23')[0].type, 'message');
});

test('usa fecha local y una duración segura por defecto', () => {
  assert.equal(localDay(new Date(2026, 8, 23, 23, 59)), '2026-09-23');
  assert.equal(slideSeconds(null), 15);
  assert.equal(slideSeconds('30'), 30);
  assert.equal(slideSeconds('0'), 15);
  assert.equal(slideSeconds('999'), 15);
});
