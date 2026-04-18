"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  addDoc
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

  const answeredCount = participants.filter(
    (p) => p.answeredQuestionIndex === currentQuestion
  ).length;

  const sortedParticipants = [...participants].sort(
    (a, b) => b.score - a.score
  );

  // ✅ NEW (за Kahoot view)
  const [questionsState, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState<any>(null);

  const highestScore = sortedParticipants[0]?.score ?? 0;
  const lowestScore =
    sortedParticipants[sortedParticipants.length - 1]?.score ?? 0;

  const averageScore =
    participants.length > 0
      ? (
          participants.reduce((sum, p) => sum + p.score, 0) /
          participants.length
        ).toFixed(2)
      : 0;

  const maxPossiblePoints = 5;

  const successRate =
    participants.length > 0
      ? (
          (participants.reduce((sum, p) => sum + p.score, 0) /
            (participants.length * maxPossiblePoints)) *
          100
        ).toFixed(1)
      : 0;

  // ✅ restore session
  useEffect(() => {
    const saved = sessionStorage.getItem("hostSessionId");
    if (saved) {
      setSessionId(saved);
    }
  }, []);

  // 🔹 create session
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

  // 🔥 LIVE SESSION (ВАЖНО – тук добавихме въпросите)
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);

    const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      setStatus(data.status);

      if (data.currentQuestion !== undefined) {
        setCurrentQuestion(data.currentQuestion);
      }

      // ✅ NEW – sync questions
      setQuestions(data.questions || []);
      setCurrentIndex(data.currentQuestion || 0);

      const q = data.questions?.[data.currentQuestion];
      setQuestion(q);
    });

    return () => unsubscribe();
  }, [sessionId]);

  // 🔹 participants listener
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

  // auto next question
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
      <h1 style={{ fontSize: "2.5rem" }}>
        Host Control Panel
      </h1>

      {!sessionId ? (
        <button onClick={generateSession} disabled={loading} style={buttonStyle}>
          {loading ? "Създаване..." : "Стартирай състезание"}
        </button>
      ) : (
        <>
          <h2 style={{ fontSize: "3rem" }}>{sessionId}</h2>

          {/* ✅ QUESTION VIEW (НОВО) */}
          {status === "in_progress" && question && (
            <div style={{ marginTop: 30 }}>
              <h2>{question.text}</h2>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                maxWidth: "500px",
                margin: "20px auto"
              }}>
                {question.options.map((opt: string, i: number) => (
                  <div key={i} style={{
                    padding: "15px",
                    borderRadius: "10px",
                    background: "#00ff88",
                    color: "#003300",
                    fontWeight: "bold"
                  }}>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* START */}
          {participants.length > 0 && status === "waiting" && (
            <button onClick={startGame} style={startButtonStyle}>
              Започни състезание
            </button>
          )}

          {/* TIMER */}
          {status === "in_progress" && (
            <>
              <h3>⏳ {autoTimer}</h3>
              <h3>Въпрос {currentQuestion + 1} / 5</h3>
              <h3>Отговорили: {answeredCount}</h3>
            </>
          )}

          {/* FINISH */}
          {status === "finished" && (
            <h2>🏆 КРАЙ</h2>
          )}
        </>
      )}
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #003d1a, #001a0d)",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  color: "#00ff88",
};

const buttonStyle: React.CSSProperties = {
  padding: "15px",
  background: "#00ff88",
  border: "none",
};

const startButtonStyle: React.CSSProperties = {
  marginTop: "20px",
  padding: "10px",
};