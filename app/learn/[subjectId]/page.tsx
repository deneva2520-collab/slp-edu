"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

export default function ModulesPage() {

  const params = useParams();
  const subjectId = params.subjectId as string;

  console.log("🔥 URL subjectId:", subjectId);

  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {

    if (!subjectId) return;

    const q = query(
      collection(db, "modules"),
      where("subjectId", "==", subjectId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const data: any[] = [];

      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log("🔥 modules from DB:", data);

      setModules(data);

    });

    return () => unsubscribe();

  }, [subjectId]);

  return (
    <main style={{ padding: 40 }}>

      <h1>📚 Модули</h1>

      {modules.length === 0 ? (
        <p>Няма модули 😢</p>
      ) : (
        modules.map((m) => (
          <div key={m.id} style={{ marginTop: 20 }}>
            {m.name}
          </div>
        ))
      )}

    </main>
  );
}