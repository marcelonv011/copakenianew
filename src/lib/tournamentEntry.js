export const searchKey = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

export function filterAvailableTeams(teams, enrolledIds, search) {
  const enrolled = new Set(enrolledIds || []);
  const key = searchKey(search);
  return teams.filter((team) => !enrolled.has(team.id) &&
    searchKey(`${team.name || ''} ${team.club_name || ''} ${team.city || ''}`).includes(key))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

export function validateScore(home, away) {
  if ([home, away].some((n) => n == null || String(n).trim() === '')) return 'Completá los puntos de ambos equipos.';
  if (![home, away].every((n) => Number.isSafeInteger(Number(n)) && Number(n) >= 0)) return 'Ingresá puntos enteros, iguales o mayores a cero.';
  if (Number(home) === Number(away)) return 'Completá el resultado final sin empate.';
  return '';
}
