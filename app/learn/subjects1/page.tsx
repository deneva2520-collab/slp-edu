"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SubjectsPage() {

  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {

    const q = query(
      collection(db, "subjects"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const data: any[] = [];

      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setSubjects(data);

    });

    return () => unsubscribe();

  }, []);

  return (

    <main style={mainStyle}>

      <h1 style={titleStyle}>
        📚 Избери предмет
      </h1>

      <div style={gridStyle}>

        {subjects.map((subject) => (

          <div
            key={subject.id}
            style={cardStyle}
            onClick={() => router.push(`/learn/${subject.id}`)}
          >

            <div style={iconStyle}>
              {subject.icon}
            </div>

            <h2 style={nameStyle}>
              {subject.name}
            </h2>

          </div>

        ))}

      </div>

    </main>

  );

}

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
};

const iconStyle: React.CSSProperties = {
  fontSize: "40px",
  marginBottom: "15px",
};

const nameStyle: React.CSSProperties = {
  color: "#FFD700",
};