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
import { refreshPlayoffQualifications } from './playoffService';
import { validateScore } from '../lib/tournamentEntry';

const collectionName = "matches";
const isQuotaError = (error) => error?.code === 'resource-exhausted' || /quota|resource.exhausted/i.test(error?.message || '');
const isScoreOnlyUpdate = (data) => Object.keys(data).every((key) => ['home_score', 'away_score', 'status'].includes(key));

export const createMatch = async (match) => {
  return await addDoc(collection(db, collectionName), match);
};

export const updateMatch = async (id, data, knownMatch = null) => {
  const ref = doc(db, collectionName, id);
  const currentMatch = knownMatch?.id === id ? knownMatch : (await getDoc(ref)).data();
  if (!currentMatch?.playoff_slot) {
    await updateDoc(ref, data);
    let playoffRefreshPending = false;
    if (currentMatch?.phase === 'grupos' && data.status === 'finalizado') {
      try {
        await refreshPlayoffQualifications(currentMatch.tournament_id);
      } catch (error) {
        if (!isQuotaError(error)) throw error;
        playoffRefreshPending = true;
      }
    }
    return { saved: true, playoffRefreshPending };
  }
  try {
    await runTransaction(db, async (transaction) => {
      const current = await transaction.get(ref);
      const match = { ...current.data(), id };
      const tournament = await transaction.get(doc(db, 'tournaments', match.tournament_id));
      const snapshots = await Promise.all(tournament.data().playoff_match_ids.map((mid) => transaction.get(doc(db, collectionName, mid))));
      for (const key of ['home_team_id', 'away_team_id', 'phase', 'cup', 'playoff_slot', 'tournament_id']) {
        if (!(key in data) || data[key] === match[key]) continue;
        const confirmsPendingSeed = ['home_team_id', 'away_team_id'].includes(key) && !match.source_match_ids?.length && !match[key] && data[key];
        if (!confirmsPendingSeed) throw new Error('Los equipos y la fase de este cruce se definen por la clasificación.');
      }
      const updated = { ...match, ...data };
      if (updated.home_team_id && updated.home_team_id === updated.away_team_id) throw new Error('Seleccioná dos equipos distintos.');
      if ((updated.status !== 'programado' || updated.home_score != null || updated.away_score != null) && (!updated.home_team_id || !updated.away_team_id)) throw new Error('Esperá a que se definan ambos equipos.');
      if (updated.status === 'finalizado') {
        const error = validateScore(updated.home_score, updated.away_score);
        if (error) throw new Error(error);
      }
      const matches = snapshots.map((matchSnapshot) => matchSnapshot.id === id ? updated : { ...matchSnapshot.data(), id: matchSnapshot.id });
      const updates = advancementUpdates(matches);
      transaction.update(ref, data);
      updates.forEach(({ id: mid, ...fields }) => transaction.update(doc(db, collectionName, mid), fields));
    });
    return { saved: true, advancementPending: false };
  } catch (error) {
    if (!isQuotaError(error) || !knownMatch || !isScoreOnlyUpdate(data) || !knownMatch.home_team_id || !knownMatch.away_team_id) throw error;
    const scoreError = data.status === 'finalizado' ? validateScore(data.home_score, data.away_score) : '';
    if (scoreError) throw new Error(scoreError, { cause: error });
    await updateDoc(ref, data);
    return { saved: true, advancementPending: true };
  }
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
