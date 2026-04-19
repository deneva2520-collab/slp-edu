"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import {
  collection,
  onSnapshot
} from "firebase/firestore";
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
    <main style={{ padding: 40 }}>
      <h1>📚 Предмети</h1>

      {subjects.map((subject) => (
        <div
          key={subject.id}
          onClick={() => router.push(`/learn/${subject.id}`)}
          style={{
            marginTop: 20,
            padding: 20,
            border: "1px solid #00ff88",
            cursor: "pointer"
          }}
        >
          {subject.name}
        </div>
      ))}
    </main>
  );
}