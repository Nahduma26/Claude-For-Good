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
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-screen">
      {/* User Profile */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-lg font-semibold">
            <span>DR</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="truncate text-lg font-semibold">Dr. Rivera</h4>
            <p className="text-slate-500 truncate text-base">CS 101</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg border transition-all text-base ${getColorClasses(category.color, isActive)}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left truncate">{category.name}</span>
                {category.count > 0 && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(category.color)}`}>
                    {category.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-5 border-t border-slate-200">
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-5 border border-primary-100">
          <div className="flex items-start gap-3 mb-2">
            <Mail className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-primary-900 mb-1.5 text-base font-semibold">AI-Powered</h4>
              <p className="text-primary-700 text-sm">Powered by Gemini semantic classification</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
