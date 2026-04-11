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
    if (!questions || questions.length === 0) return;

    const newQuestion = questions[currentIndex];
    if (!newQuestion) return;

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
  }, [currentIndex, questions]);

  // ✅ Отговор
  const handleSelect = async (index: number) => {
    if (selected !== null || showCorrect || status === "finished") return;

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
    <main>
      <h2>⏳ {timer}</h2>
      <h1>{question.question}</h1>

      {(Array.isArray(question.options)
        ? question.options
        : question.options.split(/(?=[А-Я])/)
      ).map((opt: string, i: number) => (
        <button
          key={i}
          onClick={() => handleSelect(i)}
          style={{
            display: "block",
            margin: "10px",
            padding: "10px",
          }}
        >
          {opt}
        </button>
      ))}
    </main>
  );
};
