import { Search, Settings, Bell, FileText, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface HeaderProps {
  onNavigate: (page: string) => void;
  onAskInbox: () => void;
}

export function Header({ onNavigate, onAskInbox }: HeaderProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Semantic search functionality coming soon!");
  };

  const handleNotifications = () => {
    toast.info("Checking for new notifications...");
  };

  const handleAIStatus = () => {
    toast.info("AI processing is active and monitoring your inbox");
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center gap-6 px-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Semantic search across all emails..."
          className="w-full pl-12 h-12 bg-slate-50 border-slate-200 rounded-lg focus:bg-white text-base"
        />
      </form>

      {/* Quick Actions - Right Aligned */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Ask the Inbox */}
        <Button
          onClick={onAskInbox}
          variant="ghost"
          className="gap-2 text-primary-600 hover:bg-primary-50 text-base px-4 py-2 h-auto"
        >
          <Sparkles className="w-5 h-5" />
          Ask the Inbox
        </Button>

        {/* Daily Digest */}
        <Button
          onClick={() => onNavigate('daily-digest')}
          variant="ghost"
          className="gap-2 text-base px-4 py-2 h-auto"
        >
          <FileText className="w-5 h-5" />
          <span className="hidden sm:inline">Daily Digest</span>
        </Button>

        {/* Notifications */}
        <Button onClick={handleNotifications} variant="ghost" size="icon" className="relative w-10 h-10">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
        </Button>

        {/* Settings */}
        <Button
          onClick={() => onNavigate('settings')}
          variant="ghost"
          size="icon"
          className="w-10 h-10"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* AI Status Indicator */}
        <button onClick={handleAIStatus} className="flex items-center gap-2.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer text-base">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="hidden sm:inline">AI Active</span>
        </button>
      </div>
    </header>
  );
}
