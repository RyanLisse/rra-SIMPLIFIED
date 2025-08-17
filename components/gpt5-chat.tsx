'use client';

import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Brain, Zap, Settings, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type ReasoningLevel = 'light' | 'medium' | 'deep';

interface MessageWithReasoning {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  model?: string;
  timestamp?: Date;
}

export default function GPT5Chat() {
  const [input, setInput] = useState('');
  const [useReasoning, setUseReasoning] = useState(true);
  const [reasoningLevel, setReasoningLevel] = useState<ReasoningLevel>('medium');
  const [showReasoning, setShowReasoning] = useState(true);
  
  const { messages, status, sendMessage } = useChat({
    api: '/api/chat',
    body: {
      useReasoning,
      reasoningLevel,
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    await sendMessage(input);
    setInput('');
  };

  const getModelBadgeColor = (level: ReasoningLevel) => {
    switch (level) {
      case 'light': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'deep': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto p-4">
      {/* Header with Model Settings */}
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h1 className="text-xl font-bold">GPT-5-mini Chat</h1>
            <Badge variant="outline" className="ml-2">August 2025</Badge>
          </div>
          <Settings className="w-5 h-5 text-muted-foreground" />
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
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 mb-4">
        <div className="space-y-4 p-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">GPT-5-mini with Reasoning</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Experience the latest August 2025 model with advanced reasoning capabilities. 
                Enable reasoning mode to see the AI's thought process.
              </p>
            </div>
          )}
          
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const messageReasoning = (message as any).reasoning;
            
            return (
              <div key={message.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%]", isUser ? "items-end" : "items-start")}>
                  {!isUser && useReasoning && messageReasoning && showReasoning && (
                    <Collapsible defaultOpen={false} className="mb-2">
                      <CollapsibleTrigger asChild>
                        <Card className="bg-purple-500/5 border-purple-500/20 cursor-pointer hover:bg-purple-500/10 transition-colors">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-purple-500" />
                              <span className="text-sm font-medium text-purple-500">
                                Reasoning Process
                              </span>
                              <Badge 
                                variant="outline" 
                                className={cn("ml-auto text-xs", getModelBadgeColor(reasoningLevel))}
                              >
                                {reasoningLevel}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <Card className="mt-2 bg-purple-500/5 border-purple-500/20">
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {messageReasoning}
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  
                  <Card className={cn(
                    "transition-all",
                    isUser 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted border-border"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          isUser 
                            ? "bg-primary-foreground/20" 
                            : "bg-gradient-to-br from-purple-600 to-blue-600"
                        )}>
                          {isUser ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {!isUser && (
                            <div className="flex items-center gap-2 mb-1">
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
                          
                          {message.role === 'assistant' ? (
                            <ReactMarkdown
                              className="prose prose-sm max-w-none dark:prose-invert"
                              components={{
                                code: ({ inline, className, children, ...props }) => {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      style={oneDark}
                                      language={match[1]}
                                      PreTag="div"
                                      className="rounded-md !my-2"
                                      {...props as any}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-muted border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
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
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={useReasoning ? `Ask GPT-5-mini (${reasoningLevel} reasoning)...` : "Ask GPT-5-mini..."}
          className="flex-1"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
      
      <p className="text-xs text-muted-foreground text-center mt-2">
        Powered by GPT-5-mini (August 2025) • {useReasoning ? `${reasoningLevel} reasoning enabled` : 'Standard mode'}
      </p>
    </div>
  );
}