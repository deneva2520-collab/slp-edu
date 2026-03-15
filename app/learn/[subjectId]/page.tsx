"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

export default function ModulesPage() {
  const router = useRouter();

  const params = useParams();
  const subjectId = params.subjectId as string;

  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {

    if (!subjectId) return;

    const q = query(
      collection(db, "modules"),
      where("subjectId", "==", subjectId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const data: any[] = [];

      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setModules(data);
    });

    return () => unsubscribe();

  }, [subjectId]);

  return (

    <main style={mainStyle}>

      <h1 style={titleStyle}>📚 Модули</h1>

      <div style={gridStyle}>

        {modules.map((module) => (

          <div
  key={module.id}
  style={cardStyle}
  onClick={() => router.push(`/learn/${subjectId}/${module.id}`)}
>
  {module.name}
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
};