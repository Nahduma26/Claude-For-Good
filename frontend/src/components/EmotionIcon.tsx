import { Frown, Meh, Smile, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface EmotionIconProps {
  emotion: 'neutral' | 'anxious' | 'confused' | 'frustrated' | 'calm';
}

export function EmotionIcon({ emotion }: EmotionIconProps) {
  const config = {
    neutral: {
      icon: Meh,
      color: 'text-slate-400',
      bg: 'bg-slate-100',
      label: 'Neutral tone',
    },
    anxious: {
      icon: AlertTriangle,
      color: 'text-orange-500',
      bg: 'bg-orange-100',
      label: 'Anxious tone detected',
    },
    confused: {
      icon: Meh,
      color: 'text-purple-500',
      bg: 'bg-purple-100',
      label: 'Student seems confused',
    },
    frustrated: {
      icon: Frown,
      color: 'text-red-500',
      bg: 'bg-red-100',
      label: 'Frustrated tone detected',
    },
    calm: {
      icon: Smile,
      color: 'text-green-500',
      bg: 'bg-green-100',
      label: 'Calm, polite tone',
    },
  };

  const cfg = config[emotion];
  const Icon = cfg.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center cursor-help`}>
            <Icon className={`w-5 h-5 ${cfg.color}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-base">{cfg.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
