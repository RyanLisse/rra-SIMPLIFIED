'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat, Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Brain, Zap, Settings, Sparkles, History, FileText, Link2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Reasoning } from '@/components/ai-elements/reasoning';
import { Source } from '@/components/ai-elements/source';
import { Response } from '@/components/ai-elements/response';
import useChatHistoryStore, { ChatMessage, Source as SourceType } from '@/stores/useChatHistoryStore';
import ChatHistorySidebar from './chat-history-sidebar';
import { Textarea } from '@/components/ui/textarea';

type ReasoningLevel = 'light' | 'medium' | 'deep';

// Helper function to extract text content from message parts
const getMessageContent = (message: any): string => {
  if (!message.parts) return '';
  const textParts = message.parts.filter((part: any) => part.type === 'text');
  return textParts.map((part: any) => part.text).join('');
};

// Mock sources for demonstration
const generateMockSources = (query: string): SourceType[] => {
  if (query.toLowerCase().includes('code') || query.toLowerCase().includes('programming')) {
    return [
      {
        id: '1',
        title: 'MDN Web Docs - JavaScript Guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        snippet: 'Comprehensive JavaScript documentation and tutorials...',
        relevance: 0.95,
      },
      {
        id: '2',
        title: 'Stack Overflow - Best Practices',
        url: 'https://stackoverflow.com/questions/tagged/javascript',
        snippet: 'Community-driven Q&A for programming problems...',
        relevance: 0.88,
      },
    ];
  }
  if (query.toLowerCase().includes('ai') || query.toLowerCase().includes('gpt')) {
    return [
      {
        id: '3',
        title: 'OpenAI Documentation',
        url: 'https://platform.openai.com/docs',
        snippet: 'Official documentation for OpenAI APIs and models...',
        relevance: 0.92,
      },
      {
        id: '4',
        title: 'Research Paper: GPT-5 Architecture',
        url: 'https://arxiv.org/papers/gpt5',
        snippet: 'Technical details about the GPT-5 model architecture and training...',
        relevance: 0.85,
      },
    ];
  }
  return [];
};

export default function GPT5ChatEnhanced() {
  const [input, setInput] = useState('');
  const [useReasoning, setUseReasoning] = useState(true);
  const [reasoningLevel, setReasoningLevel] = useState<ReasoningLevel>('medium');
  const [showReasoning, setShowReasoning] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSources, setCurrentSources] = useState<SourceType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    currentSessionId,
    createSession,
    addMessage,
    getCurrentSession,
  } = useChatHistoryStore();
  
  const chat = useMemo(() => new Chat({
    transport: new DefaultChatTransport({ 
      api: '/api/chat',
      body: {
        useReasoning,
        reasoningLevel,
      },
    }),
    onFinish: (message) => {
      // Save message to history
      if (currentSessionId) {
        const sources = generateMockSources(input);
        addMessage(currentSessionId, {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: getMessageContent(message),
          reasoning: useReasoning ? `[${reasoningLevel} reasoning] Analyzing the query step by step...` : undefined,
          sources: sources.length > 0 ? sources : undefined,
          timestamp: new Date(),
          model: 'gpt-5-mini',
        });
        setCurrentSources(sources);
      }
    },
  }), [useReasoning, reasoningLevel, currentSessionId, input, addMessage]);
  
  const { messages, sendMessage, status, setMessages } = useChat({
    chat,
  });
  
  const isLoading = status === 'submitted' || status === 'streaming';

  // Session creation is handled lazily in handleSubmit when actually needed

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Create session if needed
    let sessionId = currentSessionId;
    if (!sessionId) {
      const session = createSession(input.slice(0, 50));
      sessionId = session.id;
    }
    
    // Add user message to history
    addMessage(sessionId, {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    });
    
    // Generate sources for the query
    const sources = generateMockSources(input);
    setCurrentSources(sources);
    
    await sendMessage({ text: input });
    setInput('');
  };

  const handleLoadSession = (session: any) => {
    // Load messages from session
    const chatMessages = session.messages.map((msg: ChatMessage) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
    }));
    setMessages(chatMessages);
    setCurrentSources(session.messages[session.messages.length - 1]?.sources || []);
  };

  const getModelBadgeColor = (level: ReasoningLevel) => {
    switch (level) {
      case 'light': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'deep': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
  };

  return (
    <div className="flex h-screen relative">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelectSession={handleLoadSession}
      />
      
      {/* Main Chat Area */}
      <div className={cn(
        'flex-1 flex flex-col transition-all duration-300',
        sidebarOpen ? 'ml-80' : 'ml-16'
      )}>
        {/* Header with Model Settings */}
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <h1 className="text-xl font-bold">GPT-5-mini Chat</h1>
              <Badge variant="outline">August 2025</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? "Close chat history" : "Open chat history"}
              >
                <History className="w-5 h-5" />
              </Button>
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Brain className={cn("w-4 h-4", useReasoning ? "text-purple-500" : "text-muted-foreground")} />
              <label htmlFor="reasoning" className="text-sm font-medium">
                Reasoning Mode
              </label>
              <Switch
                id="reasoning"
                checked={useReasoning}
                onCheckedChange={setUseReasoning}
              />
            </div>
            
            {useReasoning && (
              <>
                <Select value={reasoningLevel} onValueChange={(v) => setReasoningLevel(v as ReasoningLevel)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Brain className="w-3 h-3" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="deep">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Deep
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <label htmlFor="show-reasoning" className="text-sm">
                    Show Reasoning
                  </label>
                  <Switch
                    id="show-reasoning"
                    checked={showReasoning}
                    onCheckedChange={setShowReasoning}
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <label htmlFor="show-sources" className="text-sm">
                Show Sources
              </label>
              <Switch
                id="show-sources"
                checked={showSources}
                onCheckedChange={setShowSources}
              />
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">GPT-5-mini with Reasoning</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Experience the latest August 2025 model with advanced reasoning capabilities. 
                  Enable reasoning mode to see the AI&apos;s thought process.
                </p>
              </div>
            )}
            
            {messages.map((message, index) => {
              const isUser = message.role === 'user';
              const historicalMessage = getCurrentSession()?.messages[index];
              const reasoning = historicalMessage?.reasoning;
              const sources = historicalMessage?.sources || (index === messages.length - 1 && !isUser ? currentSources : []);
              
              return (
                <div key={message.id}>
                  <Message from={message.role} className="mb-2">
                    <div className="shrink-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        isUser 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
                      )}>
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                    </div>
                    
                    <MessageContent>
                      {!isUser && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium">GPT-5-mini</span>
                          {useReasoning && (
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getModelBadgeColor(reasoningLevel))}
                            >
                              {reasoningLevel} reasoning
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Reasoning Display */}
                      {!isUser && useReasoning && reasoning && showReasoning && (
                        <Reasoning 
                          content={reasoning}
                          isStreaming={false}
                          className="mb-3"
                        />
                      )}
                      
                      {/* Message Content */}
                      {message.role === 'assistant' ? (
                        <Response>
                          {getMessageContent(message)}
                        </Response>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{getMessageContent(message)}</p>
                      )}
                      
                      {/* Sources Display */}
                      {!isUser && sources && sources.length > 0 && showSources && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <Link2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Sources</span>
                          </div>
                          <div className="space-y-2">
                            {sources.map((source, idx) => (
                              <Source
                                key={source.id}
                                href={source.url}
                                title={source.title}
                                className="text-xs"
                              >
                                <div className="flex items-start gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {idx + 1}
                                  </Badge>
                                  <div className="flex-1">
                                    <p className="font-medium">{source.title}</p>
                                    <p className="text-muted-foreground mt-1">{source.snippet}</p>
                                    {source.relevance && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <span className="text-xs text-muted-foreground">Relevance:</span>
                                        <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                                            style={{ width: `${source.relevance * 100}%` }}
                                          />
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                          {Math.round(source.relevance * 100)}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Source>
                            ))}
                          </div>
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                </div>
              );
            })}
            
            {isLoading && (
              <Message from="assistant">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white animate-pulse" />
                </div>
                <MessageContent>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium">GPT-5-mini</span>
                    {useReasoning && (
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getModelBadgeColor(reasoningLevel))}
                      >
                        {reasoningLevel === 'deep' ? 'Deep thinking...' : 'Reasoning...'}
                      </Badge>
                    )}
                  </div>
                  {useReasoning && showReasoning && (
                    <Reasoning 
                      content="Analyzing your query and formulating a comprehensive response..."
                      isStreaming={true}
                      className="mb-3"
                    />
                  )}
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </MessageContent>
              </Message>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={useReasoning ? `Ask GPT-5-mini (${reasoningLevel} reasoning)...` : "Ask GPT-5-mini..."}
                className="flex-1 min-h-[60px] max-h-[200px] resize-none"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-[60px]"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Powered by GPT-5-mini (August 2025) • {useReasoning ? `${reasoningLevel} reasoning enabled` : 'Standard mode'} • Session: {getCurrentSession()?.title || 'New Chat'}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}