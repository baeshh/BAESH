import { useParams, Link } from 'react-router-dom';
import JobCard from '../components/JobCard';

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();

  // 더미 데이터
  const company = {
    id: id || '1',
    name: '테크스타트업',
    description: `
      우리는 AI 기반 이미지 분석 솔루션을 개발하는 테크스타트업입니다.
      최신 딥러닝 기술을 활용하여 혁신적인 제품을 만들어가는 팀입니다.
      자율적인 업무 환경과 성장 지원 문화를 중시하며, 
      각 구성원의 전문성을 최대한 발휘할 수 있는 환경을 제공합니다.
    `,
    coreProjects: [
      {
        title: 'AI 이미지 분석 플랫폼',
        description: '대규모 이미지 데이터를 실시간으로 분석하는 AI 플랫폼',
        tech: ['Python', 'TensorFlow', 'Kubernetes', 'AWS']
      },
      {
        title: '컴퓨터 비전 솔루션',
        description: '산업 현장에 적용 가능한 컴퓨터 비전 기반 자동화 솔루션',
        tech: ['PyTorch', 'OpenCV', 'Docker']
      },
    ],
    techStack: ['Python', 'TensorFlow', 'PyTorch', 'Kubernetes', 'AWS', 'Docker', 'React', 'TypeScript'],
    culture: ['자율성', '성장지원', '워라밸', '혁신', '협업'],
    verifiedPortfolios: [
      {
        title: 'AI 모델 최적화 프로젝트',
        description: '모델 추론 속도 3배 개선',
        link: 'https://github.com/example'
      },
      {
        title: '이미지 분류 시스템',
        description: '정확도 95% 달성',
        link: 'https://notion.so/example'
      },
    ],
    otherJobs: [
      {
        id: '10',
        title: '프론트엔드 개발자',
        company: '테크스타트업',
        position: '주니어',
        skills: ['React', 'TypeScript', 'Next.js'],
        experience: '주니어' as const,
        type: '정규직' as const,
        location: '서울',
        deadline: 'D-5',
        aiMatch: 75,
      },
      {
        id: '11',
        title: '데이터 사이언티스트',
        company: '테크스타트업',
        position: '인턴',
        skills: ['Python', 'SQL', 'Machine Learning'],
        experience: '신입' as const,
        type: '인턴' as const,
        location: '서울',
        deadline: 'D-10',
        aiMatch: 68,
      },
      {
        id: '12',
        title: 'AI 연구원',
        company: '테크스타트업',
        position: '프로젝트',
        skills: ['Python', 'PyTorch', 'Research'],
        experience: '경력' as const,
        type: '프로젝트' as const,
        location: '원격',
        deadline: 'D-7',
        aiMatch: 82,
      },
    ],
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* 회사 소개 */}
      <section className="panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* 회사 로고 */}
          <div style={{
            width: 120,
            height: 120,
            borderRadius: 20,
            background: 'linear-gradient(135deg, var(--brand), var(--accent))',
            display: 'grid',
            placeItems: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 48,
            flexShrink: 0,
            boxShadow: '0 8px 24px rgba(30, 111, 255, 0.3)'
          }}>
            {company.name.charAt(0)}
          </div>

          {/* 회사 정보 */}
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 12px 0', fontSize: 32, fontWeight: 700 }}>
              {company.name}
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text)', margin: '0 0 20px 0' }}>
              {company.description}
            </p>

            {/* 기술 스택 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>
                AI가 분석한 기업 기술 스택
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {company.techStack.map(tech => (
                  <span key={tech} className="chip" style={{ fontSize: 12 }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* 조직 문화 */}
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>
                AI가 분석한 기업 문화
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {company.culture.map(culture => (
                  <span key={culture} className="badge" style={{ fontSize: 11 }}>
                    {culture}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 프로젝트 */}
      <section className="panel" style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 700 }}>
          핵심 프로젝트
        </h2>
        <div style={{ display: 'grid', gap: 16 }}>
          {company.coreProjects.map((project, idx) => (
            <div key={idx} className="panel" style={{ 
              padding: 20, 
              background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600 }}>
                {project.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', margin: '0 0 12px 0' }}>
                {project.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.tech.map(tech => (
                  <span key={tech} className="chip" style={{ fontSize: 11 }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verified 포트폴리오 */}
      <section className="panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            Verified 포트폴리오
          </h2>
          <span className="badge" style={{ fontSize: 11, background: 'rgba(34, 197, 94, 0.1)', color: '#16A34A' }}>
            인증됨
          </span>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {company.verifiedPortfolios.map((portfolio, idx) => (
            <a
              key={idx}
              href={portfolio.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="panel" style={{ 
                padding: 16, 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.borderColor = 'var(--brand)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                      {portfolio.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {portfolio.description}
                    </div>
                  </div>
                  <span style={{ fontSize: 20 }}>→</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 기업의 전체 공고 리스트 */}
      <section>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 700 }}>
          {company.name}의 전체 공고 ({company.otherJobs.length})
        </h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {company.otherJobs.map(job => (
            <JobCard
              key={job.id}
              {...job}
              isBookmarked={false}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

