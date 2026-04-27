import { useLocation, useNavigate } from 'react-router-dom'

export default function SignupComplete() {
  const nav = useNavigate()
  const loc = useLocation() as any
  const name = loc?.state?.name || '님'
  return (
    <div className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="panel" style={{ width: 'min(680px, 94vw)', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🎉 환영합니다, {name}!</div>
        <p style={{ color: 'var(--muted)' }}>BAESH 클론이 곧 당신의 목표를 함께 설계합니다.</p>
        <div style={{ height: 16 }} />
        <div style={{ position: 'relative', height: 100 }} aria-hidden>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'radial-gradient(closest-side, rgba(30,111,255,0.15), transparent)' }} />
          <div style={{ width: 16, height: 16, borderRadius: 999, background: 'var(--brand)', margin: '0 auto', animation: 'pulse 1.2s ease-in-out infinite' }} />
          <style>{`@keyframes pulse { 0%{ transform: scale(1); opacity:.8 } 50%{ transform: scale(1.4); opacity:.4 } 100%{ transform: scale(1); opacity:.8 } }`}</style>
        </div>
        <div style={{ height: 12 }} />
        <button className="button large" onClick={() => nav('/profile', { replace: true })}>프로필로 이동</button>
        <div style={{ marginTop: 8, color: 'var(--muted)' }}>AI가 맞춤 추천을 준비 중이에요...</div>
      </div>
    </div>
  )
}


