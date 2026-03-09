import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiGet } from '../utils/api';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const handleJoinClick = async () => {
    // 로그인되지 않은 경우 로그인 페이지로 이동
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // 로그인된 경우 온보딩 완료 여부 확인
    try {
      const profile = await apiGet<{ onboardingCompleted?: boolean }>('/users/profile');
      if (profile.onboardingCompleted) {
        navigate('/profile', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (error) {
      console.error('온보딩 상태 확인 실패:', error);
      // 에러 시 온보딩으로 이동
      navigate('/onboarding', { replace: true });
    }
  };

  const handleViewEcosystem = () => {
    navigate('/ecosystem');
  };

  // 반응형 처리
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 폰트 로드
  useEffect(() => {
    const link1 = document.createElement('link');
    link1.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap';
    link1.rel = 'stylesheet';
    
    const link2 = document.createElement('link');
    link2.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@800&display=swap';
    link2.rel = 'stylesheet';
    
    document.head.appendChild(link1);
    document.head.appendChild(link2);
    
    return () => {
      if (document.head.contains(link1)) document.head.removeChild(link1);
      if (document.head.contains(link2)) document.head.removeChild(link2);
    };
  }, []);

  // Genesis Network 애니메이션 (구형 3D 파티클 네트워크)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 설정값
    const particleCount = window.innerWidth < 768 ? 180 : 350;
    const sphereRadius = window.innerWidth < 768 ? 150 : 280;
    const connectionDistance = window.innerWidth < 768 ? 60 : 100;
    const focalLength = 800;

    // 애니메이션 상태 변수
    let formationProgress = 0;
    let rotationAngleX = 0;
    let rotationAngleY = 0;

    // 브랜드 컬러 팔레트 (세포/원자 색상)
    const cellColors = [
      '#FFFFFF', // White
      '#60A5FA', // Blue
      '#A855F7', // Purple
      '#EC4899'  // Pink
    ];

    class Particle {
      startX: number;
      startY: number;
      startZ: number;
      targetX: number;
      targetY: number;
      targetZ: number;
      currentX: number;
      currentY: number;
      currentZ: number;
      rotatedX: number;
      rotatedY: number;
      rotatedZ: number;
      color: string;
      size: number;
      formationSpeed: number;
      myProgress: number;

      constructor() {
        // 1. 초기 상태: 화면 전체에 넓게 퍼진 무작위 위치
        this.startX = (Math.random() - 0.5) * width * 1.5;
        this.startY = (Math.random() - 0.5) * height * 1.5;
        this.startZ = (Math.random() - 0.5) * width;

        // 2. 목표 상태: 구(Sphere) 표면의 위치 계산 (구면 좌표계)
        const theta = Math.random() * Math.PI * 2; // 경도
        const phi = Math.acos((Math.random() * 2) - 1); // 위도
        
        this.targetX = sphereRadius * Math.sin(phi) * Math.cos(theta);
        this.targetY = sphereRadius * Math.sin(phi) * Math.sin(theta);
        this.targetZ = sphereRadius * Math.cos(phi);

        // 현재 위치 (애니메이션 중 변화)
        this.currentX = this.startX;
        this.currentY = this.startY;
        this.currentZ = this.startZ;

        // 3D 회전 후의 최종 위치 저장용
        this.rotatedX = 0;
        this.rotatedY = 0;
        this.rotatedZ = 0;

        this.color = cellColors[Math.floor(Math.random() * cellColors.length)];
        this.size = 1.5 + Math.random() * 2.5; // 세포 크기
        // 각 입자마다 형성 속도를 다르게 하여 자연스럽게
        this.formationSpeed = 0.005 + Math.random() * 0.01;
        this.myProgress = 0;
      }

      update() {
        // 형성 진행도 업데이트 (서서히 목표 지점으로 이동)
        if (this.myProgress < 1) {
          this.myProgress += this.formationSpeed;
          if (this.myProgress > 1) this.myProgress = 1;
          
          // 이징 함수 (부드러운 감속) 적용
          const ease = 1 - Math.pow(1 - this.myProgress, 3);
          
          // 시작점에서 목표점까지 선형 보간(Lerp)
          this.currentX = this.startX + (this.targetX - this.startX) * ease;
          this.currentY = this.startY + (this.targetY - this.startY) * ease;
          this.currentZ = this.startZ + (this.targetZ - this.startZ) * ease;
        }
        
        // 전역 형성 진행도 업데이트 (가장 느린 입자 기준)
        formationProgress = Math.max(formationProgress, this.myProgress);

        // 3D 회전 적용 (형성이 어느 정도 진행된 후부터 회전 시작)
        let rotX = this.currentX;
        let rotY = this.currentY;
        let rotZ = this.currentZ;

        // 구 형태가 갖춰지면 회전 적용
        if (formationProgress > 0.5) {
          // Y축 회전 (지구 자전)
          const cosY = Math.cos(rotationAngleY);
          const sinY = Math.sin(rotationAngleY);
          const x1 = rotX * cosY - rotZ * sinY;
          const z1 = rotZ * cosY + rotX * sinY;
          rotX = x1;
          rotZ = z1;

          // X축 회전 (약간 기울임)
          const cosX = Math.cos(rotationAngleX);
          const sinX = Math.sin(rotationAngleX);
          const y2 = rotY * cosX - rotZ * sinX;
          const z2 = rotZ * cosX + rotY * sinX;
          rotY = y2;
          rotZ = z2;
        }

        // 회전된 최종 3D 좌표 저장
        this.rotatedX = rotX;
        this.rotatedY = rotY;
        this.rotatedZ = rotZ;
      }

      // 3D 좌표를 2D 화면에 투영(Projection)하여 그리기
      drawDot() {
        if (!ctx) return;
        
        // 원근 계산
        const scale = focalLength / (focalLength - this.rotatedZ);
        // 화면 뒤에 있는 점은 그리지 않음
        if (scale < 0) return;

        const screenX = width / 2 + this.rotatedX * scale;
        const screenY = height / 2 + this.rotatedY * scale;

        // 멀리 있는 것은 작고 투명하게
        const opacity = Math.min(1, scale * 0.7 + 0.3);
        const currentSize = this.size * scale;

        ctx.beginPath();
        ctx.arc(screenX, screenY, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.globalAlpha = 1; // 투명도 리셋
      }
    }

    let particles: Particle[] = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function init() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
      formationProgress = 0;
      rotationAngleX = 0;
      rotationAngleY = 0;
    }

    function animate() {
      if (!ctx) return;
      
      // 배경색: 완전한 리얼 블랙
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // 회전 각도 업데이트
      if (formationProgress > 0.8) {
        rotationAngleY += 0.003;
        rotationAngleX = Math.sin(rotationAngleY * 0.5) * 0.2;
      }

      // 모든 입자 위치 업데이트
      particles.forEach(p => p.update());

      // 네트워크 연결선 그리기
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.rotatedZ > focalLength * 0.5) continue;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.rotatedZ > focalLength * 0.5) continue;

          const dx = p1.rotatedX - p2.rotatedX;
          const dy = p1.rotatedY - p2.rotatedY;
          const dz = p1.rotatedZ - p2.rotatedZ;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDistance) {
            const opacity = 1 - (dist / connectionDistance);
            
            const scale1 = focalLength / (focalLength - p1.rotatedZ);
            const scale2 = focalLength / (focalLength - p2.rotatedZ);
            
            const sx1 = width / 2 + p1.rotatedX * scale1;
            const sy1 = height / 2 + p1.rotatedY * scale1;
            const sx2 = width / 2 + p2.rotatedX * scale2;
            const sy2 = height / 2 + p2.rotatedY * scale2;

            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.lineTo(sx2, sy2);
            ctx.strokeStyle = `rgba(100, 150, 255, ${opacity * 0.3})`;
            ctx.stroke();
          }
        }
      }

      // 세포/원자(점) 그리기 (Z축 정렬)
      particles.sort((a, b) => b.rotatedZ - a.rotatedZ);
      particles.forEach(p => p.drawDot());

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    resize();
    init();
    animate();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        init();
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000000',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Canvas 배경 */}
      <canvas
        ref={canvasRef}
        id="genesis-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />

      {/* 메인 콘텐츠 */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1152px',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        {/* 배지 */}
        <div
          style={{
            marginBottom: 40,
            animation: 'fadeInUp 0.8s ease-out 0.2s both',
            pointerEvents: 'auto'
          }}
        >
          <span
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              border: '1px solid rgba(31, 41, 55, 1)',
              background: 'rgba(17, 24, 39, 0.8)',
              color: '#9CA3AF',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase'
            }}
          >
            PROJECT-BASED GLOBAL CAREER PLATFORM
          </span>
        </div>

        {/* 메인 타이틀 */}
        <h1
          style={{
            fontSize: 'clamp(48px, 8vw, 128px)',
            fontWeight: 800,
            marginBottom: 24,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            fontFamily: "'Manrope', sans-serif",
            color: '#ffffff',
            margin: '0 0 24px 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            pointerEvents: 'auto'
          }}
        >
          TURN PROJECTS <br />
          <span className="brand-gradient-text">
            INTO CAREERS
          </span>
        </h1>

        {/* 설명 텍스트 */}
        <p
          style={{
            color: '#D1D5DB',
            fontSize: 'clamp(16px, 2vw, 20px)',
            maxWidth: '672px',
            marginBottom: 48,
            lineHeight: 1.75,
            fontWeight: 300,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto'
          }}
        >
          Join real projects across borders.<br />
          Build proof of skills.<br />
          Connect your work to jobs and startups.
        </p>

        {/* 버튼 그룹 */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 20,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'auto'
          }}
        >
          {/* Start Your Journey 버튼 */}
          <button
            onClick={handleJoinClick}
            style={{
              position: 'relative',
              padding: '16px 40px',
              borderRadius: '9999px',
              fontWeight: 700,
              color: '#ffffff',
              overflow: 'hidden',
              transition: 'transform 0.2s ease',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(to right, #2563EB, #9333EA, #EC4899)',
              opacity: 0.9
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '0.9';
            }}
          >
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
              Start Your Journey
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ width: 20, height: 20 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </button>

          {/* View Ecosystem 버튼 */}
          <button
            onClick={handleViewEcosystem}
            style={{
              padding: '16px 40px',
              borderRadius: '9999px',
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontWeight: 500,
              transition: 'background-color 0.2s ease',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(20, 20, 20, 0.6)';
            }}
          >
            View Ecosystem
          </button>
        </div>
      </main>

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

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .brand-gradient-text {
          background-image: linear-gradient(135deg, #60A5FA 0%, #A78BFA 35%, #C084FC 65%, #F472B6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: gradientMove 5s ease infinite;
          display: inline-block;
          color: #60A5FA;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
}
