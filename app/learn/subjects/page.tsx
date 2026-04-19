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

        console.log("🔥 SUBJECTS:", data);

        setSubjects(data);
      }
    );

    return () => unsubscribe();

  }, []);

  return (
    <main style={{ padding: 40 }}>

      <h1>📚 Предмети</h1>

      {subjects.length === 0 ? (
        <p>Няма предмети 😢</p>
      ) : (
        subjects.map((subject) => {

          console.log("SUBJECT:", subject);

          return (
            <div
              key={subject.id}
              style={{ marginTop: 20, cursor: "pointer" }}
              onClick={() => router.push(`/learn/${subject.id}`)}
            >
              {subject.name}
            </div>
          );
        })
      )}

    </main>
  );
}