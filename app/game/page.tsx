"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase";
import {
  doc,
  onSnapshot,
  runTransaction,
  collection,
} from "firebase/firestore";

export default function GamePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState<any>(null);
  const [timer, setTimer] = useState(10);
  const [selected, setSelected] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [status, setStatus] = useState("waiting");
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantId, setParticipantId] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ sessionId
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const session = params.get("session");

    if (session) {
      setSessionId(session);
      sessionStorage.setItem("sessionId", session);
    } else {
      const stored = sessionStorage.getItem("sessionId");
      setSessionId(stored);
    }
  }, []);

  // ✅ participantId
  useEffect(() => {
    if (typeof window !== "undefined") {
      setParticipantId(sessionStorage.getItem("participantId"));
    }
  }, []);

  // 🔥 Session listener
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);

    const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      setStatus(data.status);
      setQuestions(data.questions || []);
      setCurrentIndex(data.currentQuestion || 0);
    });

    return () => unsubscribe();
  }, [sessionId]);

  // 🔥 Participants
  useEffect(() => {
    if (!sessionId) return;

    const participantsRef = collection(
      db,
      "sessions",
      sessionId,
      "participants"
    );

    const unsubscribe = onSnapshot(participantsRef, (snapshot) => {
      const players: any[] = [];

      snapshot.forEach((doc) => {
        players.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setParticipants(players);
    });

    return () => unsubscribe();
  }, [sessionId]);

  // ✅ Въпрос + reset + таймер
  useEffect(() => {
  if (status === "finished") return;

  if (!questions || questions.length === 0) return;

  const newQuestion = questions[currentIndex];
  if (!newQuestion) return;

  setQuestion(newQuestion);
  setSelected(null);
  setShowCorrect(false);
  setTimer(15);

  if (intervalRef.current) clearInterval(intervalRef.current);

  intervalRef.current = setInterval(() => {
    setTimer((prev) => {
      if (prev <= 1 || showCorrect) {
        clearInterval(intervalRef.current!);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [currentIndex, questions, status]);

  // ✅ Отговор
  const handleSelect = async (index: number) => {
  console.log("CLICKED:", index);

  if (selected !== null || status === "finished") return;

  setSelected(index);

  if (!sessionId || !participantId || !question) return;

  const participantRef = doc(
    db,
    "sessions",
    sessionId,
    "participants",
    participantId
  );

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(participantRef);
      if (!snap.exists()) return;

      const data = snap.data();

      if (data.answeredQuestionIndex === currentIndex) return;

      let newScore = data.score;

      if (index === question.correctIndex) {
        newScore += 1;
      }

      transaction.update(participantRef, {
        score: newScore,
        answeredQuestionIndex: currentIndex,
      });
    });
  } catch (e) {
    console.error(e);
  }
};

// UI
if (!sessionId) return <h1>Няма session</h1>;
if (status === "waiting") return <h1>Изчакай да започне...</h1>;
if (!question) return <h1>Зареждане...</h1>;

if (status === "finished") {
  return (
    <main>
      <h1>🏆 Класиране</h1>
      {participants
        .slice()
        .sort((a, b) => b.score - a.score)
        .map((p, i) => (
          <div key={p.id}>
            #{i + 1} – {p.name} ({p.score})
          </div>
        ))}
    </main>
  );
}

return (
  <main
  style={{
    minHeight: "100vh",
    background: "linear-gradient(135deg, #003d1a, #001a0d)",
    color: "#00ff88",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  }}
>
    <h2>⏳ {timer}</h2>
    <h1>{question.question}</h1>

    {(question.options || []).map((opt: string, i: number) => {
  const isSelected = selected === i;
  const isCorrect = i === question.correctIndex;

  let background = "#002b15";

  if (selected !== null) {
  if (isCorrect) background = "#00ff88";
  else if (isSelected) background = "#ff4d4d";
}
  return (
    <button
      key={i}
      onClick={() => handleSelect(i)}
      style={{
  display: "block",
  width: "90%",
  margin: "10px auto",
  padding: "15px",
  backgroundColor: background,
  color: "#00ff88",
  border: "2px solid #00ff88",
  borderRadius: "12px",
  fontSize: "18px",
  cursor: "pointer",
  position: "relative",
  zIndex: 20,
  boxShadow: "0 0 10px rgba(0,255,136,0.3)",
}}
    >
      {opt}
    </button>
  );
})}
   </main>
);
}