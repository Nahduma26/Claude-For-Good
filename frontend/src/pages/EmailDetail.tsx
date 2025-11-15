import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Copy, Send, FileText, BookOpen, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CategoryBadge } from '../components/CategoryBadge';
import { EmotionIcon } from '../components/EmotionIcon';
import { PriorityIndicator } from '../components/PriorityIndicator';
import { Email } from '../components/EmailCard';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { emailService } from '../services/emailService';
import { EmailWithContent } from '../utils/emailAdapter';

interface EmailDetailProps {
  email: Email;
  onBack: () => void;
}

export function EmailDetail({ email, onBack }: EmailDetailProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const [showPreviousMessages, setShowPreviousMessages] = useState(false);
  const [fullEmail, setFullEmail] = useState<EmailWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [draftReply, setDraftReply] = useState(
    `Hi ${email.studentName.split(' ')[0]},\n\nThank you for reaching out. I understand your concern regarding ${email.subject.toLowerCase()}.\n\n[Your personalized response based on course policies]\n\nPlease let me know if you have any other questions.\n\nBest regards,\nDr. Rivera`
  );

  // Fetch full email content from backend
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        setLoading(true);
        const emailData = await emailService.getEmailWithContent(email.id);
        setFullEmail(emailData);
        if (emailData.draftReply) {
          setDraftReply(emailData.draftReply);
        }
      } catch (error) {
        console.error('Failed to fetch email details, using provided email:', error);
        // Use the email passed as prop as fallback
        setFullEmail({ ...email, bodyContent: email.summary });
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [email.id]);

  const handleSendReply = () => {
    toast.success(`Reply sent to ${email.studentName}!`);
  };

  const handleMarkResolved = async () => {
    try {
      await emailService.markAsRead(email.id);
      toast.success('Email marked as resolved');
    } catch (error) {
      toast.error('Failed to mark email as resolved');
    }
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftReply);
    toast.success('Draft copied to clipboard');
  };

  const handleGenerateReply = async () => {
    try {
      toast.info('Generating AI-powered reply...');
      const response = await emailService.generateReply(email.id);
      if (response.reply) {
        setDraftReply(response.reply);
        toast.success('Reply generated successfully!');
      }
    } catch (error) {
      toast.error('Failed to generate reply');
    }
  };

  const handleRefreshSuggestions = async () => {
    try {
      toast.info('Refreshing AI suggestions...');
      const response = await emailService.generateReply(email.id);
      if (response.reply) {
        setDraftReply(response.reply);
        toast.success('Reply regenerated!');
      }
    } catch (error) {
      toast.error('Failed to regenerate reply');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Left Panel - Email Content */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200 bg-white">
        {/* Header */}
        <div className="border-b border-slate-200 p-8 bg-white">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 mb-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100 -ml-2 text-base px-4 py-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Inbox
          </Button>

          {/* Email Header */}
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-xl shadow-md">
              <span>{email.studentName.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-2xl font-semibold text-slate-900">{email.studentName}</h3>
                <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-300 text-base px-3 py-1">
                  Junior, CS Major
                </Badge>
              </div>
              <p className="text-base text-slate-500 mb-4">{email.timestamp}</p>
              <h2 className="text-xl font-medium text-slate-800 mb-5 leading-tight">{email.subject}</h2>
              <div className="flex items-center gap-4 flex-wrap">
                <CategoryBadge category={email.category} size="md" />
                <EmotionIcon emotion={email.emotion} />
                <PriorityIndicator score={email.priority} />
              </div>
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto p-10">
          <div className="w-full max-w-none">
            {/* Email Body */}
            {loading ? (
              <div className="bg-white rounded-xl p-12 mb-10 border border-slate-200 shadow-sm flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-slate-600">Loading email content...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 mb-10 border border-slate-200 shadow-sm">
                <p className="whitespace-pre-line text-slate-700 leading-relaxed text-xl">
                  {fullEmail?.bodyContent || email.summary || 'No email content available.'}
                </p>
              </div>
            )}

            {/* Thread Timeline */}
            <div className="border border-slate-200 rounded-xl p-10 bg-white shadow-sm">
              <button 
                onClick={() => setShowPreviousMessages(!showPreviousMessages)}
                className="flex items-center gap-4 text-slate-600 hover:text-slate-900 w-full p-4 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <FileText className="w-7 h-7" />
                <span className="font-medium text-xl">{showPreviousMessages ? 'Hide' : 'View'} previous messages (2)</span>
              </button>

              {showPreviousMessages && (
                <div className="mt-8 space-y-6 border-t border-slate-200 pt-8">
                  {/* Previous Message 1 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-lg">
                        DR
                      </div>
                      <div>
                        <span className="font-semibold text-lg text-slate-900">Dr. Rivera</span>
                        <span className="text-sm text-slate-500 ml-3">3 days ago</span>
                      </div>
                    </div>
                    <p className="text-base text-slate-700 leading-relaxed pl-16">
                      Hi {email.studentName.split(' ')[0]}, thank you for your question about the assignment requirements. 
                      Please review the syllabus section 4.2 for detailed guidelines. Let me know if you need clarification on any specific points.
                    </p>
                  </div>

                  {/* Previous Message 2 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium text-lg">
                        {email.studentName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-lg text-slate-900">{email.studentName}</span>
                        <span className="text-sm text-slate-500 ml-3">4 days ago</span>
                      </div>
                    </div>
                    <p className="text-base text-slate-700 leading-relaxed pl-16">
                      Hi Dr. Rivera, I have a quick question about the upcoming assignment. 
                      Could you clarify what format you'd like for the bibliography? MLA or APA? 
                      Thanks!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="border-t border-slate-200 p-10 bg-white">
          <div className="flex gap-5 w-full">
            <Button 
              onClick={handleSendReply}
              className="gap-3 bg-primary-600 hover:bg-primary-700 text-white px-10 py-5 font-medium shadow-sm text-lg"
            >
              <Send className="w-6 h-6" />
              Send Reply
            </Button>
            <Button 
              onClick={handleMarkResolved}
              variant="outline" 
              className="gap-3 px-10 py-5 font-medium border-slate-300 hover:bg-blue-50 text-lg"
            >
              <CheckCircle className="w-6 h-6" />
              Mark Resolved
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - AI Assistant */}
      <div className="w-[520px] flex flex-col overflow-hidden bg-white border-l border-slate-200">
        <div className="border-b border-slate-200 p-10 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <Sparkles className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">AI Assistant</h3>
          </div>
          <p className="text-lg text-slate-600">Powered by Gemini</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-slate-200 px-10 py-6 bg-white">
            <TabsTrigger value="summary" className="px-8 py-4 text-lg">Summary</TabsTrigger>
            <TabsTrigger value="draft" className="px-8 py-4 text-lg">Draft Reply</TabsTrigger>
            <TabsTrigger value="policies" className="px-8 py-4 text-lg">Policies</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="summary" className="p-10 space-y-8 m-0">
              {/* AI Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200 shadow-sm">
                <h4 className="mb-5 flex items-center gap-3 font-semibold text-slate-900 text-xl">
                  <Sparkles className="w-6 h-6 text-primary-600" />
                  AI-Generated Summary
                </h4>
                <p className="text-slate-700 leading-relaxed text-lg">{email.summary}</p>
              </div>

              {/* Key Insights */}
              <div>
                <h4 className="mb-6 font-semibold text-slate-900 text-xl">Key Insights</h4>
                <div className="space-y-5">
                  <div className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm">
                    <p className="text-slate-700 text-lg">
                      <span className="font-semibold text-slate-900">Intent:</span> {email.category === 'extension' ? 'Student requests accommodation' : email.category === 'clarification' ? 'Student needs information' : 'Student seeks resolution'}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm">
                    <p className="text-slate-700 text-lg">
                      <span className="font-semibold text-slate-900">Urgency:</span> {email.priority > 0.7 ? 'High - Respond within 24 hours' : 'Medium - Respond within 2-3 days'}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm">
                    <p className="text-slate-700 text-lg">
                      <span className="font-semibold text-slate-900">Emotional State:</span> {email.emotion === 'anxious' ? 'Student appears stressed or worried' : email.emotion === 'confused' ? 'Student needs clarification' : 'Professional tone'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hidden Intent */}
              <div>
                <h4 className="mb-6 font-semibold text-slate-900 text-xl">Detected Patterns</h4>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-7 shadow-sm">
                  <p className="text-amber-800 font-medium text-lg">
                    {email.category === 'extension' ? 'Student may be experiencing personal challenges. Consider offering additional resources.' : 'No concerning patterns detected.'}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="draft" className="p-10 space-y-8 m-0">
              <div className="bg-green-50 border border-green-200 rounded-xl p-7 flex items-start gap-4 shadow-sm">
                <Sparkles className="w-7 h-7 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-green-800 font-medium leading-relaxed text-lg">
                  Draft generated based on your course policies and communication style.
                </p>
              </div>

              <Textarea
                value={draftReply}
                readOnly
                className="min-h-[400px] bg-white resize-none border-slate-300 shadow-sm rounded-xl text-lg p-7"
              />

              <div className="space-y-4">
                <Button onClick={handleRefreshSuggestions} variant="outline" className="w-full gap-3 py-5 text-lg border-slate-300 hover:bg-blue-50">
                  <RefreshCw className="w-6 h-6" />
                  Regenerate Draft
                </Button>
                <Button onClick={handleCopyDraft} variant="outline" className="w-full gap-3 py-5 text-lg border-slate-300 hover:bg-blue-50">
                  <Copy className="w-6 h-6" />
                  Copy to Clipboard
                </Button>
                <Button onClick={handleGenerateReply} className="w-full gap-3 py-5 text-lg bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm">
                  <Send className="w-6 h-6" />
                  Insert into Outlook
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="policies" className="p-10 space-y-8 m-0">
              <div>
                <h4 className="mb-6 flex items-center gap-3 font-semibold text-slate-900 text-xl">
                  <BookOpen className="w-7 h-7 text-primary-600" />
                  Relevant Policies
                </h4>
                
                <div className="space-y-6">
                  {email.category === 'extension' && (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                      <h4 className="text-primary-700 mb-4 font-semibold text-lg">Late Submission Policy</h4>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        Extensions may be granted for documented emergencies. Students must request extensions at least 24 hours before the deadline when possible. Medical or family emergency documentation required.
                      </p>
                    </div>
                  )}
                  
                  {email.category === 'grades' && (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                      <h4 className="text-primary-700 mb-4 font-semibold text-lg">Grade Appeal Process</h4>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        Students may request grade reconsideration within 7 days of receiving feedback. Appeals must reference specific rubric criteria and explain the concern in detail.
                      </p>
                    </div>
                  )}

                  <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                    <h4 className="text-primary-700 mb-4 font-semibold text-lg">Communication Guidelines</h4>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      Instructor will respond to emails within 24-48 hours on weekdays. For urgent matters, students should also attend office hours.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-6 font-semibold text-slate-900 text-xl">Draft Alignment</h4>
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 shadow-sm">
                  <div className="space-y-3 text-green-800 font-medium text-lg">
                    <p className="flex items-center gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      Draft response aligns with course policies
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      Maintains professional and empathetic tone
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      Provides clear next steps
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
