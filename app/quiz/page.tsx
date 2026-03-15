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

  // ✅ Възстановяване на Host session при refresh
  useEffect(() => {
    const saved = sessionStorage.getItem("hostSessionId");
    if (saved) {
      setSessionId(saved);
    }
  }, []);

  // 🔹 Създаване на нова сесия
  const generateSession = async () => {
    setLoading(true);

    const id = Math.random().toString(36).substring(2, 8).toUpperCase();

    await setDoc(doc(db, "sessions", id), {
      createdAt: new Date(),
      status: "waiting",
      participants: []
    });

    // ✅ Запазваме за Host
    sessionStorage.setItem("hostSessionId", id);

    setSessionId(id);
    setLoading(false);
  };

  // 🔥 Live listener
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);

    const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      console.log("Host session:", sessionId);
      console.log("Host data:", data);

      setStatus(data.status);
    
      if (data.currentQuestion !== undefined) {
        setCurrentQuestion(data.currentQuestion);
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  // 🔹 Стартиране на състезанието
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
// ⭐ DEMO MODE – добавя фалшиви участници
const addDemoParticipants = async () => {
  if (!sessionId) return;

  const participantsRef = collection(
    db,
    "sessions",
    sessionId,
    "participants"
  );

  const demoPlayers = ["Алекс", "Мария", "Иван", "Георги"];

  for (const name of demoPlayers) {
    await addDoc(participantsRef, {
      name,
      score: 0,
      answeredQuestionIndex: -1,
      joinedAt: new Date()
    });
  }
};
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

  // ✅ Host таймер
  useEffect(() => {
    if (status !== "in_progress" || !sessionId) return;

    const interval = setInterval(() => {
      setAutoTimer((prev) => (prev <= 1 ? 10 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [status, sessionId]);

  // ✅ Смяна на въпросите (само Host)
  useEffect(() => {
    if (!sessionId || status !== "in_progress") return;

    if (autoTimer === 10) {
      const moveNext = async () => {
        const sessionRef = doc(db, "sessions", sessionId);
        const nextQuestion = currentQuestion + 1;

        if (nextQuestion < 5) {
          await updateDoc(sessionRef, {
            currentQuestion: nextQuestion,
          });
          setCurrentQuestion(nextQuestion);
        } else {
          await updateDoc(sessionRef, {
            status: "finished",
          });
        }
      };

      moveNext();
    }
  }, [autoTimer]);

  return (
  <main style={mainStyle}>

  <style>
  {`
  @keyframes participantPop {
    0% { transform: scale(0.8); opacity: 0; }
    60% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
  `}
  </style>
      <h1 style={{ fontSize: "2.5rem" }}>
        Host Control Panel
      </h1>

      {!sessionId ? (
        <button
          onClick={generateSession}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "Създаване..." : "Стартирай състезание"}
        </button>
      ) : (
        <>
          <p style={{ fontSize: "1.2rem" }}>
            Session ID:
          </p>

          <h2
            style={{
              fontSize: "3rem",
              letterSpacing: "6px"
            }}
          >
            {sessionId}
          </h2>
      <div style={{
  marginTop: "25px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
}}>

<p style={{
  fontSize: "20px",
  marginBottom: "15px",
  fontWeight: "bold"
}}>
📱 Сканирай QR кода и се включи в състезанието
</p>

<div style={{
  animation: "qrPulse 2s infinite",
  display: "inline-block"
}}>
  <QRCodeSVG
    value={`http://192.168.100.32:3000/join?session=${sessionId}`}
    size={260}
    bgColor={"#ffffff"}
    fgColor={"#000000"}
  />
</div>
  </div>
          {status !== "finished" && (
  <>
    <h3 style={{ marginTop: "30px" }}>
      Участници: {participants.length} / 10
    </h3>

    <div style={{ marginTop: "15px" }}>
      {participants.map((p, index) => (
        <p key={index}>
          • {p.name} ({p.score})
        </p>
      ))}
    </div>
  </>
)}
          {/* ✅ Бутонът за старт */}
          {participants.length > 0 && status === "waiting" && (
            <button
              onClick={startGame}
              style={startButtonStyle}
            >
              Започни състезание
            </button>
          )}
          {/* ⭐ DEMO MODE BUTTON */}
{status === "waiting" && (
  <button
    onClick={addDemoParticipants}
    style={{
      marginTop: "15px",
      padding: "10px 20px",
      borderRadius: "8px",
      border: "1px solid #00ff88",
      background: "transparent",
      color: "#00ff88",
      cursor: "pointer"
    }}
  >
    + Добави демо участници
  </button>
)}

          {status === "in_progress" && (
  <>
    <h2 style={{ marginTop: "20px", color: "yellow" }}>
      Състезанието започна!
    </h2>

    <h3>⏳ Таймер: {autoTimer}</h3>
    <h3>Въпрос: {currentQuestion + 1} / 5</h3>

    <h3 style={{ marginTop: "10px", color: "#FFD700" }}>
      📊 Отговорили: {answeredCount} / {participants.length}
    </h3>
  </>
)}

          {status === "finished" && (
  <>
    <div style={{ marginTop: "60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2 style={{ fontSize: "48px", marginBottom: "30px" }}>
        🏆 КРАЙНО КЛАСИРАНЕ
      </h2>

      {participants
        .slice()
        .sort((a, b) => b.score - a.score)
        .map((player, index) => (
          <div
            key={player.id}
            style={{
              animation: "participantPop 0.4s ease",
              margin: "15px",
              padding: "20px",
              borderRadius: "14px",
              width: "500px",
              fontSize: "28px",
              fontWeight: "bold",
              background:
                index === 0
                  ? "linear-gradient(135deg, #FFD700, #ffcc00)"
                  : index === 1
                  ? "#C0C0C0"
                  : index === 2
                  ? "#CD7F32"
                  : "#002b15",
              color: index < 3 ? "#000" : "#00ff88"
            }}
          >
            #{index + 1} – {player.name} ({player.score} т.)
          </div>
        ))}
    </div>

    <h2 style={{ marginTop: "40px", fontSize: "36px", color: "#00ff88" }}>
      🎉 Благодарим за участието!
    </h2>

    <button
      onClick={() => {
        sessionStorage.removeItem("hostSessionId");
        setSessionId(null);
      }}
      style={{
        marginTop: "30px",
        padding: "15px 30px",
        fontSize: "1.1rem",
        fontWeight: "bold",
        backgroundColor: "#00ff88",
        color: "#003d1a",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer"
      }}
    >
      Стартирай ново състезание
    </button>

    {/* 📊 Статистика */}
    <div style={{
      marginTop: "50px",
      padding: "25px",
      borderRadius: "14px",
      width: "500px",
      background: "#001a0d",
      border: "1px solid #00ff88"
    }}>
      <h3 style={{ marginBottom: "15px", fontSize: "24px" }}>
        📊 Статистика
      </h3>

      <p>🥇 Най-висок резултат: {highestScore} т.</p>
      <p>📉 Най-нисък резултат: {lowestScore} т.</p>
      <p>📊 Среден резултат: {averageScore} т.</p>
      <p>📈 Успеваемост: {successRate}%</p>
    </div>
  </>
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
  gap: "15px",
  padding: "20px",
  textAlign: "center"
};

const buttonStyle: React.CSSProperties = {
  padding: "15px 30px",
  fontSize: "1.2rem",
  fontWeight: "600",
  backgroundColor: "#00ff88",
  color: "#003d1a",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer"
};

const startButtonStyle: React.CSSProperties = {
  marginTop: "30px",
  padding: "12px 25px",
  borderRadius: "8px",
  border: "none",
  background: "#00ff88",
  color: "#003d1a",
  fontWeight: "bold",
  cursor: "pointer"
};