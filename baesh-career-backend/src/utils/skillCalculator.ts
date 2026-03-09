// 사용자의 교육과 커리어 데이터를 기반으로 능력을 동적으로 계산
// 객관적인 점수 산출을 위해 절대 기준 사용

type SkillCategory = {
  name: string;
  score: number;
  color: string;
};

// 100점 만점을 위한 기준 점수 (이 점수에 도달해야 100%)
// 현실적으로 시니어 개발자 수준의 경력/자격을 갖춰야 도달
const MAX_REFERENCE_SCORE = 150;

// 수상 등급별 가중치
const awardTierMultiplier: Record<string, number> = {
  '대상': 2.0,
  '금상': 1.8,
  '최우수': 1.7,
  '최우수상': 1.7,
  '우수': 1.4,
  '우수상': 1.4,
  '장려': 1.0,
  '장려상': 1.0,
  '입선': 0.7,
  '참가': 0.3,
};

// 자격증 난이도별 가중치
const credentialDifficultyMultiplier: Record<string, number> = {
  // 국가공인 전문자격증
  '정보처리기사': 1.5,
  '정보보안기사': 1.8,
  '빅데이터분석기사': 1.6,
  'SQLD': 1.0,
  'SQLP': 1.5,
  'ADsP': 1.0,
  'ADP': 1.5,
  
  // 글로벌 IT 자격증
  'AWS Solutions Architect': 1.8,
  'AWS Developer': 1.6,
  'AWS SysOps': 1.6,
  'GCP': 1.7,
  'Azure': 1.7,
  'CKA': 2.0,
  'CKAD': 1.8,
  
  // 어학
  'TOEIC': 0.5,
  'TOEFL': 0.7,
  'OPIC': 0.5,
  'IELTS': 0.7,
};

// 능력 카테고리 키워드 매핑
const skillKeywords: Record<string, string[]> = {
  '개발/프로그래밍': [
    '프로그래밍', '개발', '코딩', '소프트웨어', '알고리즘',
    'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Spring', 'Django',
    '백엔드', '프론트엔드', '풀스택', '웹개발', '앱개발', '모바일',
    '데이터베이스', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Git', 'GitHub', 'CI/CD', 'Docker', 'Kubernetes', 'AWS', '클라우드'
  ],
  'AI/머신러닝': [
    'AI', '인공지능', '머신러닝', '딥러닝', 'ML', 'DL',
    'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn',
    'NLP', '컴퓨터 비전', 'Computer Vision', '자연어처리',
    '데이터 분석', '데이터 사이언스', 'Data Science',
    'LLM', 'GPT', 'ChatGPT', 'Llama', 'BERT', 'Solar', 'Upstage'
  ],
  '데이터/분석': [
    '데이터', 'Data', '분석', 'Analytics', 'BI',
    'SQL', '데이터베이스', 'Database', '데이터 엔지니어링',
    '빅데이터', 'Big Data', 'Hadoop', 'Spark', 'Kafka',
    '데이터 시각화', 'Tableau', 'Power BI', '데이터 파이프라인'
  ],
  '디자인/UI/UX': [
    '디자인', 'Design', 'UI', 'UX', '인터페이스',
    'Figma', 'Sketch', 'Adobe', 'Photoshop', 'Illustrator',
    '프로토타이핑', '와이어프레임', '사용자 경험', 'User Experience',
    '그래픽 디자인', '웹 디자인', '모바일 디자인'
  ],
  '기획/PM': [
    '기획', '기획자', 'PM', 'Product Manager', '프로덕트 매니저',
    '서비스 기획', '비즈니스 기획', '전략 기획',
    '프로젝트 관리', 'Project Management', 'Agile', 'Scrum'
  ],
  '마케팅/브랜딩': [
    '마케팅', 'Marketing', '브랜딩', 'Branding',
    '디지털 마케팅', '소셜 미디어', '콘텐츠 마케팅',
    'SEO', 'SEM', '광고', 'Advertising', 'PR'
  ],
  '커뮤니케이션/리더십': [
    '커뮤니케이션', 'Communication', '리더십', 'Leadership',
    '협업', '팀워크', 'Teamwork', '프레젠테이션', 'Presentation',
    '멘토링', 'Mentoring', '조직 관리', '인사 관리'
  ],
  '창업/비즈니스': [
    '창업', 'Startup', '비즈니스', 'Business',
    '사업 기획', '비즈니스 모델', '투자 유치', '펀딩',
    '경영', 'Management', '전략', 'Strategy'
  ],
  '블록체인/Web3': [
    '블록체인', 'Blockchain', 'Web3', '암호화폐', 'Cryptocurrency',
    '스마트 컨트랙트', 'Smart Contract', 'Solidity', 'DeFi', 'NFT'
  ],
  '보안/사이버': [
    '보안', 'Security', '사이버 보안', 'Cybersecurity',
    '정보보안', '네트워크 보안', '침투 테스트', 'Penetration Testing'
  ]
};

// 텍스트에서 능력 키워드 매칭
function matchSkillKeywords(text: string): string[] {
  const matched: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(skillKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        if (!matched.includes(category)) {
          matched.push(category);
        }
      }
    }
  }
  
  return matched;
}

// 수상 등급 가중치 계산
function getAwardMultiplier(awardName: string): number {
  for (const [tier, multiplier] of Object.entries(awardTierMultiplier)) {
    if (awardName.includes(tier)) {
      return multiplier;
    }
  }
  return 1.0; // 기본 가중치
}

// 자격증 난이도 가중치 계산
function getCredentialMultiplier(credentialName: string): number {
  for (const [cert, multiplier] of Object.entries(credentialDifficultyMultiplier)) {
    if (credentialName.toUpperCase().includes(cert.toUpperCase())) {
      return multiplier;
    }
  }
  return 1.0; // 기본 가중치
}

// 경력 기간을 개월 수로 파싱
function parseCareerPeriodMonths(period: string): number {
  // "2024.01 - 2024.06" 형식
  const dateRangeMatch = period.match(/(\d{4})\.(\d{1,2})\s*-\s*(\d{4}|현재)\.?(\d{1,2})?/);
  if (dateRangeMatch) {
    const startYear = parseInt(dateRangeMatch[1]);
    const startMonth = parseInt(dateRangeMatch[2]);
    let endYear: number, endMonth: number;
    
    if (dateRangeMatch[3] === '현재') {
      const now = new Date();
      endYear = now.getFullYear();
      endMonth = now.getMonth() + 1;
    } else {
      endYear = parseInt(dateRangeMatch[3]);
      endMonth = dateRangeMatch[4] ? parseInt(dateRangeMatch[4]) : 12;
    }
    
    return (endYear - startYear) * 12 + (endMonth - startMonth);
  }
  
  // "6개월" 형식
  const monthMatch = period.match(/(\d+)\s*(개월|월|month)/i);
  if (monthMatch) {
    return parseInt(monthMatch[1]);
  }
  
  return 3; // 기본값 3개월 (보수적으로)
}

// 사용자 데이터를 기반으로 능력 점수 계산
export function calculateSkills(data: {
  credentials: Array<{ name: string; issuer: string; verified: boolean }>;
  careers: Array<{ company: string; role: string; period: string; verified: boolean }>;
  portfolios: Array<{ name: string; role: string; techStack: string; achievements: string; verified: boolean }>;
  awards: Array<{ name: string; organization: string; year: string }>;
  organizations: Array<{ name: string; role?: string; verified: boolean }>;
}): SkillCategory[] {
  const skillScores: Record<string, number> = {};
  
  // 자격/수료 분석
  for (const cred of data.credentials) {
    const matched = matchSkillKeywords(`${cred.name} ${cred.issuer}`);
    const credMultiplier = getCredentialMultiplier(cred.name);
    const verifiedBonus = cred.verified ? 1.3 : 1.0;
    const baseScore = 6; // 기본 6점
    
    for (const category of matched) {
      skillScores[category] = (skillScores[category] || 0) + (baseScore * credMultiplier * verifiedBonus);
    }
  }
  
  // 경력 분석 - 기간에 따라 점수 차등
  for (const career of data.careers) {
    const matched = matchSkillKeywords(`${career.role} ${career.company}`);
    const months = parseCareerPeriodMonths(career.period);
    const verifiedBonus = career.verified ? 1.4 : 1.0;
    
    // 경력 기간에 따른 점수 (로그 스케일로 체감 적용)
    // 1개월: 3점, 6개월: 8점, 12개월: 12점, 24개월: 18점
    const periodScore = Math.log2(months + 1) * 4;
    
    for (const category of matched) {
      skillScores[category] = (skillScores[category] || 0) + (periodScore * verifiedBonus);
    }
  }
  
  // 포트폴리오 분석 - 기술 스택 다양성 반영
  for (const portfolio of data.portfolios) {
    const matched = matchSkillKeywords(`${portfolio.name} ${portfolio.role} ${portfolio.techStack} ${portfolio.achievements}`);
    const verifiedBonus = portfolio.verified ? 1.3 : 1.0;
    
    // 기술 스택 개수에 따른 보너스 (최대 1.5배)
    const techCount = portfolio.techStack.split(',').length;
    const techDiversityBonus = Math.min(1 + techCount * 0.1, 1.5);
    
    const baseScore = 8; // 기본 8점
    
    for (const category of matched) {
      skillScores[category] = (skillScores[category] || 0) + (baseScore * verifiedBonus * techDiversityBonus);
    }
  }
  
  // 수상/성과 분석 - 등급에 따라 차등
  for (const award of data.awards) {
    const matched = matchSkillKeywords(`${award.name} ${award.organization}`);
    const awardMultiplier = getAwardMultiplier(award.name);
    const baseScore = 8; // 기본 8점
    
    for (const category of matched) {
      skillScores[category] = (skillScores[category] || 0) + (baseScore * awardMultiplier);
    }
  }
  
  // 단체/활동 분석
  for (const org of data.organizations) {
    const matched = matchSkillKeywords(`${org.name} ${org.role || ''}`);
    const verifiedBonus = org.verified ? 1.2 : 1.0;
    
    // 역할에 따른 가중치
    const role = (org.role || '').toLowerCase();
    let roleMultiplier = 1.0;
    if (role.includes('대표') || role.includes('회장') || role.includes('리더')) {
      roleMultiplier = 1.5;
    } else if (role.includes('운영') || role.includes('core') || role.includes('임원')) {
      roleMultiplier = 1.3;
    }
    
    const baseScore = 4; // 기본 4점
    
    for (const category of matched) {
      skillScores[category] = (skillScores[category] || 0) + (baseScore * verifiedBonus * roleMultiplier);
    }
  }
  
  // 능력 카테고리 배열로 변환
  const skills: SkillCategory[] = Object.entries(skillScores).map(([name, score]) => ({
    name,
    score,
    color: getSkillColor(name)
  }));
  
  // 점수순으로 정렬하고 상위 3개 선택
  skills.sort((a, b) => b.score - a.score);
  const topSkills = skills.slice(0, 3);
  
  // 절대 기준으로 100점 만점 계산 (MAX_REFERENCE_SCORE 기준)
  // 감점 요소: 데이터가 적으면 신뢰도 낮음
  const totalItems = data.credentials.length + data.careers.length + 
                     data.portfolios.length + data.awards.length + data.organizations.length;
  const dataReliabilityFactor = Math.min(totalItems / 10, 1); // 10개 이상이면 100% 신뢰
  
  return topSkills.map(skill => ({
    ...skill,
    // 절대 점수 기준 + 데이터 신뢰도 반영
    score: Math.min(99, Math.round((skill.score / MAX_REFERENCE_SCORE) * 100 * (0.7 + 0.3 * dataReliabilityFactor)))
  }));
}

// 능력 카테고리에 따른 색상 반환
function getSkillColor(category: string): string {
  const colorMap: Record<string, string> = {
    '개발/프로그래밍': '#1E6FFF',
    'AI/머신러닝': '#8B5CF6',
    '데이터/분석': '#10B981',
    '디자인/UI/UX': '#F59E0B',
    '기획/PM': '#EF4444',
    '마케팅/브랜딩': '#EC4899',
    '커뮤니케이션/리더십': '#10B981',
    '창업/비즈니스': '#6366F1',
    '블록체인/Web3': '#F97316',
    '보안/사이버': '#14B8A6'
  };
  
  return colorMap[category] || '#6B7280';
}

