"use client";

import { useRouter } from "next/navigation";
import ActionButtons from "@/components/ActionButtons";

export default function Home() {
  const router = useRouter();

  return (
    <main style={containerStyle}>
      
      {/* 🎬 Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={videoStyle}
      >
        <source src="/logo.mp4" type="video/mp4" />
      </video>

      {/* 🔲 Overlay */}
      <div style={overlayStyle}></div>

      {/* 📝 Съдържание */}
      <div style={contentStyle}>
        <h1 style={{ fontSize: "48px", marginTop: "400px" }}>
          Добре дошли в Quiz състезанието
        </h1>

        <p style={{ fontSize: "40px", marginTop: "20px" }}>
          Включи се и тествай знанията си!
        </p>
        <ActionButtons />
      </div>
    </main>
  );
}

const containerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100vh",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  color: "white"
};

const videoStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  zIndex: -2
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: -1
};

const contentStyle: React.CSSProperties = {
  zIndex: 2,
  padding: "20px"
};

const buttonStyle: React.CSSProperties = {
  marginTop: "40px",
  padding: "15px 40px",
  fontSize: "20px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#00ff88",
  color: "#003d1a",
  fontWeight: "bold"
};