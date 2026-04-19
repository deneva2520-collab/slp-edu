"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function TopicsPage() {
  const router = useRouter();
  const params = useParams();

  const subjectId = params.subjectId as string;
  const moduleId = params.moduleId as string;

  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    if (!moduleId) return;

    const unsubscribe = onSnapshot(collection(db, "topics"), (snapshot) => {
      const data: any[] = [];

      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // 🔥 ФИЛТЪР ПО MODULE ID
      const filtered = data.filter(
        (t: any) => t.moduleId === moduleId
      );

      console.log("MODULE ID:", moduleId);
      console.log("FILTERED TOPICS:", filtered);

      setTopics(filtered);
    });

    return () => unsubscribe();
  }, [moduleId]);

  return (
    <main className="topics-container">
      <h1 className="topics-title">📖 Уроци</h1>

      <div className="topics-grid">
        {topics.length === 0 ? (
          <p style={{ opacity: 0.7 }}>Няма уроци...</p>
        ) : (
          topics.map((topic: any) => (
            <div
              key={topic.id}
              className="topic-card"
              onClick={() =>
                router.push(
                  `/learn/${subjectId}/${moduleId}/${topic.id}`
                )
              }
            >
              {topic.name}
            </div>
          ))
        )}
      </div>
    </main>
  );
}