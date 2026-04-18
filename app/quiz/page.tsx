"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { questions } from "../../data/questions";
import { collection } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";

export default function QuizPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [status, setStatus] = useState("waiting");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [autoTimer, setAutoTimer] = useState(20);
  const [question, setQuestion] = useState<any>(null);

  const answeredCount = participants.filter(
    (p) => p.answeredQuestionIndex === currentQuestion
  ).length;

  // restore session
  useEffect(() => {
    const saved = sessionStorage.getItem("hostSessionId");
    if (saved) setSessionId(saved);
  }, []);

  // create session
  const generateSession = async () => {
    setLoading(true);

    const id = Math.random().toString(36).substring(2, 8).toUpperCase();

    await setDoc(doc(db, "sessions", id), {
      createdAt: new Date(),
      status: "waiting",
      participants: []
    });

    sessionStorage.setItem("hostSessionId", id);
    setSessionId(id);
    setLoading(false);
  };

  // main listener
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);

    const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      setStatus(data.status);

      if (data.currentQuestion !== undefined) {
        setCurrentQuestion(data.currentQuestion);
        const q = data.questions?.[data.currentQuestion];
        setQuestion(q);
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  // participants
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

  const startGame = async () => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);

    const usedIndexes = new Set<number>();
    const selectedQuestions = [];

    while (selectedQuestions.length < 5) {
      const randomIndex = Math.floor(
        Math.random() * questions.length
      );

      if (!usedIndexes.has(randomIndex)) {
        usedIndexes.add(randomIndex);
        selectedQuestions.push(questions[randomIndex]);
      }
    }

    await updateDoc(sessionRef, {
      status: "in_progress",
      currentQuestion: 0,
      questions: selectedQuestions
    });

    setCurrentQuestion(0);
    setAutoTimer(10);
  };

  // timer
  useEffect(() => {
    if (status !== "in_progress") return;

    const interval = setInterval(() => {
      setAutoTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // next question
  useEffect(() => {
    if (!sessionId || status !== "in_progress") return;

    if (autoTimer === 0) {
      const moveNext = async () => {
        const sessionRef = doc(db, "sessions", sessionId);
        const nextQuestion = currentQuestion + 1;

        if (nextQuestion < 5) {
          await updateDoc(sessionRef, {
            currentQuestion: nextQuestion,
          });
          setCurrentQuestion(nextQuestion);
          setAutoTimer(10);
        } else {
          await updateDoc(sessionRef, {
            status: "finished",
          });
        }
      };

      moveNext();
    }
  }, [autoTimer, sessionId, status]);

 return (
  <main style={mainStyle}>
    <h1 style={{ fontSize: "2.5rem" }}>Host Control Panel</h1>

    {!sessionId ? (
      <button onClick={generateSession} disabled={loading}>
        {loading ? "..." : "Старт"}
      </button>
    ) : (
      <>
        {/* ✅ Session ID */}
        <h2 style={{ fontSize: "3rem", letterSpacing: "6px" }}>
          {sessionId}
        </h2>

        {/* ✅ QR (САМО ЕДИН!) */}
        <div style={{ marginTop: 20 }}>
          <QRCodeSVG
            value={`${window.location.origin}/join?session=${sessionId}`}
            size={220}
          />
        </div>
{participants.length > 0 && (
  <div style={{ marginTop: 20 }}>
    <button
      onClick={startGame}
      style={{
        marginTop: 25,
        padding: "15px 30px",
        fontSize: "1.2rem",
        fontWeight: "bold",
        backgroundColor: "#00ff88",
        color: "#003d1a",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer"
      }}
    >
      ▶️ Започни играта
    </button>
  </div>
)}

          {status === "in_progress" && question && (
            <div style={{ marginTop: 30 }}>
              <h2>{question.text}</h2>

              {question.options.map((opt: string, i: number) => (
                <div key={i} style={{
                  padding: 10,
                  margin: 5,
                  background: "#00ff88",
                  color: "#003300",
                  borderRadius: 8
                }}>
                  {opt}
                </div>
              ))}
            </div>
          )}

          {status === "in_progress" && (
            <div>
              <p>⏳ {autoTimer}</p>
              <p>Въпрос {currentQuestion + 1}/5</p>
              <p>Отговорили: {answeredCount}</p>
            </div>
          )}

       {status === "finished" && (
  <div style={{ marginTop: 40, textAlign: "center" }}>
    <h2 style={{ fontSize: "3rem", color: "#FFD700" }}>
      🏆 КРАЙНО КЛАСИРАНЕ
    </h2>

    {participants
      .slice()
      .sort((a, b) => b.score - a.score)
      .map((p, i) => (
        <div
          key={p.id}
          style={{
            marginTop: 15,
            padding: "15px",
            width: "300px",
            borderRadius: "10px",
            background:
              i === 0
                ? "#FFD700"
                : i === 1
                ? "#C0C0C0"
                : i === 2
                ? "#CD7F32"
                : "#002b15",
            color: i < 3 ? "#000" : "#00ff88",
            fontSize: "1.3rem",
            fontWeight: "bold"
          }}
        >
          #{i + 1} – {p.name} ({p.score} т.)
        </div>
      ))}

    <button
      onClick={() => {
        sessionStorage.removeItem("hostSessionId");
        setSessionId(null);
      }}
      style={{
        marginTop: 30,
        padding: "15px 30px",
        fontSize: "1.1rem",
        backgroundColor: "#00ff88",
        color: "#003d1a",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer"
      }}
    >
      🔄 Нова игра
    </button>
  </div>
)}
        </>
      )}
    </main>
  );
}

// ✅ ТУК трябва да е (извън компонента)
const mainStyle: React.CSSProperties = {
  background: "#001a0d",
  color: "#00ff88",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center"
};