const STORAGE_KEY = 'copakenia-emergency-results-v1';

function readAll() {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAll(value) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function getEmergencyResults(tournamentId) {
  const entries = readAll()[tournamentId];
  return entries && typeof entries === 'object' ? Object.values(entries) : [];
}

export function saveEmergencyResult(tournamentId, match, data) {
  const all = readAll();
  all[tournamentId] ||= {};
  all[tournamentId][match.id] = {
    match: { ...match, ...data },
    data,
    saved_at: new Date().toISOString(),
  };
  writeAll(all);
  return all[tournamentId][match.id];
}

export function removeEmergencyResult(tournamentId, matchId) {
  const all = readAll();
  if (!all[tournamentId]?.[matchId]) return;
  delete all[tournamentId][matchId];
  if (!Object.keys(all[tournamentId]).length) delete all[tournamentId];
  writeAll(all);
}

export function mergeEmergencyResults(matches, entries) {
  const merged = new Map((matches || []).map((match) => [match.id, match]));
  for (const entry of entries || []) merged.set(entry.match.id, { ...(merged.get(entry.match.id) || {}), ...entry.match, emergency_pending: true });
  return [...merged.values()];
}
