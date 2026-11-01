import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// The single driver account created in the Firebase console
export const DRIVER_EMAIL = "driver@apu-bus.com";

export function driverSignIn(code) {
  return signInWithEmailAndPassword(auth, DRIVER_EMAIL, code);
}

export function driverSignOut() {
  return signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}