type Props = {
  org: string
  verifiedOrg?: boolean
  title: string
  category: string
  period: string
  applicants: number
  capacity: number
  aiFit: number
  onView?: () => void
  onApply?: () => void
  reason?: string
  growthPredict?: string
}

export default function LoungeCard({ org, verifiedOrg, title, category, period, applicants, capacity, aiFit, onView, onApply, reason, growthPredict }: Props) {
  return (
    <div className="lounge-card" title={reason ? `추천 이유: ${reason}` : undefined}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #1E6FFF, #408CFF)', flexShrink: 0 }} />
          <strong style={{ fontSize: 14 }}>{org}</strong>
          {verifiedOrg ? <span className="verified-badge" style={{ fontSize: 10 }}>공식 인증</span> : <span className="badge" style={{ fontSize: 10 }}>미인증</span>}
        </div>
        <span className="badge" style={{ fontSize: 11, alignSelf: 'flex-start' }}>AI 적합도: {aiFit}%</span>
      </div>
      <div style={{ marginTop: 6, fontWeight: 600, fontSize: 14 }}>{title}</div>
      <div className="helper" style={{ marginTop: 4, fontSize: 11 }}>분야: {category} | 기간: {period}</div>
      <div className="helper" style={{ fontSize: 11 }}>지원자: {applicants}명 | 정원: {capacity}명</div>
      {growthPredict && <div className="helper" style={{ marginTop: 4, fontSize: 11 }}>성장 예측: {growthPredict}</div>}
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <button className="badge" style={{ fontSize: 11, transition: 'all 0.2s ease' }} onClick={onView} onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,111,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = ''}>📄 자세히</button>
        <button className="button" style={{ fontSize: 12 }} onClick={onApply}>💙 지원하기</button>
      </div>
    </div>
  )
}


