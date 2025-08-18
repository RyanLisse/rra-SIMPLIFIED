'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Download,
  Upload,
  Clock,
  ChevronRight,
  History,
  Sparkles,
} from 'lucide-react';
import useChatHistoryStore, { ChatSession } from '@/stores/useChatHistoryStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectSession: (session: ChatSession) => void;
}

export default function ChatHistorySidebar({
  isOpen,
  onToggle,
  onSelectSession,
}: ChatHistorySidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  const {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    setCurrentSession,
    clearHistory,
    exportHistory,
    importHistory,
  } = useChatHistoryStore();

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.messages.some((msg) =>
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleNewChat = () => {
    const session = createSession();
    onSelectSession(session);
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session.id);
    onSelectSession(session);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  const handleExport = () => {
    const data = exportHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      importHistory(data);
    };
    reader.readAsText(file);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const getModelBadge = (session: ChatSession) => {
    if (session.model?.includes('gpt-5')) {
      return (
        <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">
          <Sparkles className="w-2 h-2 mr-1" />
          GPT-5
        </Badge>
      );
    }
    return null;
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          'fixed left-0 top-0 h-full bg-background border-r transition-all duration-300 z-40',
          isOpen ? 'w-80' : 'w-16'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className={cn('flex items-center gap-2', !isOpen && 'justify-center')}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="hover:bg-accent"
                >
                  <ChevronRight className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
                </Button>
                {isOpen && (
                  <>
                    <History className="w-5 h-5" />
                    <h2 className="font-semibold">Chat History</h2>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleNewChat}
                  className={cn(
                    'w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
                    !isOpen && 'px-2'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  {isOpen && <span className="ml-2">New Chat</span>}
                </Button>
              </TooltipTrigger>
              {!isOpen && <TooltipContent side="right">New Chat</TooltipContent>}
            </Tooltip>
          </div>

          {isOpen && (
            <>
              {/* Search */}
              <div className="px-2 pb-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
              </div>

              {/* Sessions List */}
              <ScrollArea className="flex-1 px-2">
                <div className="space-y-1">
                  {filteredSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No chats yet</p>
                      <p className="text-xs mt-1">Start a new conversation</p>
                    </div>
                  ) : (
                    filteredSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleSelectSession(session)}
                        className={cn(
                          'group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                          currentSessionId === session.id
                            ? 'bg-accent'
                            : 'hover:bg-accent/50'
                        )}
                      >
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium truncate">
                              {session.title}
                            </p>
                            {getModelBadge(session)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(session.updatedAt)}</span>
                            <span className="ml-auto">{session.messages.length} msgs</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6"
                          onClick={(e) => handleDeleteSession(e, session.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Footer Actions */}
              <div className="p-2 border-t space-y-1">
                <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export History
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Export Chat History</DialogTitle>
                      <DialogDescription>
                        Download your chat history as a JSON file
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2">
                      <Button onClick={handleExport} className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <label htmlFor="import-file">
                    <Upload className="w-4 h-4 mr-2" />
                    Import History
                    <input
                      id="import-file"
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImport}
                    />
                  </label>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive"
                  size="sm"
                  onClick={clearHistory}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </>
          )}

          {!isOpen && (
            <div className="flex-1 flex flex-col items-center gap-2 py-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Export History</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <label htmlFor="import-file-collapsed">
                      <Upload className="w-4 h-4" />
                      <input
                        id="import-file-collapsed"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImport}
                      />
                    </label>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Import History</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}