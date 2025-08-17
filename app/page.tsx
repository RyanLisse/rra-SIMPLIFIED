"use client";
import EnhancedChat from "@/components/enhanced-chat";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, MessageSquare } from "lucide-react";

export default function Main() {
  const [showLegacyChat, setShowLegacyChat] = useState(false);

  if (showLegacyChat) {
    // Dynamic imports to avoid issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Assistant = require("@/components/assistant").default;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ToolsPanel = require("@/components/tools-panel").default;
    
    return (
      <div className="flex justify-center h-screen">
        <div className="w-full md:w-[70%]">
          <div className="p-4">
            <Button 
              onClick={() => setShowLegacyChat(false)}
              variant="outline"
              className="mb-4"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Switch to Modern Chat
            </Button>
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
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            <h1 className="text-lg font-semibold">AI Chat App</h1>
          </div>
          <Button 
            onClick={() => setShowLegacyChat(true)}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Legacy Mode
          </Button>
        </div>
      </header>
      <main className="container mx-auto h-[calc(100vh-3.5rem)]">
        <EnhancedChat />
      </main>
    </div>
  );
}
