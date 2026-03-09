import { useEffect, useMemo, useRef, useState } from 'react'

export default function OTPInput({ onSend, onVerify, cooldownSec = 30, ttlSec = 300 }: { onSend: () => Promise<void> | void; onVerify: (code: string) => Promise<boolean> | boolean; cooldownSec?: number; ttlSec?: number }) {
  const [code, setCode] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'sent' | 'verified' | 'error'>('idle')
  const timerRef = useRef<number>()

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const ttlLeft = useMemo(() => (expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : 0), [expiresAt])
  useEffect(() => {
    if (!expiresAt) return
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      if (left <= 0) {
        setExpiresAt(null)
        setStatus('idle')
      }
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const send = async () => {
    await onSend()
    setStatus('sent')
    setCooldown(cooldownSec)
    setExpiresAt(Date.now() + ttlSec * 1000)
  }

  const verify = async () => {
    const ok = await onVerify(code)
    setStatus(ok ? 'verified' : 'error')
  }

  const disabledSend = cooldown > 0

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="input" placeholder="인증코드 6자리" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0,6))} />
        <button type="button" className="badge" onClick={send} disabled={disabledSend}>{disabledSend ? `재전송 ${String(cooldown).padStart(2,'0')}s` : '코드 전송'}</button>
        <button type="button" className="button" onClick={verify} disabled={code.length !== 6}>확인</button>
      </div>
      <div style={{ marginTop: 6, color: 'var(--muted)' }}>{status === 'sent' && `5분 내 입력 (${String(ttlLeft).padStart(2,'0')}s)`}{status === 'verified' && '인증 완료'}{status === 'error' && '인증 실패. 다시 시도해 주세요.'}</div>
    </div>
  )
}


