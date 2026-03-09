import { type ChatSession } from '../services/sessionService'

type Props = {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  onDeleteSession: (sessionId: string) => void
  onClose: () => void
}

export default function SessionManager({ sessions, currentSessionId, onSelectSession, onNewSession, onDeleteSession, onClose }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '오늘'
    if (days === 1) return '어제'
    if (days < 7) return `${days}일 전`
    if (days < 30) return `${Math.floor(days / 7)}주 전`
    return `${Math.floor(days / 30)}개월 전`
  }

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.55)', 
        display: 'grid', 
        placeItems: 'center', 
        zIndex: 50,
        padding: 16 
      }} 
      onClick={onClose}
    >
      <div 
        className="panel" 
        style={{ 
          width: 'min(500px, 90vw)', 
          maxHeight: '80vh', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0 }}>대화 세션</h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', lineHeight: 1, padding: '4px 8px' }}
          >
            &times;
          </button>
        </div>

        {/* New Session Button */}
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <button 
            className="button" 
            onClick={() => { onNewSession(); onClose(); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            ➕ 새 대화 시작
          </button>
        </div>

        {/* Session List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {sessions.length === 0 ? (
            <div className="helper" style={{ textAlign: 'center', padding: 40 }}>
              아직 저장된 대화가 없습니다
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {sessions.map(session => (
                <div 
                  key={session.id}
                  className="panel"
                  style={{ 
                    padding: 12,
                    cursor: 'pointer',
                    border: currentSessionId === session.id ? '2px solid var(--brand)' : '1px solid var(--border)',
                    background: currentSessionId === session.id ? 'rgba(30,111,255,0.05)' : undefined,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12
                  }}
                  onClick={() => { onSelectSession(session.id); onClose(); }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: currentSessionId === session.id ? 600 : 400,
                      fontSize: 14,
                      marginBottom: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {session.title}
                    </div>
                    <div className="helper" style={{ fontSize: 11 }}>
                      {formatDate(session.updatedAt)} · {session.messages.length}개 메시지
                    </div>
                  </div>
                  <button
                    className="badge delete-session-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`"${session.title}" 세션을 삭제하시겠습니까?`)) {
                        onDeleteSession(session.id)
                        // 삭제 후 즉시 UI 업데이트를 위해 약간의 지연
                        setTimeout(() => {
                          // 모달은 열린 상태로 유지하여 삭제 결과 확인 가능
                        }, 100)
                      }
                    }}
                    style={{ 
                      fontSize: 11,
                      padding: '4px 8px',
                      flexShrink: 0,
                      color: '#EF4444',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = ''
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

