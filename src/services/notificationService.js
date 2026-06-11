import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "@/firebase/config";

const collectionName = "notifications";

export const getNotificationsByUser = async (userId) => {
  const q = query(
    collection(db, collectionName),
    where("user_id", "==", userId),
    orderBy("created_date", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

export const createNotification = async (data) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    read: false,
    created_date: new Date().toISOString(),
  });

  return {
    id: docRef.id,
    ...data,
  };
};

export const markNotificationAsRead = async (id) => {
  const ref = doc(db, collectionName, id);

  await updateDoc(ref, {
    read: true,
  });

  return true;
};

export const deleteNotification = async (id) => {
  const ref = doc(db, collectionName, id);

  await deleteDoc(ref);

  return true;
};