
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type Resource = {
  title: string;
  url: string;
  type?: string;
};

type Topic = {
  id: string;
  name?: string;
  genially?: string;
  pdfUrl?: string;
  videoUrl?: string;
  files?: string[];
  resources?: Resource[];
};

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();

  const topicId = String(params.topicId || "");

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "topics", topicId),
      (docSnap) => {
        if (docSnap.exists()) {
          setTopic({
            ...docSnap.data(),
            id: docSnap.id,
          } as Topic);
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

  const resources: Resource[] = [];

  // Новите ресурси от Firebase
  if (Array.isArray(topic.resources)) {
    topic.resources.forEach((resource) => {
      if (
        resource &&
        typeof resource.title === "string" &&
        typeof resource.url === "string" &&
        resource.url.trim()
      ) {
        resources.push(resource);
      }
    });
  }

  // Запазваме старите линкове
  if (topic.genially) {
    resources.push({
      title: "Отвори презентация",
      url: topic.genially,
      type: "presentation",
    });
  }

  if (topic.pdfUrl) {
    resources.push({
      title: "Отвори PDF документа",
      url: topic.pdfUrl,
      type: "pdf",
    });
  }

  if (topic.videoUrl) {
    resources.push({
      title: "Отвори видеото",
      url: topic.videoUrl,
      type: "video",
    });
  }

  if (Array.isArray(topic.files)) {
    topic.files.forEach((file, index) => {
      if (typeof file === "string" && file.trim()) {
        resources.push({
          title: `Отвори файл ${index + 1}`,
          url: `/${file.trim().replace(/^\/+/, "")}`,
          type: "file",
        });
      }
    });
  }

  // Премахваме повтарящите се линкове
  const uniqueResources = resources.filter(
    (resource, index, array) =>
      array.findIndex((item) => item.url === resource.url) === index
  );

  return (
    <main className="topics-container">
      <button
        className="back-btn"
        onClick={() => router.back()}
      >
        ← Назад към уроците
      </button>

      <h1 className="topics-title">
        {topic.name}
      </h1>

      {uniqueResources.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            marginTop: "40px",
          }}
        >
          {uniqueResources.map((resource, index) => (
            <a
              key={`${resource.url}-${index}`}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="open-lesson-btn"
            >
              🔗 {resource.title}
            </a>
          ))}
        </div>
      ) : (
        <p style={{ marginTop: 20 }}>
          Няма съдържание за този урок ❌
        </p>
      )}
    </main>
  );
}
