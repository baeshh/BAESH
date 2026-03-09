const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'baesh6778@gmail.com';
  
  // 사용자 찾기
  const user = await prisma.user.findUnique({ 
    where: { email } 
  });
  
  if (!user) {
    console.error('User not found:', email);
    process.exit(1);
  }
  
  console.log('User found:', user.id, user.name);
  
  // 프로젝트 생성
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'BAESH Project',
      description: 'A comprehensive project to build and improve the BAESH platform. This project involves developing features, integrating AI capabilities, and creating a seamless user experience for career development through project-based learning.',
      type: 'startup',
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      isOngoing: true,
      tags: ['AI', 'Career', 'Platform', 'Web Development', 'Startup'],
      status: 'inProgress',
      visibility: 'public',
      // 소유자를 팀 멤버로 자동 추가
      teamMembers: {
        create: {
          userId: user.id,
          role: 'development',
          participationType: 'invited',
          teamRole: 'owner',
          projectRoles: []
        }
      }
    },
    include: {
      teamMembers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              nickname: true
            }
          }
        }
      }
    }
  });
  
  console.log('Project created successfully:');
  console.log('  ID:', project.id);
  console.log('  Title:', project.title);
  console.log('  Type:', project.type);
  console.log('  Status:', project.status);
  console.log('  Team Members:', project.teamMembers.length);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
