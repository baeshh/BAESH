export default function AIHero() {
  return (
    <div
      className="panel soft-inner"
      style={{
        padding: 24,
        minHeight: 280,
        display: "grid",
        gap: 10,
        alignContent: "start",
        background:
          "radial-gradient(1200px 600px at -10% -20%, rgba(30,111,255,0.08), transparent), radial-gradient(800px 400px at 120% 120%, rgba(64,140,255,0.08), transparent)",
        border: "1px solid var(--border)",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #1E6FFF, #408CFF)",
            }}
          />
          <strong style={{ fontSize: 18 }}>BAESH</strong>
        </div>
        <h2 style={{ margin: "12px 0 4px 0", fontSize: 28, lineHeight: 1.2 }}>
          Build projects. Grow faster.
        </h2>
        <p style={{ color: "var(--muted)", margin: 0 }}>
          Meet your career AI clone. Start your journey now.
        </p>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <span className="pill">AI Clone Ready</span>
          <span className="pill">Personalized Recommendations</span>
        </div>
      </div>
      <div
        aria-hidden
        className="ai-dots"
        style={{ position: "relative", height: 60, marginTop: 6 }}
      >
        <span
          style={{
            position: "absolute",
            left: 20,
            top: 20,
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "var(--brand)",
            filter: "blur(.4px)",
            animation: "gatherA 2.5s ease-in-out infinite",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 80,
            top: 30,
            width: 8,
            height: 8,
            borderRadius: 999,
            background: "var(--accent)",
            filter: "blur(.5px)",
            animation: "gatherB 2.5s ease-in-out infinite",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 140,
            top: 10,
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "var(--brand)",
            filter: "blur(.6px)",
            animation: "gatherC 2.5s ease-in-out infinite",
          }}
        />
        <style>{`@keyframes gatherA { 0%, 100%{ transform: translate(0, 0) scale(1); } 50%{ transform: translate(60px, 5px) scale(1.2); } } @keyframes gatherB { 0%, 100%{ transform: translate(0, 0) scale(1); } 50%{ transform: translate(0, -10px) scale(1.2); } } @keyframes gatherC { 0%, 100%{ transform: translate(0, 0) scale(1); } 50%{ transform: translate(-60px, 10px) scale(1.2); } }`}</style>
      </div>
    </div>
  );
}
