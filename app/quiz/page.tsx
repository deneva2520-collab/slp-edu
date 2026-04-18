"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  collection
} from "firebase/firestore";
import { questions } from "../../data/questions";
import { QRCodeSVG } from "qrcode.react";
import type { CSSProperties } from "react";

export default function QuizPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [status, setStatus] = useState("waiting");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [autoTimer, setAutoTimer] = useState(10);
  const [question, setQuestion] = useState<any>(null);

  // 🎯 animation
  const [lastJoined, setLastJoined] = useState<string | null>(null);
  const [prevCount, setPrevCount] = useState(0);

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
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();

    await setDoc(doc(db, "sessions", id), {
      status: "waiting",
      currentQuestion: 0,
      questions: []
    });

    sessionStorage.setItem("hostSessionId", id);
    setSessionId(id);
  };

  // 🔥 session listener
  useEffect(() => {
    if (!sessionId) return;

    const ref = doc(db, "sessions", sessionId);

    const unsubscribe = onSnapshot(ref, (snap) => {
      const data = snap.data();
      if (!data) return;

      setStatus(data.status);

      if (data.currentQuestion !== undefined) {
        setCurrentQuestion(data.currentQuestion);
        setQuestion(data.questions?.[data.currentQuestion]);
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  // 🔥 participants + SOUND + ANIMATION
  useEffect(() => {
    if (!sessionId) return;

    const ref = collection(db, "sessions", sessionId, "participants");

    const unsubscribe = onSnapshot(ref, (snap) => {
      const list: any[] = [];

      snap.forEach((d) => {
        list.push({
          id: d.id,
          score: d.data().score || 0,
          ...d.data()
        });
      });

      // 🎯 нов участник
      if (list.length > prevCount) {
        const newPlayer = list[list.length - 1];

        setLastJoined(newPlayer.name);

        // 🔊 звук
        const audio = new Audio("/join.mp3");
        audio.play().catch(() => {});

        setTimeout(() => setLastJoined(null), 2500);
      }

      setPrevCount(list.length);
      setParticipants(list);
    });

    return () => unsubscribe();
  }, [sessionId, prevCount]);

  // start game
  const startGame = async () => {
    if (!sessionId) return;

    const selected = questions.slice(0, 5).map((q) => ({
      question: q.question,
      options: q.options
    }));

    await updateDoc(doc(db, "sessions", sessionId), {
      status: "in_progress",
      currentQuestion: 0,
      questions: selected
    });

    setAutoTimer(10);
  };

  // timer
  useEffect(() => {
    if (status !== "in_progress") return;

    const interval = setInterval(() => {
      setAutoTimer((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // next question
  useEffect(() => {
    if (!sessionId || status !== "in_progress") return;

    if (autoTimer === 0) {
      const next = currentQuestion + 1;

      if (next < 5) {
        updateDoc(doc(db, "sessions", sessionId), {
          currentQuestion: next
        });
        setAutoTimer(10);
      } else {
        updateDoc(doc(db, "sessions", sessionId), {
          status: "finished"
        });
      }
    }
  }, [autoTimer]);

  const sorted = [...participants].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  return (
    <main style={mainStyle}>
      <h1 style={{ fontSize: "3rem" }}>Host Control Panel</h1>

      {!sessionId ? (
        <button onClick={generateSession} style={btn}>
          🚀 Старт
        </button>
      ) : (
        <>
          <h2 style={{ fontSize: "3rem" }}>{sessionId}</h2>

          {/* QR */}
          {status === "waiting" && (
            <QRCodeSVG
              value={`${window.location.origin}/join?session=${sessionId}`}
              size={220}
            />
          )}

          {/* 🎯 JOIN ANIMATION */}
          {lastJoined && (
            <div style={joinBox}>
              👤 {lastJoined} се присъедини!
            </div>
          )}

          <p>Участници: {participants.length}</p>

          {/* START */}
          {participants.length > 0 && status === "waiting" && (
            <button onClick={startGame} style={btn}>
              ▶️ Започни играта
            </button>
          )}

          {/* QUESTION */}
          {status === "in_progress" && question && (
            <>
              <h2 style={{ fontSize: "2rem" }}>
                {question.question}
              </h2>

              {question.options.map((o: string, i: number) => (
                <div key={i} style={option}>
                  {o}
                </div>
              ))}
            </>
          )}

          {/* TIMER */}
          {status === "in_progress" && (
            <>
              <p>⏳ {autoTimer}</p>
              <p>Въпрос {currentQuestion + 1}/5</p>
              <p>Отговорили: {answeredCount}</p>
            </>
          )}

          {/* LEADERBOARD */}
          {status === "in_progress" && autoTimer === 0 && (
            <div>
              <h3>🏆 Временно класиране</h3>
              {sorted.slice(0, 5).map((p, i) => (
                <p key={p.id}>
                  #{i + 1} {p.name} – {p.score || 0}
                </p>
              ))}
            </div>
          )}

          {/* FINAL */}
          {status === "finished" && (
            <div>
              <h2 style={{ color: "gold" }}>
                🏆 Крайно класиране
              </h2>

              {sorted.map((p, i) => (
                <div key={p.id} style={rank}>
                  #{i + 1} {p.name} – {p.score || 0}
                </div>
              ))}

              <button
                onClick={() => {
                  sessionStorage.removeItem("hostSessionId");
                  setSessionId(null);
                }}
                style={btn}
              >
                🔄 Нова игра
              </button>
            </div>
          )}
        </>
      )}

      {/* 🎯 animation css */}
      <style>
        {`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}
      </style>
    </main>
  );
}

/* STYLES */

const mainStyle: CSSProperties = {
  background: "#001a0d",
  color: "#00ff88",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  textAlign: "center"
};

const btn: CSSProperties = {
  marginTop: 20,
  padding: "15px 30px",
  fontSize: "1.2rem",
  background: "#00ff88",
  color: "#003300",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer"
};

const option: CSSProperties = {
  margin: 5,
  padding: 10,
  background: "#00ff88",
  color: "#003300",
  borderRadius: 8
};

const rank: CSSProperties = {
  marginTop: 10,
  padding: 10,
  background: "#002b15",
  borderRadius: 8
};

const joinBox: CSSProperties = {
  marginTop: 20,
  padding: "12px 20px",
  background: "#00ff88",
  color: "#003300",
  borderRadius: "10px",
  fontWeight: "bold",
  animation: "fadeInOut 2.5s ease"
};