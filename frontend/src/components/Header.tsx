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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Semantic search across all emails..."
          className="w-full pl-10 h-10 bg-slate-50 border-slate-200 rounded-lg focus:bg-white"
        />
      </form>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Ask the Inbox */}
        <Button
          onClick={onAskInbox}
          variant="ghost"
          className="gap-2 text-primary-600 hover:bg-primary-50"
        >
          <Sparkles className="w-4 h-4" />
          Ask the Inbox
        </Button>

        {/* Daily Digest */}
        <Button
          onClick={() => onNavigate('daily-digest')}
          variant="ghost"
          className="gap-2"
        >
          <FileText className="w-4" />
          <span className="hidden sm:inline">Daily Digest</span>
        </Button>

        {/* Notifications */}
        <Button onClick={handleNotifications} variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* Settings */}
        <Button
          onClick={() => onNavigate('settings')}
          variant="ghost"
          size="icon"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* AI Status Indicator */}
      <button onClick={handleAIStatus} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="hidden sm:inline">AI Active</span>
      </button>
    </header>
  );
}
