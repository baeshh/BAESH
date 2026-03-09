import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export default function Ecosystem() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [currentStep, setCurrentStep] = useState(0);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  // Font Awesome 로드
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(link);

    // 폰트 로드
    const link1 = document.createElement('link');
    link1.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap';
    link1.rel = 'stylesheet';
    
    const link2 = document.createElement('link');
    link2.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@800&display=swap';
    link2.rel = 'stylesheet';
    
    document.head.appendChild(link1);
    document.head.appendChild(link2);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(link1)) document.head.removeChild(link1);
      if (document.head.contains(link2)) document.head.removeChild(link2);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 입자 수를 대폭 줄여서 시각적 피로도 감소
    const particleCount = 100;
    let particles: Particle[] = [];

    // 눈이 편한 파스텔톤 컬러 팔레트
    const colors = [
      'rgba(96, 165, 250, 0.6)', // Soft Blue
      'rgba(167, 139, 250, 0.6)', // Soft Purple
      'rgba(244, 114, 182, 0.4)', // Soft Pink
      'rgba(255, 255, 255, 0.3)'  // Low Opacity White
    ];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number;
      y: number;
      z: number;
      tx: number;
      ty: number;
      tz: number;
      size: number;
      color: string;
      speed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * width;
        
        this.tx = this.x;
        this.ty = this.y;
        this.tz = this.z;

        this.size = Math.random() * 4 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speed = 0.02 + Math.random() * 0.02;
      }

      setTarget(step: number) {
        const cx = width / 2;
        const cy = height / 2;
        const r = Math.min(width, height) * 0.25;

        if (step === 0) { // Intro: 넓게 퍼진 우주
          this.tx = Math.random() * width;
          this.ty = Math.random() * height;
          this.tz = Math.random() * 500;
        } 
        else if (step === 1) { // Projects: 중앙에 모여들지만 부유함
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * r * 1.5;
          this.tx = cx + Math.cos(angle) * dist;
          this.ty = cy + Math.sin(angle) * dist;
          this.tz = (Math.random() - 0.5) * 200;
        }
        else if (step === 2) { // Structure: 구체 표면에 정렬 (질서)
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          this.tx = cx + r * Math.sin(phi) * Math.cos(theta);
          this.ty = cy + r * Math.sin(phi) * Math.sin(theta);
          this.tz = r * Math.cos(phi);
        }
        else if (step === 3) { // Identity: 나선형 (DNA)
          const i = particles.indexOf(this);
          const angle = (i / particleCount) * Math.PI * 8;
          this.tx = cx + (r * 0.5) * Math.cos(angle);
          this.ty = (i / particleCount) * height * 0.6 + height * 0.2;
          this.tz = (r * 0.5) * Math.sin(angle);
        }
        else if (step === 4) { // Global: 화면 전체로 확산 (연결)
          const angle = Math.random() * Math.PI * 2;
          const dist = r * 2 + Math.random() * r;
          this.tx = cx + Math.cos(angle) * dist;
          this.ty = cy + Math.sin(angle) * dist;
          this.tz = (Math.random() - 0.5) * 500;
        }
      }

      update() {
        this.x += (this.tx - this.x) * this.speed;
        this.y += (this.ty - this.y) * this.speed;
        this.z += (this.tz - this.z) * this.speed;
        
        this.x += Math.sin(Date.now() * 0.001 + this.y) * 0.2;
        this.y += Math.cos(Date.now() * 0.001 + this.x) * 0.2;
      }

      draw(rotY: number, step: number) {
        const cx = width / 2;
        const cy = height / 2;
        
        let px = this.x - cx;
        let py = this.y - cy;
        let pz = this.z;

        const cos = Math.cos(rotY);
        const sin = Math.sin(rotY);
        
        let rx = px * cos - pz * sin;
        let rz = pz * cos + px * sin;
        
        let displayY = this.y;
        if (step === 3) {
          displayY = (this.y - height/2) + height/2;
        }

        const focal = 1000;
        const scale = focal / (focal + rz);
        
        const sx = cx + rx * scale;
        const sy = (displayY - cy) * scale + cy;

        ctx.beginPath();
        ctx.arc(sx, sy, this.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        ctx.shadowBlur = 15 * scale;
        ctx.shadowColor = this.color;
        
        ctx.globalAlpha = Math.max(0, Math.min(1, scale * 0.8));
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    }

    function init() {
      particles = [];
      for(let i=0; i<particleCount; i++) {
        particles.push(new Particle());
      }
      updateTarget(0);
    }

    function updateTarget(step: number) {
      particles.forEach(p => p.setTarget(step));
    }

    function drawConnections(rotY: number, step: number) {
      const cx = width / 2;
      const cy = height / 2;
      const focal = 1000;

      ctx.lineWidth = 0.5;
      
      if(step === 3) return; // DNA 단계에서는 연결선 생략

      for(let i=0; i<particleCount; i++) {
        const p1 = particles[i];
        let px1 = p1.x - cx;
        let pz1 = p1.z;
        let rx1 = px1 * Math.cos(rotY) - pz1 * Math.sin(rotY);
        let rz1 = pz1 * Math.cos(rotY) + px1 * Math.sin(rotY);
        let scale1 = focal / (focal + rz1);
        let sx1 = cx + rx1 * scale1;
        let sy1 = (p1.y - cy) * scale1 + cy;

        for(let j=i+1; j<particleCount; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

          if (dist < 100) {
            let px2 = p2.x - cx;
            let pz2 = p2.z;
            let rx2 = px2 * Math.cos(rotY) - pz2 * Math.sin(rotY);
            let rz2 = pz2 * Math.cos(rotY) + px2 * Math.sin(rotY);
            let scale2 = focal / (focal + rz2);
            let sx2 = cx + rx2 * scale2;
            let sy2 = (p2.y - cy) * scale2 + cy;

            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.lineTo(sx2, sy2);
            const opacity = (1 - dist/100) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.stroke();
          }
        }
      }
    }

    let rotY = 0;
    let step = 0;

    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      rotY += 0.002;

      particles.forEach(p => {
        p.update();
        p.draw(rotY, step);
      });
      drawConnections(rotY, step);

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    // 스크롤 옵저버
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          const stepNum = parseInt(entry.target.getAttribute('data-step') || '0');
          sectionsRef.current.forEach(s => {
            if (s) s.classList.remove('active');
          });
          entry.target.classList.add('active');
          
          if(step !== stepNum) {
            step = stepNum;
            setCurrentStep(stepNum);
            updateTarget(stepNum);
          }
        }
      });
    }, { threshold: 0.5 });

    init();
    animate();

    // 섹션 관찰 시작 (약간의 지연을 두어 DOM이 완전히 렌더링된 후 실행)
    const observeSections = () => {
      setTimeout(() => {
        sectionsRef.current.forEach(s => {
          if (s) observer.observe(s);
        });
      }, 100);
    };

    observeSections();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#050508',
        color: 'white',
        fontFamily: "'Inter', sans-serif",
        overflowX: 'hidden'
      }}
    >
      {/* Canvas 배경 */}
      <canvas
        ref={canvasRef}
        id="calm-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />

      {/* 네비게이션 */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 50,
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          mixBlendMode: 'difference'
        }}
      >
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          style={{
            pointerEvents: 'auto',
            fontSize: '20px',
            fontWeight: 700,
            fontFamily: "'Manrope', sans-serif",
            color: 'white',
            textDecoration: 'none'
          }}
        >
          BAESH.
        </a>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          style={{
            pointerEvents: 'auto',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          Exit
        </a>
      </nav>

      {/* 스크롤 컨테이너 */}
      <div className="scroll-container" style={{ position: 'relative', zIndex: 10 }}>
        {/* 섹션 0: Intro */}
        <section
          ref={(el) => {
            if (el) sectionsRef.current[0] = el;
          }}
          className="step-section active"
          data-step="0"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            opacity: 1,
            transition: 'opacity 1s ease'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontSize: 'clamp(48px, 7vw, 72px)',
                fontWeight: 800,
                fontFamily: "'Manrope', sans-serif",
                marginBottom: '24px',
                letterSpacing: '-0.02em'
              }}
            >
              The Ecosystem
            </h1>
            <p
              style={{
                fontSize: 'clamp(18px, 2vw, 20px)',
                color: 'rgba(96, 165, 250, 0.8)',
                fontWeight: 300
              }}
            >
              A journey from chaos to connection.
            </p>
            <div
              style={{
                marginTop: '64px',
                animation: 'bounce 2s infinite',
                color: 'rgba(96, 165, 250, 0.5)',
                fontSize: '24px'
              }}
            >
              <i className="fa-solid fa-arrow-down"></i>
            </div>
          </div>
        </section>

        {/* 섹션 1: Projects Start Here */}
        <section
          ref={(el) => {
            if (el) sectionsRef.current[1] = el;
          }}
          className="step-section"
          data-step="1"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            opacity: 0.3,
            transition: 'opacity 1s ease',
            position: 'relative'
          }}
        >
          <div
            className="bg-number"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '25vw',
              fontWeight: 900,
              color: 'rgba(255, 255, 255, 0.02)',
              zIndex: -1,
              fontFamily: "'Manrope', sans-serif",
              pointerEvents: 'none'
            }}
          >
            01
          </div>
          <div
            className="content-box"
            style={{
              maxWidth: '700px',
              textAlign: 'center',
              background: 'rgba(5, 5, 8, 0.6)',
              backdropFilter: 'blur(8px)',
              padding: '48px',
              borderRadius: '32px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
              transform: 'translateY(20px)',
              transition: 'transform 1s ease'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '12px',
                borderRadius: '16px',
                background: 'rgba(96, 165, 250, 0.1)',
                marginBottom: '24px',
                fontSize: '32px',
                color: '#60A5FA'
              }}
            >
              <i className="fa-solid fa-lightbulb"></i>
            </div>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 700,
                marginBottom: '16px',
                fontFamily: "'Manrope', sans-serif"
              }}
            >
              Projects Start Here
            </h2>
            <p
              style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: 1.8,
                fontWeight: 300
              }}
            >
              Scattered ideas come together to form projects.<br />
              Not mock tasks, but real <span style={{ color: '#60A5FA', fontWeight: 500 }}>execution</span> begins here.
            </p>
          </div>
        </section>

        {/* 섹션 2: Structure & Proof */}
        <section
          ref={(el) => {
            if (el) sectionsRef.current[2] = el;
          }}
          className="step-section"
          data-step="2"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            opacity: 0.3,
            transition: 'opacity 1s ease',
            position: 'relative'
          }}
        >
          <div
            className="bg-number"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '25vw',
              fontWeight: 900,
              color: 'rgba(255, 255, 255, 0.02)',
              zIndex: -1,
              fontFamily: "'Manrope', sans-serif",
              pointerEvents: 'none'
            }}
          >
            02
          </div>
          <div
            className="content-box"
            style={{
              maxWidth: '700px',
              textAlign: 'center',
              background: 'rgba(5, 5, 8, 0.6)',
              backdropFilter: 'blur(8px)',
              padding: '48px',
              borderRadius: '32px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
              transform: 'translateY(20px)',
              transition: 'transform 1s ease'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '12px',
                borderRadius: '16px',
                background: 'rgba(167, 139, 250, 0.1)',
                marginBottom: '24px',
                fontSize: '32px',
                color: '#A78BFA'
              }}
            >
              <i className="fa-solid fa-cubes"></i>
            </div>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 700,
                marginBottom: '16px',
                fontFamily: "'Manrope', sans-serif"
              }}
            >
              Structure & Proof
            </h2>
            <p
              style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: 1.8,
                fontWeight: 300
              }}
            >
              Chaotic efforts align into structured data.<br />
              Every contribution becomes verifiable <span style={{ color: '#A78BFA', fontWeight: 500 }}>proof</span>.
            </p>
          </div>
        </section>

        {/* 섹션 3: Your Unique Identity */}
        <section
          ref={(el) => {
            if (el) sectionsRef.current[3] = el;
          }}
          className="step-section"
          data-step="3"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            opacity: 0.3,
            transition: 'opacity 1s ease',
            position: 'relative'
          }}
        >
          <div
            className="bg-number"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '25vw',
              fontWeight: 900,
              color: 'rgba(255, 255, 255, 0.02)',
              zIndex: -1,
              fontFamily: "'Manrope', sans-serif",
              pointerEvents: 'none'
            }}
          >
            03
          </div>
          <div
            className="content-box"
            style={{
              maxWidth: '700px',
              textAlign: 'center',
              background: 'rgba(5, 5, 8, 0.6)',
              backdropFilter: 'blur(8px)',
              padding: '48px',
              borderRadius: '32px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
              transform: 'translateY(20px)',
              transition: 'transform 1s ease'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '12px',
                borderRadius: '16px',
                background: 'rgba(244, 114, 182, 0.1)',
                marginBottom: '24px',
                fontSize: '32px',
                color: '#F472B6'
              }}
            >
              <i className="fa-solid fa-fingerprint"></i>
            </div>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 700,
                marginBottom: '16px',
                fontFamily: "'Manrope', sans-serif"
              }}
            >
              Your Unique Identity
            </h2>
            <p
              style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: 1.8,
                fontWeight: 300
              }}
            >
              Proven data becomes your unique <span style={{ color: '#F472B6', fontWeight: 500 }}>career DNA</span>.<br />
              A living record that cannot be contained in a single resume.
            </p>
          </div>
        </section>

        {/* 섹션 4: Global Connection */}
        <section
          ref={(el) => {
            if (el) sectionsRef.current[4] = el;
          }}
          className="step-section"
          data-step="4"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            opacity: 0.3,
            transition: 'opacity 1s ease',
            position: 'relative'
          }}
        >
          <div
            className="bg-number"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '25vw',
              fontWeight: 900,
              color: 'rgba(255, 255, 255, 0.02)',
              zIndex: -1,
              fontFamily: "'Manrope', sans-serif",
              pointerEvents: 'none'
            }}
          >
            04
          </div>
          <div
            className="content-box"
            style={{
              maxWidth: '700px',
              textAlign: 'center',
              background: 'rgba(5, 5, 8, 0.6)',
              backdropFilter: 'blur(8px)',
              padding: '48px',
              borderRadius: '32px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
              transform: 'translateY(20px)',
              transition: 'transform 1s ease'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '12px',
                borderRadius: '16px',
                background: 'rgba(34, 197, 94, 0.1)',
                marginBottom: '24px',
                fontSize: '32px',
                color: '#22C55E'
              }}
            >
              <i className="fa-solid fa-earth-americas"></i>
            </div>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 700,
                marginBottom: '16px',
                fontFamily: "'Manrope', sans-serif"
              }}
            >
              Global Connection
            </h2>
            <p
              style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: 1.8,
                fontWeight: 300,
                marginBottom: '32px'
              }}
            >
              Ready talent connects across borders.<br />
              Teams and startups around the world are waiting for you.
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                borderRadius: '9999px',
                background: 'white',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(96, 165, 250, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#EFF6FF';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Join BAESH Now
            </button>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }

        .step-section.active {
          opacity: 1 !important;
        }

        .step-section.active .content-box {
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
}
