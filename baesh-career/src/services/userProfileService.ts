// 사용자 프로필 데이터를 AI 클론이 이해할 수 있는 형식으로 변환

export type UserProfile = {
  basic: {
    name: string
    nickname?: string
    school?: string
    major?: string
    status: string[]
  }
  credentials: Array<{
    name: string
    issuer: string
    verified: boolean
  }>
  awards: Array<{
    name: string
    organization: string
    year: string
  }>
  careers: Array<{
    company: string
    role: string
    period: string
    verified: boolean
  }>
  portfolios: Array<{
    name: string
    role: string
    techStack: string
    period: string
    achievements: string
    verified: boolean
  }>
  organizations: Array<{
    name: string
    role?: string
    verified: boolean
  }>
  topSkills: Array<{
    name: string
    score: number
    color: string
  }>
  interests: string[]
  goals?: string
  recentPosts?: Array<{
    title: string
    content: string
    tags: string[]
    timestamp: string
  }>
}

// 백엔드 API에서 사용자 프로필 가져오기
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getToken = (): string | null => {
  return localStorage.getItem('baesh-token');
};

// 빈 프로필 생성 (새 사용자용)
const getEmptyProfile = (userName: string): UserProfile => {
  return {
    basic: {
      name: userName,
      nickname: undefined,
      school: undefined,
      major: undefined,
      status: [],
    },
    credentials: [],
    awards: [],
    careers: [],
    portfolios: [],
    organizations: [],
    topSkills: [], // 빈 배열
    interests: [],
    goals: undefined,
  };
};

// 백엔드에서 프로필 가져오기
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // 인증 실패 - 토큰이 유효하지 않음
        throw new Error('Unauthorized - Please login again');
      }
      if (response.status === 404) {
        // 프로필이 없으면 빈 프로필 반환
        // 백엔드에서 사용자 이름을 반환하므로 여기서는 기본값 사용
        return getEmptyProfile('사용자');
      }
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const data = await response.json();
    
    // 백엔드 데이터를 프론트엔드 형식으로 변환
    const profile: UserProfile & { profilePhoto?: string; coverImage?: string; headline?: string; username?: string } = {
      basic: {
        name: data.basic?.name || '사용자',
        nickname: data.basic?.nickname,
        school: data.basic?.school,
        major: data.basic?.major,
        status: Array.isArray(data.basic?.status) ? data.basic.status : [],
      },
      credentials: Array.isArray(data.credentials) ? data.credentials : [],
      awards: Array.isArray(data.awards) ? data.awards : [],
      careers: Array.isArray(data.careers) ? data.careers : [],
      portfolios: Array.isArray(data.portfolios) ? data.portfolios : [],
      organizations: Array.isArray(data.organizations) ? data.organizations : [],
      topSkills: Array.isArray(data.topSkills) ? data.topSkills : [],
      interests: Array.isArray(data.interests) ? data.interests : [],
      goals: data.goals,
    };
    
    // 프로필 사진 및 추가 정보 포함
    if (data.profilePhoto) profile.profilePhoto = data.profilePhoto;
    if (data.coverImage) profile.coverImage = data.coverImage;
    if (data.headline) profile.headline = data.headline;
    if (data.username) profile.username = data.username;
    
    return profile;
  } catch (error) {
    console.error('Get profile error:', error);
    // 에러 시 빈 프로필 반환 (localStorage 사용하지 않음)
    // 백엔드에서 현재 로그인한 사용자 정보를 가져와야 함
    throw error; // 에러를 다시 throw하여 호출자가 처리하도록 함
  }
};

// 더미 사용자 프로필 (폴백용)
const getDummyProfile = (): UserProfile => {
  return {
    basic: {
      name: 'Seunghwan Bae',
      nickname: 'Seunghwan',
      school: 'Stanford University',
      major: 'Computer Science',
      status: ['💼 Software Engineer', '🚀 Meta Developer', '🏆 Award Winner', '🌍 Global Experience']
    },
    credentials: [
      // Certifications
      { name: 'AWS Solutions Architect Associate', issuer: 'Amazon Web Services', verified: true },
      { name: 'TensorFlow Developer Certificate', issuer: 'Google', verified: true },
      { name: 'SQL Developer (SQLD)', issuer: 'Korea Data Agency', verified: true },
      { name: 'Information Processing Engineer', issuer: 'Human Resources Development Service of Korea', verified: true },
      { name: 'TOEIC 925', issuer: 'ETS', verified: true },
      { name: 'Meta Certified Developer', issuer: 'Meta', verified: true },
      { name: 'Meta AI Engineer Certification', issuer: 'Meta', verified: true },
      { name: 'PyTorch Professional Certificate', issuer: 'Meta AI', verified: true },
    ],
    awards: [
      // Awards & Achievements
      { name: 'AI Hackathon Grand Prize', organization: 'Naver Cloud', year: '2025' },
      { name: 'Meta Llama LLM Application Hackathon 1st Place', organization: 'Meta', year: '2024' },
      { name: 'Capstone Design Excellence Award', organization: 'Hanyang University, College of Engineering', year: '2024' },
      { name: 'Startup Competition Top Award', organization: 'Hanyang University', year: '2024' },
      { name: 'Global Innovation Award', organization: 'Jeju Creative Economy Innovation Center', year: '2024' },
      { name: 'Start-up Vision Award', organization: 'Busan Economic Promotion Agency', year: '2024' },
      { name: 'Venture Entrepreneur Award', organization: 'Busan Creative Economy Innovation Center', year: '2024' },
      { name: 'ICT COG Startup Competition Excellence Award (1st Place)', organization: 'Daegu Gyeongbuk Institute of Science and Technology', year: '2024' },
    ],
    careers: [
      { company: 'Meta', role: 'Software Engineer (AI/ML)', period: '2024.06 - Present', verified: true },
      { company: 'Meta', role: 'AI Research Intern', period: '2024.07 - 2024.08', verified: true },
      { company: 'Naver AI Lab', role: 'ML Engineer Intern', period: '2024.03 - 2024.05', verified: true },
      { company: 'Toss', role: 'Backend Developer Intern', period: '2023.12 - 2024.02', verified: true }
    ],
    portfolios: [
      {
        name: 'AI Resume Analyzer',
        role: 'ML Engineer',
        techStack: 'Python, PyTorch, FastAPI, LangChain, NLP',
        period: '2024.03 - 2024.05',
        achievements: 'Built RAG-based document Q&A system, achieved 95% response accuracy',
        verified: true
      },
      {
        name: 'Real-time Stock Prediction Dashboard',
        role: 'Data Engineer',
        techStack: 'Python, Pandas, Scikit-learn, SQL, Statistics',
        period: '2023.09 - 2023.12',
        achievements: 'Developed real-time prediction system with 85% accuracy, processed 1M+ data points daily',
        verified: true
      },
      {
        name: 'BAESH Career Platform',
        role: 'Full Stack Developer',
        techStack: 'React, TypeScript, Node.js, Prisma, Upstage Solar Pro2',
        period: '2024.10 - Present',
        achievements: 'AI-based career platform development, reached 10,000 users',
        verified: true
      },
      {
        name: 'Meta Llama LLM Application',
        role: 'AI Engineer',
        techStack: 'Python, PyTorch, Meta Llama, LangChain',
        period: '2024.06 - 2024.08',
        achievements: 'Won 1st place in Meta Llama Hackathon, deployed production-ready LLM application',
        verified: true
      }
    ],
    organizations: [
      { name: 'GDSC Stanford University', role: 'Core Member', verified: true },
      { name: 'Meta Developer Community', role: 'Active Contributor', verified: true },
      { name: 'IEEE Computer Society', role: 'Member', verified: true },
      { name: 'ACM Special Interest Group on AI', role: 'Member', verified: true }
    ],
    topSkills: [
      { name: 'Development/Programming', score: 92, color: '#1E6FFF' },
      { name: 'AI/Machine Learning', score: 88, color: '#10B981' },
      { name: 'Data/Analytics', score: 85, color: '#6366F1' }
    ],
    interests: ['AI', 'Machine Learning', 'LLM', 'PyTorch', 'Meta AI', 'Full Stack', 'Cloud', 'Open Source'],
    goals: 'Build innovative AI products at Meta. Contribute to open-source ML frameworks. Lead AI research projects.',
    recentPosts: [
      {
        title: 'Working on Meta AI Research Projects',
        content: 'Excited to be contributing to cutting-edge AI research at Meta. Currently working on LLM applications and PyTorch framework improvements. Building the future of AI!',
        tags: ['Meta', 'AI', 'LLM', 'Research'],
        timestamp: '1 day ago'
      },
      {
        title: 'Meta Llama LLM 해커톤 1위 수상!',
        content: 'Meta에서 주최한 Llama LLM 응용 해커톤에서 1위를 수상했습니다! AI 클론 기반 커리어 플랫폼 BAESH의 기술력을 인정받아 기쁩니다. LLM을 활용한 실시간 커리어 코칭 시스템이 높은 평가를 받았습니다.',
        tags: ['Meta', 'LLM', 'AI', '수상'],
        timestamp: '3일 전'
      },
      {
        title: '구공패밀리 매출 1,400만원 돌파!',
        content: '빈티지 악세사리 리셀 플랫폼 구공패밀리가 2025년 7월 기준 1,400만원 매출을 달성했습니다. 작년 1,000만원에서 40% 성장! E-commerce와 창업에 관심 있는 분들과 경험을 나누고 싶습니다.',
        tags: ['창업', 'E-commerce', '매출'],
        timestamp: '1주일 전'
      }
    ]
  }
}

// 프로필을 AI가 이해할 수 있는 텍스트로 변환
export const formatProfileForAI = (profile: UserProfile): string => {
  let formatted = `# 사용자 프로필: ${profile.basic.name}\n\n`

  // 기본 정보
  formatted += `## 기본 정보\n`
  formatted += `- 이름: ${profile.basic.name}\n`
  if (profile.basic.nickname) formatted += `- 닉네임: ${profile.basic.nickname}\n`
  if (profile.basic.school) formatted += `- 학교: ${profile.basic.school} ${profile.basic.major || ''}\n`
  formatted += `- 현재 상태: ${profile.basic.status.join(', ')}\n\n`

  // 목표
  if (profile.goals) {
    formatted += `## 커리어 목표\n${profile.goals}\n\n`
  }

  // 스킬 수준
  formatted += `## 현재 역량 수준\n`
    // 상위 능력 표시
    if (profile.topSkills && profile.topSkills.length > 0) {
      formatted += `- 주요 능력:\n`
      profile.topSkills.forEach(skill => {
        formatted += `  * ${skill.name}: ${skill.score}%\n`
      })
      formatted += `\n`
    } else {
      formatted += `- 주요 능력: 아직 분석되지 않음\n\n`
    }

  // 관심사
  formatted += `## 관심 분야\n${profile.interests.join(', ')}\n\n`

  // 자격증/수료
  if (profile.credentials.length > 0) {
    formatted += `## 보유 자격증 및 수료증\n`
    profile.credentials.forEach(c => {
      formatted += `- ${c.name} (${c.issuer}) ${c.verified ? '✅ 인증됨' : '⚪ 미인증'}\n`
    })
    formatted += `\n`
  }

  // 수상 경력
  if (profile.awards.length > 0) {
    formatted += `## 수상 경력\n`
    profile.awards.forEach(a => {
      formatted += `- ${a.name} (${a.organization}, ${a.year})\n`
    })
    formatted += `\n`
  }

  // 경력
  if (profile.careers.length > 0) {
    formatted += `## 경력 사항\n`
    profile.careers.forEach(c => {
      formatted += `- ${c.company} - ${c.role} (${c.period}) ${c.verified ? '✅' : '⚪'}\n`
    })
    formatted += `\n`
  }

  // 포트폴리오 (가장 중요!)
  if (profile.portfolios.length > 0) {
    formatted += `## 주요 프로젝트 포트폴리오\n`
    profile.portfolios.forEach(p => {
      formatted += `### ${p.name} ${p.verified ? '✅ 인증됨' : ''}\n`
      formatted += `- 역할: ${p.role}\n`
      formatted += `- 기술 스택: ${p.techStack}\n`
      formatted += `- 기간: ${p.period}\n`
      formatted += `- 주요 성과: ${p.achievements}\n\n`
    })
  }

  // 단체/활동
  if (profile.organizations.length > 0) {
    formatted += `## 소속 단체 및 활동\n`
    profile.organizations.forEach(o => {
      formatted += `- ${o.name} ${o.verified ? '✅' : '⚪'}\n`
    })
    formatted += `\n`
  }

  // 최근 네트워킹 게시물
  if (profile.recentPosts && profile.recentPosts.length > 0) {
    formatted += `## 최근 네트워킹 활동 (게시물)\n`
    profile.recentPosts.forEach(p => {
      formatted += `### "${p.title}" (${p.timestamp})\n`
      formatted += `${p.content}\n`
      formatted += `태그: ${p.tags.join(', ')}\n\n`
    })
  }

  formatted += `---\n`
  formatted += `위 정보를 바탕으로 사용자의 커리어 상황을 정확히 이해하고, 맞춤형 조언을 제공해주세요.\n`
  formatted += `특히 포트폴리오와 최근 게시물을 참고하여 사용자의 관심사와 현재 진행 중인 프로젝트를 파악하세요.\n`

  return formatted
}

