import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

const collectionName = "sponsors";

export const getSponsors = async () => {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

export const createSponsor = async (data) => {
  return await addDoc(collection(db, collectionName), data);
};

export const updateSponsor = async (id, data) => {
  return await updateDoc(doc(db, collectionName, id), data);
};

export const deleteSponsor = async (id) => {
  return await deleteDoc(doc(db, collectionName, id));
};