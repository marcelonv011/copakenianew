import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

const collectionName = "teams";

export const getTeams = async () => {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

export const createTeam = async (data) => {
  return await addDoc(collection(db, collectionName), data);
};

export const updateTeam = async (id, data) => {
  return await updateDoc(doc(db, collectionName, id), data);
};

export const deleteTeam = async (id) => {
  return await deleteDoc(doc(db, collectionName, id));
};