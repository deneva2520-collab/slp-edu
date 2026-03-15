"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  onSnapshot
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");
  useEffect(() => {
  if (sessionParam) {
    setSessionId(sessionParam);
  }
}, [sessionParam]);

  const joinSession = async () => {
    setError("");

    if (!name || !sessionId) {
      setError("Моля, въведете име и код.");
      return;
    }

    setLoading(true);

    try {
      const sessionRef = doc(db, "sessions", sessionId.toUpperCase());
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        setError("Невалиден код на сесия.");
        setLoading(false);
        return;
      }

      // 🔒 Проверка за дублирано име
      const participantsRef = collection(
        db,
        "sessions",
        sessionId.toUpperCase(),
        "participants"
      );

      const snapshot = await getDocs(participantsRef);
      if (snapshot.docs.length >= 10) {
  setError("Сесията вече има максимален брой участници.");
  setLoading(false);
  return;
}
      const nameExists = snapshot.docs.some(
        (doc) =>
          doc.data().name.toLowerCase().trim() ===
          name.toLowerCase().trim()
      );

      if (nameExists) {
        setError("Името вече е използвано в тази сесия.");
        setLoading(false);
        return;
      }

      const participantId = crypto.randomUUID();

      const participantDocRef = doc(
        db,
        "sessions",
        sessionId.toUpperCase(),
        "participants",
        participantId
      );

      await setDoc(participantDocRef, {
        name: name,
        score: 0,
        answeredQuestionIndex: -1,
        joinedAt: new Date()
      });

      sessionStorage.setItem("participantId", participantId);
      sessionStorage.setItem("sessionId", sessionId.toUpperCase());

      setJoined(true);

      onSnapshot(sessionRef, (snapshot) => {
        const data = snapshot.data();
        if (data?.status === "in_progress") {
          router.push("/game");
        }
      });

    } catch (err) {
      console.error(err);
      setError("Възникна грешка при свързване.");
    }

    setLoading(false);
  };

  if (joined) {
    return (
      <main style={mainStyle}>
        <h1>Успешно се включихте!</h1>
        <p>Изчакайте началото на състезанието...</p>
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      <h1 style={{ marginBottom: "20px" }}>Включи се в Quiz</h1>

      <input
        placeholder="Твоето име"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Код на сесия"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        style={inputStyle}
      />

      <button onClick={joinSession} style={buttonStyle} disabled={loading}>
        {loading ? "Свързване..." : "Включи се"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #003d1a, #001a0d)",
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  color: "#00ff88",
  gap: "15px"
};

const inputStyle: React.CSSProperties = {
  padding: "12px",
  width: "250px",
  borderRadius: "8px",
  border: "1px solid #00ff88",
  background: "black",
  color: "#00ff88"
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 25px",
  borderRadius: "8px",
  border: "none",
  background: "#00ff88",
  color: "#003d1a",
  fontWeight: "bold",
  cursor: "pointer"
};