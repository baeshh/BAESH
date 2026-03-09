// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 토큰 가져오기
const getToken = (): string | null => {
  return localStorage.getItem('baesh-token');
};

// 기본 fetch 래퍼
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// POST 요청
export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// GET 요청
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
  });
}

// PUT 요청
export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE 요청
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
  });
}

// PATCH 요청
export async function apiPatch<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// 알림 관련 API
export interface Notification {
  id: string;
  userId: string;
  type: 'lounge' | 'networking' | 'job' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

// 알림 목록 가져오기
export async function getNotifications(): Promise<NotificationsResponse> {
  return apiGet<NotificationsResponse>('/notifications');
}

// 알림 읽음 처리
export async function markNotificationAsRead(id: string): Promise<{ success: boolean }> {
  return apiPatch<{ success: boolean }>(`/notifications/${id}/read`);
}

// 모든 알림 읽음 처리
export async function markAllNotificationsAsRead(): Promise<{ success: boolean }> {
  return apiPatch<{ success: boolean }>('/notifications/read-all');
}

// SSE 스트리밍 요청
export async function* apiStream(
  endpoint: string,
  data: any
): AsyncGenerator<string, void, unknown> {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body');
  }

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            yield parsed.content;
          }
        } catch (e) {
          // JSON 파싱 실패 시 무시
        }
      }
    }
  }
}

