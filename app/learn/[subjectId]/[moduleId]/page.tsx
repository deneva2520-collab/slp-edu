"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

export default function TopicsPage() {
  const router = useRouter();
  const params = useParams();

  const subjectId = String(params.subjectId || "");
  const moduleId = String(params.moduleId || "").trim();

  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleId) return;

    console.log("URL SUBJECT ID:", subjectId);
    console.log("URL MODULE ID:", moduleId);

    const q = query(
      collection(db, "topics"),
      where("moduleId", "==", moduleId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("FILTERED TOPICS FROM FIRESTORE:", data);

        setTopics(data);
        setLoading(false);
      },
      (error) => {
        console.error("FIRESTORE ERROR:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [moduleId, subjectId]);

  return (
    <main className="topics-container">
      <h1 className="topics-title">📖 Уроци</h1>

      <div className="topics-grid">
        {loading ? (
          <p style={{ opacity: 0.7 }}>Зареждане...</p>
        ) : topics.length === 0 ? (
          <p style={{ opacity: 0.7 }}>Няма уроци...</p>
        ) : (
          topics.map((topic: any) => (
            <div
              key={topic.id}
              className="topic-card"
              onClick={() =>
                router.push(`/learn/${subjectId}/${moduleId}/${topic.id}`)
              }
            >
              {topic.name || topic.title || "Без име"}
            </div>
          ))
        )}
      </div>
    </main>
  );
}