import { collection, doc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { planPlayoffs } from '@/lib/playoffs';

export async function generatePlayoffs(tournamentId) {
  const knownMatches = await getDocs(query(collection(db, 'matches'), where('tournament_id', '==', tournamentId)));
  return runTransaction(db, async (transaction) => {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const snapshot = await transaction.get(tournamentRef);
    const tournament = { ...snapshot.data(), id: tournamentId };
    if (tournament.playoff_match_ids?.length) throw new Error('Los cruces ya fueron generados.');
    const matchDocs = await Promise.all(knownMatches.docs.map((m) => transaction.get(m.ref)));
    const teamDocs = await Promise.all((tournament.team_ids || []).map((id) => transaction.get(doc(db, 'teams', id))));
    const matches = matchDocs.filter((m) => m.exists()).map((m) => ({ ...m.data(), id: m.id }));
    const teams = teamDocs.filter((t) => t.exists()).map((t) => ({ ...t.data(), id: t.id }));
    const planned = planPlayoffs(tournament, matches, teams);
    const destinations = await Promise.all(planned.map((m) => transaction.get(doc(db, 'matches', m.id))));
    if (destinations.some((m) => m.exists())) throw new Error('Ya existen cruces de esta copa.');
    planned.forEach(({ id, ...data }) => transaction.set(doc(db, 'matches', id), data));
    transaction.update(tournamentRef, { playoff_match_ids: planned.map((m) => m.id), playoff_generated_at: new Date().toISOString() });
    return planned;
  });
}
