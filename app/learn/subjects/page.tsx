"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "subjects"),
      (snapshot) => {
        const data: any[] = [];

        snapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setSubjects(data);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <main className="subjects-container">
      <h1 className="subjects-title">📚 Предмети</h1>

      {subjects.length === 0 ? (
        <p className="subjects-empty">Няма предмети 😢</p>
      ) : (
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="subject-card"
              onClick={() => router.push(`/learn/${subject.id}`)}
            >
              {subject.name}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}