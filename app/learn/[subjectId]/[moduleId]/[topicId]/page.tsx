"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function TopicPage() {
  const params = useParams();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<any>(null);

  useEffect(() => {
    if (!topicId) return;

    const unsubscribe = onSnapshot(
      doc(db, "topics", topicId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          console.log("🔥 TOPIC DATA:", data);
          console.log("📄 FILE RAW:", data.file);

          setTopic({
            id: docSnap.id,
            ...data,
          });
        }
      }
    );

    return () => unsubscribe();
  }, [topicId]);

  if (!topic) {
    return <p style={{ padding: 40 }}>Зареждане...</p>;
  }

  // 🔥 гарантирано чист file
  const file = topic.file?.trim();

  console.log("📄 FINAL FILE:", file);

  return (
    <main className="topics-container">
      <h1 className="topics-title">{topic.name}</h1>

      {file ? (
        <iframe
          src={`/${file}`}
          key={file}
          width="100%"
          height="600px"
          style={{
            border: "2px solid #00ff9c",
            borderRadius: "12px",
            marginTop: "20px",
            boxShadow: "0 0 20px rgba(0,255,156,0.3)",
            background: "white", // 🔥 важно за HTML
          }}
        />
      ) : (
        <p style={{ marginTop: 20 }}>
          Няма файл за този урок ❌
        </p>
      )}
    </main>
  );
}