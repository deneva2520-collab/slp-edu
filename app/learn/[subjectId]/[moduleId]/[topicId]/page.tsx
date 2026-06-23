"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();

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
  const genially = topic.genially || "";
  const pdfUrl = topic.pdfUrl || "";
  const videoUrl = topic.videoUrl || "";

  const openUrl = genially || pdfUrl || videoUrl || "";

  return (
    <main className="topics-container">
      <button className="back-btn" onClick={() => router.back()}>
        ← Назад към уроците
      </button>

      <h1 className="topics-title">{topic.name}</h1>

      {openUrl ? (
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="open-lesson-btn"
        >
          🔗 Отвори урока
        </a>
      ) : files.length > 0 ? (
        files.map((file: string, index: number) => {
          const cleanFile = file.trim();

          return (
            <a
              key={index}
              href={`/${cleanFile}`}
              target="_blank"
              rel="noopener noreferrer"
              className="open-lesson-btn"
            >
              🔗 Отвори файл {index + 1}
            </a>
          );
        })
      ) : (
        <p style={{ marginTop: 20 }}>Няма съдържание за този урок ❌</p>
      )}
    </main>
  );
}