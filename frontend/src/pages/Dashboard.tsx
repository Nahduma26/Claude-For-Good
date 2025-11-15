import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { EmailCard } from '../components/EmailCard';
import { mockEmails } from '../data/mockEmails';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Inbox } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredEmails = activeCategory === 'all' 
    ? mockEmails 
    : mockEmails.filter(email => email.category === activeCategory);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onNavigate={onNavigate}
          onAskInbox={() => onNavigate('ask-inbox')}
        />
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {filteredEmails.length > 0 ? (
            <div className="max-w-5xl mx-auto space-y-3">
              {filteredEmails.map(email => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onClick={() => onNavigate('email-detail', email)}
                />
              ))}
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <Inbox className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="mb-2">No emails in this category</h3>
                <p className="text-slate-500 mb-6">
                  All caught up! Check back later for new messages.
                </p>
                <div className="max-w-sm mx-auto rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1631823794808-b359f1132de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMGluYm94JTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc2MzIzNDc1NHww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Empty inbox"
                    className="w-full h-48 object-cover opacity-60"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
