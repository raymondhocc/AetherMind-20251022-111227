import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Clock, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/chat';
import type { Message, ToolCall } from '../../worker/types';
import { ToolCallDisplay } from './ToolCallDisplay';
interface ChatMessageProps {
  message: Message;
}
export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
  >
    {message.role === 'assistant' && (
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
        <Bot className="w-5 h-5 text-muted-foreground" />
      </div>
    )}
    <div className={cn('max-w-[80%] p-4 rounded-2xl shadow-md', message.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none')}>
      <div className="flex items-center gap-2 mb-2 text-xs opacity-70">
        <Clock className="w-3 h-3 inline" />
        <span>{formatTime(message.timestamp)}</span>
      </div>
      <p className="whitespace-pre-wrap mb-2 text-base font-medium">{message.content}</p>
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="mt-3 pt-3 border-t border-current/20 space-y-2">
          <div className="flex items-center gap-1.5 text-sm opacity-80 font-medium">
            <Wrench className="w-3.5 h-3.5" />
            <span>Tools Used:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {message.toolCalls.map((tool: ToolCall, idx: number) => (
              <motion.div key={idx} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <ToolCallDisplay toolCall={tool} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
    {message.role === 'user' && (
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary">
        <User className="w-5 h-5 text-primary-foreground" />
      </div>
    )}
  </motion.div>
);