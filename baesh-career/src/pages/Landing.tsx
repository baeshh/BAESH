import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleJoinClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/profile', { replace: true });
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css';
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.2 }
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-root">
      <header>
        <nav className="nav-links">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#community">Community</a>
        </nav>
        <button className="nav-btn" onClick={handleJoinClick}>Get Started</button>
      </header>

      <main className="hero">
        <img src="/baesh-logo-main.png" alt="BAESH 3D Logo" className="floating-logo" />

        <div className="content">
          <div className="badge">PROJECT-BASED GLOBAL CAREER PLATFORM</div>

          <h1 className="title-eng">
            TURN PROJECTS
            <br />
            INTO CAREERS
          </h1>

          <h2 className="title-kor">
            프로젝트가 커리어가 되는 생태계,
            <br />
            당신의 꿈을 펼쳐보세요
          </h2>

          <p className="desc">
            Join real projects across borders.
            <br />
            Build proof of skills.
            <br />
            Connect your work to jobs and startups.
          </p>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={handleJoinClick}>Start Your Journey →</button>
          </div>
        </div>

        <button
          className="hero-scroll-cue"
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="다음 섹션으로 스크롤"
        >
          <span>Scroll to explore</span>
          <i />
        </button>
      </main>

      <section id="about" className="story-section">
        <div className="story-container">
          <div className="text-box reveal">
            <h2>
              이제 실행은
              <br />
              <span className="highlight-purple">AI 에이전트</span>가
              <br />
              대신하는 세상입니다.
            </h2>
            <p>
              누구나 쉽게 아이디어를 프로덕트로 만들 수 있습니다.
              <br />
              중요한 것은 아이디어가 아니라, 그것을 실제로 구현해 낸 프로젝트의 경험 그
              자체입니다.
            </p>
          </div>
          <div className="visual-box reveal delay-1">
            <div className="agent-orb">
              <img src="/baesh-logo-main.png" alt="" className="agent-bg-logo" aria-hidden="true" />
              <span className="agent-particle p1" />
              <span className="agent-particle p2" />
              <span className="agent-particle p3" />
              <span className="agent-ring r1" />
              <span className="agent-ring r2" />
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="story-section muted-section">
        <div className="story-container reverse">
          <div className="text-box reveal">
            <h2>
              하지만 그 프로젝트들을
              <br />
              담아낼 <span className="highlight-blue">생태계</span>가 없습니다.
            </h2>
            <p>
              기존의 이력서로는 당신의 능력을 다 담을 수 없고, 기껏 만든 프로젝트는
              파편화되어 사라집니다.
              <br />
              프로젝트 단위로 지원하고, 커리어를 증명할 플랫폼이 부재합니다.
            </p>
          </div>
          <div className="visual-box reveal delay-1">
            <div className="glass-card card-1">Lost Project</div>
            <div className="glass-card card-2">Empty Space</div>
            <div className="glass-card card-3" />
          </div>
        </div>
      </section>

      <section id="community" className="ecosystem-section">
        <div className="eco-header reveal">
          <h2>
            그래서 우리는
            <br />
            열띤 네트워킹과 도전이 담긴
            <br />
            <span className="highlight-blue">진짜 생태계</span>를 만듭니다.
          </h2>
        </div>

        <div className="network-container reveal delay-1">
          <div className="line line-tl" />
          <div className="line line-tr" />
          <div className="line line-bl" />
          <div className="line line-br" />

          <div className="node node-tl">
            <div className="node-dot" />
            <span>Passion</span>
          </div>
          <div className="node node-tr">
            <div className="node-dot" />
            <span>Growth</span>
          </div>
          <div className="node node-bl">
            <div className="node-dot" />
            <span>Network</span>
          </div>
          <div className="node node-br">
            <div className="node-dot" />
            <span>Ideas</span>
          </div>

          <div className="logo-core">
            <img src="/baesh-logo-main.png" alt="BAESH logo" />
          </div>
        </div>

        <div className="eco-footer reveal delay-2">
          <p>
            수많은 프로젝트들이 하나로 연결되고, 서로의 비전이 교차하는 곳.
            <br />
            단순한 구직을 넘어, 당신의 프로젝트가 곧 가장 강력한 포트폴리오가 되는 플랫폼입니다.
          </p>
          <button className="join-bottom-btn" onClick={handleJoinClick}>합류하기 →</button>
        </div>
      </section>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Pretendard', sans-serif;
        }

        .landing-root {
          background-color: #FFFFFF;
          color: #191F28;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
        }

        .reveal {
          opacity: 0;
          transform: translateY(50px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        .delay-1 { transition-delay: 0.1s; }

        header {
          width: 100%;
          max-width: 1200px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px 40px;
          position: relative;
          z-index: 100;
        }

        .nav-links { display: flex; gap: 32px; }
        .nav-links a {
          text-decoration: none;
          color: #6B7684;
          font-weight: 500;
          font-size: 1rem;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #191F28; }

        .nav-btn {
          position: absolute;
          right: 40px;
          padding: 10px 24px;
          border-radius: 30px;
          border: 1px solid #E5E8EB;
          background: #FFFFFF;
          color: #191F28;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-btn:hover {
          background: #F9FAFB;
          border-color: #D1D6DB;
        }

        .hero {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          width: 100%;
          min-height: calc(100vh - 76px);
          text-align: center;
          padding-bottom: 60px;
        }

        .floating-logo {
          position: absolute;
          top: 48%;
          left: 50%;
          width: 520px;
          height: auto;
          z-index: 0;
          opacity: 0.22;
          animation: float-logo 6s ease-in-out infinite;
          filter: blur(0.2px) drop-shadow(0 28px 55px rgba(49, 130, 246, 0.18));
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 20px;
          text-shadow: 0 4px 20px rgba(255, 255, 255, 0.8);
        }

        .badge {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #4E5968;
          margin-bottom: 24px;
          background: rgba(255, 255, 255, 0.8);
          padding: 8px 20px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          backdrop-filter: blur(10px);
          text-shadow: none;
        }

        .title-eng {
          font-size: 5.5rem;
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.04em;
          color: #111418;
          margin-bottom: 24px;
          text-shadow: 0 2px 16px rgba(255, 255, 255, 0.95);
        }

        .title-kor {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: -0.03em;
          color: #191F28;
          margin-bottom: 24px;
          text-shadow: 0 2px 14px rgba(255, 255, 255, 0.9);
        }

        .desc {
          font-size: 1.1rem;
          font-weight: 500;
          color: #4E5968;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .btn-group { display: flex; gap: 16px; text-shadow: none; }

        .btn {
          padding: 16px 32px;
          border-radius: 30px;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(90deg, #3B82F6 0%, #D946EF 100%);
          color: #ffffff;
          box-shadow: 0 8px 16px rgba(217, 70, 239, 0.2);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(217, 70, 239, 0.3);
        }

        .btn-secondary {
          background: #FFFFFF;
          color: #191F28;
          border: 1px solid #E5E8EB;
        }
        .btn-secondary:hover {
          background: #F9FAFB;
          transform: translateY(-2px);
        }

        .hero-scroll-cue {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: #8B95A1;
          background: transparent;
          border: none;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          cursor: pointer;
          animation: scroll-cue-float 2.4s ease-in-out infinite;
        }

        .hero-scroll-cue i {
          width: 2px;
          height: 46px;
          border-radius: 999px;
          background: linear-gradient(to bottom, #8B95A1, rgba(139, 149, 161, 0));
          display: block;
          position: relative;
          overflow: hidden;
        }

        .hero-scroll-cue i::after {
          content: '';
          position: absolute;
          top: -18px;
          left: 0;
          width: 100%;
          height: 18px;
          border-radius: 999px;
          background: #3182F6;
          animation: scroll-line-drop 1.8s ease-in-out infinite;
        }

        .story-section {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 100px 20px;
          background: #FAFAFC;
        }

        .muted-section {
          background: #F2F4F6;
        }

        .story-container {
          max-width: 1040px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .reverse {
          direction: rtl;
        }

        .reverse > * {
          direction: ltr;
        }

        .center-story {
          grid-template-columns: 1fr;
          text-align: center;
        }

        .text-box h2 {
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1.3;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
          word-break: keep-all;
        }

        .highlight-blue {
          background: linear-gradient(135deg, #3182F6 0%, #1B64DA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .highlight-purple {
          background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .text-box p {
          font-size: 1.25rem;
          color: #6B7684;
          line-height: 1.6;
          word-break: keep-all;
        }

        .visual-box {
          position: relative;
          height: 400px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .agent-orb {
          width: 220px;
          height: 220px;
          position: relative;
          display: grid;
          place-items: center;
          filter: drop-shadow(0 28px 60px rgba(49, 130, 246, 0.22));
        }

        .agent-bg-logo {
          position: absolute;
          width: 360px;
          height: auto;
          opacity: 0.16;
          z-index: 1;
          transform: translateY(2px);
          filter: blur(0.2px) saturate(1.2);
          pointer-events: none;
        }

        .agent-orb::before {
          content: '';
          position: absolute;
          width: 112px;
          height: 112px;
          border-radius: 999px;
          background:
            radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.2) 18%, transparent 32%),
            linear-gradient(135deg, #3182F6 0%, #8B5CF6 55%, #D946EF 100%);
          box-shadow:
            0 20px 55px rgba(139, 92, 246, 0.28),
            inset -14px -16px 32px rgba(25, 31, 40, 0.18);
          animation: breathe-orb 4s ease-in-out infinite;
          z-index: 3;
        }

        .agent-orb::after {
          content: '';
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(49,130,246,0.12), transparent 62%);
          animation: glow-pulse 5s ease-in-out infinite;
          z-index: 0;
        }

        .agent-ring {
          position: absolute;
          border-radius: 999px;
          border: 1.5px solid rgba(139, 92, 246, 0.22);
          z-index: 2;
        }

        .agent-ring.r1 {
          width: 178px;
          height: 178px;
          transform: rotate(22deg) skewX(12deg);
          animation: orbit-spin-a 9s linear infinite;
        }

        .agent-ring.r2 {
          width: 220px;
          height: 128px;
          transform: rotate(-28deg);
          border-color: rgba(49, 130, 246, 0.24);
          animation: orbit-spin-b 12s linear infinite reverse;
        }

        .agent-particle {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 999px;
          z-index: 4;
        }

        .agent-particle.p1 {
          background: #D946EF;
          box-shadow: 0 0 18px rgba(217, 70, 239, 0.75);
          animation: particle-path-1 4.5s ease-in-out infinite;
        }

        .agent-particle.p2 {
          width: 9px;
          height: 9px;
          background: #3182F6;
          box-shadow: 0 0 16px rgba(49, 130, 246, 0.7);
          animation: particle-path-2 5.2s ease-in-out infinite;
        }

        .agent-particle.p3 {
          width: 7px;
          height: 7px;
          background: #00C471;
          box-shadow: 0 0 14px rgba(0, 196, 113, 0.65);
          animation: particle-path-3 6s ease-in-out infinite;
        }

        .glass-card {
          position: absolute;
          width: 220px;
          height: 140px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #B0B8C1;
          font-weight: 600;
        }

        .card-1 { transform: rotate(-10deg) translate(-40px, -40px); }
        .card-2 {
          transform: rotate(5deg) translate(40px, 40px);
          background: transparent;
          border: 2px dashed #D1D6DB;
        }
        .card-3 { transform: rotate(15deg) translate(20px, -60px); opacity: 0.5; }

        .ecosystem-section {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 100px 20px;
          background: #FFFFFF;
          overflow: hidden;
        }

        .eco-header {
          text-align: center;
          margin-bottom: 60px;
          z-index: 20;
        }

        .eco-header h2 {
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1.3;
          letter-spacing: -0.03em;
          color: #191F28;
          word-break: keep-all;
        }

        .network-container {
          position: relative;
          width: 100%;
          max-width: 800px;
          height: 460px;
          margin: 0 auto 60px auto;
        }

        .logo-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 220px;
          height: 220px;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float-logo-center 5s ease-in-out infinite;
        }

        .logo-core img {
          width: 180px;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 24px 45px rgba(49, 130, 246, 0.24));
        }

        .logo-core::before,
        .logo-core::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px dashed rgba(49, 130, 246, 0.4);
          pointer-events: none;
        }

        .logo-core::before {
          width: 260px;
          height: 260px;
          animation: spin-orbit 20s linear infinite;
        }

        .logo-core::after {
          width: 320px;
          height: 320px;
          border: 1px dashed rgba(139, 92, 246, 0.3);
          animation: spin-orbit 30s linear infinite reverse;
        }

        .node {
          position: absolute;
          width: 130px;
          height: 130px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 1);
          border-radius: 50%;
          backdrop-filter: blur(12px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05), inset 0 2px 5px rgba(255, 255, 255, 1);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 5;
          animation: float-node 6s ease-in-out infinite;
        }

        .node-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-bottom: 12px;
        }

        .node span {
          font-size: 0.95rem;
          font-weight: 700;
          color: #333D4B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .node-tl { top: 0; left: 10%; animation-delay: 0s; }
        .node-tl .node-dot { background: #FF5A5F; box-shadow: 0 0 12px rgba(255, 90, 95, 0.6); }

        .node-tr { top: 0; right: 10%; animation-delay: -1.5s; }
        .node-tr .node-dot { background: #8B5CF6; box-shadow: 0 0 12px rgba(139, 92, 246, 0.6); }

        .node-bl { bottom: 0; left: 10%; animation-delay: -3s; }
        .node-bl .node-dot { background: #00C471; box-shadow: 0 0 12px rgba(0, 196, 113, 0.6); }

        .node-br { bottom: 0; right: 10%; animation-delay: -4.5s; }
        .node-br .node-dot { background: #F5A623; box-shadow: 0 0 12px rgba(245, 166, 35, 0.6); }

        .line {
          position: absolute;
          top: 50%;
          left: 50%;
          height: 2px;
          background: linear-gradient(90deg, rgba(49, 130, 246, 0.5), transparent);
          transform-origin: left center;
          z-index: 1;
        }

        .line-tl { width: 220px; transform: rotate(-150deg); }
        .line-tr { width: 220px; transform: rotate(-30deg); }
        .line-bl { width: 220px; transform: rotate(150deg); }
        .line-br { width: 220px; transform: rotate(30deg); }

        .eco-footer {
          text-align: center;
          z-index: 20;
        }

        .eco-footer p {
          font-size: 1.15rem;
          color: #6B7684;
          line-height: 1.6;
          word-break: keep-all;
        }

        .join-bottom-btn {
          margin-top: 36px;
          padding: 16px 36px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(90deg, #3B82F6 0%, #D946EF 100%);
          color: #FFFFFF;
          font-size: 1.05rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(217, 70, 239, 0.22);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .join-bottom-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(217, 70, 239, 0.3);
        }

        @keyframes float-logo {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-20px); }
        }

        @keyframes scroll-cue-float {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.76; }
          50% { transform: translateX(-50%) translateY(-8px); opacity: 1; }
        }

        @keyframes scroll-line-drop {
          0% { transform: translateY(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(70px); opacity: 0; }
        }

        @keyframes breathe-orb {
          0%, 100% { transform: scale(1); border-radius: 42% 58% 46% 54%; }
          50% { transform: scale(1.08); border-radius: 56% 44% 58% 42%; }
        }

        @keyframes glow-pulse {
          0%, 100% { transform: scale(0.92); opacity: 0.75; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        @keyframes orbit-spin-a {
          0% { transform: rotate(22deg) skewX(12deg); }
          100% { transform: rotate(382deg) skewX(12deg); }
        }

        @keyframes orbit-spin-b {
          0% { transform: rotate(-28deg); }
          100% { transform: rotate(332deg); }
        }

        @keyframes particle-path-1 {
          0%, 100% { transform: translate(78px, -44px); }
          50% { transform: translate(-72px, 48px); }
        }

        @keyframes particle-path-2 {
          0%, 100% { transform: translate(-62px, -58px); }
          50% { transform: translate(70px, 52px); }
        }

        @keyframes particle-path-3 {
          0%, 100% { transform: translate(12px, 88px); }
          50% { transform: translate(-10px, -86px); }
        }

        @keyframes slide-line {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }

        @keyframes pulse-orb {
          0% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 20px 50px rgba(49, 130, 246, 0.3), inset -10px -10px 30px rgba(0, 0, 0, 0.15);
          }
          100% {
            transform: translate(-50%, -50%) scale(1.03);
            box-shadow: 0 30px 70px rgba(49, 130, 246, 0.5), inset -10px -10px 30px rgba(0, 0, 0, 0.15);
          }
        }

        @keyframes spin-orbit {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes float-logo-center {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-12px); }
        }

        @keyframes float-node {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @media (max-width: 768px) {
          .title-eng { font-size: 3.5rem; }
          .title-kor { font-size: 1.8rem; }
          .floating-logo {
            width: 340px;
            top: 50%;
            opacity: 0.18;
          }
          .nav-links { display: none; }
          .nav-btn { position: static; margin-top: 10px; }
          header { justify-content: flex-end; }
          .story-container {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }
          .reverse { direction: ltr; }
          .text-box h2 { font-size: 2.2rem; }
          .text-box p { font-size: 1.05rem; }
          .visual-box { height: 300px; }
          .eco-header h2 { font-size: 2.2rem; }
          .network-container {
            height: 360px;
            transform: scale(0.8);
            margin-bottom: 20px;
          }
          .eco-footer p { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
}
