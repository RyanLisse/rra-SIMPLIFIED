"use client";
import GPT5ChatEnhanced from "@/components/gpt5-chat-enhanced";
import EnhancedChat from "@/components/enhanced-chat";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, MessageSquare, Sparkles, Cpu } from "lucide-react";

export default function Main() {
  const [chatMode, setChatMode] = useState<'gpt5' | 'enhanced' | 'legacy'>('gpt5');

  if (chatMode === 'legacy') {
    // Dynamic imports to avoid issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Assistant = require("@/components/assistant").default;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ToolsPanel = require("@/components/tools-panel").default;
    
    return (
      <div className="flex justify-center h-screen">
        <div className="w-full md:w-[70%]">
          <div className="p-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => setChatMode('gpt5')}
                variant="outline"
                className="mb-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                GPT-5 Chat
              </Button>
              <Button 
                onClick={() => setChatMode('enhanced')}
                variant="outline"
                className="mb-4"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Enhanced Chat
              </Button>
            </div>
          </div>
          <Assistant />
        </div>
        <div className="hidden md:block w-[30%]">
          <ToolsPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            {chatMode === 'gpt5' ? (
              <Sparkles className="w-6 h-6 text-purple-500" />
            ) : (
              <MessageSquare className="w-6 h-6" />
            )}
            <h1 className="text-lg font-semibold">
              {chatMode === 'gpt5' ? 'GPT-5-mini Chat' : 'AI Chat App'}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setChatMode(chatMode === 'gpt5' ? 'enhanced' : 'gpt5')}
              variant={chatMode === 'gpt5' ? 'default' : 'outline'}
              size="sm"
            >
              {chatMode === 'gpt5' ? (
                <>
                  <Cpu className="w-4 h-4 mr-2" />
                  Standard Chat
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  GPT-5 Mode
                </>
              )}
            </Button>
            <Button 
              onClick={() => setChatMode('legacy')}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Legacy Mode
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto h-[calc(100vh-3.5rem)]">
        {chatMode === 'gpt5' ? <GPT5ChatEnhanced /> : <EnhancedChat />}
      </main>
    </div>
  );
}
