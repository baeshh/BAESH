import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { apiPost } from '../utils/api';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isApplying = searchParams.get('apply') === 'true';
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(true);
  const [skillGapVisible, setSkillGapVisible] = useState(false);
  const [coverLetterVisible, setCoverLetterVisible] = useState(false);
  const [interviewQuestionsVisible, setInterviewQuestionsVisible] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [motivation, setMotivation] = useState('');

  // 더미 데이터
  const job = {
    id: id || '1',
    title: 'AI/ML 엔지니어 (컴퓨터 비전)',
    company: '테크스타트업',
    position: '시니어',
    matchRate: 92,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'Deep Learning', 'OpenCV'],
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'Deep Learning', 'SQL', 'Data Modeling'],
    mySkills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'Deep Learning'],
    missingSkills: ['SQL', 'Data Modeling'],
    type: '정규직',
    experience: '경력 3년 이상',
    location: '서울 · 원격 가능',
    deadline: 'D-3',
    salary: '협의',
    description: `
      우리는 AI 기반 이미지 분석 솔루션을 개발하는 테크스타트업입니다.
      최신 딥러닝 기술을 활용하여 혁신적인 제품을 만들어가는 팀에 합류할 인재를 찾고 있습니다.
    `,
    responsibilities: [
      '컴퓨터 비전 기반 딥러닝 모델 개발 및 최적화',
      '대규모 이미지 데이터셋 처리 및 전처리 파이프라인 구축',
      '모델 성능 평가 및 개선',
      '연구 논문 리뷰 및 최신 기술 적용',
      '팀 내 기술 공유 및 멘토링'
    ],
    requirements: [
      'Python, TensorFlow, PyTorch를 활용한 딥러닝 프로젝트 경험',
      '컴퓨터 비전 또는 이미지 처리 경험',
      '대규모 데이터셋 처리 경험',
      'Git을 활용한 협업 경험'
    ],
    preferred: [
      '데이터 분석 경험 3년 이상',
      '클라우드 환경(AWS, GCP) 경험',
      '팀 리딩 및 협업 경험',
      '논문 발표 또는 오픈소스 기여 경력'
    ],
    benefits: [
      '자율적인 업무 환경',
      '성장 지원 (교육비, 컨퍼런스 참가 지원)',
      '유연한 근무 시간',
      '최신 장비 및 개발 환경 제공'
    ],
    culture: ['자율성', '성장지원', '워라밸', '혁신'],
  };

  const handleApply = () => {
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (motivation.length > 1000) {
      alert('지원 동기는 1000자 이하로 작성해주세요.');
      return;
    }
    setApplying(true);
    
    try {
      // 백엔드에 지원 내역 저장
      await apiPost('/applications', {
        jobId: id,
        type: 'job',
        motivation: motivation || undefined,
      });
      
      setApplied(true);
      setTimeout(() => {
        setApplyModalOpen(false);
        setApplied(false);
        setMotivation('');
        navigate('/lounge/applications');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('지원 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* 상단 요약 박스 */}
      <section className="panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* 회사 로고 */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            background: 'linear-gradient(135deg, var(--brand), var(--accent))',
            display: 'grid',
            placeItems: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 32,
            flexShrink: 0
          }}>
            {job.company.charAt(0)}
          </div>

          {/* 공고 정보 */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700 }}>
                  {job.title}
                </h1>
                <div style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 12 }}>
                  {job.company} · {job.position}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {job.skills.map(skill => (
                    <span key={skill} className="chip" style={{ fontSize: 12 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 24,
                  color: isBookmarked ? '#F59E0B' : 'var(--muted)',
                  padding: 8
                }}
              >
                {isBookmarked ? '★' : '☆'}
              </button>
            </div>

            {/* 매칭률 */}
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              padding: '8px 16px',
              background: 'rgba(30, 111, 255, 0.1)',
              borderRadius: 999,
              marginBottom: 16
            }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand)' }}>
                AI 매칭률 {job.matchRate}%
              </span>
            </div>

            {/* 메타 정보 */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 16, 
              fontSize: 14, 
              color: 'var(--muted)',
              marginBottom: 20
            }}>
              <span>{job.type}</span>
              <span>·</span>
              <span>{job.experience}</span>
              <span>·</span>
              <span>{job.location}</span>
              <span>·</span>
              <span>마감 {job.deadline}</span>
            </div>

            {/* 지원 버튼 */}
            <button
              className="button"
              onClick={handleApply}
              style={{
                fontSize: 16,
                fontWeight: 600,
                height: 48,
                padding: '0 32px'
              }}
            >
              지원하기
            </button>
          </div>
        </div>
      </section>

      {/* 공고 설명 */}
      <section className="panel" style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 700 }}>공고 설명</h2>
        
        <div style={{ display: 'grid', gap: 24 }}>
          {/* 기업 소개 */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>기업 소개</h3>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text)', margin: 0 }}>
              {job.description}
            </p>
          </div>

          {/* 역할 및 주요 업무 */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>역할 및 주요 업무</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
              {job.responsibilities.map((item, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
          </div>

          {/* 필요 역량 및 스킬 */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>필요 역량 및 스킬</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
              {job.requirements.map((item, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
          </div>

          {/* 우대사항 */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>우대사항</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
              {job.preferred.map((item, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
          </div>

          {/* 혜택과 환경 */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>혜택과 환경</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
              {job.benefits.map((item, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {job.culture.map(culture => (
                <span key={culture} className="badge" style={{ fontSize: 11 }}>
                  {culture}
                </span>
              ))}
            </div>
          </div>

          {/* 근무 형태/지역 */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>근무 형태</h3>
            <div style={{ fontSize: 14, lineHeight: 1.8 }}>
              <div>형태: {job.type}</div>
              <div>지역: {job.location}</div>
              <div>경력: {job.experience}</div>
              <div>마감일: {job.deadline}</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI 기반 기능 (BAESH 특화 기능) */}
      {showAIFeatures && (
        <section className="panel" style={{ 
          padding: 24, 
          background: 'linear-gradient(135deg, rgba(30, 111, 255, 0.05) 0%, rgba(64, 140, 255, 0.05) 100%)',
          border: '2px solid rgba(30, 111, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
              ✨ AI 준비 패키지
            </h2>
            <span className="badge" style={{ fontSize: 11, background: 'rgba(30, 111, 255, 0.1)', color: 'var(--brand)' }}>
              BAESH 특화 기능
            </span>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {/* 스킬 갭 분석 */}
            <div className="panel" style={{ padding: 20, background: 'var(--panel)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>스킬 갭 분석</h3>
                <button
                  className="button--ghost"
                  onClick={() => setSkillGapVisible(!skillGapVisible)}
                  style={{ fontSize: 12, height: 28, padding: '0 12px' }}
                >
                  {skillGapVisible ? '접기' : '자세히 보기'}
                </button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px 0' }}>
                AI가 분석한 직무와 나의 스킬 격차
              </p>
              {skillGapVisible && (
                <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>보유 스킬</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {job.mySkills.map(skill => (
                        <span key={skill} className="badge" style={{ 
                          fontSize: 11, 
                          background: 'rgba(34, 197, 94, 0.1)', 
                          color: '#16A34A'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>부족 스킬</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {job.missingSkills.map(skill => (
                        <span key={skill} className="badge" style={{ 
                          fontSize: 11, 
                          background: 'rgba(239, 68, 68, 0.1)', 
                          color: '#DC2626'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ 
                    padding: 12, 
                    background: 'rgba(30, 111, 255, 0.05)', 
                    borderRadius: 8,
                    fontSize: 13,
                    lineHeight: 1.6
                  }}>
                    <strong>성장 경로 추천:</strong> SQL과 Data Modeling 학습을 위해 온라인 강의와 실습 프로젝트를 추천합니다.
                  </div>
                </div>
              )}
            </div>

            {/* 포트폴리오 자동 최적화 */}
            <div className="panel" style={{ padding: 20, background: 'var(--panel)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>포트폴리오 자동 최적화</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px 0' }}>
                AI가 공고 핵심 키워드로 포트폴리오를 자동으로 최적화합니다
              </p>
              <button className="button" style={{ fontSize: 13, height: 36 }}>
                포트폴리오 최적화하기
              </button>
            </div>

            {/* 맞춤 자기소개서 초안 */}
            <div className="panel" style={{ padding: 20, background: 'var(--panel)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>맞춤 자기소개서 초안</h3>
                <button
                  className="button--ghost"
                  onClick={() => setCoverLetterVisible(!coverLetterVisible)}
                  style={{ fontSize: 12, height: 28, padding: '0 12px' }}
                >
                  {coverLetterVisible ? '접기' : '생성하기'}
                </button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                AI가 작성해주는 맞춤 자기소개서 초안
              </p>
              {coverLetterVisible && (
                <div style={{ 
                  marginTop: 16, 
                  padding: 16, 
                  background: '#F8FAFC', 
                  borderRadius: 8,
                  fontSize: 13,
                  lineHeight: 1.8
                }}>
                  <p style={{ margin: '0 0 12px 0' }}>
                    안녕하세요. 저는 AI/ML 분야에서 3년 이상의 경험을 보유한 개발자입니다. 
                    Python과 TensorFlow, PyTorch를 활용한 딥러닝 프로젝트를 다수 수행했으며, 
                    특히 컴퓨터 비전 분야에서 실무 경험을 쌓았습니다.
                  </p>
                  <p style={{ margin: '0 0 12px 0' }}>
                    귀사의 혁신적인 AI 솔루션 개발에 기여하고 싶습니다. 
                    자율적인 업무 환경과 성장 지원 문화가 저의 전문성을 더욱 발전시킬 수 있는 
                    최적의 환경이라고 생각합니다.
                  </p>
                  <p style={{ margin: 0 }}>
                    SQL과 Data Modeling에 대한 학습 계획을 수립하여 빠르게 보완하겠습니다.
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="button--ghost" style={{ fontSize: 12, height: 32, padding: '0 12px' }}>
                      복사
                    </button>
                    <button className="button--ghost" style={{ fontSize: 12, height: 32, padding: '0 12px' }}>
                      수정
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 면접 예상 질문 */}
            <div className="panel" style={{ padding: 20, background: 'var(--panel)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>면접 예상 질문</h3>
                <button
                  className="button--ghost"
                  onClick={() => setInterviewQuestionsVisible(!interviewQuestionsVisible)}
                  style={{ fontSize: 12, height: 28, padding: '0 12px' }}
                >
                  {interviewQuestionsVisible ? '접기' : '생성하기'}
                </button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                AI 면접 예상 질문 목록 자동 생성
              </p>
              {interviewQuestionsVisible && (
                <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                  {[
                    '컴퓨터 비전 프로젝트에서 가장 어려웠던 점은 무엇인가요?',
                    'TensorFlow와 PyTorch의 차이점에 대해 설명해주세요.',
                    '대규모 이미지 데이터셋을 처리할 때 주의해야 할 점은?',
                    '딥러닝 모델의 성능을 개선하기 위해 어떤 방법을 사용하시나요?'
                  ].map((q, idx) => (
                    <div key={idx} style={{ 
                      padding: 12, 
                      background: '#F8FAFC', 
                      borderRadius: 8,
                      fontSize: 13,
                      lineHeight: 1.6
                    }}>
                      {q}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 지원 방법 */}
      <section className="panel" style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 700 }}>지원 방법</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>기본 정보 자동 입력</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
              내 AI 프로필의 정보가 자동으로 입력됩니다.
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>포트폴리오 자동 연결</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
              LinkedIn, GitHub, Notion 포트폴리오가 자동으로 연결됩니다.
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>지원 동기 (선택사항)</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px 0' }}>
              이 공고에 지원하는 이유나 추가로 전달하고 싶은 내용을 작성해주세요.
            </p>
            <textarea
              className="input"
              placeholder="예: 이 포지션에 관심을 가지게 된 이유, 특별히 강조하고 싶은 경험, 회사에 대한 관심사 등을 자유롭게 작성해주세요."
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              style={{
                width: '100%',
                minHeight: 120,
                padding: 12,
                fontSize: 14,
                lineHeight: 1.6,
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ 
              marginTop: 8, 
              fontSize: 12, 
              color: 'var(--muted)',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>{motivation.length}자</span>
              <span>최대 1000자</span>
            </div>
          </div>
          <button
            className="button"
            onClick={handleApply}
            style={{
              marginTop: 8,
              fontSize: 16,
              fontWeight: 600,
              height: 48
            }}
          >
            지원하기
          </button>
        </div>
      </section>

      {/* 해당 기업의 다른 공고 */}
      <section className="panel" style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 700 }}>
          {job.company}의 다른 공고
        </h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { title: '프론트엔드 개발자', type: '정규직', deadline: 'D-5' },
            { title: '데이터 사이언티스트', type: '인턴', deadline: 'D-10' },
            { title: 'AI 연구원', type: '프로젝트', deadline: 'D-7' },
          ].map((otherJob, idx) => (
            <Link 
              key={idx} 
              to={`/lounge/jobs/${idx + 10}`}
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
                      {otherJob.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {otherJob.type} · 마감 {otherJob.deadline}
                    </div>
                  </div>
                  <span style={{ fontSize: 20 }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 지원 모달 */}
      <Modal
        open={applyModalOpen}
        onClose={() => {
          if (!applying && !applied) {
            setApplyModalOpen(false);
          }
        }}
        title="지원하기"
      >
        {applied ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 20, fontWeight: 600 }}>
              지원이 완료되었습니다!
            </h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
              지원 현황 페이지에서 결과를 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 24 }}>
            {/* 지원 정보 요약 */}
            <div className="panel" style={{ padding: 16, background: '#F8FAFC' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>지원 공고</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{job.title}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>{job.company}</div>
            </div>

            {/* 기본 정보 자동 입력 */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>
                기본 정보 자동 입력
              </h4>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px 0' }}>
                내 AI 프로필의 정보가 자동으로 입력됩니다.
              </p>
              <div style={{ 
                padding: 12, 
                background: '#F8FAFC', 
                borderRadius: 8,
                fontSize: 13,
                lineHeight: 1.6
              }}>
                <div><strong>이름:</strong> 승환</div>
                <div><strong>이메일:</strong> baesh6778@gmail.com</div>
                <div><strong>전화번호:</strong> 010-****-****</div>
                <div><strong>경력:</strong> 3년</div>
              </div>
            </div>

            {/* 포트폴리오 자동 연결 */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>
                포트폴리오 자동 연결
              </h4>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px 0' }}>
                LinkedIn, GitHub, Notion 포트폴리오가 자동으로 연결됩니다.
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: 12,
                  background: '#F8FAFC',
                  borderRadius: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>💼</span>
                    <span style={{ fontSize: 13 }}>LinkedIn</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>연결됨</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: 12,
                  background: '#F8FAFC',
                  borderRadius: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>💻</span>
                    <span style={{ fontSize: 13 }}>GitHub</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>연결됨</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: 12,
                  background: '#F8FAFC',
                  borderRadius: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>📝</span>
                    <span style={{ fontSize: 13 }}>Notion 포트폴리오</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>연결됨</span>
                </div>
              </div>
            </div>

            {/* 지원 동기 */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>
                지원 동기 (선택사항)
              </h4>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px 0' }}>
                이 공고에 지원하는 이유나 추가로 전달하고 싶은 내용을 작성해주세요.
                <br />
                <span style={{ fontSize: 12 }}>💡 AI 프로필이 이력서 역할을 대체하므로, 지원 동기를 통해 자신을 더 어필할 수 있습니다.</span>
              </p>
              <textarea
                className="input"
                placeholder="예: 이 포지션에 관심을 가지게 된 이유, 특별히 강조하고 싶은 경험, 회사에 대한 관심사 등을 자유롭게 작성해주세요."
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: 12,
                  fontSize: 14,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ 
                marginTop: 8, 
                fontSize: 12, 
                color: 'var(--muted)',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{motivation.length}자</span>
                <span>최대 1000자</span>
              </div>
            </div>

            {/* 지원 버튼 */}
            <div style={{ 
              display: 'flex', 
              gap: 8, 
              justifyContent: 'flex-end',
              paddingTop: 16,
              borderTop: '1px solid var(--border)'
            }}>
              <button
                className="button--ghost"
                onClick={() => setApplyModalOpen(false)}
                disabled={applying}
                style={{ fontSize: 14, height: 40, padding: '0 20px' }}
              >
                취소
              </button>
              <button
                className="button"
                onClick={handleSubmitApplication}
                disabled={applying}
                style={{ fontSize: 14, height: 40, padding: '0 24px' }}
              >
                {applying ? '지원 중...' : '지원하기'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

