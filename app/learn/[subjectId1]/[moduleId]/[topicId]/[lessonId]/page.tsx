"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function LessonPage() {

  const params = useParams();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<any>(null);

  useEffect(() => {

    const loadLesson = async () => {

      const ref = doc(db, "lessons", lessonId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setLesson({
          id: snap.id,
          ...snap.data(),
        });
      }

    };

    loadLesson();

  }, [lessonId]);

  if (!lesson) {
    return <div style={{padding:40}}>Зареждане...</div>;
  }

  return (

    <main style={mainStyle}>

      <h1 style={titleStyle}>
        {lesson.title}
      </h1>

      <p style={descStyle}>
        {lesson.description}
      </p>

      {/* YouTube Video */}
      {lesson.videoUrl && (
        <div style={videoWrapper}>
          <iframe
            width="100%"
            height="450"
            src={lesson.videoUrl.replace("watch?v=", "embed/")}
            title="Lesson video"
            allowFullScreen
            style={videoStyle}
          />
        </div>
      )}

      {/* PDF Viewer */}
      {lesson.pdfUrl && (
        <div style={pdfWrapper}>
          <iframe
            src={lesson.pdfUrl}
            width="100%"
            height="600"
            style={pdfStyle}
          />
        </div>
      )}

    </main>

  );

}

/* styles */

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#003d1a,#001a0d)",
  padding: "40px 20px",
  color: "#00ff88",
  maxWidth: "900px",
  margin: "auto"
};

const titleStyle: React.CSSProperties = {
  fontSize: "36px",
  marginBottom: "10px"
};

const descStyle: React.CSSProperties = {
  fontSize: "18px",
  marginBottom: "30px",
  color: "#ffffff"
};

const videoWrapper: React.CSSProperties = {
  marginBottom: "40px"
};

const videoStyle: React.CSSProperties = {
  borderRadius: "10px",
  border: "2px solid #00ff88"
};

const pdfWrapper: React.CSSProperties = {
  marginTop: "20px"
};

const pdfStyle: React.CSSProperties = {
  border: "2px solid #00ff88",
  borderRadius: "10px"
};