import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

const collectionName = "matches";

export const createMatch = async (match) => {
  return await addDoc(collection(db, collectionName), match);
};

export const updateMatch = async (id, data) => {
  const ref = doc(db, collectionName, id);
  return await updateDoc(ref, data);
};

export const deleteMatch = async (id) => {
  const ref = doc(db, collectionName, id);
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