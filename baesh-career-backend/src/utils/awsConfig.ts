import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

// AWS Systems Manager에서 환경 변수 가져오기
export const getParameter = async (name: string): Promise<string> => {
  // 로컬 개발 환경에서는 환경 변수 직접 사용
  if (process.env.NODE_ENV !== 'production') {
    return process.env[name] || '';
  }

  try {
    const client = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });
    const command = new GetParameterCommand({
      Name: name,
      WithDecryption: true
    });

    const response = await client.send(command);
    return response.Parameter?.Value || '';
  } catch (error) {
    console.error(`Failed to get parameter ${name}:`, error);
    return '';
  }
};

// 환경 변수 초기화 (앱 시작 시 호출)
export const loadAwsConfig = async () => {
  if (process.env.NODE_ENV === 'production') {
    process.env.JWT_SECRET = await getParameter('/baesh/jwt-secret');
    process.env.UPSTAGE_API_KEY = await getParameter('/baesh/upstage-api-key');
    process.env.DATABASE_URL = await getParameter('/baesh/database-url');
  }
};


