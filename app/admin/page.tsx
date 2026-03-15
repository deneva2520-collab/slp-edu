"use client";

import { useState } from "react";
import { db } from "../../lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function AdminPage() {
  const [name, setName] = useState("");

  const addSubject = async () => {
    if (!name) return;

    await addDoc(collection(db, "subjects"), {
  name,
  icon: "📘",
  createdAt: new Date(),
});

    setName("");
    alert("Предметът е добавен!");
  };

  return (
    <main style={mainStyle}>
      <h1 style={titleStyle}>Admin Panel</h1>

      <div style={cardStyle}>
        <h2>Добави предмет</h2>

        <input
          placeholder="Например: Математика"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <button onClick={addSubject} style={buttonStyle}>
  Добави предмет
</button>
      </div>
    </main>
  );
}

/* styles */

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#001a0d",
  padding: "40px",
  color: "#00ff88",
};

const titleStyle: React.CSSProperties = {
  fontSize: "36px",
  marginBottom: "40px",
};

const cardStyle: React.CSSProperties = {
  background: "#002b15",
  padding: "30px",
  borderRadius: "12px",
  maxWidth: "400px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  marginBottom: "20px",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 20px",
  background: "#00ff88",
  color: "#003d1a",   // 
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};