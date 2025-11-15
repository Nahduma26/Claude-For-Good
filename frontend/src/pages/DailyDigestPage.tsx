import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, AlertCircle, HelpCircle, AlertTriangle, Calendar, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { emailService } from '../services/emailService';

interface DailyDigestProps {
  onBack: () => void;
}

interface DigestData {
  summary: string;
  categories: Record<string, number>;
  high_priority: string[];
  common_themes: string[];
  recommendations: string[];
  statistics: {
    total_emails: number;
    priority_distribution: { low: number; medium: number; high: number };
  };
}

export function DailyDigest({ onBack }: DailyDigestProps) {
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load digest on mount
  useEffect(() => {
    loadDigest();
  }, [selectedDate]);

  const loadDigest = async () => {
    setLoading(true);
    try {
      const digestData = await emailService.generateDailyDigest(selectedDate);
      setDigest(digestData);
    } catch (error) {
      console.error('Failed to load digest:', error);
      toast.error('Failed to load daily digest. Using mock data.');
      // Keep existing mock data structure
    } finally {
      setLoading(false);
    }
  };

  const handleEmailDigest = async () => {
    try {
      setLoading(true);
      const digestData = await emailService.generateDailyDigest(selectedDate);
      setDigest(digestData);
      toast.success('Daily digest generated successfully!');
    } catch (error) {
      toast.error('Failed to generate digest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewTask = () => {
    toast.info("Opening task review interface...");
  };

  const handleScheduleMeeting = () => {
    toast.info("Opening calendar to schedule meeting...");
  };

  const handleDatePicker = () => {
    toast.info("Opening date picker for digest selection...");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="w-full px-10 py-8">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col items-start">
              <Button variant="ghost" onClick={onBack} className="gap-3 mb-6 text-slate-600 hover:text-slate-900 hover:bg-blue-50 -ml-2 px-4 py-3 text-base">
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-3">Daily Digest</h1>
                <p className="text-xl text-slate-600">Summary of email activity for today</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-base"
              />
              <Button 
                onClick={handleEmailDigest} 
                disabled={loading}
                className="gap-3 px-8 py-3 text-base bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Generate Digest
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-none mx-auto p-10 space-y-10">
        {loading && !digest ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-lg text-slate-600">Generating daily digest...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:bg-blue-50">
                <CardHeader className="pb-4 p-8">
                  <CardDescription className="text-slate-500 font-medium text-base">Total Emails</CardDescription>
                  <CardTitle className="text-4xl font-bold text-slate-900 mt-2">
                    {digest?.statistics?.total_emails || 47}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:bg-blue-50">
                <CardHeader className="pb-4 p-8">
                  <CardDescription className="text-slate-500 font-medium text-base">High Priority</CardDescription>
                  <CardTitle className="text-4xl font-bold text-primary-600 mt-2">
                    {digest?.statistics?.priority_distribution?.high || 12}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:bg-blue-50">
                <CardHeader className="pb-4 p-8">
                  <CardDescription className="text-slate-500 font-medium text-base">Medium Priority</CardDescription>
                  <CardTitle className="text-4xl font-bold text-amber-600 mt-2">
                    {digest?.statistics?.priority_distribution?.medium || 2}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:bg-blue-50">
                <CardHeader className="pb-4 p-8">
                  <CardDescription className="text-slate-500 font-medium text-base">Low Priority</CardDescription>
                  <CardTitle className="text-4xl font-bold text-green-600 mt-2">
                    {digest?.statistics?.priority_distribution?.low || 8}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* AI-Generated Summary */}
            {digest?.summary && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Sparkles className="w-7 h-7 text-primary-600" />
                    AI-Generated Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-line">
                    {digest.summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* High Priority Items */}
            {digest?.high_priority && digest.high_priority.length > 0 && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-red-50 to-orange-50 p-8">
                  <CardTitle className="flex items-center gap-4 text-2xl">
                    <AlertCircle className="w-7 h-7 text-red-500" />
                    High Priority Items
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base mt-2">Items requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-8">
                  {digest.high_priority.map((item, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
                      <p className="text-red-900 text-base leading-relaxed">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Common Themes */}
            {digest?.common_themes && digest.common_themes.length > 0 && (
              <Card className="hover:bg-blue-50 transition-colors">
                <CardHeader className="p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <HelpCircle className="w-7 h-7 text-purple-500" />
                    Common Themes
                  </CardTitle>
                  <CardDescription className="text-base mt-2">Recurring patterns identified by AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-8">
                  {digest.common_themes.map((theme, idx) => (
                    <div key={idx} className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                      <p className="text-purple-900 text-base leading-relaxed">{theme}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {digest?.recommendations && digest.recommendations.length > 0 && (
              <Card className="hover:bg-blue-50 transition-colors">
                <CardHeader className="p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <AlertTriangle className="w-7 h-7 text-orange-500" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription className="text-base mt-2">Actionable next steps suggested by AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-8">
                  {digest.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                      <p className="text-orange-900 text-base leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Students at Academic Risk */}
        <Card className="hover:bg-blue-50 transition-colors">
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <AlertTriangle className="w-7 h-7 text-orange-500" />
              Students at Academic Risk
            </CardTitle>
            <CardDescription className="text-base mt-2">Students showing signs of academic or emotional distress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-orange-900 text-lg font-semibold">Marcus Johnson</h4>
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-base">High concern</span>
              </div>
              <p className="text-orange-700 mb-3 text-base">
                Multiple extension requests citing family emergencies. Anxious tone in communications.
              </p>
              <div className="text-orange-600 text-base">
                <strong>Recommendation:</strong> Schedule check-in meeting, provide student support resources
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-amber-900 text-lg font-semibold">David Park</h4>
                <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-base">Medium concern</span>
              </div>
              <p className="text-amber-700 mb-3 text-base">
                Grade dispute showing frustration. May need additional academic support.
              </p>
              <div className="text-amber-600 text-base">
                <strong>Recommendation:</strong> Offer office hours meeting to discuss study strategies
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-Up Reminders */}
        <Card className="hover:bg-blue-50 transition-colors">
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Mail className="w-7 h-7 text-primary-500" />
              Follow-Up Reminders
            </CardTitle>
            <CardDescription className="text-base mt-2">Emails requiring your response</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-lg border border-slate-200 hover:bg-blue-50 transition-colors">
                <div>
                  <h4 className="text-base font-semibold">Daniel Lee - Letter of recommendation request</h4>
                  <p className="text-slate-600 text-base">Due date: Dec 1, 2025</p>
                </div>
                <Button onClick={handleReviewTask} variant="outline" className="px-4 py-2 text-base hover:bg-blue-50">Review</Button>
              </div>
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-lg border border-slate-200 hover:bg-blue-50 transition-colors">
                <div>
                  <h4 className="text-base font-semibold">David Park - Grade dispute discussion</h4>
                  <p className="text-slate-600 text-base">Needs scheduling</p>
                </div>
                <Button onClick={handleScheduleMeeting} variant="outline" className="px-4 py-2 text-base hover:bg-blue-50">Schedule</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy-Related Issues */}
        <Card className="hover:bg-blue-50 transition-colors">
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Calendar className="w-7 h-7 text-slate-500" />
              Policy-Related Issues
            </CardTitle>
            <CardDescription className="text-base mt-2">Emails involving course policy clarification</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h4 className="mb-3 text-lg font-semibold">Extension Requests: 8 total</h4>
              <p className="text-slate-600 mb-4 text-base">
                Consider reviewing extension policy communication. Multiple students requesting clarification on procedure.
              </p>
              <div className="text-slate-700 text-base">
                <strong>Most common reasons:</strong> Family emergencies (3), Medical issues (2), Technical difficulties (2)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
