import { ArrowLeft, Mail, AlertCircle, HelpCircle, AlertTriangle, Calendar, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

interface DailyDigestProps {
  onBack: () => void;
}

export function DailyDigest({ onBack }: DailyDigestProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto p-6">
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Daily Digest</h1>
              <p className="text-slate-500">Summary of email activity for today</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Saturday, Nov 15
              </Button>
              <Button className="gap-2 bg-primary-600 hover:bg-primary-700 text-white">
                <Send className="w-4 h-4" />
                Email Digest
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Emails</CardDescription>
              <CardTitle>47</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>New Today</CardDescription>
              <CardTitle className="text-primary-600">12</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Urgent</CardDescription>
              <CardTitle className="text-red-600">2</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Resolved</CardDescription>
              <CardTitle className="text-green-600">8</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Urgent Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Urgent Items
            </CardTitle>
            <CardDescription>Emails requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-red-900">Jessica Williams</h4>
                  <p className="text-red-700">Cannot access course materials - assignment due tonight</p>
                </div>
                <span className="text-red-600">30 min ago</span>
              </div>
              <p className="text-red-700">
                Student locked out of Canvas, multiple failed IT contact attempts. Immediate technical support needed.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-amber-900">Ryan Miller</h4>
                  <p className="text-amber-700">Possible academic integrity issue</p>
                </div>
                <span className="text-amber-600">6 hours ago</span>
              </div>
              <p className="text-amber-700">
                Student suspects plagiarism, requests confidential meeting. Requires sensitive handling.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Repeated Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-500" />
              Repeated Student Questions
            </CardTitle>
            <CardDescription>Common themes that may warrant a class-wide announcement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-purple-900">Midterm Exam Coverage</h4>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">3 students</span>
              </div>
              <p className="text-purple-700 mb-3">
                Multiple students asking which chapters will be covered on the midterm exam.
              </p>
              <div className="text-purple-600">
                <strong>Students:</strong> Sarah Chen, Priya Patel, Olivia Brown
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-blue-900">Assignment Format Requirements</h4>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">2 students</span>
              </div>
              <p className="text-blue-700 mb-3">
                Questions about file format (PDF vs Word) and what to include in submissions.
              </p>
              <div className="text-blue-600">
                <strong>Students:</strong> Olivia Brown, Priya Patel
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students at Academic Risk */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Students at Academic Risk
            </CardTitle>
            <CardDescription>Students showing signs of academic or emotional distress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-orange-900">Marcus Johnson</h4>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">High concern</span>
              </div>
              <p className="text-orange-700 mb-2">
                Multiple extension requests citing family emergencies. Anxious tone in communications.
              </p>
              <div className="text-orange-600">
                <strong>Recommendation:</strong> Schedule check-in meeting, provide student support resources
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-amber-900">David Park</h4>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full">Medium concern</span>
              </div>
              <p className="text-amber-700 mb-2">
                Grade dispute showing frustration. May need additional academic support.
              </p>
              <div className="text-amber-600">
                <strong>Recommendation:</strong> Offer office hours meeting to discuss study strategies
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-Up Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary-500" />
              Follow-Up Reminders
            </CardTitle>
            <CardDescription>Emails requiring your response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h4>Daniel Lee - Letter of recommendation request</h4>
                  <p className="text-slate-600">Due date: Dec 1, 2025</p>
                </div>
                <Button variant="outline" size="sm">Review</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h4>David Park - Grade dispute discussion</h4>
                  <p className="text-slate-600">Needs scheduling</p>
                </div>
                <Button variant="outline" size="sm">Schedule</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy-Related Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500" />
              Policy-Related Issues
            </CardTitle>
            <CardDescription>Emails involving course policy clarification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="mb-2">Extension Requests: 8 total</h4>
              <p className="text-slate-600 mb-3">
                Consider reviewing extension policy communication. Multiple students requesting clarification on procedure.
              </p>
              <div className="text-slate-700">
                <strong>Most common reasons:</strong> Family emergencies (3), Medical issues (2), Technical difficulties (2)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
