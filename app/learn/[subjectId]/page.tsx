"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

  console.log("🔥 URL subjectId:", subjectId);

  const [modules, setModules] = useState<any[]>([]);
  useEffect(() => {

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

    console.log("📦 modules from DB:", data);

    setModules(data);
  });

  return () => unsubscribe();

}, [subjectId]);

  useEffect(() => {

  if (!subjectId) return;

  console.log("FILTER subjectId:", subjectId);

  const q = query(
    collection(db, "modules"),
    where("subjectId", "==", subjectId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {

    const data: any[] = [];

    snapshot.forEach((doc) => {
      console.log("DOC subjectId:", doc.data().subjectId);

      data.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log("modules from DB:", data);

    setModules(data);
  });

  return () => unsubscribe();

}, [subjectId]);

 return (
  <main style={{ padding: 40 }}>
    <h1>📚 Модули</h1>

    {modules.length === 0 ? (
      <p>Няма модули 😢</p>
    ) : (
      modules.map((module: any) => (
        <div
          key={module.id}
          onClick={() => {
            console.log("CLICK module:", module.id);
            router.push(`/learn/${subjectId}/${module.id}`);
          }}
          style={{
            background: "#002b15",
            border: "1px solid #00ff88",
            borderRadius: "14px",
            width: "220px",
            padding: "30px",
            cursor: "pointer",
            marginTop: "20px",
            color: "#FFD700",
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "600",
          }}
        >
          {module.name}
        </div>
      ))
    )}
  </main>
  );
}