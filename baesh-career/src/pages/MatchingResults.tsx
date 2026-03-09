import { useState } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard';

export default function MatchingResults() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // 더미 데이터
  const matchedJobs = [
    {
      id: '1',
      title: 'AI/ML 엔지니어 (컴퓨터 비전)',
      company: '테크스타트업',
      position: '시니어',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'Deep Learning'],
      experience: '경력' as const,
      type: '정규직' as const,
      location: '서울 · 원격 가능',
      deadline: 'D-3',
      aiMatch: 92,
      reason: '컴퓨터 비전 프로젝트 경험과 딥러닝 스킬이 높게 매칭됩니다. 부족한 SQL 스킬은 빠르게 보완 가능합니다.',
      growthPath: ['SQL 기초 강의 수강', 'Data Modeling 실습 프로젝트', '포트폴리오에 데이터 분석 프로젝트 추가']
    },
    {
      id: '2',
      title: '프론트엔드 개발자 (React)',
      company: '핀테크 기업',
      position: '주니어',
      skills: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
      experience: '주니어' as const,
      type: '정규직' as const,
      location: '서울',
      deadline: 'D-5',
      aiMatch: 88,
      reason: 'React와 TypeScript 경험이 요구사항과 높게 일치합니다.',
      growthPath: []
    },
    {
      id: '3',
      title: '데이터 사이언티스트',
      company: '이커머스 플랫폼',
      position: '경력',
      skills: ['Python', 'SQL', 'Machine Learning', 'Data Analysis'],
      experience: '경력' as const,
      type: '정규직' as const,
      location: '서울',
      deadline: 'D-7',
      aiMatch: 85,
      reason: 'Python과 ML 경험이 풍부하나, SQL 실무 경험이 부족합니다.',
      growthPath: ['SQL 고급 쿼리 학습', '대용량 데이터 처리 경험 쌓기']
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* 헤더 */}
      <section className="panel" style={{ padding: 24 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700 }}>
          AI 매칭 결과
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
          내 AI 프로필 기반 맞춤 공고 추천
        </p>
      </section>

      {/* Top 10 매칭 공고 */}
      <section>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 700 }}>
          내가 지원 가능한 포지션 Top 10
        </h2>
        <div style={{ display: 'grid', gap: 16 }}>
          {matchedJobs.map((job, index) => (
            <div key={job.id} style={{ position: 'relative' }}>
              {/* 순위 배지 */}
              <div style={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 10,
                width: 32,
                height: 32,
                borderRadius: 999,
                background: index === 0 
                  ? 'linear-gradient(135deg, #F59E0B, #F97316)' 
                  : index === 1
                  ? 'linear-gradient(135deg, #94A3B8, #64748B)'
                  : index === 2
                  ? 'linear-gradient(135deg, #CD7F32, #A0522D)'
                  : 'var(--border)',
                display: 'grid',
                placeItems: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: 14,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                {index + 1}
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <JobCard
                  {...job}
                  isBookmarked={false}
                />

                {/* 매칭 이유 및 성장 경로 */}
                {selectedJob === job.id && (
                  <div className="panel" style={{ padding: 20, background: 'rgba(30, 111, 255, 0.05)' }}>
                    <div style={{ marginBottom: 16 }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600 }}>
                        왜 매칭됐나요? (Explainable AI)
                      </h3>
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>
                        {job.reason}
                      </p>
                    </div>

                    {job.growthPath.length > 0 && (
                      <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600 }}>
                          성장 경로 추천
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
                          {job.growthPath.map((path, idx) => (
                            <li key={idx} style={{ marginBottom: 4 }}>{path}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ marginTop: 16, padding: 12, background: 'var(--panel)', borderRadius: 8 }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600 }}>
                        부족한 포트폴리오 부분
                      </h4>
                      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px 0' }}>
                        AI가 자동 생성 제안:
                      </p>
                      <button className="button" style={{ fontSize: 12, height: 32, padding: '0 16px' }}>
                        포트폴리오 자동 생성하기
                      </button>
                    </div>
                  </div>
                )}

                <button
                  className="button--ghost"
                  onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                  style={{ 
                    fontSize: 13, 
                    height: 36,
                    justifySelf: 'start'
                  }}
                >
                  {selectedJob === job.id ? '접기' : '매칭 이유 보기'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 추가 공고들 */}
      <section>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 700 }}>
          추가 추천 공고
        </h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { id: '4', title: '백엔드 개발자', company: '소셜 네트워크', aiMatch: 78 },
            { id: '5', title: 'AI 연구원', company: 'AI 연구소', aiMatch: 91 },
            { id: '6', title: '풀스택 개발자', company: '스타트업', aiMatch: 82 },
          ].map(job => (
            <Link key={job.id} to={`/lounge/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="panel" style={{ padding: 16, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                      {job.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {job.company} · AI 매칭률 {job.aiMatch}%
                    </div>
                  </div>
                  <span style={{ fontSize: 20 }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

