import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
interface AetherMindLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}
export function AetherMindLogo({ className, iconClassName, textClassName }: AetherMindLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-aether-hero shadow-lg",
        "transform transition-transform duration-300 hover:scale-110",
        iconClassName
      )}>
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <span className={cn("text-2xl font-display font-bold text-aether-gradient animate-shimmer-text bg-[length:200%_auto] bg-clip-text", textClassName)}>
        AetherMind
      </span>
    </div>
  );
}