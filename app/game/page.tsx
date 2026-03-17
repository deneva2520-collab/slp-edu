"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase";
import { doc, onSnapshot, runTransaction } from "firebase/firestore";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { collection } from "firebase/firestore";

export default function GamePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState<any>(null);
  const [timer, setTimer] = useState(20);
  const [selected, setSelected] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [status, setStatus] = useState("in_progress");
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantId, setParticipantId] = useState<string | null>(null);

  const { width, height } = useWindowSize();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sessionId =
  typeof window !== "undefined"
    ? sessionStorage.getItem("hostSessionId")
    : null;
  console.log("GAME sessionId:", sessionId);

  // 🔐 Взимаме participantId
  useEffect(() => {
    if (typeof window !== "undefined") {
      setParticipantId(sessionStorage.getItem("participantId"));
    }
  }, []);

  // 🔥 Live listener
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);

    const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      setStatus(data.status);

      if (data.status === "finished") return;

      if (data.questions) {
        const newIndex = data.currentQuestion || 0;
        setQuestions(data.questions);
        setCurrentIndex((prev) =>
          prev !== newIndex ? newIndex : prev
        );
      }
    });

    return () => unsubscribe();
  }, [sessionId]);
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

  // 🔄 Таймер за играчите (само визуален)
  useEffect(() => {
    if (questions.length === 0 || status === "finished") return;

    const newQuestion = questions[currentIndex];

    setQuestion(newQuestion);
    setSelected(null);
    setShowCorrect(false);
    setTimer(10);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setShowCorrect(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex, questions, status]);

  // ✅ Запис на точки (само transaction)
  const handleEndOfQuestion = async (
  finishedQuestion: any,
  selectedIndex: number
) => {
  if (!sessionId || !participantId) return;

  const participantRef = doc(
    db,
    "sessions",
    sessionId,
    "participants",
    participantId
  );

  try {
    await runTransaction(db, async (transaction) => {
      const participantDoc = await transaction.get(participantRef);

      if (!participantDoc.exists()) return;

      const data = participantDoc.data();

      const currentQuestionIndex = currentIndex;

      // ✅ Защита срещу двойно отговаряне
      if (data.answeredQuestionIndex === currentQuestionIndex) {
        return;
      }

      let newScore = data.score;

      if (selectedIndex === finishedQuestion.correctIndex) {
        newScore = data.score + 1;
      }

      transaction.update(participantRef, {
        score: newScore,
        answeredQuestionIndex: currentQuestionIndex,
      });
    });
  } catch (error) {
    console.error("Transaction failed: ", error);
  }
};

  const handleSelect = (index: number) => {
  if (selected !== null || showCorrect || status === "finished") return;

  setSelected(index);

  if (question) {
    handleEndOfQuestion(question, index);
  }
};

  const pulseStyle = `
  @keyframes winnerPulse {
    0% { transform: scale(1.08); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1.08); }
  }
  `;

  return (
    <main style={mainStyle}>
      <style>{pulseStyle}</style>

      {status === "finished" ? (
        <>
          <h1>🏆 Класиране</h1>

          {(() => {
            const sorted = participants
              .slice()
              .sort((a, b) => b.score - a.score);

            const winner = sorted[0];

            return (
              <>
                {winner?.id === participantId && (
                  <>
                    <Confetti width={width} height={height} />
                    <h2
                      style={{
                        fontSize: "36px",
                        marginBottom: "20px",
                        color: "#FFD700",
                        textShadow: "0 0 20px rgba(255,215,0,0.8)",
                      }}
                    >
                      🏆 ПОБЕДИТЕЛ!
                    </h2>
                  </>
                )}

                {sorted.map((player, index) => {
                  const isCurrent = player.id === participantId;

                  return (
                    <div
                      key={player.id}
                      style={{
                        margin: "10px",
                        padding: "15px",
                        borderRadius: "8px",
                        width: "320px",
                        background:
                          index === 0
                            ? "#FFD700"
                            : index === 1
                            ? "#C0C0C0"
                            : index === 2
                            ? "#CD7F32"
                            : "#002b15",
                        color: index < 3 ? "#000" : "#00ff88",
                        fontWeight: "bold",
                        border: isCurrent ? "3px solid white" : "none",
                        animation:
                          index === 0
                            ? "winnerPulse 1.5s infinite"
                            : "none",
                      }}
                    >
                      #{index + 1} – {player.name} ({player.score} т.)
                      {isCurrent && <div>👉 Това си ти</div>}
                    </div>
                  );
                })}
              </>
            );
          })()}
          {/* 📊 Live Leaderboard */}
<div style={{ marginTop: "40px" }}>
  <h3>Текущо класиране:</h3>

  {participants
    .slice()
    .sort((a, b) => b.score - a.score)
    .map((player, index) => {
      const isCurrent = player.id === participantId;

      return (
        <div
          key={player.id}
          style={{
            margin: "5px",
            fontWeight: isCurrent ? "bold" : "normal",
            color: isCurrent ? "#FFD700" : "#00ff88"
          }}
        >
          #{index + 1} – {player.name} ({player.score} т.)
          {isCurrent && " 👈 Това си ти"}
        </div>
      );
    })}
</div>
      </>
      ) : !question ? (
        <h1>Зареждане...</h1>
      ) : (
        <>
          <h2>Оставащо време: {timer}</h2>

          <h1 style={{ marginTop: "20px" }}>
            {question.question}
          </h1>

          <div style={optionsContainer}>
            {question.options.map((option: string, index: number) => {
              let background = "black";
              let color = "#00ff88";
              let opacity = 1;

              if (showCorrect) {
                if (index === question.correctIndex) {
                  background = "#00ff88";
                  color = "#003d1a";
                } else {
                  opacity = 0.4;
                }
              } else if (selected === index) {
                background = "#004d26";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={showCorrect}
                  style={{
                    ...optionStyle,
                    backgroundColor: background,
                    color,
                    opacity,
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
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
  padding: "20px",
  textAlign: "center",
};

const optionsContainer: React.CSSProperties = {
  marginTop: "30px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const optionStyle: React.CSSProperties = {
  padding: "15px",
  borderRadius: "8px",
  border: "1px solid #00ff88",
  cursor: "pointer",
  transition: "all 0.3s ease",
};
