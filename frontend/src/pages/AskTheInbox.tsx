import { useState } from 'react';
import { ArrowLeft, Send, Sparkles, Mail, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { mockEmails } from '../data/mockEmails';
import { emailService } from '../services/emailService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ studentName: string; subject: string; snippet: string; emailId: string }>;
}

interface AskTheInboxProps {
  onBack: () => void;
  onNavigate: (page: string, data?: any) => void;
}

export function AskTheInbox({ onBack, onNavigate }: AskTheInboxProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I can help you search through your emails and answer questions about patterns, student concerns, or specific topics. What would you like to know?',
    },
  ]);

  const handleEmailClick = (emailId: string) => {
    // Find the email in mockEmails
    const email = mockEmails.find(e => e.id === emailId);
    if (email) {
      onNavigate('email-detail', email);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages([...messages, userMessage]);
    setInput('');

    // Show loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Searching your inbox...',
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Search emails using backend API
      const searchResponse = await emailService.searchEmails(input);
      const results = searchResponse.results;

      // Format the response
      let content = '';
      const sources: Array<{ studentName: string; subject: string; snippet: string; emailId: string }> = [];

      if (results.length > 0) {
        content = `I found ${results.length} relevant email${results.length > 1 ? 's' : ''} matching your query:\n\n`;
        
        results.slice(0, 5).forEach((email, idx) => {
          const studentName = email.sender_name || email.sender_email?.split('@')[0] || 'Unknown';
          content += `${idx + 1}. ${studentName}: ${email.subject || 'No subject'}\n`;
          if (email.summary || email.body_preview) {
            content += `   ${(email.summary || email.body_preview || '').substring(0, 100)}...\n\n`;
          }
          
          sources.push({
            studentName,
            subject: email.subject || 'No subject',
            snippet: email.summary || email.body_preview || 'No preview',
            emailId: email.id,
          });
        });

        if (results.length > 5) {
          content += `\n...and ${results.length - 5} more result${results.length - 5 > 1 ? 's' : ''}.`;
        }
      } else {
        content = "I couldn't find any emails matching your query. Try rephrasing or using different keywords.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content,
        sources: sources.length > 0 ? sources : undefined,
      };

      setMessages(prev => prev.slice(0, -1).concat(assistantMessage));
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while searching. Please try again or check if the backend is running.',
      };
      setMessages(prev => prev.slice(0, -1).concat(errorMessage));
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 p-8 bg-white">
          <Button variant="ghost" onClick={onBack} className="gap-3 mb-6 text-slate-600 hover:text-slate-900 hover:bg-blue-50 px-4 py-3 text-base">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Ask the Inbox</h2>
              <p className="text-slate-500 text-lg">Conversational search powered by RAG</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-10">
          <div className="max-w-none mx-auto space-y-8">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-6 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div className={`flex-1 max-w-4xl ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div
                    className={`rounded-2xl p-6 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-slate-200 shadow-sm'
                    }`}
                  >
                    <p className={`${message.role === 'user' ? 'text-white' : 'text-slate-700'} text-base leading-relaxed`}>
                      {message.content}
                    </p>
                  </div>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <p className="text-slate-500 text-base font-medium">Sources:</p>
                      {message.sources.map((source, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleEmailClick(source.emailId)}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-primary-200 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-primary-500" />
                              <h4 className="text-slate-900 font-semibold text-base">{source.studentName}</h4>
                            </div>
                            <ExternalLink className="w-5 h-5 text-slate-400" />
                          </div>
                          <p className="text-slate-600 mb-3 text-base">{source.subject}</p>
                          <p className="text-slate-500 line-clamp-2 text-base">{source.snippet}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white flex-shrink-0 text-base font-semibold">
                    <span>DR</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-8 bg-white">
          <div className="max-w-none mx-auto">
            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="mb-6">
                <p className="text-slate-500 mb-4 text-base font-medium">Try asking:</p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setInput('How many students have requested extensions?')}
                    className="px-6 py-3 text-base hover:bg-blue-50"
                  >
                    Extension requests overview
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setInput('Which students seem confused about the exam?')}
                    className="px-6 py-3 text-base hover:bg-blue-50"
                  >
                    Students confused about exam
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setInput('Show me urgent emails from the past week')}
                    className="px-6 py-3 text-base hover:bg-blue-50"
                  >
                    Recent urgent emails
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about patterns, specific students, or search for topics..."
                className="resize-none text-base p-4"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="self-end bg-primary-600 hover:bg-primary-700 text-white px-6 py-4"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Context */}
      <div className="w-96 border-l border-slate-200 bg-white p-8 overflow-y-auto">
        <h4 className="mb-6 text-xl font-bold text-slate-900">Search Context</h4>
        
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <p className="text-slate-600 mb-3 text-base">
              <strong className="text-lg">47</strong> emails indexed
            </p>
            <p className="text-slate-600 text-base">
              <strong className="text-lg">23</strong> students
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-slate-900">Recent Topics</h4>
            <div className="space-y-3">
              <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-3 hover:bg-primary-100 transition-colors">
                <span className="text-primary-700 text-base font-medium">Extension requests</span>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 hover:bg-purple-100 transition-colors">
                <span className="text-purple-700 text-base font-medium">Exam coverage</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 hover:bg-amber-100 transition-colors">
                <span className="text-amber-700 text-base font-medium">Grade inquiries</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-slate-900">Tips</h4>
            <div className="space-y-3 text-slate-600 text-base">
              <p>• Ask about patterns across multiple emails</p>
              <p>• Search for specific student concerns</p>
              <p>• Identify recurring questions</p>
              <p>• Find emails by topic or sentiment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
