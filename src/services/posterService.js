import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';

export function watchPoster(tournamentId, onTournament, onMatches, onError) {
  const stopTournament = onSnapshot(doc(db, 'tournaments', tournamentId),
    (snapshot) => onTournament(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null), onError);
  const stopMatches = onSnapshot(query(collection(db, 'matches'), where('tournament_id', '==', tournamentId)),
    { includeMetadataChanges: true },
    (snapshot) => onMatches(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })), snapshot.metadata.fromCache), onError);
  return () => { stopTournament(); stopMatches(); };
}
