import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import OTPInput from '../components/OTPInput'
import { formatKR, isValidKR } from '../utils/phone'

function validateEmail(v: string) { return /.+@.+\..+/.test(v) }

export default function Forgot() {
  const nav = useNavigate()
  const [tab, setTab] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    // tracking
    console.log('forgot.opened')
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => setCooldown(c => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const emailValid = useMemo(() => validateEmail(email), [email])
  const phoneValid = useMemo(() => isValidKR(phone), [phone])
  const canSend = tab === 'email' ? emailValid : phoneValid

  const send = async () => {
    console.log('forgot.submit', { method: tab })
    setSent(true)
    setCooldown(60)
  }

  const goReset = () => {
    nav('/reset-password', { replace: true })
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="panel" style={{ width: 'min(520px, 94vw)', padding: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: 28 }}>비밀번호를 잊으셨나요?</h2>
        <p style={{ color: 'var(--muted)' }}>이메일 또는 전화번호로 비밀번호 재설정 코드를 보내드립니다.</p>

        <div className="tabs" role="tablist" style={{ marginTop: 12 }}>
          <div role="tab" aria-selected={tab==='email'} className={`tab ${tab==='email' ? 'active' : ''}`} onClick={() => setTab('email')}>이메일</div>
          <div role="tab" aria-selected={tab==='phone'} className={`tab ${tab==='phone' ? 'active' : ''}`} onClick={() => setTab('phone')}>휴대폰</div>
        </div>

        {tab === 'email' && (
          <div className="slide-fade">
            <div className="field" style={{ marginTop: 16 }}>
              <input id="fg-email" className="input" placeholder=" " value={email} onChange={e => setEmail(e.target.value)} />
              <label htmlFor="fg-email">이메일</label>
              <div className="helper">예: name@company.com</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="button large" disabled={!canSend || cooldown>0} onClick={send}>{cooldown>0 ? `재전송 ${String(cooldown).padStart(2,'0')}s` : '인증 코드 받기'}</button>
            </div>
            <div style={{ marginTop: 8 }}>
              <Link to="/login" className="textlink">로그인으로 돌아가기</Link>
            </div>
            {sent && (
              <div className="panel" style={{ padding: 12, marginTop: 12 }}>
                인증 정보를 전송했습니다. 가입된 이메일에만 발송됩니다.
                <div style={{ marginTop: 8 }}>
                  <button className="badge" onClick={goReset}>링크로 이동 (개발용)</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'phone' && (
          <div className="slide-fade">
            <div className="field" style={{ marginTop: 16 }}>
              <input id="fg-phone" className={`input ${phone && !phoneValid ? 'error' : ''}`} placeholder=" " value={phone} onChange={e => setPhone(formatKR(e.target.value))} />
              <label htmlFor="fg-phone">휴대폰 번호</label>
              <div className="helper">예: 010-1234-5678</div>
              {phone && !phoneValid && <div className="error-text">한국 휴대폰 번호 형식으로 입력해 주세요.</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              {!sent ? (
                <button className="button large" disabled={!canSend || cooldown>0} onClick={() => { send(); }}>{cooldown>0 ? `재전송 ${String(cooldown).padStart(2,'0')}s` : '인증 코드 받기'}</button>
              ) : (
                <span className="helper">남은 시간 안에 코드를 입력해 주세요.</span>
              )}
            </div>
            <div style={{ marginTop: 8 }}>
              <Link to="/login" className="textlink">로그인으로 돌아가기</Link>
            </div>
            {sent && (
              <div style={{ marginTop: 12 }}>
                <OTPInput onSend={async () => setCooldown(60)} onVerify={async () => { setVerifying(true); await new Promise(r=>setTimeout(r,500)); setVerifying(false); goReset(); return true }} />
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 16, color: 'var(--muted)' }}>가입된 이메일/휴대폰으로만 전송됩니다.</div>
      </div>
    </div>
  )
}


