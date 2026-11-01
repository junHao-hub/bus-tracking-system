import { collection, doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Listen to all buses and call the callback whenever the data changes
export function subscribeBuses(callback) {
  return onSnapshot(collection(db, "buses"), (snapshot) => {
    const buses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(buses);
  });
}

// Create or update one bus document
export function updateBusLocation(busId, data) {
  return setDoc(
    doc(db, "buses", busId),
    { ...data, lastUpdated: serverTimestamp() },
    { merge: true }
  );
}