import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

const collectionName = "users";

export const getUsers = async () => {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

export const updateUser = async (id, data) => {
  const ref = doc(db, collectionName, id);

  await updateDoc(ref, data);

  return {
    id,
    ...data,
  };
};