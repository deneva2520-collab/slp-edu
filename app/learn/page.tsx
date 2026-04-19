"use client";

import { useRouter } from "next/navigation";

export default function LearnPage() {
  const router = useRouter();

  return (
    <main style={{ padding: 40 }}>
      <h1>📚 Научи</h1>

      <button
        onClick={() => router.push("/learn/subjects")}
        style={{
          padding: "20px",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        Влез в обучението
      </button>
    </main>
  );
}