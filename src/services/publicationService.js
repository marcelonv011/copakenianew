import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

const collectionName = "publications";

export const getPublications = async () => {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs
    .map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }))
    .sort((a, b) => {
      return new Date(b.created_date || 0) - new Date(a.created_date || 0);
    });
};

export const createPublication = async (data) => {
  return await addDoc(collection(db, collectionName), {
    ...data,
    created_date: new Date().toISOString(),
  });
};

export const updatePublication = async (id, data) => {
  return await updateDoc(doc(db, collectionName, id), data);
};

export const deletePublication = async (id) => {
  return await deleteDoc(doc(db, collectionName, id));
};