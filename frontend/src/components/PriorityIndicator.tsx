import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface PriorityIndicatorProps {
  score: number; // 0 to 1
}

export function PriorityIndicator({ score }: PriorityIndicatorProps) {
  const getColor = () => {
    if (score >= 0.8) return 'bg-red-500';
    if (score >= 0.6) return 'bg-orange-500';
    if (score >= 0.4) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getLabel = () => {
    if (score >= 0.8) return 'Urgent';
    if (score >= 0.6) return 'High Priority';
    if (score >= 0.4) return 'Medium Priority';
    return 'Low Priority';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getColor()} transition-all`}
                style={{ width: `${score * 100}%` }}
              />
            </div>
            <div className={`w-3 h-3 rounded-full ${getColor()}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-base">{getLabel()}</p>
          <p className="text-slate-400 text-sm">Priority Score: {(score * 100).toFixed(0)}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
