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

    if (!moduleId) return;

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

    <main style={mainStyle}>

      <h1 style={titleStyle}>📚 Теми</h1>

      <div style={gridStyle}>

        {topics.map((topic) => (

  <div
    key={topic.id}
    style={cardStyle}
    onClick={() =>
      router.push(`/learn/${subjectId}/${moduleId}/${topic.id}`)
    }
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.05)";
      e.currentTarget.style.boxShadow =
        "0 0 20px rgba(0,255,136,0.4)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {topic.name || "ИЗБЕРИ УРОК"}
  </div>

))}

      </div>

    </main>

  );

}

/* styles */

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#003d1a,#001a0d)",
  padding: "60px 40px",
  color: "#00ff88",
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  fontSize: "42px",
  marginBottom: "40px",
};

const gridStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "30px",
  justifyContent: "center",
};

const cardStyle: React.CSSProperties = {
  background: "#002b15",
  border: "1px solid #00ff88",
  borderRadius: "14px",
  width: "220px",
  padding: "30px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  color: "#FFD700",
  fontSize: "20px",
  fontWeight: "600",
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};