"use client";

import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function TestPage() {
  useEffect(() => {
    const testFirestore = async () => {
      try {
        const snap = await getDocs(collection(db, "sessions"));
        console.log("DATA:", snap.docs.map(d => d.data()));
      } catch (e) {
        console.error("ERROR:", e);
      }
    };

    testFirestore();
  }, []);

  return <h1>Firestore Test</h1>;
}