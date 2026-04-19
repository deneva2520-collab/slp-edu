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
      subjects.map((subject) => (
        <div
          key={subject.id}
          onClick={() => {
            console.log("CLICK subject.id:", subject.id);
            router.push(`/learn/${subject.id}`);
          }}
          style={{
            padding: 20,
            border: "1px solid #ccc",
            marginTop: 10,
            cursor: "pointer",
          }}
        >
          {subject.name}
        </div>
      ))
    )}
  </main>
);
}