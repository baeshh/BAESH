import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PasswordStrength from '../components/PasswordStrength'
import Modal from '../components/Modal'

export default function ResetPassword() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [open, setOpen] = useState(false)

  const okLen = pw.length >= 8
  const okMatch = pw2.length > 0 && pw === pw2
  const canSubmit = useMemo(() => okLen && okMatch, [okLen, okMatch])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call backend with token & hashed pw
    setOpen(true)
  }

  const goLogin = () => nav('/login', { replace: true })

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <form className="panel" onSubmit={submit} style={{ width: 'min(520px, 94vw)', padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>새 비밀번호 설정</h2>
        <p style={{ color: 'var(--muted)' }}>8자 이상, 영문/숫자/특수문자 포함</p>
        <div className="field" style={{ marginTop: 16 }}>
          <input id="npw" className="input" type="password" value={pw} onChange={e => setPw(e.target.value)} required />
          <label htmlFor="npw">새 비밀번호</label>
          <PasswordStrength password={pw} />
        </div>
        <div style={{ height: 12 }} />
        <div className="field">
          <input id="npw2" className={`input ${pw2 && !okMatch ? 'error' : ''}`} type="password" value={pw2} onChange={e => setPw2(e.target.value)} required />
          <label htmlFor="npw2">비밀번호 확인</label>
          {pw2 && !okMatch && <div className="error-text">두 비밀번호가 일치하지 않아요.</div>}
        </div>
        <div className="panel" style={{ padding: 12, marginTop: 12 }}>
          이 비밀번호는 즉시 적용됩니다. 다른 기기에서 자동 로그아웃 될 수 있습니다.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="button large" disabled={!canSubmit}>비밀번호 변경</button>
        </div>
      </form>

      <Modal open={open} onClose={() => setOpen(false)} title="비밀번호 변경 완료">
        <p>비밀번호가 변경되었습니다. 보안을 위해 모든 기기에서 로그아웃되었습니다.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="button" onClick={goLogin}>로그인하기</button>
        </div>
      </Modal>
    </div>
  )
}


