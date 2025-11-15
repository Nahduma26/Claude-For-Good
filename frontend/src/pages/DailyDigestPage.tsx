import { ArrowLeft, Mail, AlertCircle, HelpCircle, AlertTriangle, Calendar, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

interface DailyDigestProps {
  onBack: () => void;
}

export function DailyDigest({ onBack }: DailyDigestProps) {
  const handleEmailDigest = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve("Digest generated successfully!");
        }, 2000);
      }),
      {
        loading: "Generating comprehensive email digest...",
        success: "Email digest sent to your inbox! Check your email for the detailed summary.",
        error: "Failed to generate digest. Please try again.",
      }
    );
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
              <Button onClick={handleDatePicker} variant="outline" className="gap-3 px-6 py-3 text-base border-slate-300 hover:bg-blue-50">
                <Calendar className="w-5 h-5" />
                Saturday, Nov 15
              </Button>
              <Button onClick={handleEmailDigest} className="gap-3 px-8 py-3 text-base bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm">
                <Send className="w-5 h-5" />
                Email Digest
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-none mx-auto p-10 space-y-10">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:bg-blue-50">
            <CardHeader className="pb-4 p-8">
              <CardDescription className="text-slate-500 font-medium text-base">Total Emails</CardDescription>
              <CardTitle className="text-4xl font-bold text-slate-900 mt-2">47</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:bg-blue-50">
            <CardHeader className="pb-4 p-8">
              <CardDescription className="text-slate-500 font-medium text-base">New Today</CardDescription>
              <CardTitle className="text-4xl font-bold text-primary-600 mt-2">12</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:bg-blue-50">
            <CardHeader className="pb-4 p-8">
              <CardDescription className="text-slate-500 font-medium text-base">Urgent</CardDescription>
              <CardTitle className="text-4xl font-bold text-red-600 mt-2">2</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:bg-blue-50">
            <CardHeader className="pb-4 p-8">
              <CardDescription className="text-slate-500 font-medium text-base">Resolved</CardDescription>
              <CardTitle className="text-4xl font-bold text-green-600 mt-2">8</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Urgent Items */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-red-50 to-orange-50 p-8">
            <CardTitle className="flex items-center gap-4 text-2xl">
              <AlertCircle className="w-7 h-7 text-red-500" />
              Urgent Items
            </CardTitle>
            <CardDescription className="text-slate-600 text-base mt-2">Emails requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-7 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-red-900 text-xl">Jessica Williams</h4>
                  <p className="text-red-700 font-medium text-base mt-1">Cannot access course materials - assignment due tonight</p>
                </div>
                <span className="text-red-600 text-base font-medium">30 min ago</span>
              </div>
              <p className="text-red-700 leading-relaxed text-base">
                Student locked out of Canvas, multiple failed IT contact attempts. Immediate technical support needed.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-7 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-amber-900 text-xl">Ryan Miller</h4>
                  <p className="text-amber-700 font-medium text-base mt-1">Possible academic integrity issue</p>
                </div>
                <span className="text-amber-600 text-base font-medium">6 hours ago</span>
              </div>
              <p className="text-amber-700 leading-relaxed text-base">
                Student suspects plagiarism, requests confidential meeting. Requires sensitive handling.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Repeated Questions */}
        <Card className="hover:bg-blue-50 transition-colors">
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <HelpCircle className="w-7 h-7 text-purple-500" />
              Repeated Student Questions
            </CardTitle>
            <CardDescription className="text-base mt-2">Common themes that may warrant a class-wide announcement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-purple-900 text-lg font-semibold">Midterm Exam Coverage</h4>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-base">3 students</span>
              </div>
              <p className="text-purple-700 mb-4 text-base">
                Multiple students asking which chapters will be covered on the midterm exam.
              </p>
              <div className="text-purple-600 text-base">
                <strong>Students:</strong> Sarah Chen, Priya Patel, Olivia Brown
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-blue-900 text-lg font-semibold">Assignment Format Requirements</h4>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-base">2 students</span>
              </div>
              <p className="text-blue-700 mb-4 text-base">
                Questions about file format (PDF vs Word) and what to include in submissions.
              </p>
              <div className="text-blue-600 text-base">
                <strong>Students:</strong> Olivia Brown, Priya Patel
              </div>
            </div>
          </CardContent>
        </Card>

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
