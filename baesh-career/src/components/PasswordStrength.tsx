import { useMemo } from 'react'
import { evaluatePassword } from '../utils/password'

export default function PasswordStrength({ password, email, name }: { password: string; email?: string; name?: string }) {
  const result = useMemo(() => evaluatePassword(password, { email, name }), [password, email, name])
  const levelText = result.score >= 4 ? '강' : result.score === 3 ? '보통' : '약'
  const levelColor = result.score >= 4 ? '#1E6FFF' : result.score === 3 ? '#2563EB' : '#EF4444'

  return (
    <div aria-live="polite" style={{ marginTop: 6 }}>
      <div style={{ height: 6, background: '#E5E7EB', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(result.score/5)*100}%`, background: levelColor, transition: 'width .2s' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, color: 'var(--muted)' }}>
        <strong style={{ color: '#0A0A0A' }}>강도: {levelText}</strong>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {result.hints.map((h, i) => (
            <li key={i} style={{ fontSize: 12 }}>{h}</li>
          ))}
        </ul>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
        {result.checks.map((c, i) => (
          <span key={i} className="badge" style={{ borderColor: c.pass ? 'rgba(30,111,255,0.35)' : '#E5E7EB', color: c.pass ? '#1E6FFF' : 'var(--muted)' }}>{c.label}</span>
        ))}
      </div>
    </div>
  )
}


