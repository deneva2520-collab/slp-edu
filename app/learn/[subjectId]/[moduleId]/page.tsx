"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

export default function TopicsPage() {

  const router = useRouter();
  const params = useParams();

  const subjectId = params.subjectId as string;
  const moduleId = params.moduleId as string;

  console.log("📘 subjectId:", subjectId);
  console.log("📗 moduleId:", moduleId);

  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {

    const q = query(
      collection(db, "topics"),
      where("moduleId", "==", moduleId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const data: any[] = [];

      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log("📦 topics from DB:", data);

      setTopics(data);
    });

    return () => unsubscribe();

  }, [moduleId]);

  return (
    <main style={{ padding: 40 }}>
      <h1>📖 Уроци</h1>

      {topics.length === 0 ? (
        <p>Няма уроци 😢</p>
      ) : (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {topics.map((topic: any) => (
            <div
              key={topic.id}
              onClick={() => {
                console.log("👉 CLICK topic:", topic.id);
                router.push(`/learn/${subjectId}/${moduleId}/${topic.id}`);
              }}
              style={{
                background: "#001f3f",
                color: "#FFD700",
                padding: "20px",
                borderRadius: "12px",
                cursor: "pointer",
                width: "200px",
                textAlign: "center",
              }}
            >
              {topic.name}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}