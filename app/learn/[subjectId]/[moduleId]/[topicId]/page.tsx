"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../../../lib/firebase";
import {
  doc,
  onSnapshot
} from "firebase/firestore";

export default function TopicPage() {
  const params = useParams();

  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<any>(null);
  console.log("📄 topic:", topic);
console.log("📄 file:", topic.file);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "topics", topicId),
      (docSnap) => {
        if (docSnap.exists()) {
          setTopic({
            id: docSnap.id,
            ...docSnap.data(),
          });
        }
      }
    );

    return () => unsubscribe();
  }, [topicId]);

  if (!topic) {
    return <p style={{ padding: 40 }}>Зареждане...</p>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>{topic.name}</h1>

      {topic.file ? (
  <iframe
    src={`/${topic.file}`}
    width="100%"
    height="600px"
    style={{ border: "none" }}
  />
) : (
  <p>Няма файл за този урок ❌</p>
)}
    </main>
  );
}