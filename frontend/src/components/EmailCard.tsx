import { MoreVertical, FileText, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { PriorityIndicator } from './PriorityIndicator';
import { CategoryBadge } from './CategoryBadge';
import { EmotionIcon } from './EmotionIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export interface Email {
  id: string;
  studentName: string;
  subject: string;
  summary: string;
  priority: number;
  category: string;
  emotion: 'neutral' | 'anxious' | 'confused' | 'frustrated' | 'calm';
  timestamp: string;
  unread?: boolean;
}

interface EmailCardProps {
  email: Email;
  onClick: () => void;
}

export function EmailCard({ email, onClick }: EmailCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer ${
        email.unread ? 'bg-primary-50/30' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Student Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white flex-shrink-0">
          <span>{email.studentName.charAt(0)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h4 className="truncate">{email.studentName}</h4>
              {email.unread && (
                <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
              )}
            </div>
            <span className="text-slate-400 flex-shrink-0">{email.timestamp}</span>
          </div>

          {/* Subject */}
          <p className="text-slate-900 mb-2 line-clamp-1">{email.subject}</p>

          {/* AI Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
              <p className="text-slate-600 line-clamp-2">{email.summary}</p>
            </div>
          </div>

          {/* Meta Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <CategoryBadge category={email.category} />
            <EmotionIcon emotion={email.emotion} />
            <PriorityIndicator score={email.priority} />
          </div>
        </div>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <FileText className="w-4 h-4 mr-2" />
              Summarize
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Draft
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Resolved
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
