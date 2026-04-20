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
          console.log("📄 FILES RAW:", data.files);

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

  const files = topic.files || [];

  console.log("📄 FINAL FILES:", files);

  return (
    <main className="topics-container">
      <h1 className="topics-title">{topic.name}</h1>

      {files.length > 0 ? (
        files.map((file: string, index: number) => {
          const cleanFile = file.trim();

          // 🎬 VIDEO (mp4)
          if (cleanFile.endsWith(".mp4")) {
            return (
              <video
                key={index}
                src={`/${cleanFile}`}
                controls
                width="100%"
                style={{
                  marginTop: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 0 20px rgba(0,255,156,0.3)",
                }}
              />
            );
          }

          // 🌐 HTML (или други)
          return (
            <iframe
              key={index}
              src={`/${cleanFile}`}
              width="100%"
              height="600px"
              style={{
                border: "2px solid #00ff9c",
                borderRadius: "12px",
                marginTop: "20px",
                boxShadow: "0 0 20px rgba(0,255,156,0.3)",
                background: "white",
              }}
            />
          );
        })
      ) : (
        <p style={{ marginTop: 20 }}>
          Няма файлове за този урок ❌
        </p>
      )}
    </main>
  );
}