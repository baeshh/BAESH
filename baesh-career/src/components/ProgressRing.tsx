type Props = {
  size?: number
  stroke?: number
  percent: number
  label: string
  color?: string
  hint?: string
}

export default function ProgressRing({ size = 88, stroke = 8, percent, label, color = '#1E6FFF', hint }: Props) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = Math.max(0, Math.min(100, percent)) / 100 * circumference
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }} title={hint}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          strokeDasharray={`${dash} ${circumference-dash}`}
          style={{ transition: 'stroke-dasharray .5s ease' }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={14} fontWeight={600}>{Math.round(percent)}%</text>
      </svg>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</div>
    </div>
  )
}


