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
  const getSessionFromUrl = () => {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  return params.get("session");
};

  const { width, height } = useWindowSize();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sessionId =
  typeof window !== "undefined"
    ? getSessionFromUrl() || sessionStorage.getItem("hostSessionId")
    : null;
  console.log("GAME sessionId:", sessionId);

  "use client";

import { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase";
import { doc, onSnapshot, runTransaction, collection } from "firebase/firestore";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

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

const [sessionId, setSessionId] = useState<string | null>(null);

const { width, height } = useWindowSize();
const intervalRef = useRef<NodeJS.Timeout | null>(null);

// ✅ Взимаме sessionId от URL или storage
useEffect(() => {
if (typeof window === "undefined") return;

```
const params = new URLSearchParams(window.location.search);
const urlSession = params.get("session");

if (urlSession) {
  console.log("FROM URL:", urlSession);
  setSessionId(urlSession);
  sessionStorage.setItem("sessionId", urlSession);
} else {
  const stored = sessionStorage.getItem("sessionId");
  console.log("FROM STORAGE:", stored);
  setSessionId(stored);
}
```

}, []);

// DEBUG
useEffect(() => {
console.log("FINAL sessionId:", sessionId);
}, [sessionId]);

// 🔐 participantId
useEffect(() => {
if (typeof window !== "undefined") {
setParticipantId(sessionStorage.getItem("participantId"));
}
}, []);

// 🔥 Session listener
useEffect(() => {
if (!sessionId) return;

```
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
```

}, [sessionId]);

// 🔥 Participants listener
useEffect(() => {
if (!sessionId) return;

```
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
```

}, [sessionId]);

// ⏱️ Таймер
useEffect(() => {
if (questions.length === 0 || status === "finished") return;

```
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
```

}, [currentIndex, questions, status]);

// ✅ Точки
const handleEndOfQuestion = async (
finishedQuestion: any,
selectedIndex: number
) => {
if (!sessionId || !participantId) return;

```
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

    if (data.answeredQuestionIndex === currentIndex) return;

    let newScore = data.score;

    if (selectedIndex === finishedQuestion.correctIndex) {
      newScore = data.score + 1;
    }

    transaction.update(participantRef, {
      score: newScore,
      answeredQuestionIndex: currentIndex,
    });
  });
} catch (error) {
  console.error("Transaction failed:", error);
}
```

};

const handleSelect = (index: number) => {
if (selected !== null || showCorrect || status === "finished") return;

```
setSelected(index);

if (question) {
  handleEndOfQuestion(question, index);
}
```

};

return ( <main style={mainStyle}>
{status === "finished" ? (
<> <h1>🏆 Класиране</h1>

```
      {participants
        .slice()
        .sort((a, b) => b.score - a.score)
        .map((player, index) => (
          <div key={player.id}>
            #{index + 1} – {player.name} ({player.score})
          </div>
        ))}
    </>
  ) : !question ? (
    <h1>Зареждане...</h1>
  ) : (
    <>
      <h2>⏳ {timer}</h2>
      <h1>{question.question}</h1>

      {question.options.map((option: string, index: number) => (
        <button
          key={index}
          onClick={() => handleSelect(index)}
          disabled={showCorrect}
          style={optionStyle}
        >
          {option}
        </button>
      ))}
    </>
  )}
</main>
```

);
}

const mainStyle: React.CSSProperties = {
minHeight: "100vh",
display: "flex",
flexDirection: "column",
alignItems: "center",
justifyContent: "center",
};

const optionStyle: React.CSSProperties = {
margin: "10px",
padding: "10px",
};

