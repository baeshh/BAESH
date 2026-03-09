import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { apiGet, apiPost } from '../utils/api'

type Step = 1 | 2 | 3

export default function EntryPortal() {
  const nav = useNavigate()
  const loc = useLocation() as any
  const { isAuthenticated, login } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [goal, setGoal] = useState('이직')
  const [tags, setTags] = useState<string[]>([])
  const [nickname, setNickname] = useState('')

  const interestPool = ['AI', 'Python', 'Frontend', 'Backend', 'Data', 'Design']

  const toggleTag = (t: string) => {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const complete = async () => {
    if (!isAuthenticated) {
      login()
      return
    }
    
    try {
      // 온보딩 완료 API 호출
      await apiPost('/users/onboarding/complete', {
        interests: tags,
        goals: goal,
      })
      
      // 프로필 페이지로 이동
      nav('/profile', { replace: true })
    } catch (error) {
      console.error('온보딩 완료 실패:', error)
      // 에러가 발생해도 프로필로 이동
      nav('/profile', { replace: true })
    }
  }

  useEffect(() => {
    // 온보딩 완료 여부 확인
    const checkOnboardingStatus = async () => {
      if (!isAuthenticated) return
      
      try {
        const profile = await apiGet<{ onboardingCompleted?: boolean }>('/users/profile')
        // 온보딩이 완료된 경우 프로필로 리다이렉트
        if (profile.onboardingCompleted) {
          nav('/profile', { replace: true })
          return
        }
      } catch (error) {
        console.error('온보딩 상태 확인 실패:', error)
      }
    }
    
    checkOnboardingStatus()
  }, [isAuthenticated, nav])

  return (
    <div className="row">
      <div className="panel" style={{ padding: 20 }}>
        <div className="row row-2">
          <div>
            <h2>BAESH Entry Portal</h2>
            <p style={{ color: 'var(--muted)' }}>가입 → 내 클론과 첫 대화까지 1분</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge">5초 진입</span>{' '}
            <span className="badge">AI가 기억하는 시작</span>
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div className="row">
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ height: 4, background: '#E5E7EB', borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ height: '100%', width: `${(step/3)*100}%`, background: 'var(--text)' }} />
            </div>
            <h3>Step {step} / 3</h3>

            {step === 1 && (
              <div>
                <p>당신의 목표는 무엇인가요?</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['이직', '성장', '협업'].map(g => (
                    <button
                      key={g}
                      className="pill"
                      style={{ borderColor: goal === g ? 'var(--brand)' : 'var(--border)', background: goal === g ? 'rgba(30,111,255,0.1)' : undefined, color: goal === g ? 'var(--brand)' : undefined }}
                      onClick={() => setGoal(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <p>관심 분야를 골라주세요.</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {interestPool.map(t => (
                    <button
                      key={t}
                      className="pill"
                      style={{ borderColor: tags.includes(t) ? 'var(--brand)' : 'var(--border)', background: tags.includes(t) ? 'rgba(30,111,255,0.1)' : undefined, color: tags.includes(t) ? 'var(--brand)' : undefined }}
                      onClick={() => toggleTag(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <p>간단한 자기소개나 닉네임을 알려주세요.</p>
                <input
                  className="input"
                  placeholder="예: 승환"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
                <div style={{ height: 8 }} />
                <div className="panel soft-inner" style={{ padding: 12 }}>
                  안녕하세요, {nickname || '님'}. 목표는 ‘{goal}’, 관심 분야는 ‘{tags.join(', ') || '미선택'}’로 설정되었네요. 첫 추천을 준비할게요.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <button className="button" onClick={() => setStep(s => Math.max(1, (s - 1) as Step))}>이전</button>
              {step < 3 ? (
                <button className="button" onClick={() => setStep(s => Math.min(3, (s + 1) as Step))}>다음</button>
              ) : (
                <button className="button" onClick={complete}>완료 후 허브로</button>
              )}
            </div>
          </div>

          <div className="panel" style={{ padding: 16 }}>
            <h3>로그인 선택</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="button" onClick={() => complete()}>일반 로그인</button>
              <button className="button" onClick={() => complete()}>소셜 로그인</button>
              <button className="button" onClick={() => complete()}>게스트 모드</button>
            </div>
            <div style={{ height: 12 }} />
            <div className="panel" style={{ padding: 12 }}>
              <strong>기업 로그인</strong>
              <p style={{ color: 'var(--muted)' }}>도메인 인증 안내</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


