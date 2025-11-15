import { useState } from 'react';
import { ArrowLeft, Send, Sparkles, Mail, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { mockEmails } from '../data/mockEmails';

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

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    // Mock AI response with sources
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: input.toLowerCase().includes('extension')
        ? 'Based on your inbox, you have received 8 extension requests in the past two weeks. The most common reasons cited are: family emergencies (3), medical issues (2), technical difficulties (2), and personal circumstances (1). Students Marcus Johnson, Sarah Chen, and Emily Rodriguez have requested extensions.'
        : input.toLowerCase().includes('confused')
        ? 'Several students appear confused about the midterm exam coverage. Three students (Sarah Chen, Priya Patel, Olivia Brown) have asked about which chapters will be tested, and two students have questions about the exam format.'
        : 'I found 5 relevant emails matching your query. The common theme across these messages is students seeking clarification on assignment requirements and deadlines.',
      sources: [
        {
          studentName: 'Marcus Johnson',
          subject: 'Grade Appeal Request',
          snippet: 'Student is requesting a grade review for their midterm exam, citing calculation errors.',
          emailId: '2',
        },
        {
          studentName: 'Sarah Chen',
          subject: 'Question about Final Project Requirements',
          snippet: 'Student is asking for clarification on the project scope and deliverables for the final assignment.',
          emailId: '1',
        },
        {
          studentName: 'Emma Rodriguez',
          subject: 'Lab Report Submission Issue',
          snippet: 'Student had technical difficulties submitting their lab report and is requesting an extension.',
          emailId: '3',
        },
      ],
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput('');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 p-4 bg-white">
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2>Ask the Inbox</h2>
              <p className="text-slate-500">Conversational search powered by RAG</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div
                    className={`rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    <p className={message.role === 'user' ? 'text-white' : 'text-slate-700'}>
                      {message.content}
                    </p>
                  </div>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-slate-500">Sources:</p>
                      {message.sources.map((source, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleEmailClick(source.emailId)}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-primary-200 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-primary-500" />
                              <h4 className="text-slate-900">{source.studentName}</h4>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </div>
                          <p className="text-slate-600 mb-2">{source.subject}</p>
                          <p className="text-slate-500 line-clamp-2">{source.snippet}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white flex-shrink-0">
                    <span>DR</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4 bg-white">
          <div className="max-w-4xl mx-auto">
            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="mb-4">
                <p className="text-slate-500 mb-3">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput('How many students have requested extensions?')}
                  >
                    Extension requests overview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput('Which students seem confused about the exam?')}
                  >
                    Students confused about exam
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput('Show me urgent emails from the past week')}
                  >
                    Recent urgent emails
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about patterns, specific students, or search for topics..."
                className="resize-none"
                rows={2}
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
                className="self-end bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Context */}
      <div className="w-80 border-l border-slate-200 bg-white p-4 overflow-y-auto">
        <h4 className="mb-4">Search Context</h4>
        
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-slate-600 mb-2">
              <strong>47</strong> emails indexed
            </p>
            <p className="text-slate-600">
              <strong>23</strong> students
            </p>
          </div>

          <div>
            <h4 className="mb-3">Recent Topics</h4>
            <div className="space-y-2">
              <div className="bg-primary-50 border border-primary-200 rounded-lg px-3 py-2">
                <span className="text-primary-700">Extension requests</span>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                <span className="text-purple-700">Exam coverage</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <span className="text-amber-700">Grade inquiries</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3">Tips</h4>
            <div className="space-y-2 text-slate-600">
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
