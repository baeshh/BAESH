import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SessionManager from "../components/SessionManager";
import { streamChatWithReasoning, type Message } from "../services/aiService";
import {
  getUserProfile,
  formatProfileForAI,
  type UserProfile,
} from "../services/userProfileService";
import {
  getAllSessions,
  saveSession,
  deleteSession,
  getCurrentSessionId,
  setCurrentSessionId,
  createNewSession,
  generateSessionTitle,
  loadSession,
  type ChatSession,
} from "../services/sessionService";
import { apiGet } from "../utils/api";
import type { Project } from "./Projects";

type Msg = {
  role: "user" | "clone";
  text: string;
  isStreaming?: boolean;
};

type Opportunity = {
  id: string;
  title: string;
  company: string;
  matchRate: number;
  location: string;
  deadline?: string;
  isHackathon?: boolean;
};

type RecommendedUser = {
  id: string;
  name: string;
  school?: string;
  major?: string;
  desc?: string;
  role?: string;  // e.g. "Sr. AI Engineer · 멘토링 가능"
  matchScore?: number;
  interests?: string[];
};

type MilestoneStatus = 'done' | 'active' | 'pending';
type Milestone = { id: string; text: string; date: string; status: MilestoneStatus };

// Lounge 기회 데이터 (Lounge와 연동)
const OPPORTUNITIES: Opportunity[] = [
  { id: 'job-global-1', title: 'AI Research Scientist', company: 'Meta', matchRate: 95, location: 'London (Hybrid)', deadline: '2d ago' },
  { id: 'job-global-2', title: 'AI Hackathon 2026', company: 'Naver Cloud', matchRate: 88, location: 'Online', deadline: 'D-3', isHackathon: true },
  { id: 'job-global-3', title: 'Founding Engineer', company: 'Stealth Startup', matchRate: 82, location: 'Remote', deadline: 'Early Stage' },
  { id: 'job-1', title: 'Backend Engineer (AWS)', company: 'Amazon', matchRate: 89, location: 'Seattle (On-site)', deadline: 'Jan 30' },
  { id: 'job-2', title: 'Software Engineer (Azure AI)', company: 'Microsoft', matchRate: 85, location: 'Redmond', deadline: 'Posted today' },
];

// BAESH AI Copilot 라이트 테마 (Full Features)
const THEME = {
  bgBody: '#F4F7FB',
  bgCard: '#FFFFFF',
  primaryBlue: '#3b82f6',
  gradientBrand: 'linear-gradient(135deg, #4F46E5, #EC4899)',
  textMain: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  successGreen: '#10B981',
  bgChatBody: '#FAFAFA',
};

export default function CloneHub() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const profileContext = useMemo(
    () => userProfile ? formatProfileForAI(userProfile) : '',
    [userProfile]
  );

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(null);
  const [showSessionList, setShowSessionList] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [opportunities] = useState<Opportunity[]>(OPPORTUNITIES);
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>([]);

  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "clone", text: `안녕하세요! 👋\n\n${t('cloneHub.loadingProfile')}...` },
  ]);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [topSkills, setTopSkills] = useState<Array<{ name: string; score: number; color: string }>>([]);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const getMilestoneTexts = (en: boolean) => [
    { id: '1', text: en ? 'Custom portfolio created' : '맞춤 포트폴리오 생성', date: 'Today', status: 'done' as MilestoneStatus },
    { id: '2', text: en ? 'Meta tech interview prep' : 'Meta 기술 면접 예상 질문 대비', date: 'D-3', status: 'active' as MilestoneStatus },
    { id: '3', text: en ? 'Submit 1 open source PR' : '오픈소스 기여 PR 1건 제출', date: 'By Dec 20', status: 'pending' as MilestoneStatus },
  ];
  const [milestones, setMilestones] = useState<Milestone[]>(() => getMilestoneTexts(i18n.language === 'en'));

  useEffect(() => {
    setMilestones(getMilestoneTexts(isEnglish));
  }, [isEnglish]);

  // 프로필, 세션, 프로젝트, 추천 유저 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
        setTopSkills(profile.topSkills || []);

        const loadedSessions = await getAllSessions();
        setSessions(loadedSessions);

        const savedSessionId = getCurrentSessionId();
        let session = savedSessionId ? await loadSession(savedSessionId) : null;
        if (session) {
          setCurrentSessionIdState(savedSessionId!);
          setMsgs(session.messages.map((m) => ({ role: m.role, text: m.text })));
        } else {
          const newSession = await createNewSession();
          const welcomeText = getWelcomeMessage(profile, isEnglish);
          newSession.messages = [{ role: "clone", text: welcomeText }];
          await saveSession(newSession);
          setCurrentSessionId(newSession.id); // persist to storage
          setCurrentSessionIdState(newSession.id);
          setMsgs(newSession.messages.map((m) => ({ role: m.role, text: m.text })));
          setSessions([newSession, ...loadedSessions]);
        }

        try {
          const projectsData = await apiGet<{ projects: Project[] }>('/projects');
          setProjects(projectsData.projects || []);
        } catch {
          setProjects([]);
        }

        try {
          const usersData = await apiGet<{ users: RecommendedUser[] }>('/users?limit=6&excludeCurrent=true');
          const roles = [isEnglish ? 'Sr. AI Engineer · Mentoring available' : 'Sr. AI Engineer · 멘토링 가능', isEnglish ? 'Tech Recruiter · Mock interview' : 'Tech Recruiter · 모의 면접', isEnglish ? 'ML Engineer · Open source' : 'ML Engineer · 오픈소스'];
          const users = (usersData.users || []).slice(0, 5).map((u: any, i: number) => ({
            ...u,
            desc: u.school && u.major ? `${u.school} · ${u.major}` : u.school || u.major || 'BAESH User',
            role: u.role || roles[i % roles.length],
            matchScore: u.matchScore ?? Math.floor(Math.random() * 15) + 80,
          }));
          setRecommendedUsers(users);
        } catch {
          setRecommendedUsers([]);
        }
      } catch (error) {
        console.error('Load error:', error);
      }
    };
    loadData();
  }, []);

  function getWelcomeMessage(profile: UserProfile, en: boolean, includePortfolio = true): string {
    const name = profile.basic.name;
    const skillPct = profile.topSkills?.[0]?.score ?? 87;
    const suffix = includePortfolio ? '\n\n__PORTFOLIO__' : '';
    return en
      ? `Hello, ${name}! Meta's AI Research Scientist position is a perfect fit for your skill set (AI/ML ${skillPct}%) and Llama Hackathon experience.\n\nI've generated a custom portfolio draft based on your BAESH project data. Would you like to review it?${suffix}`
      : `안녕하세요 ${name}님! Meta의 AI Research Scientist 포지션이 ${name}님의 스킬셋(AI/ML ${skillPct}%)과 Llama 해커톤 경험에 완벽하게 부합합니다.\n\nBAESH 프로젝트 데이터를 기반으로 지원 맞춤형 포트폴리오 초안을 생성했습니다. 확인해 보시겠어요?${suffix}`;
  }

  // 시스템 프롬프트: 커리어 조언 + 기회/프로젝트/팀원 추천
  useEffect(() => {
    if (!userProfile || !profileContext) return;

    const oppSummary = opportunities.slice(0, 5).map(o =>
      `- ${o.title} (${o.company}) ${o.matchRate}% match`
    ).join('\n');
    const projSummary = projects.slice(0, 3).map(p =>
      `- ${p.title} (${p.status}) - ${p.description?.slice(0, 50)}...`
    ).join('\n') || '- No projects yet. Suggest creating one.';
    const userSummary = recommendedUsers.slice(0, 3).map(u =>
      `- ${u.name} (${u.desc || 'BAESH User'}) - interests: ${(u.interests || []).slice(0, 3).join(', ')}`
    ).join('\n') || '- Suggest networking with users who share similar interests.';

    const systemPrompt = isEnglish
      ? `You are BAESH AI Copilot. Provide personalized career advice using the user's profile.

# Your roles
- Career path & spec advice based on their skills, awards, portfolios
- Recommend Lounge opportunities (jobs, hackathons) - mention match rates
- One-click portfolio suggestions for specific job positions
- Recommend team members / mentors to connect with

# Data you can reference
## Top opportunities for user:
${oppSummary}

## User's projects:
${projSummary}

## Recommended users to connect:
${userSummary}

# Response style
- Friendly, specific, actionable
- Use markdown and emojis
- When mentioning opportunities/projects/users, suggest they tap the cards in the right panel for quick access
- Reference specific skills, projects, awards from their profile

---
${profileContext}`
      : `당신은 BAESH AI 코파일럿입니다. 사용자 프로필을 바탕으로 맞춤형 커리어 조언을 제공하세요.

# 역할
- 스킬, 수상, 포트폴리오 기반 커리어 패스 및 스펙 조언
- 라운지 기회(채용, 해커톤) 추천 - 매칭률 언급
- 관심사에 맞는 BAESH 프로젝트 추천
- 협업을 위한 팀원/연결 추천

# 참고 가능한 데이터
## 사용자 맞춤 기회:
${oppSummary}

## 사용자 프로젝트:
${projSummary}

## 추천 연결 사용자:
${userSummary}

# 응답 스타일
- 친근하고 구체적이며 실행 가능하게
- 마크다운, 이모지 활용
- 기회/프로젝트/유저 언급 시 오른쪽 패널 카드 탭으로 바로 이동 가능하다고 안내
- 프로필의 구체적 스킬, 프로젝트, 수상을 인용

---
${profileContext}`;

    setConversationHistory([{ role: "system", content: systemPrompt }]);
  }, [userProfile, profileContext, isEnglish, opportunities, projects, recommendedUsers]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [msgs]);

  const send = async (text: string) => {
    if (isAIResponding || !text.trim()) return;

    setMsgs((prev) => [...prev, { role: "user", text }]);
    setInputText("");

    const updatedHistory: Message[] = [
      ...(conversationHistory.length ? conversationHistory : [{ role: "system" as const, content: "You are BAESH AI Copilot." }]),
      { role: "user", content: text },
    ];
    setConversationHistory(updatedHistory);

    const cloneMsgIndex = msgs.length + 1;
    setMsgs((prev) => [...prev, { role: "clone", text: "", isStreaming: true }]);
    setIsAIResponding(true);

    try {
      let fullResponse = "";
      for await (const chunk of streamChatWithReasoning(updatedHistory, "high")) {
        fullResponse += chunk;
        setMsgs((prev) => {
          const next = [...prev];
          next[cloneMsgIndex] = { role: "clone", text: fullResponse, isStreaming: true };
          return next;
        });
      }
      setMsgs((prev) => {
        const next = [...prev];
        next[cloneMsgIndex] = { role: "clone", text: fullResponse, isStreaming: false };
        return next;
      });
      setConversationHistory([...updatedHistory, { role: "assistant", content: fullResponse }]);

      if (currentSessionId) {
        const session = await loadSession(currentSessionId);
        if (session) {
          session.messages = [...msgs, { role: "user" as const, text }, { role: "clone" as const, text: fullResponse }];
          session.updatedAt = new Date().toISOString();
          if (session.title === "새 대화" || session.title === "New conversation") {
            session.title = await generateSessionTitle(session.messages);
          }
          await saveSession(session);
          setSessions(await getAllSessions());
        }
      }
    } catch (error) {
      console.error("AI error:", error);
      setMsgs((prev) => {
        const next = [...prev];
        next[cloneMsgIndex] = { role: "clone", text: t('cloneHub.messages.error'), isStreaming: false };
        return next;
      });
    } finally {
      setIsAIResponding(false);
    }
  };

  const handleNewSession = async () => {
    if (!userProfile) return;
    const newSession = await createNewSession();
    const welcomeText = getWelcomeMessage(userProfile, isEnglish, true);
    newSession.messages = [{ role: "clone", text: welcomeText }];
    await saveSession(newSession);
    setCurrentSessionId(newSession.id); // persist
    setCurrentSessionIdState(newSession.id);
    setMsgs(newSession.messages.map((m) => ({ role: m.role, text: m.text })));
    setSessions(await getAllSessions());
    if (conversationHistory.length) setConversationHistory([conversationHistory[0]]);
  };

  const handleSelectSession = async (sessionId: string) => {
    const session = await loadSession(sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setCurrentSessionIdState(sessionId);
      setMsgs(session.messages.map((m) => ({ role: m.role, text: m.text })));
      if (conversationHistory.length) setConversationHistory([conversationHistory[0]]);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    const updated = await getAllSessions();
    setSessions(updated);
    if (currentSessionId === sessionId) {
      if (updated.length) {
        const first = updated[0];
        setCurrentSessionId(first.id);
        setCurrentSessionIdState(first.id);
        setMsgs(first.messages.map((m) => ({ role: m.role, text: m.text })));
      } else {
        handleNewSession();
      }
    }
  };

  const toggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (m.status === 'done') return { ...m, status: 'pending' as MilestoneStatus };
        return { ...m, status: 'done' as MilestoneStatus };
      })
    );
  };

  const handlePortfolioOneClick = () => {
    navigate('/projects');
  };

  if (!userProfile) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', background: THEME.bgBody }}>
        <div style={{ padding: 24, textAlign: 'center', color: THEME.textMain }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h3>{t('cloneHub.loadingProfile')}</h3>
          <p style={{ color: THEME.textMuted }}>{t('cloneHub.pleaseWait')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: THEME.bgBody,
      color: THEME.textMain,
      minHeight: 'calc(100vh - 70px)',
      padding: '40px 20px',
      fontFamily: "'Pretendard', 'Inter', sans-serif",
    }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* 왼쪽: 채팅 */}
        <main style={{
          background: THEME.bgCard,
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          border: `1px solid ${THEME.border}`,
          display: 'flex',
          flexDirection: 'column',
          height: '85vh',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 30px',
            borderBottom: `1px solid ${THEME.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.2rem', fontWeight: 800 }}>
              BAESH AI Copilot
              <span style={{ background: THEME.gradientBrand, color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 'bold' }}>BETA</span>
            </div>
            <button
              onClick={() => setShowSessionList(true)}
              style={{
                background: '#F3F4F6',
                border: `1px solid ${THEME.border}`,
                color: THEME.textMain,
                padding: '8px 16px',
                borderRadius: 12,
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              📂 {sessions.length}
            </button>
          </div>

          <div ref={chatAreaRef} style={{
            flex: 1,
            padding: 30,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            background: THEME.bgChatBody,
          }}>
            {msgs.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 16,
                  maxWidth: '90%',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  background: m.role === 'clone' ? THEME.gradientBrand : '#E5E7EB',
                  color: m.role === 'clone' ? 'white' : THEME.textMuted,
                }}>
                  {m.role === 'user' ? userProfile.basic.name.slice(0, 2).toUpperCase() : '✨'}
                </div>
                <div style={{
                  padding: '16px 24px',
                  borderRadius: 16,
                  lineHeight: 1.6,
                  fontSize: '0.95rem',
                  background: m.role === 'user' ? THEME.textMain : 'white',
                  color: m.role === 'user' ? 'white' : THEME.textMain,
                  border: m.role === 'user' ? 'none' : `1px solid ${THEME.border}`,
                  boxShadow: m.role === 'clone' ? '0 2px 8px rgba(0,0,0,0.02)' : 'none',
                  borderTopLeftRadius: m.role === 'clone' ? 4 : 16,
                  borderTopRightRadius: m.role === 'user' ? 4 : 16,
                }}>
                  {m.role === 'user' ? (
                    m.text
                  ) : (
                    <>
                      {m.text ? (
                        <>
                          {m.text.includes('__PORTFOLIO__') ? (
                            <>
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                {m.text.replace('__PORTFOLIO__', '')}
                              </ReactMarkdown>
                              <div style={{ marginTop: 16, background: '#F8FAFC', border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                  <div style={{ width: 40, height: 40, background: '#1877F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>∞</div>
                                  <div>
                                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{isEnglish ? 'Meta (London) Custom Portfolio' : 'Meta (London) 맞춤 포트폴리오'}</h4>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: THEME.textMuted }}>{isEnglish ? 'Highlights: Llama 3 optimization, PyTorch contribution' : '강조점: Llama 3 최적화 경험, PyTorch 기여'}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={handlePortfolioOneClick}
                                  style={{
                                    width: '100%',
                                    background: THEME.gradientBrand,
                                    color: 'white',
                                    border: 'none',
                                    padding: 12,
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                  }}
                                >
                                  ✨ {isEnglish ? 'One-click auto-complete resume' : '원클릭으로 이력서 자동 완성하기'}
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                {m.text}
                              </ReactMarkdown>
                              {m.isStreaming && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
                            </>
                          )}
                        </>
                      ) : (
                        m.isStreaming && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <span style={{ width: 6, height: 6, background: THEME.textMuted, borderRadius: '50%', animation: 'bounce 0.6s infinite' }} />
                            <span style={{ width: 6, height: 6, background: THEME.textMuted, borderRadius: '50%', animation: 'bounce 0.6s 0.1s infinite' }} />
                            <span style={{ width: 6, height: 6, background: THEME.textMuted, borderRadius: '50%', animation: 'bounce 0.6s 0.2s infinite' }} />
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '20px 30px', background: 'white', borderTop: `1px solid ${THEME.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: 12, padding: '6px 6px 6px 20px' }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(inputText.trim()))}
                placeholder={isEnglish ? "Tell AI your next action..." : "AI에게 다음 행동을 지시하세요..."}
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 0', fontSize: '0.95rem', outline: 'none' }}
              />
              <button
                onClick={() => send(inputText.trim())}
                disabled={isAIResponding}
                style={{
                  background: THEME.primaryBlue,
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 600,
                  cursor: isAIResponding ? 'not-allowed' : 'pointer',
                  opacity: isAIResponding ? 0.7 : 1,
                }}
              >
                {isEnglish ? 'Send' : '전송'}
              </button>
            </div>
          </div>
        </main>

        {/* 오른쪽: 마일스톤, 스킬, 네트워크 */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20, alignSelf: 'flex-start' }}>
          {/* My AI Roadmap - 인터랙티브 마일스톤 */}
          <div style={{ padding: 24, background: 'white', borderRadius: 16, border: `1px solid ${THEME.border}` }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              📍 {isEnglish ? 'My AI Roadmap' : 'My AI 로드맵'}
              <span style={{ fontSize: '0.8rem', color: THEME.primaryBlue }}>In Progress</span>
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {milestones.map((m) => (
                <li
                  key={m.id}
                  onClick={() => toggleMilestone(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    background: m.status === 'active' ? '#EFF6FF' : m.status === 'done' ? '#F9FAFB' : '#F9FAFB',
                    borderRadius: 10,
                    border: `1px solid ${m.status === 'active' ? THEME.primaryBlue : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: `2px solid ${m.status === 'done' ? THEME.successGreen : m.status === 'active' ? THEME.primaryBlue : '#D1D5DB'}`,
                    background: m.status === 'done' ? THEME.successGreen : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                  }}>{m.status === 'done' ? '✓' : ''}</div>
                  <span style={{ flex: 1, fontSize: '0.9rem', textDecoration: m.status === 'done' ? 'line-through' : 'none', color: m.status === 'done' ? THEME.textMuted : THEME.textMain }}>{m.text}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: m.status === 'active' ? THEME.primaryBlue : THEME.textMuted,
                    background: m.status === 'active' ? '#DBEAFE' : '#F3F4F6',
                    padding: '4px 8px',
                    borderRadius: 12,
                  }}>{m.date}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skill Insights */}
          <div style={{ padding: 24, background: 'white', borderRadius: 16, border: `1px solid ${THEME.border}` }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 20px 0' }}>Skill Insights</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 16,
            }}>
              {(topSkills.length ? topSkills : [
                { name: isEnglish ? 'AI/ML' : 'AI/머신러닝', score: 87, color: '#6366F1' },
                { name: isEnglish ? 'Dev' : '개발/프로그래밍', score: 61, color: '#3B82F6' },
                { name: isEnglish ? 'Data' : '데이터/분석', score: 72, color: '#EC4899' },
                { name: isEnglish ? 'Communication' : '소통/협업', score: 58, color: '#10B981' },
              ]).slice(0, 4).map((s, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    color: s.color,
                    background: `conic-gradient(${s.color} ${s.score}%, #F3F4F6 0)`,
                    position: 'relative',
                  }}>
                    <div style={{ position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, background: 'white', borderRadius: '50%' }} />
                    <span style={{ position: 'relative', zIndex: 1 }}>{s.score}%</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: THEME.textMuted, textAlign: 'center', lineHeight: 1.2 }}>{s.name}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, fontSize: '0.8rem', color: THEME.textMuted }}>
              <span style={{ color: '#8B5CF6' }}>✨</span> <strong>Analysis:</strong> {isEnglish ? 'Project lead-level capability.' : '현재 프로젝트 리드급 역량 보유.'}
            </div>
          </div>

          {/* Network Synergizer - 다이내믹 팀원 매칭 */}
          <div style={{ padding: 24, background: 'white', borderRadius: 16, border: `1px solid ${THEME.border}`, borderTop: '3px solid #4F46E5' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              🤝 {isEnglish ? 'Network Synergizer' : '네트워크 시너지'}
              <span style={{ fontSize: '0.75rem', background: '#F3F4F6', padding: '4px 8px', borderRadius: 12 }}>{isEnglish ? 'Based on Roadmap' : '로드맵 기반'}</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: THEME.textMuted, marginBottom: 16 }}>
              {isEnglish ? 'Recommended mentors for tech interview prep.' : '기술 면접 준비를 도와줄 수 있는 멘토를 추천합니다.'}
            </p>
            {recommendedUsers.slice(0, 2).map((u) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#F8FAFC', borderRadius: 10, border: `1px solid ${THEME.border}`, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, background: '#E0E7FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👨‍💻</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{u.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: THEME.textMuted, margin: '4px 0 0 0' }}>{u.role || u.desc || 'BAESH User'}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/profile/${u.id}`); }}
                  style={{
                    background: 'transparent',
                    color: THEME.primaryBlue,
                    border: `1px solid ${THEME.primaryBlue}`,
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isEnglish ? 'Connect' : '요청'}
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
      `}</style>

      {showSessionList && (
        <SessionManager
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onClose={() => setShowSessionList(false)}
        />
      )}
    </div>
  );
}
