import { useState } from 'react'

type Message = {
  id: number
  sender: string
  content: string
  timestamp: string
  isMine: boolean
}

export default function DMModal({ open, onClose, recipient }: { open: boolean; onClose: () => void; recipient: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: recipient, content: '안녕하세요! 프로필 보고 연락드립니다.', timestamp: '오후 2:30', isMine: false },
    { id: 2, sender: '배승환', content: '안녕하세요! 반갑습니다 😊', timestamp: '오후 2:32', isMine: true },
  ])
  const [messageText, setMessageText] = useState('')

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: '배승환',
        content: messageText,
        timestamp: '방금 전',
        isMine: true
      }
      setMessages([...messages, newMessage])
      setMessageText('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!open) return null

  return (
    <div 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'grid', placeItems: 'center', zIndex: 50, padding: 16 }} 
      onClick={onClose}
    >
      <div 
        className="panel" 
        style={{ width: 'min(600px, 90vw)', padding: 0, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(135deg, #1E6FFF, #408CFF)' }} />
            <div>
              <strong style={{ fontSize: 14 }}>{recipient}</strong>
              <div style={{ fontSize: 11, color: 'var(--success)' }}>● 온라인</div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', lineHeight: 1, padding: '4px 8px' }}
          >
            &times;
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: '#FAFAFA' }}>
          {messages.map(msg => (
            <div 
              key={msg.id} 
              style={{ 
                display: 'flex', 
                justifyContent: msg.isMine ? 'flex-end' : 'flex-start',
                gap: 8
              }}
            >
              {!msg.isMine && (
                <div style={{ width: 32, height: 32, borderRadius: 999, background: 'linear-gradient(135deg, #1E6FFF, #408CFF)', flexShrink: 0 }} />
              )}
              <div style={{ maxWidth: '70%' }}>
                <div 
                  style={{ 
                    padding: '10px 14px', 
                    borderRadius: 12, 
                    background: msg.isMine ? 'var(--brand)' : '#FFFFFF',
                    color: msg.isMine ? '#FFFFFF' : 'var(--text)',
                    fontSize: 14,
                    lineHeight: 1.5,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {msg.content}
                </div>
                <div 
                  className="helper" 
                  style={{ 
                    fontSize: 10, 
                    marginTop: 4, 
                    textAlign: msg.isMine ? 'right' : 'left' 
                  }}
                >
                  {msg.timestamp}
                </div>
              </div>
              {msg.isMine && (
                <div style={{ width: 32, height: 32, borderRadius: 999, background: 'linear-gradient(135deg, #1E6FFF, #408CFF)', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: 16, borderTop: '1px solid var(--border)', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              className="input" 
              placeholder="메시지를 입력하세요..." 
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ flex: 1, height: 44, fontSize: 14 }}
              autoFocus
            />
            <button 
              className="button" 
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              style={{ 
                height: 44, 
                padding: '0 20px',
                opacity: messageText.trim() ? 1 : 0.5,
                cursor: messageText.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              📩 전송
            </button>
          </div>
          <div className="helper" style={{ fontSize: 11, marginTop: 6 }}>
            Enter를 눌러 전송 · Shift+Enter로 줄바꿈
          </div>
        </div>
      </div>
    </div>
  )
}

