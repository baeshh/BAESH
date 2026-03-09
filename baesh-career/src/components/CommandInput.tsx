import { useState } from 'react'

type Props = {
  onSubmit: (text: string) => void
  placeholder?: string
}

export default function CommandInput({ onSubmit, placeholder }: Props) {
  const [text, setText] = useState('')
  return (
    <div className="panel" style={{ padding: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
      <span className="kbd">/추천</span>
      <span className="kbd">/분석</span>
      <span className="kbd">/목표</span>
      <span className="kbd">/정리</span>
      <input
        className="input"
        style={{ flex: 1 }}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder ?? '클론에게 메시지를 입력하세요…'}
        onKeyDown={e => {
          if (e.key === 'Enter' && text.trim()) {
            onSubmit(text.trim())
            setText('')
          }
        }}
      />
      <button className="button" onClick={() => { if (text.trim()) { onSubmit(text.trim()); setText('') } }}>
        전송
      </button>
    </div>
  )
}


