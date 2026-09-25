import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  runTransaction,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { advancementUpdates } from '../lib/playoffs';
import { validateScore } from '../lib/tournamentEntry';

const collectionName = "matches";

export const createMatch = async (match) => {
  return await addDoc(collection(db, collectionName), match);
};

export const updateMatch = async (id, data) => {
  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.data()?.playoff_slot) return await updateDoc(ref, data);
  return runTransaction(db, async (transaction) => {
    const current = await transaction.get(ref);
    const match = { ...current.data(), id };
    const tournament = await transaction.get(doc(db, 'tournaments', match.tournament_id));
    const snapshots = await Promise.all(tournament.data().playoff_match_ids.map((mid) => transaction.get(doc(db, collectionName, mid))));
    for (const key of ['home_team_id', 'away_team_id', 'phase', 'cup', 'playoff_slot', 'tournament_id']) {
      if (key in data && data[key] !== match[key]) throw new Error('Los equipos y la fase de este cruce se definen por la clasificación.');
    }
    const updated = { ...match, ...data };
    if ((updated.status !== 'programado' || updated.home_score != null || updated.away_score != null) && (!updated.home_team_id || !updated.away_team_id)) throw new Error('Esperá a que se definan ambos finalistas.');
    if (updated.status === 'finalizado') {
      const error = validateScore(updated.home_score, updated.away_score);
      if (error) throw new Error(error);
    }
    const matches = snapshots.map((m) => m.id === id ? updated : { ...m.data(), id: m.id });
    const updates = advancementUpdates(matches);
    transaction.update(ref, data);
    updates.forEach(({ id: mid, ...fields }) => transaction.update(doc(db, collectionName, mid), fields));
  });
};

export const deleteMatch = async (id) => {
  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  if (snapshot.data()?.playoff_slot) throw new Error('No se puede borrar un partido del cuadro generado.');
  return await deleteDoc(ref);
};

export const getMatchesByTournament = async (tournamentId) => {
  const q = query(
    collection(db, collectionName),
    where("tournament_id", "==", tournamentId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

export const getUpcomingMatches = async () => {
  const q = query(
    collection(db, collectionName),
    where("status", "==", "programado")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

export const getFinishedMatches = async () => {
  const q = query(
    collection(db, collectionName),
    where("status", "==", "finalizado")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};
