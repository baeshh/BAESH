import prisma from './prisma';

export interface CreateNotificationParams {
  userId: string;
  type: 'lounge' | 'networking' | 'job' | 'system';
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

/**
 * 알림 생성 헬퍼 함수
 * 다른 컨트롤러에서 알림을 생성할 때 사용
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : null,
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * 라운지 관련 알림 생성 예시
 */
export async function createLoungeNotification(
  userId: string,
  activityName: string,
  status: 'approved' | 'rejected' | 'reminder',
  link?: string
) {
  const messages = {
    approved: `${activityName} 지원이 승인되었습니다! 🎉`,
    rejected: `${activityName} 지원 결과를 확인해주세요.`,
    reminder: `${activityName} 마감이 임박했습니다.`,
  };

  return createNotification({
    userId,
    type: 'lounge',
    title: '라운지 알림',
    message: messages[status],
    link: link || '/lounge',
    metadata: { activityName, status },
  });
}

/**
 * 네트워킹 관련 알림 생성 예시
 */
export async function createNetworkingNotification(
  userId: string,
  actorName: string,
  action: 'follow' | 'like' | 'comment',
  link?: string
) {
  const messages = {
    follow: `${actorName}님이 당신을 팔로우했습니다.`,
    like: `${actorName}님이 당신의 게시물에 좋아요를 눌렀습니다.`,
    comment: `${actorName}님이 당신의 게시물에 댓글을 남겼습니다.`,
  };

  return createNotification({
    userId,
    type: 'networking',
    title: '네트워킹 알림',
    message: messages[action],
    link: link || '/networking',
    metadata: { actorName, action },
  });
}

/**
 * 채용 관련 알림 생성 예시
 */
export async function createJobNotification(
  userId: string,
  jobTitle: string,
  companyName: string,
  status: 'applied' | 'reviewing' | 'interview' | 'accepted' | 'rejected',
  link?: string
) {
  const messages = {
    applied: `${companyName}의 ${jobTitle}에 지원이 완료되었습니다.`,
    reviewing: `${companyName}의 ${jobTitle} 지원서 검토 중입니다.`,
    interview: `${companyName}의 ${jobTitle} 면접 일정이 잡혔습니다.`,
    accepted: `축하합니다! ${companyName}의 ${jobTitle}에 합격하셨습니다! 🎉`,
    rejected: `${companyName}의 ${jobTitle} 지원 결과를 확인해주세요.`,
  };

  return createNotification({
    userId,
    type: 'job',
    title: '채용 알림',
    message: messages[status],
    link: link || '/lounge/applications',
    metadata: { jobTitle, companyName, status },
  });
}

