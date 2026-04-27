import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useInstitutionAuth } from "../auth/InstitutionAuthContext";
import Modal from "../components/Modal";
import { apiPost } from "../utils/api";
import LanguageSelector from "../components/LanguageSelector";

function validateEmail(v: string) {
  return /.+@.+\..+/.test(v);
}

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const { login: instLogin } = useInstitutionAuth();
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
  const [languageSelected, setLanguageSelected] = useState(() => {
    return !!localStorage.getItem("baesh-language");
  });

  const canSubmit = useMemo(
    () => validateEmail(email) && password.length >= 8,
    [email, password]
  );

  useEffect(() => {
    const fontAwesome = document.createElement("link");
    fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    fontAwesome.rel = "stylesheet";

    const pretendard = document.createElement("link");
    pretendard.href = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css";
    pretendard.rel = "stylesheet";

    document.head.appendChild(fontAwesome);
    document.head.appendChild(pretendard);

    return () => {
      if (document.head.contains(fontAwesome)) document.head.removeChild(fontAwesome);
      if (document.head.contains(pretendard)) document.head.removeChild(pretendard);
    };
  }, []);

  useEffect(() => {
    const redirectAuthenticatedUser = () => {
      if (!isAuthenticated) return;

      if (loc?.state?.from?.pathname) {
        nav(loc.state.from.pathname, { replace: true });
        return;
      }

      nav("/profile", { replace: true });
    };

    if (isAuthenticated) {
      redirectAuthenticatedUser();
    }
  }, [isAuthenticated, nav, loc?.state?.from?.pathname]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await apiPost<any>("/auth/unified-login", { email, password });

      if (data.type === "institution") {
        instLogin(data.token, data.institution);
        nav("/institution/dashboard", { replace: true });
        return;
      }

      login(data.token, data.user);
      nav("/profile", { replace: true });
    } catch (err: any) {
      setError(err.message || "로그인에 실패했습니다.");
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
      login("dummy-token", { id: "user-oauth", email: "oauth@example.com", name: "OAuth User" });
      nav("/profile", { replace: true });
    }, 600);
  };

  if (!languageSelected) {
    return (
      <div className="language-shell">
        <div className="language-card">
          <LanguageSelector onLanguageSelected={() => setLanguageSelected(true)} />
        </div>
        <style>{`
          .language-shell {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #FAFAFC;
          }
          .language-card {
            max-width: 500px;
            width: 100%;
            padding: 2rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="visual-panel">
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
        <div className="glass-badge">✦ Connected Identity</div>
        <div className="mini-card card-a">Skill Graph Ready</div>
        <div className="mini-card card-b">Global Network</div>

        <div className="visual-content">
          <h1>
            Welcome to
            <br />
            Your <span className="highlight-gradient">Project Core.</span>
          </h1>
          <p>
            당신의 프로젝트가 곧 실력이 되고,
            <br />
            그 실력이 글로벌 커리어로 연결됩니다.
          </p>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-wrapper">
          <div className="form-header">
            <h2>
              <span className="dot" />
              Connect Your Identity
            </h2>
            <p>프로젝트, 스킬, 그리고 글로벌 네트워크에 접속하세요.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <Link to="/forgot" className="forgot-link">Forgot?</Link>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn-submit" disabled={!canSubmit || submitting}>
              {submitting ? "Entering..." : "Enter the Project Network →"}
            </button>
          </form>

          <div className="divider"><span>OR CONNECT VIA</span></div>

          <div className="social-group">
            <button className="social-btn" onClick={() => startOAuth("Google")}>G</button>
            <button className="social-btn" onClick={() => startOAuth("GitHub")}>GH</button>
            <button className="social-btn" onClick={() => startOAuth("LinkedIn")}>in</button>
          </div>

          <div className="footer-links">
            New here? <Link to="/signup">Create your project profile</Link>
          </div>

          <button className="btn-guest" onClick={() => nav("/preview")}>로그인 없이 둘러보기</button>
        </div>
      </div>

      <Modal
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        title={`데이터 수집 동의 (${provider ?? ""})`}
      >
        <p style={{ color: "var(--muted)" }}>
          첫 소셜 로그인 시 프로필(이름/이메일/이미지)과 공개 활동 데이터를 불러옵니다.
          개인화 추천을 위해 동의가 필요합니다.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button className="badge" onClick={() => setConsentOpen(false)}>취소</button>
          <button className="button" onClick={confirmOAuth}>동의하고 계속</button>
        </div>
      </Modal>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Pretendard', sans-serif;
        }

        .login-page {
          background-color: #FAFAFC;
          color: #191F28;
          height: 100vh;
          display: flex;
          overflow: hidden;
        }

        .visual-panel {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 80px;
          background: #FAFAFC;
          overflow: hidden;
        }

        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          animation: pulse-orb 8s infinite alternate ease-in-out;
        }

        .orb-1 {
          top: -10%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%);
        }

        .orb-2 {
          bottom: -20%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, rgba(49,130,246,0.15), transparent 70%);
          animation-delay: -4s;
        }

        .visual-content {
          position: relative;
          z-index: 10;
        }

        .visual-content h1 {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }

        .highlight-gradient {
          background: linear-gradient(135deg, #3182F6 0%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .visual-content p {
          font-size: 1.25rem;
          font-weight: 500;
          color: #6B7684;
          line-height: 1.6;
        }

        .glass-badge,
        .mini-card {
          position: absolute;
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
          font-weight: 700;
          z-index: 10;
        }

        .glass-badge {
          top: 18%;
          left: 12%;
          padding: 16px 24px;
          color: #3182F6;
          animation: float 5s infinite alternate ease-in-out;
        }

        .mini-card {
          padding: 14px 20px;
          color: #4E5968;
          font-size: 0.95rem;
        }

        .card-a {
          top: 34%;
          left: 18%;
          animation: float 5.8s infinite alternate ease-in-out;
        }

        .card-b {
          top: 28%;
          left: 42%;
          animation: float 6.4s infinite alternate-reverse ease-in-out;
        }

        .form-panel {
          flex: 1;
          max-width: 640px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          box-shadow: -20px 0 40px rgba(0,0,0,0.02);
          z-index: 20;
        }

        .form-wrapper {
          width: 100%;
          max-width: 420px;
        }

        .form-header {
          margin-bottom: 40px;
        }

        .form-header h2 {
          font-size: 2rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .dot {
          width: 12px;
          height: 12px;
          background: #3182F6;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(49, 130, 246, 0.4);
        }

        .form-header p {
          color: #6B7684;
          font-size: 1rem;
          font-weight: 500;
        }

        .input-group {
          position: relative;
          margin-bottom: 16px;
        }

        .input-group input {
          width: 100%;
          padding: 18px 20px;
          background: #F2F4F6;
          border: 1px solid transparent;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 500;
          color: #191F28;
          transition: all 0.2s;
          outline: none;
        }

        .input-group input::placeholder {
          color: #B0B8C1;
        }

        .input-group input:focus {
          background: #FFFFFF;
          border-color: #3182F6;
          box-shadow: 0 0 0 4px rgba(49, 130, 246, 0.1);
        }

        .forgot-link {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.875rem;
          font-weight: 600;
          color: #8B5CF6;
          text-decoration: none;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .login-error {
          padding: 12px 14px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 12px;
          color: #DC2626;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }

        .btn-submit {
          width: 100%;
          padding: 18px;
          margin-top: 8px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(90deg, #3B82F6 0%, #D946EF 100%);
          color: #FFFFFF;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 8px 20px rgba(217, 70, 239, 0.2);
        }

        .btn-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .btn-submit:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(217, 70, 239, 0.3);
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 32px 0;
          color: #8B95A1;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #E5E8EB;
        }

        .divider span {
          padding: 0 16px;
        }

        .social-group {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 32px;
        }

        .social-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #F2F4F6;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 800;
          color: #4E5968;
          cursor: pointer;
          transition: all 0.2s;
        }

        .social-btn:hover {
          background: #E5E8EB;
          transform: translateY(-2px);
        }

        .footer-links {
          text-align: center;
          font-size: 0.95rem;
          font-weight: 500;
          color: #4E5968;
        }

        .footer-links a {
          color: #3182F6;
          font-weight: 700;
          text-decoration: none;
        }

        .btn-guest {
          display: block;
          width: 100%;
          padding: 16px;
          margin-top: 24px;
          background: transparent;
          border: 1px solid #E5E8EB;
          border-radius: 16px;
          color: #4E5968;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-guest:hover {
          background: #F9FAFB;
        }

        @keyframes pulse-orb {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.1); opacity: 0.8; }
        }

        @keyframes float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-15px); }
        }

        @media (max-width: 900px) {
          .login-page {
            flex-direction: column;
            overflow: auto;
            height: auto;
            min-height: 100vh;
          }
          .visual-panel {
            flex: none;
            padding: 60px 20px;
            min-height: 40vh;
          }
          .visual-content h1 { font-size: 2.8rem; }
          .form-panel {
            flex: none;
            max-width: 100%;
            padding: 40px 20px;
            box-shadow: none;
            border-radius: 24px 24px 0 0;
            margin-top: -24px;
          }
          .glass-badge,
          .mini-card {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
