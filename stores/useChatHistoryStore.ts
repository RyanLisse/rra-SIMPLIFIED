import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  reasoningLevel?: 'light' | 'medium' | 'deep';
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  sources?: Source[];
  timestamp: Date;
  model?: string;
}

export interface Source {
  id: string;
  title: string;
  url?: string;
  snippet: string;
  relevance?: number;
}

interface ChatHistoryStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  
  // Session management
  createSession: (title?: string) => ChatSession;
  ensureSession: () => ChatSession;
  deleteSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<ChatSession>) => void;
  setCurrentSession: (id: string) => void;
  getCurrentSession: () => ChatSession | undefined;
  
  // Message management
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  
  // History management
  clearHistory: () => void;
  exportHistory: () => string;
  importHistory: (data: string) => void;
}

const useChatHistoryStore = create<ChatHistoryStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      
      createSession: (title) => {
        const newSession: ChatSession = {
          id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: title || `Chat ${new Date().toLocaleDateString()}`,
          messages: [],
          model: 'gpt-5-mini',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        }));
        
        return newSession;
      },
      
      ensureSession: () => {
        const { sessions, currentSessionId, createSession } = get();
        
        // If no sessions exist, create one
        if (sessions.length === 0) {
          return createSession('New Chat');
        }
        
        // If no current session is set, set the first one
        if (!currentSessionId) {
          set({ currentSessionId: sessions[0].id });
          return sessions[0];
        }
        
        // Return current session or first available
        const currentSession = sessions.find(s => s.id === currentSessionId);
        return currentSession || sessions[0];
      },
      
      deleteSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
        }));
      },
      
      updateSession: (id, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
          ),
        }));
      },
      
      setCurrentSession: (id) => {
        set({ currentSessionId: id });
      },
      
      getCurrentSession: () => {
        const { sessions, currentSessionId } = get();
        return sessions.find((s) => s.id === currentSessionId);
      },
      
      addMessage: (sessionId, message) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [...s.messages, message],
                  updatedAt: new Date(),
                }
              : s
          ),
        }));
      },
      
      updateMessage: (sessionId, messageId, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === messageId ? { ...m, ...updates } : m
                  ),
                  updatedAt: new Date(),
                }
              : s
          ),
        }));
      },
      
      clearHistory: () => {
        set({ sessions: [], currentSessionId: null });
      },
      
      exportHistory: () => {
        const { sessions } = get();
        return JSON.stringify(sessions, null, 2);
      },
      
      importHistory: (data) => {
        try {
          const sessions = JSON.parse(data);
          set({ sessions, currentSessionId: null });
        } catch (error) {
          console.error('Failed to import history:', error);
        }
      },
    }),
    {
      name: 'chat-history-storage',
      partialize: (state) => ({
        sessions: state.sessions.slice(0, 50), // Keep only last 50 sessions
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);

export default useChatHistoryStore;