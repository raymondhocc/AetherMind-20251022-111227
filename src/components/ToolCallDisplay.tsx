import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wrench, Cloud, Database, Search, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolCall, WeatherResult, MCPResult, ErrorResult } from '../../worker/types';
interface ToolCallDisplayProps {
  toolCall: ToolCall;
  className?: string;
}
const renderToolCallContent = (toolCall: ToolCall): { icon: React.ElementType; text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
  const result = toolCall.result as WeatherResult | MCPResult | ErrorResult | { content: string } | undefined;
  if (!result) return { icon: Info, text: `Executing: ${toolCall.name}`, variant: 'outline' };
  if ('error' in result && result.error) return { icon: XCircle, text: `Error in ${toolCall.name}: ${result.error}`, variant: 'destructive' };
  switch (toolCall.name) {
    case 'get_weather': {
      const weather = result as WeatherResult;
      return { icon: Cloud, text: `Weather in ${weather.location}: ${weather.temperature}°C, ${weather.condition}`, variant: 'secondary' };
    }
    case 'web_search': {
      try {
        const content = (result as { content: string }).content;
        if (content.includes('Search results for')) {
          return { icon: Search, text: `Web Search: Results found`, variant: 'secondary' };
        } else if (content.includes('Content from')) {
          const urlMatch = content.match(/Content from (https?:\/\/[^\s]+):/);
          return { icon: Search, text: `Web Browse: ${urlMatch ? new URL(urlMatch[1]).hostname : 'Content fetched'}`, variant: 'secondary' };
        }
        return { icon: Search, text: `Web Search: Executed`, variant: 'secondary' };
      } catch {
        return { icon: Search, text: `Web Search: Executed`, variant: 'secondary' };
      }
    }
    case 'data_query': {
      try {
        const data = JSON.parse((result as { content: string }).content);
        return { icon: Database, text: `Data Query: ${data.results.length} results for "${data.query}"`, variant: 'secondary' };
      } catch {
        return { icon: Database, text: `Data Query: Executed`, variant: 'secondary' };
      }
    }
    default: {
      // For MCP tools or other generic tools
      return { icon: Wrench, text: `${toolCall.name}: Executed successfully`, variant: 'secondary' };
    }
  }
};
export const ToolCallDisplay: React.FC<ToolCallDisplayProps> = ({ toolCall, className }) => {
  const { icon: Icon, text, variant } = renderToolCallContent(toolCall);
  return (
    <Badge variant={variant} className={cn("flex items-center gap-1.5 text-xs px-2 py-1 max-w-full", className)}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="truncate">{text}</span>
    </Badge>
  );
};