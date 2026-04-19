"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function ModulesPage() {
  const router = useRouter();
  const params = useParams();

  const subjectId = params.subjectId as string;

  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
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

      setModules(data);
    });

    return () => unsubscribe();
  }, [subjectId]);

  return (
  <main className="modules-container">
    <h1 className="modules-title">📚 Модули</h1>

    <div className="modules-grid">
      {modules.map((module: any) => (
        <div
          key={module.id}
          className="module-card"
          onClick={() =>
            router.push(`/learn/${subjectId}/${module.id}`)
          }
        >
          {module.name}
        </div>
      ))}
    </div>
  </main>
);
}