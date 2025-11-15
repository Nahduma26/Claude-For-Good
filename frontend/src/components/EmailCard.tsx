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
import { toast } from 'sonner';

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
  const handleSummarize = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Generating summary for "${email.subject}"...`);
  };

  const handleGenerateDraft = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Creating draft reply for ${email.studentName}...`);
  };

  const handleMarkResolved = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Marked "${email.subject}" as resolved`);
  };

  return (
    <div
      onClick={onClick}
      className={`group bg-white border border-slate-200 rounded-xl p-10 hover:shadow-md hover:bg-slate-50/50 hover:border-slate-300 transition-all duration-200 cursor-pointer ${
        email.unread ? 'bg-blue-50/50 border-blue-200' : ''
      }`}
    >
      <div className="flex items-start gap-8">
        {/* Student Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white flex-shrink-0 font-semibold text-2xl shadow-md">
          <span>{email.studentName.charAt(0)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <h4 className="text-2xl font-semibold text-slate-900 truncate">{email.studentName}</h4>
              {email.unread && (
                <div className="w-3.5 h-3.5 bg-primary-500 rounded-full flex-shrink-0 animate-pulse"></div>
              )}
            </div>
            <span className="text-base text-slate-500 flex-shrink-0 font-medium">{email.timestamp}</span>
          </div>

          {/* Subject */}
          <p className="text-slate-900 mb-6 line-clamp-1 font-medium text-xl">{email.subject}</p>

          {/* AI Summary */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 rounded-xl p-7 mb-6 shadow-sm">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700 line-clamp-2 leading-relaxed text-lg">{email.summary}</p>
            </div>
          </div>

          {/* Meta Row */}
          <div className="flex items-center gap-5 flex-wrap">
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
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-50 rounded-lg p-3 w-10 h-10"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <MoreVertical className="w-6 h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-lg border-slate-200">
            <DropdownMenuItem onClick={handleSummarize} className="cursor-pointer hover:bg-blue-50 py-4 text-base">
              <FileText className="w-5 h-5 mr-3" />
              Summarize
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleGenerateDraft} className="cursor-pointer hover:bg-blue-50 py-4 text-base">
              <Sparkles className="w-5 h-5 mr-3" />
              Generate Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMarkResolved} className="cursor-pointer hover:bg-blue-50 py-4 text-base">
              <CheckCircle className="w-5 h-5 mr-3" />
              Mark Resolved
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
