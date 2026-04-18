"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase";
import {
  doc,
  onSnapshot,
  runTransaction,
  collection,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { sounds } from "@/lib/sounds";

export default function GamePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState<any>(null);
  const [timer, setTimer] = useState(10);
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState("waiting");
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // sessionId
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

  // participantId
  useEffect(() => {
    if (typeof window !== "undefined") {
      setParticipantId(sessionStorage.getItem("participantId"));
    }
  }, []);

  // session listener
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

  // въпрос + таймер + звук
  useEffect(() => {
    if (status === "finished") return;
    if (!questions || questions.length === 0) return;

    const newQuestion = questions[currentIndex];
    if (!newQuestion) return;

    if (hasInteracted) {
      sounds.question.play();
    }

    setQuestion(newQuestion);
    setSelected(null);
    setTimer(10);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
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

  // отговор
  const handleSelect = async (index: number) => {
    if (selected !== null || status === "finished") return;

    setSelected(index);
    sounds.select.play();

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

  // UI states
  if (!sessionId) return <h1>Няма session</h1>;
  if (status === "waiting") return <h1>Изчакай...</h1>;
  if (!question) return <h1>Зареждане...</h1>;

  // 🏆 финал
  if (status === "finished") {
    const sorted = participants.slice().sort((a, b) => b.score - a.score);

    return (
      <main style={mainStyle} onClick={() => setHasInteracted(true)}>
        <Confetti />
        <h1 style={{ fontSize: "2rem" }}>🏆 Класиране</h1>

        {sorted.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            style={{
              margin: "10px",
              padding: "15px",
              borderRadius: "12px",
              background:
                i === 0
                  ? "#FFD700"
                  : i === 1
                  ? "#C0C0C0"
                  : i === 2
                  ? "#CD7F32"
                  : "#002b15",
              color: i < 3 ? "#000" : "#00ff88",
              width: "90%",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            #{i + 1} – {p.name} ({p.score})
          </motion.div>
        ))}
      </main>
    );
  }

  return (
    <main style={mainStyle} onClick={() => setHasInteracted(true)}>
      <h2>⏳ {timer}</h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.question}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
        >
          <h1 style={{ padding: "10px" }}>{question.question}</h1>
        </motion.div>
      </AnimatePresence>

      <div style={gridStyle}>
        {(question.options || []).map((opt: string, i: number) => {
          const isSelected = selected === i;
          const isCorrect = i === question.correctIndex;

          let bg = "#002b15";

          if (selected !== null) {
            if (isCorrect) bg = "#00ff88";
            else if (isSelected) bg = "#ff4d4d";
          }

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              whileTap={{ scale: 0.95 }}
              animate={{ backgroundColor: bg }}
              style={buttonStyle}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </main>
  );
}

// styles
const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #003d1a, #001a0d)",
  color: "#00ff88",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  textAlign: "center",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
  width: "100%",
  maxWidth: "500px",
};

const buttonStyle: React.CSSProperties = {
  padding: "20px",
  fontSize: "18px",
  borderRadius: "15px",
  border: "2px solid #00ff88",
  color: "#00ff88",
  cursor: "pointer",
};