"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ActionButtons() {
  const [hovered, setHovered] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          marginTop: "50px",
          flexWrap: "wrap"
        }}
      >
        {/* Генерирай Quiz */}
        <button
          onClick={() => router.push("/quiz")}
          onMouseEnter={() => setHovered("quiz")}
          onMouseLeave={() => setHovered(null)}
          style={{
            width: "220px",
            padding: "14px 30px",
            fontSize: "1rem",
            fontWeight: "600",
            background: "linear-gradient(135deg, #00ff88, #00cc66)",
            color: "#003d1a",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: hovered === "quiz" ? "scale(1.05)" : "scale(1)",
            boxShadow:
              hovered === "quiz"
                ? "0 0 25px rgba(0,255,136,0.7)"
                : "0 0 12px rgba(0,255,136,0.4)"
          }}
        >
          Генерирай Quiz
        </button>

        {/* Научи */}
        <button
          onClick={() => router.push("/learn")}
          onMouseEnter={() => setHovered("learn")}
          onMouseLeave={() => setHovered(null)}
          style={{
            width: "220px",
            padding: "14px 30px",
            fontSize: "1rem",
            fontWeight: "600",
            background: "transparent",
            color: "#00ff88",
            border: "2px solid #00ff88",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: hovered === "learn" ? "scale(1.05)" : "scale(1)",
            boxShadow:
              hovered === "learn"
                ? "0 0 25px rgba(0,255,136,0.6)"
                : "none"
          }}
        >
          Научи
        </button>
      </div>

      {/* Copyright */}
      <p
        style={{
          marginTop: "50px",
          fontSize: "14px",
          color: "#cccccc",
          opacity: 0.8,
          textAlign: "center"
        }}
      >
        © 2026 SLP EDU – Educational Platform
      </p>
    </div>
  );
}