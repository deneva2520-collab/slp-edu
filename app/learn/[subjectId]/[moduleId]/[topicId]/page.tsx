"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function TopicPage() {
  const params = useParams();
  const topicId = String(params.topicId || "");

  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicId) return;

    const unsubscribe = onSnapshot(
      doc(db, "topics", topicId),
      (docSnap) => {
        if (docSnap.exists()) {
          setTopic({
            id: docSnap.id,
            ...docSnap.data(),
          });
        } else {
          setTopic(null);
        }

        setLoading(false);
      },
      (error) => {
        console.error("TOPIC ERROR:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [topicId]);

  if (loading) {
    return <p style={{ padding: 40 }}>Зареждане...</p>;
  }

  if (!topic) {
    return <p style={{ padding: 40 }}>Урокът не е намерен ❌</p>;
  }

  const files = topic.files || [];
  const genially = topic.genially;

  return (
    <main className="topics-container">
      <h1 className="topics-title">{topic.name}</h1>

      {genially && (
        <iframe
          src={genially}
          width="100%"
          height="700"
          allowFullScreen
          style={{
            border: "2px solid #00ff9c",
            borderRadius: "12px",
            marginTop: "20px",
            background: "white",
            boxShadow: "0 0 20px rgba(0,255,156,0.3)",
          }}
        />
      )}

      {files.length > 0 &&
        files.map((file: string, index: number) => {
          const cleanFile = file.trim();

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

          return (
            <iframe
              key={index}
              src={`/${cleanFile}`}
              width="100%"
              height="600"
              style={{
                border: "2px solid #00ff9c",
                borderRadius: "12px",
                marginTop: "20px",
                background: "white",
                boxShadow: "0 0 20px rgba(0,255,156,0.3)",
              }}
            />
          );
        })}

      {!genially && files.length === 0 && (
        <p style={{ marginTop: 20 }}>Няма съдържание за този урок ❌</p>
      )}
    </main>
  );
}