"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function TopicsPage() {
  const router = useRouter();
  const params = useParams();

  const subjectId = params.subjectId as string;
  const moduleId = params.moduleId as string;

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

      setTopics(data);
    });

    return () => unsubscribe();
  }, [moduleId]);

  return (
    <main className="topics-container">
      <h1 className="topics-title">📖 Уроци</h1>

      <div className="topics-grid">
        {topics.map((topic: any) => (
          <div
            key={topic.id}
            className="topic-card"
            onClick={() =>
              router.push(`/learn/${subjectId}/${moduleId}/${topic.id}`)
            }
          >
            {topic.name}
          </div>
        ))}
      </div>
    </main>
  );
}