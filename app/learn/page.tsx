"use client";

import { useRouter } from "next/navigation";

export default function LearnPage() {
  const router = useRouter();

  return (
    <main className="learn-container">
      <h1 className="learn-title">📚 Научи</h1>

      <p className="learn-subtitle">
        Започни своето обучение по интерактивен начин
      </p>

      <div className="learn-icon">🎯</div>

      <button
        onClick={() => router.push("/learn/subjects")}
        className="learn-btn"
      >
        Влез в обучението
      </button>
    </main>
  );
}