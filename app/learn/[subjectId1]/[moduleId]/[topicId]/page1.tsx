"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../../../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function LessonsPage() {

  const params = useParams();
  const router = useRouter();

  const subjectId = params.subjectId as string;
  const moduleId = params.moduleId as string;
  const topicId = params.topicId as string;

  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {

    if (!topicId) return;

    const q = query(
      collection(db, "lessons"),
      where("topicId", "==", topicId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const data: any[] = [];

      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setLessons(data);

    });

    return () => unsubscribe();

  }, [topicId]);

  return (

    <main style={{ padding: 40 }}>

      <h1>📖 Уроци</h1>

      {lessons.length === 0 ? (
        <p style={{ marginTop: 20 }}>
          Няма добавени уроци за тази тема.
        </p>
      ) : (
        lessons.map((lesson) => (
          <div
            key={lesson.id}
            style={cardStyle}
            onClick={() =>
              router.push(
                `/learn/${subjectId}/${moduleId}/${topicId}/${lesson.id}`
              )
            }
          >
            {lesson.title}
          </div>
        ))
      )}

    </main>

  );
}

const cardStyle: React.CSSProperties = {
  background: "#002b15",
  border: "1px solid #00ff88",
  borderRadius: "14px",
  width: "300px",
  padding: "20px",
  cursor: "pointer",
  marginTop: "20px",
  color: "#00ff88"
};