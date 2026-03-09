// 대화 세션 관리 - 백엔드 API 사용

export type ChatSession = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Array<{
    role: 'user' | 'clone'
    text: string
  }>
  summary?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const CURRENT_SESSION_KEY = 'baesh_current_session'

const getToken = (): string | null => {
  return localStorage.getItem('baesh-token');
};

// 백엔드에서 모든 세션 가져오기
export const getAllSessions = async (): Promise<ChatSession[]> => {
  try {
    const token = getToken();
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    const data = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.error('Get sessions error:', error);
    return [];
  }
}

// 세션 저장 - 백엔드 API 사용
export const saveSession = async (session: ChatSession): Promise<void> => {
  try {
    const token = getToken();
    if (!token) {
      console.warn('No token, cannot save session');
      return;
    }

    // 메시지를 백엔드 형식으로 변환
    const messages = session.messages.map(msg => ({
      role: msg.role === 'clone' ? 'assistant' : 'user',
      text: msg.text,
      timestamp: new Date().toISOString(),
    }));

    const response = await fetch(`${API_BASE_URL}/sessions/${session.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: session.title,
        messages,
        summary: session.summary,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save session');
    }
  } catch (error) {
    console.error('Save session error:', error);
  }
}

// 세션 삭제 - 백엔드 API 사용
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    const token = getToken();
    if (!token) {
      console.warn('No token, cannot delete session');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete session');
    }

    // 현재 세션이 삭제된 세션이면 초기화
    if (getCurrentSessionId() === sessionId) {
      localStorage.removeItem(CURRENT_SESSION_KEY)
    }
  } catch (error) {
    console.error('Delete session error:', error);
  }
}

// 현재 세션 ID 가져오기
export const getCurrentSessionId = (): string | null => {
  return localStorage.getItem(CURRENT_SESSION_KEY)
}

// 현재 세션 ID 설정
export const setCurrentSessionId = (sessionId: string): void => {
  localStorage.setItem(CURRENT_SESSION_KEY, sessionId)
}

// 새 세션 생성 - 백엔드 API 사용
export const createNewSession = async (): Promise<ChatSession> => {
  try {
    const token = getToken();
    if (!token) {
      // 토큰이 없으면 로컬 세션 생성
      return {
        id: `session_${Date.now()}`,
        title: '새 대화',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
    }

    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: '새 대화',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    const session = await response.json();
    return {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: (session.messages || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'clone' : 'user',
        text: msg.text,
      })),
      summary: session.summary,
    };
  } catch (error) {
    console.error('Create session error:', error);
    // 실패 시 로컬 세션 반환
    return {
      id: `session_${Date.now()}`,
      title: '새 대화',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
  }
}

// AI를 사용하여 대화 제목 생성
export const generateSessionTitle = async (messages: Array<{ role: 'user' | 'clone', text: string }>): Promise<string> => {
  // 첫 3개의 사용자 메시지를 기반으로 제목 생성
  const userMessages = messages
    .filter(m => m.role === 'user')
    .slice(0, 3)
    .map(m => m.text)
    .join(' ')
  
  if (!userMessages) return '새 대화'
  
  // 간단한 규칙 기반 제목 생성 (실제로는 AI API를 사용할 수 있음)
  const keywords = ['포트폴리오', '라운지', 'JD', '채용', '목표', '성장', '네트워킹', '프로젝트', '스킬', '경력']
  const foundKeyword = keywords.find(k => userMessages.includes(k))
  
  if (foundKeyword) {
    return `${foundKeyword} 관련 상담`
  }
  
  // 첫 사용자 메시지의 처음 20자를 제목으로
  const firstMessage = messages.find(m => m.role === 'user')?.text || '새 대화'
  return firstMessage.length > 20 ? firstMessage.slice(0, 20) + '...' : firstMessage
}

// 세션 제목 업데이트 - 백엔드 API 사용
export const updateSessionTitle = async (sessionId: string, title: string): Promise<void> => {
  try {
    const token = getToken();
    if (!token) {
      console.warn('No token, cannot update session title');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error('Failed to update session title');
    }
  } catch (error) {
    console.error('Update session title error:', error);
  }
}

// 세션 로드 - 백엔드 API 사용
export const loadSession = async (sessionId: string): Promise<ChatSession | null> => {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    return {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: (session.messages || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'clone' : 'user',
        text: msg.text,
      })),
      summary: session.summary,
    };
  } catch (error) {
    console.error('Load session error:', error);
    return null;
  }
}

