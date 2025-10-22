import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Plus, ArrowDownCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { chatService, generateSessionTitle, MODELS, formatDateForGrouping } from '@/lib/chat';
import type { ChatState, SessionInfo, Message } from '../../worker/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster, toast } from '@/components/ui/sonner';
import { SettingsSheet } from '@/components/SettingsSheet';
import { useAuth } from '@/hooks/use-auth';
import { ChatMessage } from '@/components/ChatMessage';
import { Skeleton } from '@/components/ui/skeleton';
const ChatSkeletonLoader = () => (
  <div className="space-y-6">
    <div className="flex items-start gap-3 justify-start">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <div className="flex items-start gap-3 justify-end">
      <div className="space-y-2 flex-1 text-right">
        <Skeleton className="h-4 w-3/4 ml-auto" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);
interface GroupedMessage {
  dateLabel: string;
  messages: Message[];
}
export function HomePage() {
  const { isAuthenticated } = useAuth();
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: chatService.getSessionId(),
    isProcessing: false,
    model: MODELS[0].id,
    streamingMessage: ''
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<{ id: string; title: string } | null>(null);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  useEffect(scrollToBottom, [scrollToBottom, chatState.messages.length, chatState.streamingMessage]);
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const isScrolledUp = container.scrollHeight - container.scrollTop > container.clientHeight + 150;
      setShowScrollToBottom(isScrolledUp);
    }
  };
  const loadCurrentSession = useCallback(async () => {
    if (!isAuthenticated) return;
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(prev => ({ ...prev, ...response.data, sessionId: chatService.getSessionId() }));
    } else {
      toast.error("Failed to load session messages.");
    }
  }, [isAuthenticated]);
  const loadSessions = useCallback(async () => {
    if (!isAuthenticated) return;
    const response = await chatService.listSessions();
    if (response.success && response.data) {
      setSessions(response.data);
    } else {
      toast.error("Failed to load session list.");
    }
  }, [isAuthenticated]);
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      Promise.all([loadSessions(), loadCurrentSession()]).finally(() => setIsLoading(false));
    } else {
      setSessions([]);
      setChatState(prev => ({ ...prev, messages: [], streamingMessage: '' }));
      setIsLoading(false);
    }
  }, [isAuthenticated, loadSessions, loadCurrentSession]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatState.isProcessing) return;
    const message = input.trim();
    setInput('');
    const userMessage = { id: crypto.randomUUID(), role: 'user' as const, content: message, timestamp: Date.now() };
    setChatState(prev => ({ ...prev, messages: [...prev.messages, userMessage], streamingMessage: '', isProcessing: true }));
    const isNewSession = !sessions.some(s => s.id === chatState.sessionId);
    if (isNewSession) {
      const title = generateSessionTitle(message);
      await chatService.createSession(title, chatState.sessionId, message);
      await loadSessions();
    }
    await chatService.sendMessage(message, chatState.model, (chunk) => {
      setChatState(prev => ({ ...prev, streamingMessage: (prev.streamingMessage || '') + chunk }));
    });
    await loadCurrentSession();
    setChatState(prev => ({ ...prev, isProcessing: false }));
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };
  const handleModelChange = async (model: string) => {
    const response = await chatService.updateModel(model);
    if (response.success && response.data) {
      setChatState(prev => ({ ...prev, ...response.data }));
      toast.success(`Model switched to ${MODELS.find(m => m.id === model)?.name}.`);
    } else {
      toast.error("Failed to switch model.");
    }
  };
  const handleNewSession = async () => {
    chatService.newSession();
    setChatState({ messages: [], sessionId: chatService.getSessionId(), isProcessing: false, model: chatState.model, streamingMessage: '' });
    await loadSessions();
    toast.info("New research session started.");
  };
  const handleSwitchSession = async (sessionId: string) => {
    if (sessionId === chatState.sessionId) return;
    chatService.switchSession(sessionId);
    setIsLoading(true);
    setChatState(prev => ({ ...prev, sessionId, messages: [], streamingMessage: '', isProcessing: false }));
    await loadCurrentSession();
    setIsLoading(false);
    toast.info("Switched to a different session.");
  };
  const handleClear = async () => {
    const response = await chatService.clearMessages();
    if (response.success && response.data) {
      setChatState(prev => ({ ...prev, ...response.data }));
      toast.info("Current conversation cleared.");
    } else {
      toast.error("Failed to clear conversation.");
    }
  };
  const handleClearAllSessions = async () => {
    await chatService.clearAllSessions();
    await loadSessions();
    await handleNewSession();
    toast.warning("All sessions have been cleared.");
  };
  const handleStartRenameSession = (sessionId: string, currentTitle: string) => {
    setEditingSession({ id: sessionId, title: currentTitle });
    setRenameDialogOpen(true);
  };
  const handleConfirmRename = async () => {
    if (!editingSession || !editingSession.title.trim()) return;
    const { id, title } = editingSession;
    const response = await chatService.updateSessionTitle(id, title);
    if (response.success) {
      toast.success("Session renamed successfully.");
      await loadSessions();
    } else {
      toast.error(`Failed to rename session: ${response.error}`);
    }
    setRenameDialogOpen(false);
    setEditingSession(null);
  };
  const handleDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    const response = await chatService.deleteSession(sessionToDelete);
    if (response.success) {
      toast.success("Session deleted successfully.");
      await loadSessions();
      if (chatState.sessionId === sessionToDelete) {
        handleNewSession();
      }
    } else {
      toast.error(`Failed to delete session: ${response.error}`);
    }
    setSessionToDelete(null);
    setDeleteDialogOpen(false);
  };
  const groupedMessages = useMemo(() => {
    return chatState.messages.reduce((acc: GroupedMessage[], msg) => {
      const dateLabel = formatDateForGrouping(msg.timestamp);
      const lastGroup = acc[acc.length - 1];
      if (lastGroup && lastGroup.dateLabel === dateLabel) {
        lastGroup.messages.push(msg);
      } else {
        acc.push({ dateLabel, messages: [msg] });
      }
      return acc;
    }, []);
  }, [chatState.messages]);
  const sidebarProps = {
    sessions,
    activeSessionId: chatState.sessionId,
    onNewSession: handleNewSession,
    onSwitchSession: handleSwitchSession,
    onClearAllSessions: handleClearAllSessions,
    onStartRenameSession: handleStartRenameSession,
    onDeleteSession: handleDeleteSession,
  };
  return (
    <AppLayout sidebarProps={sidebarProps} onOpenSettings={() => setSettingsOpen(true)} className="h-screen flex flex-col">
      <main className="flex-1 flex flex-col max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full overflow-hidden relative">
        <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-6" aria-live="polite">
          <AnimatePresence>
            {isLoading && <ChatSkeletonLoader />}
            {!isLoading && chatState.messages.length === 0 && !chatState.streamingMessage && !chatState.isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center h-full relative"
              >
                <div className="absolute inset-0 bg-grid-slate-100/[0.05] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom mask-image-radial-fade" />
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-gradient-aether-hero rounded-full opacity-20 blur-2xl"></div>
                  <Bot className="w-24 h-24 mx-auto text-primary/50" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2 animate-fade-up">Welcome to AetherMind</h2>
                <p className="max-w-md mb-6 text-base font-medium animate-fade-up" style={{ animationDelay: '0.2s' }}>Your smart knowledge navigator. Start a new research session by asking a question below.</p>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}>
                  <Button onClick={handleNewSession} className="btn-aether-primary" aria-label="Start a new research session">
                    <Plus className="mr-2 h-4 w-4" />
                    Start New Research
                  </Button>
                </motion.div>
              </motion.div>
            )}
            {!isLoading && groupedMessages.map((group) => (
              <div key={group.dateLabel}>
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-4 text-xs text-muted-foreground">{group.dateLabel}</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>
                <div className="space-y-6">
                  {group.messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
                </div>
              </div>
            ))}
          </AnimatePresence>
          {chatState.streamingMessage && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                <Bot className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="max-w-[80%] p-4 rounded-2xl bg-muted rounded-tl-none">
                <p className="whitespace-pre-wrap text-base font-medium">{chatState.streamingMessage}<span className="animate-pulse">|</span></p>
              </div>
            </div>
          )}
          {chatState.isProcessing && !chatState.streamingMessage && (
            <div className="flex items-start gap-3 justify-start">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1 max-w-[80%]">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <AnimatePresence>
          {showScrollToBottom && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-24 right-8 z-10">
              <Button onClick={scrollToBottom} size="icon" className="rounded-full shadow-lg" aria-label="Scroll to bottom">
                <ArrowDownCircle className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="py-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Chat with AetherMind..."
              className="w-full min-h-[52px] max-h-48 resize-none rounded-full py-3 pl-6 pr-40 text-base transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:border-primary/50"
              rows={1}
              disabled={chatState.isProcessing}
              aria-label="Chat input"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground" disabled={chatState.messages.length === 0} aria-label="Clear current conversation">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear the current conversation history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClear}>Clear</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Select value={chatState.model} onValueChange={handleModelChange}>
                <SelectTrigger className="w-auto h-8 text-xs border-none bg-transparent shadow-none focus:ring-0 hover:bg-muted rounded-md" aria-label="Select AI model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((model) => <SelectItem key={model.id} value={model.id} className="text-xs">{model.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="submit" size="icon" className="rounded-full w-9 h-9 btn-aether-primary" disabled={!input.trim() || chatState.isProcessing} aria-label="Send message">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-3">
            AI responses may be inaccurate. There is a limit on the number of requests that can be made to the AI servers.
          </p>
        </motion.div>
      </main>
      <AlertDialog open={isRenameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Session</AlertDialogTitle>
            <AlertDialogDescription>Enter a new title for this research session.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={editingSession?.title || ''}
            onChange={(e) => setEditingSession(prev => prev ? { ...prev, title: e.target.value } : null)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()}
            placeholder="Session title"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingSession(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRename}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <SettingsSheet isOpen={isSettingsOpen} onOpenChange={setSettingsOpen} defaultModelId={chatState.model} onDefaultModelChange={handleModelChange} />
      <Toaster richColors />
    </AppLayout>
  );
}