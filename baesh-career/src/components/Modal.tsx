export default function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  style,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{
          width: "min(720px, 95vw)",
          padding: 0,
          maxHeight: "calc(100vh - 32px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title !== undefined && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--border)",
              padding: "20px 24px",
            }}
          >
            {title && <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h3>}
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 28,
                cursor: "pointer",
                lineHeight: 1,
                padding: "4px 8px",
                color: "var(--muted)",
                transition: "color 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--muted)";
              }}
            >
              &times;
            </button>
          </div>
        )}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "0 24px 24px 24px" }}>{children}</div>
        {actions && (
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 16,
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
