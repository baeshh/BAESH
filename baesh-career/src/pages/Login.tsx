import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Modal from "../components/Modal";
import { apiGet, apiPost } from "../utils/api";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";

function validateEmail(v: string) {
  return /.+@.+\..+/.test(v);
}

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const { t } = useTranslation();
  const nav = useNavigate();
  const loc = useLocation() as ReturnType<typeof useLocation> & {
    state?: { from?: { pathname?: string } };
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(() => {
    return !!localStorage.getItem('baesh-language');
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const isInteractingRef = useRef(false);

  const canSubmit = useMemo(
    () => validateEmail(email) && password.length >= 8,
    [email, password]
  );

  // Font Awesome 로드
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Google Fonts 로드
  useEffect(() => {
    const link1 = document.createElement('link');
    link1.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=swap';
    link1.rel = 'stylesheet';
    document.head.appendChild(link1);
    return () => {
      if (document.head.contains(link1)) {
        document.head.removeChild(link1);
      }
    };
  }, []);

  // 반응형 처리
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      if (!isAuthenticated) return;
      
      if (loc?.state?.from?.pathname) {
        nav(loc.state.from.pathname, { replace: true });
        return;
      }
      
      try {
        const profile = await apiGet<{ onboardingCompleted?: boolean }>('/users/profile');
        if (profile.onboardingCompleted) {
          nav('/profile', { replace: true });
        } else {
          nav('/onboarding', { replace: true });
        }
      } catch (error) {
        console.error('온보딩 상태 확인 실패:', error);
        nav('/onboarding', { replace: true });
      }
    };
    
    if (isAuthenticated) {
      checkOnboardingAndRedirect();
    }
  }, [isAuthenticated, nav, loc?.state?.from?.pathname]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSubmitting(true);
    
    try {
      const data = await apiPost<{ token: string; user: { id: string; email: string; name: string } }>('/auth/login', {
        email,
        password,
      });

      login(data.token, data.user);
      try {
        const profile = await apiGet<{ onboardingCompleted?: boolean }>('/users/profile');
        if (profile.onboardingCompleted) {
          nav('/profile', { replace: true });
        } else {
          nav('/onboarding', { replace: true });
        }
      } catch (error) {
        console.error('온보딩 상태 확인 실패:', error);
        nav('/onboarding', { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || '로그인에 실패했습니다.');
      setSubmitting(false);
    }
  };

  const startOAuth = (p: string) => {
    setProvider(p);
    setConsentOpen(true);
  };

  const confirmOAuth = async () => {
    setConsentOpen(false);
    setSubmitting(true);
    setTimeout(async () => {
      login('dummy-token', { id: 'user-oauth', email: 'oauth@example.com', name: 'OAuth User' });
      try {
        const profile = await apiGet<{ onboardingCompleted?: boolean }>('/users/profile');
        if (profile.onboardingCompleted) {
          nav('/profile', { replace: true });
        } else {
          nav('/onboarding', { replace: true });
        }
      } catch (error) {
        console.error('온보딩 상태 확인 실패:', error);
        nav('/onboarding', { replace: true });
      }
    }, 600);
  };

  // 파티클 애니메이션
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = isMobile ? window.innerWidth : window.innerWidth * 0.6;
    let height = isMobile ? window.innerHeight * 0.4 : window.innerHeight;

    const colors = ['#60A5FA', '#A855F7', '#EC4899', '#ffffff'];

    class Particle {
      x: number;
      y: number;
      baseSize: number;
      size: number;
      baseSpeedX: number;
      baseSpeedY: number;
      speedX: number;
      speedY: number;
      color: string;
      baseAlpha: number;
      alpha: number;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseSize = Math.random() * 2.5 + 0.5;
        this.size = this.baseSize;
        this.baseSpeedX = (Math.random() - 0.5) * 0.8;
        this.baseSpeedY = (Math.random() - 0.5) * 0.8;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.baseAlpha = Math.random() * 0.4 + 0.1;
        this.alpha = this.baseAlpha;
      }

      update() {
        const interacting = isInteractingRef.current;
        if (interacting) {
          this.speedX = this.baseSpeedX * 3;
          this.speedY = this.baseSpeedY * 3;
          this.size = Math.min(this.baseSize * 1.5, 5);
          this.alpha = Math.min(this.baseAlpha * 2, 0.8);
        } else {
          this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
          this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
          this.size += (this.baseSize - this.size) * 0.05;
          this.alpha += (this.baseAlpha - this.alpha) * 0.05;
        }

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    let particles: Particle[] = [];

    function resize() {
      width = isMobile ? window.innerWidth : window.innerWidth * 0.6;
      height = isMobile ? window.innerHeight * 0.4 : window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      init();
    }

    function init() {
      particles = [];
      const count = isMobile ? 80 : 150;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function drawConnections() {
      const maxDistance = isInteractingRef.current ? 120 : 80;
      ctx.lineWidth = isInteractingRef.current ? 0.8 : 0.4;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const opacity = (1 - dist / maxDistance) * (isInteractingRef.current ? 0.5 : 0.2);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isInteractingRef.current 
              ? `rgba(96, 165, 250, ${opacity})` 
              : `rgba(255, 255, 255, ${opacity})`;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.fillStyle = isInteractingRef.current 
        ? 'rgba(0, 0, 0, 0.2)' 
        : 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      drawConnections();
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    resize();
    animate();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMobile]);

  // 인터랙션 상태 동기화
  useEffect(() => {
    isInteractingRef.current = isInteracting;
  }, [isInteracting]);

  const startInteraction = () => setIsInteracting(true);
  const endInteraction = () => setIsInteracting(false);

  // 언어 선택 모달
  if (!languageSelected) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: 500, width: '100%', padding: '2rem' }}>
          <LanguageSelector 
            onLanguageSelected={(lang) => {
              setLanguageSelected(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      width: '100vw',
      height: '100vh',
      background: '#000000',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden'
    }}>
      {/* 왼쪽 비주얼 영역 */}
      <section style={{
        position: 'relative',
        width: isMobile ? '100%' : '60%',
        height: isMobile ? '40%' : '100%',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '2rem' : '4rem',
          left: isMobile ? '2rem' : '4rem',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <h2 style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '1rem',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            Welcome to<br />Your <span style={{
              background: 'linear-gradient(135deg, #60A5FA 0%, #A855F7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Project Core.</span>
          </h2>
          <p style={{
            color: '#D1D5DB',
            fontSize: isMobile ? '0.9rem' : '1.125rem',
            maxWidth: '28rem',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
          }}>
            당신의 프로젝트가 곧 실력이 되고,<br />
            그 실력이 글로벌 커리어로 연결됩니다.
          </p>
        </div>
      </section>

      {/* 오른쪽 입력 폼 영역 */}
      <section style={{
        width: isMobile ? '100%' : '40%',
        height: isMobile ? '60%' : '100%',
        background: 'rgba(10, 10, 12, 0.95)',
        backdropFilter: 'blur(30px)',
        borderLeft: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
        borderTop: isMobile ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: isMobile ? '2rem' : '4rem',
        position: 'relative',
        zIndex: 20
      }}>
        <div style={{
          maxWidth: '28rem',
          width: '100%',
          margin: '0 auto',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          <div style={{ marginBottom: '3rem' }}>
            <h1 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#3B82F6',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
              Connect Your Identity
            </h1>
            <p style={{ color: '#9CA3AF' }}>
              프로젝트, 스킬, 그리고 글로벌 네트워크에 접속하세요.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={startInteraction}
                onBlur={endInteraction}
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '1rem 1rem 1rem 3rem',
                  borderRadius: '0.75rem',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  startInteraction();
                  e.currentTarget.style.background = 'rgba(96, 165, 250, 0.05)';
                  e.currentTarget.style.borderColor = '#60A5FA';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(96, 165, 250, 0.1), 0 0 20px rgba(96, 165, 250, 0.1)';
                }}
                onBlur={(e) => {
                  endInteraction();
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <i className="fa-solid fa-envelope" style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B7280',
                transition: 'color 0.3s ease',
                pointerEvents: 'none'
              }} />
            </div>

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={startInteraction}
                onBlur={endInteraction}
                required
                minLength={8}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '1rem 1rem 1rem 3rem',
                  borderRadius: '0.75rem',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  startInteraction();
                  e.currentTarget.style.background = 'rgba(96, 165, 250, 0.05)';
                  e.currentTarget.style.borderColor = '#60A5FA';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(96, 165, 250, 0.1), 0 0 20px rgba(96, 165, 250, 0.1)';
                }}
                onBlur={(e) => {
                  endInteraction();
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <i className="fa-solid fa-lock" style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B7280',
                transition: 'color 0.3s ease',
                pointerEvents: 'none'
              }} />
              <Link
                to="/forgot"
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#60A5FA'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
              >
                Forgot?
              </Link>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.5rem',
                color: '#FCA5A5',
                fontSize: '0.875rem',
                marginBottom: '1.5rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                color: '#ffffff',
                fontSize: '1.125rem',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                border: 'none',
                cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
                opacity: canSubmit && !submitting ? 1 : 0.5,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (canSubmit && !submitting) {
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {submitting ? 'Entering...' : 'Enter the Project Network '}
              {!submitting && <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }} />}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '0.75rem',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '1rem',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ width: '2rem', height: '1px', background: 'rgba(31, 41, 55, 1)' }} />
              Or connect via
              <span style={{ width: '2rem', height: '1px', background: 'rgba(31, 41, 55, 1)' }} />
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => startOAuth("Google")}
                style={{
                  padding: '0.75rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  color: '#9CA3AF'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#9CA3AF';
                }}
              >
                <i className="fab fa-google" />
              </button>
              <button
                onClick={() => startOAuth("GitHub")}
                style={{
                  padding: '0.75rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  color: '#9CA3AF'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#9CA3AF';
                }}
              >
                <i className="fab fa-github" />
              </button>
              <button
                onClick={() => startOAuth("LinkedIn")}
                style={{
                  padding: '0.75rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  color: '#9CA3AF'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#3B82F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#9CA3AF';
                }}
              >
                <i className="fab fa-linkedin-in" />
              </button>
            </div>
            <p style={{ color: '#9CA3AF' }}>
              New here?{' '}
              <Link
                to="/signup"
                style={{
                  color: '#60A5FA',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#93C5FD'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#60A5FA'}
              >
                Create your project profile
              </Link>
            </p>
            <div style={{ marginTop: '2rem' }}>
              <button
                onClick={() => nav("/preview")}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#9CA3AF';
                }}
              >
                {t('login.title') === 'Login' 
                  ? 'Browse without logging in'
                  : '로그인 없이 둘러보기'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        title={`데이터 수집 동의 (${provider ?? ""})`}
      >
        <p style={{ color: "var(--muted)" }}>
          첫 소셜 로그인 시 프로필(이름/이메일/이미지)과 공개 활동 데이터를
          불러옵니다. 개인화 추천을 위해 동의가 필요합니다.
        </p>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 12,
          }}
        >
          <button className="badge" onClick={() => setConsentOpen(false)}>
            취소
          </button>
          <button className="button" onClick={confirmOAuth}>
            동의하고 계속
          </button>
        </div>
      </Modal>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
