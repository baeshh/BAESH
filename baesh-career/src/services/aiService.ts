// 백엔드 API를 통해 AI 서비스 사용
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getToken = (): string | null => {
  return localStorage.getItem('baesh-token');
};

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

// 일반 채팅 (스트리밍) - 백엔드 프록시 사용
export async function* streamChat(messages: Message[]) {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error('AI 서비스 오류');
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
  } catch (error) {
    console.error("AI 채팅 오류:", error);
    yield "죄송합니다. AI 응답 중 오류가 발생했습니다.";
  }
}

// 추론과 채팅 (스트리밍) - 백엔드 프록시 사용
export async function* streamChatWithReasoning(messages: Message[], reasoningEffort: "low" | "medium" | "high" = "high") {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ messages, reasoningEffort }),
    });

    if (!response.ok) {
      throw new Error('AI 서비스 오류');
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
  } catch (error) {
    console.error("AI 추론 채팅 오류:", error);
    yield "죄송합니다. AI 응답 중 오류가 발생했습니다.";
  }
}

// 일반 채팅 (비스트리밍) - 백엔드 프록시 사용
export async function chat(messages: Message[]): Promise<string> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error('AI 서비스 오류');
    }

    const data = await response.json();
    return data.content || "응답을 생성할 수 없습니다.";
  } catch (error) {
    console.error("AI 채팅 오류:", error);
    return "죄송합니다. AI 응답 중 오류가 발생했습니다.";
  }
}

// 추론과 채팅 (비스트리밍) - 백엔드 프록시 사용
export async function chatWithReasoning(messages: Message[], reasoningEffort: "low" | "medium" | "high" = "high"): Promise<string> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ messages, reasoningEffort }),
    });

    if (!response.ok) {
      throw new Error('AI 서비스 오류');
    }

    const data = await response.json();
    return data.content || "응답을 생성할 수 없습니다.";
  } catch (error) {
    console.error("AI 추론 채팅 오류:", error);
    return "죄송합니다. AI 응답 중 오류가 발생했습니다.";
  }
}

