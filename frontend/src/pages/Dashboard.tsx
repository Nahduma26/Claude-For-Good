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
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          {filteredEmails.length > 0 ? (
            <div className="w-full max-w-none px-6 space-y-8">
              {filteredEmails.map(email => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onClick={() => onNavigate('email-detail', email)}
                />
              ))}
            </div>
          ) : (
            <div className="w-full max-w-none px-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-24 text-center">
                <div className="w-40 h-40 mx-auto mb-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner">
                  <Inbox className="w-20 h-20 text-slate-400" />
                </div>
                <h3 className="text-4xl font-semibold text-slate-900 mb-5">No emails in this category</h3>
                <p className="text-2xl text-slate-500 mb-12 max-w-lg mx-auto">
                  All caught up! Check back later for new messages.
                </p>
                <div className="max-w-md mx-auto rounded-xl overflow-hidden shadow-lg">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1631823794808-b359f1132de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMGluYm94JTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc2MzIzNDc1NHww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Empty inbox"
                    className="w-full h-64 object-cover opacity-70"
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
