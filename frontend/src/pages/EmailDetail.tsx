import { useState } from 'react';
import { ArrowLeft, Sparkles, Copy, Send, FileText, BookOpen, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CategoryBadge } from '../components/CategoryBadge';
import { EmotionIcon } from '../components/EmotionIcon';
import { PriorityIndicator } from '../components/PriorityIndicator';
import { Email } from '../components/EmailCard';
import { Badge } from '../components/ui/badge';

interface EmailDetailProps {
  email: Email;
  onBack: () => void;
}

export function EmailDetail({ email, onBack }: EmailDetailProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const [showPreviousMessages, setShowPreviousMessages] = useState(false);
  const [draftReply] = useState(
    `Hi ${email.studentName.split(' ')[0]},\n\nThank you for reaching out. I understand your concern regarding ${email.subject.toLowerCase()}.\n\n[Your personalized response based on course policies]\n\nPlease let me know if you have any other questions.\n\nBest regards,\nDr. Rivera`
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Left Panel - Email Content */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200 bg-white">
        {/* Header */}
        <div className="border-b border-slate-200 p-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inbox
          </Button>

          {/* Email Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white">
              <span>{email.studentName.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3>{email.studentName}</h3>
                <Badge variant="outline" className="text-slate-500">
                  Junior, CS Major
                </Badge>
              </div>
              <p className="text-slate-500 mb-2">{email.timestamp}</p>
              <h2 className="mb-3">{email.subject}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={email.category} size="md" />
                <EmotionIcon emotion={email.emotion} />
                <PriorityIndicator score={email.priority} />
              </div>
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            {/* Email Body */}
            <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200">
              <p className="whitespace-pre-line text-slate-700 leading-relaxed">
                Dear Dr. Rivera,
                
                I hope this email finds you well. I am writing to {email.subject.toLowerCase()}.
                
                {email.category === 'extension' && `I have been dealing with a family emergency that has made it difficult for me to complete the assignment on time. I have documentation that I can provide if needed. I would really appreciate if I could have a few extra days to submit my work.`}
                
                {email.category === 'clarification' && `I've been studying for the exam and I'm not entirely clear on the scope of the material. Could you please clarify which chapters will be covered? I want to make sure I'm focusing my studying on the right topics.`}
                
                {email.category === 'grades' && `I reviewed the grading rubric for Assignment 4, and I believe there may have been a misunderstanding in how my submission was evaluated. Would it be possible to discuss this further? I'm happy to meet during office hours.`}
                
                {email.category === 'urgent' && `I've been trying to access the course materials for the past hour but I keep getting an error message. I've contacted IT but haven't heard back. My assignment is due tonight and I'm really worried I won't be able to submit it on time.`}
                
                {email.category === 'honor' && `I need to discuss a sensitive matter regarding academic integrity. I would prefer to speak with you in person if possible. Could we schedule a confidential meeting?`}
                
                {email.category === 'logistics' && `Thank you so much for the detailed feedback on my recent assignment. Your comments were incredibly helpful. I was wondering if you could recommend any additional resources or books that might help me dive deeper into this topic?`}
                
                Thank you for your time and understanding.
                
                Best regards,
                {email.studentName}
              </p>
            </div>

            {/* Thread Timeline */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <button 
                onClick={() => setShowPreviousMessages(!showPreviousMessages)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 w-full"
              >
                <FileText className="w-4 h-4" />
                <span>{showPreviousMessages ? 'Hide' : 'View'} previous messages (2)</span>
              </button>

              {showPreviousMessages && (
                <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                  {/* Previous Message 1 */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">Dr. Rivera</span>
                      <span className="text-xs text-slate-500">3 days ago</span>
                    </div>
                    <p className="text-sm text-slate-700">
                      Hi {email.studentName.split(' ')[0]}, thank you for your question about the assignment requirements. 
                      Please review the syllabus section 4.2 for detailed guidelines. Let me know if you need clarification on any specific points.
                    </p>
                  </div>

                  {/* Previous Message 2 */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{email.studentName}</span>
                      <span className="text-xs text-slate-500">4 days ago</span>
                    </div>
                    <p className="text-sm text-slate-700">
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
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <div className="flex gap-2">
            <Button className="gap-2 bg-primary-600 hover:bg-primary-700 text-white">
              <Send className="w-4 h-4" />
              Send Reply
            </Button>
            <Button variant="outline" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Mark Resolved
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - AI Assistant */}
      <div className="w-[400px] flex flex-col overflow-hidden bg-white">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h3>AI Assistant</h3>
          </div>
          <p className="text-slate-500">Powered by Gemini</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-slate-200 px-4 bg-white">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="draft">Draft Reply</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="summary" className="p-4 space-y-4 m-0">
              {/* AI Summary */}
              <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl p-4 border border-primary-100">
                <h4 className="mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  AI-Generated Summary
                </h4>
                <p className="text-slate-700">{email.summary}</p>
              </div>

              {/* Key Insights */}
              <div>
                <h4 className="mb-3">Key Insights</h4>
                <div className="space-y-2">
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="text-slate-700">
                      <strong>Intent:</strong> {email.category === 'extension' ? 'Student requests accommodation' : email.category === 'clarification' ? 'Student needs information' : 'Student seeks resolution'}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="text-slate-700">
                      <strong>Urgency:</strong> {email.priority > 0.7 ? 'High - Respond within 24 hours' : 'Medium - Respond within 2-3 days'}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="text-slate-700">
                      <strong>Emotional State:</strong> {email.emotion === 'anxious' ? 'Student appears stressed or worried' : email.emotion === 'confused' ? 'Student needs clarification' : 'Professional tone'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hidden Intent */}
              <div>
                <h4 className="mb-3">Detected Patterns</h4>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800">
                    {email.category === 'extension' ? 'Student may be experiencing personal challenges. Consider offering additional resources.' : 'No concerning patterns detected.'}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="draft" className="p-4 space-y-4 m-0">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-green-600 mt-0.5" />
                <p className="text-green-800">
                  Draft generated based on your course policies and communication style.
                </p>
              </div>

              <Textarea
                value={draftReply}
                readOnly
                className="min-h-[300px] bg-white resize-none"
              />

              <div className="space-y-2">
                <Button variant="outline" className="w-full gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Draft
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </Button>
                <Button className="w-full gap-2 bg-primary-600 hover:bg-primary-700 text-white">
                  <Send className="w-4 h-4" />
                  Insert into Outlook
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="policies" className="p-4 space-y-4 m-0">
              <div>
                <h4 className="mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Relevant Policies
                </h4>
                
                <div className="space-y-3">
                  {email.category === 'extension' && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <h4 className="text-primary-700 mb-2">Late Submission Policy</h4>
                      <p className="text-slate-600">
                        Extensions may be granted for documented emergencies. Students must request extensions at least 24 hours before the deadline when possible. Medical or family emergency documentation required.
                      </p>
                    </div>
                  )}
                  
                  {email.category === 'grades' && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <h4 className="text-primary-700 mb-2">Grade Appeal Process</h4>
                      <p className="text-slate-600">
                        Students may request grade reconsideration within 7 days of receiving feedback. Appeals must reference specific rubric criteria and explain the concern in detail.
                      </p>
                    </div>
                  )}

                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-primary-700 mb-2">Communication Guidelines</h4>
                    <p className="text-slate-600">
                      Instructor will respond to emails within 24-48 hours on weekdays. For urgent matters, students should also attend office hours.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3">Draft Alignment</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800">
                    ✓ Draft response aligns with course policies<br />
                    ✓ Maintains professional and empathetic tone<br />
                    ✓ Provides clear next steps
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
