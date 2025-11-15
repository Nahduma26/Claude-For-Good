import { Mail, HelpCircle, Clock, MapPin, AlertTriangle, AlertCircle, ShieldAlert, Inbox } from 'lucide-react';
import { mockEmails } from '../data/mockEmails';

const getCategoryCount = (categoryId: string) => {
  if (categoryId === 'all') return mockEmails.length;
  return mockEmails.filter(email => email.category === categoryId).length;
};

const categories = [
  { id: 'all', name: 'All Emails', icon: Inbox, count: getCategoryCount('all'), color: 'slate' },
  { id: 'clarification', name: 'Clarification Questions', icon: HelpCircle, count: getCategoryCount('clarification'), color: 'purple' },
  { id: 'extension', name: 'Extension Requests', icon: Clock, count: getCategoryCount('extension'), color: 'amber' },
  { id: 'logistics', name: 'Logistics', icon: MapPin, count: getCategoryCount('logistics'), color: 'blue' },
  { id: 'grades', name: 'Grade Disputes', icon: AlertTriangle, count: getCategoryCount('grades'), color: 'orange' },
  { id: 'urgent', name: 'Urgent / Emergency', icon: AlertCircle, count: getCategoryCount('urgent'), color: 'red' },
  { id: 'honor', name: 'Honor Code Concerns', icon: ShieldAlert, count: getCategoryCount('honor'), color: 'red' },
];

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function Sidebar({ activeCategory, onCategoryChange }: SidebarProps) {
  const getColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      const activeColors = {
        slate: 'bg-primary-50 text-primary-700 border-primary-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        blue: 'bg-primary-50 text-primary-700 border-primary-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
        red: 'bg-red-50 text-red-700 border-red-200',
      };
      return activeColors[color as keyof typeof activeColors] || activeColors.slate;
    }
    return 'text-slate-600 hover:bg-slate-50 border-transparent';
  };

  const getBadgeColor = (color: string) => {
    const colors = {
      slate: 'bg-slate-100 text-slate-700',
      purple: 'bg-purple-100 text-purple-700',
      amber: 'bg-amber-100 text-amber-700',
      blue: 'bg-primary-100 text-primary-700',
      orange: 'bg-orange-100 text-orange-700',
      red: 'bg-red-100 text-red-700',
    };
    return colors[color as keyof typeof colors] || colors.slate;
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
      {/* User Profile */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white">
            <span>DR</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="truncate">Dr. Rivera</h4>
            <p className="text-slate-500 truncate">CS 101</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${getColorClasses(category.color, isActive)}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left truncate">{category.name}</span>
                {category.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getBadgeColor(category.color)}`}>
                    {category.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-4 border border-primary-100">
          <div className="flex items-start gap-2 mb-2">
            <Mail className="w-4 h-4 text-primary-600 mt-0.5" />
            <div>
              <h4 className="text-primary-900 mb-1">AI-Powered</h4>
              <p className="text-primary-700">Powered by Gemini semantic classification</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
