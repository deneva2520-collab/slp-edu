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

  const getGoogleDrivePreviewUrl = (url: string) => {
    if (!url) return "";

    if (url.includes("drive.google.com") && url.includes("/view")) {
      return url.replace("/view", "/preview");
    }

    return url;
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Зареждане...</p>;
  }

  if (!topic) {
    return <p style={{ padding: 40 }}>Урокът не е намерен ❌</p>;
  }

  const files = topic.files || [];
  const genially = topic.genially;
  const pdfUrl = topic.pdfUrl ? getGoogleDrivePreviewUrl(topic.pdfUrl) : "";

  return (
    <main className="topics-container">
      <button className="back-btn" onClick={() => router.back()}>
        ← Назад към уроците
      </button>

      <h1 className="topics-title">{topic.name}</h1>

      {genially && (
        <iframe
          src={genially}
          width="100%"
          height="720"
          allowFullScreen
          className="genially-frame"
        />
      )}

      {pdfUrl && (
        <iframe
          src={pdfUrl}
          width="100%"
          height="850"
          className="pdf-frame"
          allow="autoplay"
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
                className="lesson-video"
              />
            );
          }

          return (
            <iframe
              key={index}
              src={`/${cleanFile}`}
              width="100%"
              height="600"
              className="lesson-frame"
            />
          );
        })}

      {!genially && !pdfUrl && files.length === 0 && (
        <p style={{ marginTop: 20 }}>Няма съдържание за този урок ❌</p>
      )}
    </main>
  );
}