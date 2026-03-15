"use client";

import { useRouter } from "next/navigation";

export default function LearnPage() {

  const router = useRouter();

  const grades = [
    "5 клас",
    "6 клас",
    "7 клас"
  ];

  return (

    <main style={mainStyle}>

      <h1 style={titleStyle}>
        📚 Избери клас
      </h1>

      <div style={gridStyle}>

        {grades.map((grade) => (

          <div
            key={grade}
            style={cardStyle}
            onClick={() => router.push("/learn/subjects")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 0 20px rgba(0,255,136,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >

            {grade}

          </div>

        ))}

      </div>

    </main>

  );

}

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#003d1a,#001a0d)",
  padding: "60px 40px",
  color: "#00ff88",
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  fontSize: "42px",
  marginBottom: "40px",
};

const gridStyle: React.CSSProperties = {
  display: "flex",
  gap: "30px",
  justifyContent: "center",
};

const cardStyle: React.CSSProperties = {
  background: "#002b15",
  border: "1px solid #00ff88",
  borderRadius: "14px",
  width: "220px",
  padding: "40px",
  cursor: "pointer",
  transition: "all 0.3s ease",
};