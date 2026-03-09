import { useState } from 'react';
import { Link } from 'react-router-dom';

type TabType = 'bookmarked' | 'applied' | 'pending' | 'result' | 'messages' | 'interviews';

export default function MyApplications() {
  const [activeTab, setActiveTab] = useState<TabType>('applied');

  const tabs = [
    { id: 'bookmarked' as TabType, label: '북마크한 공고', count: 5 },
    { id: 'applied' as TabType, label: '지원한 공고', count: 8 },
    { id: 'pending' as TabType, label: '결과 대기', count: 3 },
    { id: 'result' as TabType, label: '합격/불합격', count: 5 },
    { id: 'messages' as TabType, label: '기업과의 메시지', count: 2 },
    { id: 'interviews' as TabType, label: '면접 일정', count: 1 },
  ];

  // 더미 데이터
  const applications = {
    bookmarked: [
      { id: '1', title: 'AI/ML 엔지니어', company: '테크스타트업', deadline: 'D-3', matchRate: 92 },
      { id: '2', title: '프론트엔드 개발자', company: '핀테크 기업', deadline: 'D-5', matchRate: 88 },
    ],
    applied: [
      { id: '3', title: '데이터 사이언티스트', company: '이커머스 플랫폼', appliedDate: '2024.12.15', status: '서류 전형', matchRate: 85 },
      { id: '4', title: '백엔드 개발자', company: '소셜 네트워크', appliedDate: '2024.12.10', status: '면접 대기', matchRate: 78 },
      { id: '5', title: 'AI 연구원', company: 'AI 연구소', appliedDate: '2024.12.08', status: '최종 면접', matchRate: 91 },
    ],
    pending: [
      { id: '3', title: '데이터 사이언티스트', company: '이커머스 플랫폼', appliedDate: '2024.12.15', status: '서류 전형' },
      { id: '4', title: '백엔드 개발자', company: '소셜 네트워크', appliedDate: '2024.12.10', status: '면접 대기' },
      { id: '5', title: 'AI 연구원', company: 'AI 연구소', appliedDate: '2024.12.08', status: '최종 면접' },
    ],
    result: [
      { id: '6', title: '프론트엔드 개발자', company: '게임 회사', appliedDate: '2024.11.20', result: '합격', matchRate: 68 },
      { id: '7', title: '풀스택 개발자', company: '스타트업', appliedDate: '2024.11.15', result: '불합격', matchRate: 82 },
    ],
    messages: [
      { id: '8', company: '테크스타트업', message: '면접 일정 조율 요청', time: '2시간 전', unread: true },
      { id: '9', company: '핀테크 기업', message: '서류 전형 결과 안내', time: '1일 전', unread: false },
    ],
    interviews: [
      { id: '5', title: 'AI 연구원', company: 'AI 연구소', date: '2024.12.20', time: '14:00', type: '최종 면접' },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '합격':
        return { bg: 'rgba(34, 197, 94, 0.1)', color: '#16A34A' };
      case '불합격':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#DC2626' };
      case '최종 면접':
        return { bg: 'rgba(30, 111, 255, 0.1)', color: 'var(--brand)' };
      case '면접 대기':
        return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' };
      default:
        return { bg: 'var(--border)', color: 'var(--muted)' };
    }
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* 헤더 */}
      <section className="panel" style={{ padding: 24 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700 }}>
          지원 현황
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
          지원자 중심 설계
        </p>
      </section>

      {/* 탭 */}
      <section className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tabs" style={{ borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  marginLeft: 6,
                  padding: '2px 6px',
                  background: activeTab === tab.id ? 'rgba(30, 111, 255, 0.2)' : 'var(--border)',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600
                }}>
                  {tab.count}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div style={{ padding: 24 }}>
          {activeTab === 'bookmarked' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {applications.bookmarked.map(app => (
                <Link key={app.id} to={`/lounge/jobs/${app.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="panel" style={{ padding: 16, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                          {app.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {app.company} · AI 매칭률 {app.matchRate}% · 마감 {app.deadline}
                        </div>
                      </div>
                      <span style={{ fontSize: 20 }}>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'applied' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {applications.applied.map(app => (
                <Link key={app.id} to={`/lounge/jobs/${app.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="panel" style={{ padding: 16, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                          {app.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                          {app.company} · 지원일 {app.appliedDate} · AI 매칭률 {app.matchRate}%
                        </div>
                        <span className="badge" style={{ 
                          fontSize: 11,
                          ...getStatusColor(app.status)
                        }}>
                          {app.status}
                        </span>
                      </div>
                      <span style={{ fontSize: 20, marginLeft: 16 }}>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'pending' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {applications.pending.map(app => (
                <Link key={app.id} to={`/lounge/jobs/${app.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="panel" style={{ padding: 16, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                          {app.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                          {app.company} · 지원일 {app.appliedDate}
                        </div>
                        <span className="badge" style={{ 
                          fontSize: 11,
                          ...getStatusColor(app.status)
                        }}>
                          {app.status}
                        </span>
                      </div>
                      <span style={{ fontSize: 20, marginLeft: 16 }}>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'result' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {applications.result.map(app => (
                <Link key={app.id} to={`/lounge/jobs/${app.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="panel" style={{ padding: 16, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                          {app.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                          {app.company} · 지원일 {app.appliedDate} · AI 매칭률 {app.matchRate}%
                        </div>
                        <span className="badge" style={{ 
                          fontSize: 11,
                          ...getStatusColor(app.result)
                        }}>
                          {app.result}
                        </span>
                      </div>
                      <span style={{ fontSize: 20, marginLeft: 16 }}>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'messages' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {applications.messages.map(msg => (
                <div key={msg.id} className="panel" style={{ padding: 16, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>
                          {msg.company}
                        </div>
                        {msg.unread && (
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: 'var(--brand)'
                          }} />
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>
                        {msg.message}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {msg.time}
                      </div>
                    </div>
                    <span style={{ fontSize: 20, marginLeft: 16 }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'interviews' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {applications.interviews.map(interview => (
                <div key={interview.id} className="panel" style={{ 
                  padding: 20,
                  background: 'linear-gradient(135deg, rgba(30, 111, 255, 0.05) 0%, rgba(64, 140, 255, 0.05) 100%)',
                  border: '2px solid rgba(30, 111, 255, 0.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                        {interview.title}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                        {interview.company} · {interview.type}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                        <div><strong>날짜:</strong> {interview.date}</div>
                        <div><strong>시간:</strong> {interview.time}</div>
                      </div>
                    </div>
                    <button className="button" style={{ fontSize: 12, height: 32, padding: '0 16px' }}>
                      일정 확인
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

