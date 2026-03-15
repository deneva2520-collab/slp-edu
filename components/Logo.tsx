export default function Logo() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px"
    }}>
      
      <img 
        src="/logo.png" 
        alt="SLP EDU Logo"
        style={{
          width: "400px",
          maxWidth: "90%",
          height: "auto"
        }}
      />

      <p style={{
        fontSize: "1.8rem",
        color: "#00ff88",
        letterSpacing: "2px"
      }}>
        Smart Learning Platform
      </p>
    </div>
  );
}