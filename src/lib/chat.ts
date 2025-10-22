import type { Message, ChatState, ToolCall, WeatherResult, MCPResult, ErrorResult, SessionInfo } from '../../worker/types';
import { isToday, isYesterday, format, startOfDay } from 'date-fns';
export interface ChatResponse {
  success: boolean;
  data?: ChatState;
  error?: string;
}
export const MODELS = [
  { id: 'qwen/qwen-turbo', name: 'Qwen Turbo' },
  { id: 'qwen/qwen-plus', name: 'Qwen Plus' },
  { id: 'deepseek/deepseek-coder', name: 'Deepseek Coder' },
  { id: 'deepseek/deepseek-chat', name: 'Deepseek Chat' },
];
class ChatService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  async sendMessage(
    message: string,
    model?: string,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, stream: !!onChunk }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (onChunk && response.body) {
        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            if (chunk) {
              fullResponse += chunk;
              onChunk(chunk);
            }
          }
        } finally {
          reader.releaseLock();
        }
        return { success: true };
      }
      // Non-streaming response
      return await response.json();
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }
  async getMessages(): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get messages:', error);
      return { success: false, error: 'Failed to load messages' };
    }
  }
  async clearMessages(): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/clear`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to clear messages:', error);
      return { success: false, error: 'Failed to clear messages' };
    }
  }
  getSessionId(): string {
    return this.sessionId;
  }
  newSession(): void {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  switchSession(sessionId: string): void {
    this.sessionId = sessionId;
    this.baseUrl = `/api/chat/${sessionId}`;
  }
  // Session Management Methods
  async createSession(title?: string, sessionId?: string, firstMessage?: string): Promise<{ success: boolean; data?: { sessionId: string; title: string }; error?: string }> {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, sessionId, firstMessage })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to create session' };
    }
  }
  async listSessions(): Promise<{ success: boolean; data?: SessionInfo[]; error?: string }> {
    try {
      const response = await fetch('/api/sessions');
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to list sessions' };
    }
  }
  async deleteSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Failed to delete session' }));
        throw new Error(err.error);
      }
      return await response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/title`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Failed to update title' }));
        throw new Error(err.error);
      }
      return await response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }
  async clearAllSessions(): Promise<{ success: boolean; data?: { deletedCount: number }; error?: string }> {
    try {
      const response = await fetch('/api/sessions', { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to clear all sessions' };
    }
  }
  async updateModel(model: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to update model:', error);
      return { success: false, error: 'Failed to update model' };
    }
  }
}
export const chatService = new ChatService();
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};
export const generateSessionTitle = (firstUserMessage?: string): string => {
  const now = new Date();
  const dateTime = now.toLocaleString([], {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  if (!firstUserMessage || !firstUserMessage.trim()) {
    return `Chat ${dateTime}`;
  }
  const cleanMessage = firstUserMessage.trim().replace(/\s+/g, ' ');
  const truncated = cleanMessage.length > 50 ? cleanMessage.slice(0, 47) + '...' : cleanMessage;
  return `Research on '${truncated}' • ${dateTime}`;
};
export const renderToolCall = (toolCall: ToolCall): string => {
  const result = toolCall.result as WeatherResult | MCPResult | ErrorResult | { content: string } | undefined;
  if (!result) return `⚠️ ${toolCall.name}: No result`;
  if ('error' in result && result.error) return `❌ ${toolCall.name}: ${result.error}`;
  if (toolCall.name === 'data_query') {
    try {
      const data = JSON.parse((result as { content: string }).content);
      return `📊 Queried ${data.type}: ${data.results.length} results found for "${data.query}"`;
    } catch {
      return `🔧 ${toolCall.name}: Executed`;
    }
  }
  if ('content' in result) return `🔧 ${toolCall.name}: Executed`;
  if (toolCall.name === 'get_weather') {
    const weather = result as WeatherResult;
    return `🌤️ Weather in ${weather.location}: ${weather.temperature}°C, ${weather.condition}`;
  }
  return `🔧 ${toolCall.name}: Done`;
};
export const formatDateForGrouping = (timestamp: number): string => {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MM/dd/yyyy');
};