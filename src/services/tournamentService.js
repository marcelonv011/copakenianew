import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export const addTournamentTeams = (id, teamIds) => {
  if (!teamIds.length) return Promise.resolve();
  return updateDoc(doc(db, 'tournaments', id), { team_ids: arrayUnion(...new Set(teamIds)) });
};

export const removeTournamentTeam = (id, teamId) =>
  updateDoc(doc(db, 'tournaments', id), { team_ids: arrayRemove(teamId) });

// Obtener todos los torneos
export const getTournaments = async () => {
  const snapshot = await getDocs(collection(db, "tournaments"));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

// Obtener torneo por ID
export const getTournamentById = async (id) => {
  const ref = doc(db, "tournaments", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// Crear torneo
export const createTournament = async (data) => {
  const docRef = await addDoc(collection(db, "tournaments"), {
    ...data,
    created_date: new Date().toISOString(),
    team_ids: data.team_ids || [],
  });

  return {
    id: docRef.id,
    ...data,
  };
};

// Actualizar torneo
export const updateTournament = async (id, data) => {
  const ref = doc(db, "tournaments", id);

  await updateDoc(ref, data);

  return {
    id,
    ...data,
  };
};

// Eliminar torneo
export const deleteTournament = async (id) => {
  const ref = doc(db, "tournaments", id);

  await deleteDoc(ref);

  return true;
};
