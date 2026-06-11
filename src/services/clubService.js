import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

const collectionName = "clubs";

export const getClubs = async () => {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};