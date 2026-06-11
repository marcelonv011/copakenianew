import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

const collectionName = "champions";

export const getChampions = async () => {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs
    .map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }))
    .sort((a, b) => Number(b.year) - Number(a.year));
};

export const createChampion = async (data) => {
  return await addDoc(collection(db, collectionName), data);
};

export const updateChampion = async (id, data) => {
  return await updateDoc(doc(db, collectionName, id), data);
};

export const deleteChampion = async (id) => {
  return await deleteDoc(doc(db, collectionName, id));
};