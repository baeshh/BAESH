const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'baesh6778@gmail.com';
  const password = 'meta1234';
  
  // 기존 유저 찾기 또는 생성
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Seunghwan Bae',
      }
    });
    console.log('새 유저 생성됨:', user.id);
  } else {
    // 비밀번호 및 이름 업데이트
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        name: 'Seunghwan Bae'
      }
    });
    console.log('기존 유저 발견, 비밀번호 및 이름 업데이트:', user.id);
  }

  // 프로필 생성 또는 업데이트
  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      nickname: 'Seunghwan',
      school: 'Stanford University',
      major: 'Computer Science',
      status: ['Software Engineer', 'Meta Developer'],
      interests: ['AI/ML', 'LLM', 'PyTorch', 'Meta AI'],
      goals: 'Build innovative AI products at Meta. Contribute to open-source ML frameworks.',
      onboardingCompleted: true,
    },
    create: {
      userId: user.id,
      nickname: 'Seunghwan',
      school: 'Stanford University',
      major: 'Computer Science',
      status: ['Software Engineer', 'Meta Developer'],
      interests: ['AI/ML', 'LLM', 'PyTorch', 'Meta AI'],
      goals: 'Build innovative AI products at Meta. Contribute to open-source ML frameworks.',
      onboardingCompleted: true,
    }
  });
  console.log('프로필 생성/업데이트됨:', profile.id);

  // 기존 데이터 삭제 (중복 방지)
  await prisma.credential.deleteMany({ where: { profileId: profile.id } });
  await prisma.award.deleteMany({ where: { profileId: profile.id } });
  await prisma.portfolio.deleteMany({ where: { profileId: profile.id } });
  await prisma.career.deleteMany({ where: { profileId: profile.id } });
  await prisma.organization.deleteMany({ where: { profileId: profile.id } });

  // 자격증 추가
  const credentials = await prisma.credential.createMany({
    data: [
      { profileId: profile.id, name: 'AWS Solutions Architect Associate', issuer: 'Amazon Web Services', verified: true },
      { profileId: profile.id, name: 'TensorFlow Developer Certificate', issuer: 'Google', verified: true },
      { profileId: profile.id, name: 'SQL Developer (SQLD)', issuer: 'Korea Data Agency', verified: true },
      { profileId: profile.id, name: 'Information Processing Engineer', issuer: 'Human Resources Development Service of Korea', verified: true },
      { profileId: profile.id, name: 'TOEIC 925', issuer: 'ETS', verified: true },
      { profileId: profile.id, name: 'Meta Certified Developer', issuer: 'Meta', verified: true },
      { profileId: profile.id, name: 'Meta AI Engineer Certification', issuer: 'Meta', verified: true },
      { profileId: profile.id, name: 'PyTorch Professional Certificate', issuer: 'Meta AI', verified: true },
    ]
  });
  console.log('자격증 추가됨:', credentials.count);

  // 수상경력 추가
  const awards = await prisma.award.createMany({
    data: [
      { profileId: profile.id, name: 'AI Hackathon Grand Prize', organization: 'Naver Cloud', year: '2025' },
      { profileId: profile.id, name: 'Meta Llama LLM Application Hackathon 1st Place', organization: 'Meta', year: '2024' },
      { profileId: profile.id, name: 'Capstone Design Excellence Award', organization: 'Hanyang University, College of Engineering', year: '2024' },
      { profileId: profile.id, name: 'Startup Competition Top Award', organization: 'Hanyang University', year: '2024' },
    ]
  });
  console.log('수상경력 추가됨:', awards.count);

  // 포트폴리오 추가
  const portfolios = await prisma.portfolio.createMany({
    data: [
      { 
        profileId: profile.id, 
        name: 'AI Resume Analyzer', 
        role: 'ML Engineer', 
        techStack: 'Python, PyTorch, FastAPI, LangChain, NLP',
        period: '2024.03 - 2024.05',
        achievements: 'Built RAG-based document Q&A system, achieved 95% response accuracy',
        verified: true 
      },
      { 
        profileId: profile.id, 
        name: 'Real-time Stock Prediction Dashboard', 
        role: 'Data Engineer', 
        techStack: 'Python, Pandas, Scikit-learn, SQL, Statistics',
        period: '2023.09 - 2023.12',
        achievements: 'Developed real-time prediction system with 85% accuracy, processed 1M+ data points daily',
        verified: true 
      },
      { 
        profileId: profile.id, 
        name: 'BAESH Career Platform', 
        role: 'Full Stack Developer', 
        techStack: 'React, TypeScript, Node.js, Prisma, Upstage Solar Pro2',
        period: '2024.10 - Present',
        achievements: 'AI-based career platform development, reached 10,000 users',
        verified: true 
      },
      { 
        profileId: profile.id, 
        name: 'Meta Llama LLM Application', 
        role: 'AI Engineer', 
        techStack: 'Python, PyTorch, Meta Llama, LangChain',
        period: '2024.06 - 2024.08',
        achievements: 'Won 1st place in Meta Llama Hackathon, deployed production-ready LLM application',
        verified: true 
      },
    ]
  });
  console.log('포트폴리오 추가됨:', portfolios.count);

  // 경력 추가
  const careers = await prisma.career.createMany({
    data: [
      { profileId: profile.id, company: 'Meta', role: 'Software Engineer (AI/ML)', period: '2024.06 - Present', verified: true },
      { profileId: profile.id, company: 'Meta', role: 'AI Research Intern', period: '2024.07 - 2024.08', verified: true },
      { profileId: profile.id, company: 'Naver AI Lab', role: 'ML Engineer Intern', period: '2024.03 - 2024.05', verified: true },
      { profileId: profile.id, company: 'Toss', role: 'Backend Developer Intern', period: '2023.12 - 2024.02', verified: true },
    ]
  });
  console.log('경력 추가됨:', careers.count);

  // 단체 추가
  const organizations = await prisma.organization.createMany({
    data: [
      { profileId: profile.id, name: 'GDSC Stanford University', role: 'Core Member', verified: true },
      { profileId: profile.id, name: 'Meta Developer Community', role: 'Active Contributor', verified: true },
      { profileId: profile.id, name: 'IEEE Computer Society', role: 'Member', verified: true },
      { profileId: profile.id, name: 'ACM Special Interest Group on AI', role: 'Member', verified: true },
    ]
  });
  console.log('단체 추가됨:', organizations.count);

  // 샘플 게시물 추가 (기존 게시물이 없을 때만)
  const existingPosts = await prisma.post.count({ where: { userId: user.id } });
  if (existingPosts === 0) {
    await prisma.post.createMany({
      data: [
        { userId: user.id, title: 'Building BAESH: AI-Powered Career Platform', content: 'Just completed Pohang TP certification! Preparing for a new project. Looking to network with people interested in AI and data-driven startups.', tags: ['AI', 'Startup', 'Data'], type: 'networking' },
        { userId: user.id, title: 'Meta Llama Hackathon Experience', content: 'Won first place at this hackathon! Sharing the process of developing an AI-based solution.', tags: ['Hackathon', 'AI', 'Winner'], type: 'networking' },
        { userId: user.id, title: 'Completed Pohang TP AI Advanced Course', content: 'Finished 3 months of AI advanced course. The hands-on project experience was really valuable!', tags: ['AI', 'Education', 'Completion'], type: 'networking' },
        { userId: user.id, title: 'Sharing Data Engineering Experience', content: 'Worked on building an AWS-based data pipeline project. Sharing the problems I encountered and how I solved them.', tags: ['Data', 'AWS', 'Engineering'], type: 'networking' },
      ]
    });
    console.log('샘플 게시물 4개 추가됨');
  }

  console.log('\n✅ 모든 데이터 추가 완료!');
  console.log('========================================');
  console.log('📧 Email (ID):', email);
  console.log('🔑 Password:', password);
  console.log('👤 Name: Seunghwan Bae');
  console.log('💼 Role: Meta Developer');
  console.log('🌍 All profiles in English');
  console.log('========================================');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
