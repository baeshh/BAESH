type Props = {
  title: string
  description?: string
  badgeNew?: boolean
  actionText?: string
  onAction?: () => void
}

export default function InsightCard({ title, description, badgeNew, actionText, onAction }: Props) {
  return (
    <div className="panel" style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{title}</strong>
        {badgeNew && <span className="badge glow">NEW 🌟</span>}
      </div>
      {description && <p style={{ color: 'var(--muted)', marginTop: 6 }}>{description}</p>}
      {actionText && (
        <div style={{ marginTop: 8 }}>
          <button className="button" onClick={onAction}>{actionText}</button>
        </div>
      )}
    </div>
  )}


