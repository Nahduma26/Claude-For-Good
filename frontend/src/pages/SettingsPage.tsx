import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useState } from 'react';

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [tone, setTone] = useState('professional');
  const [replyLength, setReplyLength] = useState([50]);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [detectDistress, setDetectDistress] = useState(true);
  const [highlightUrgent, setHighlightUrgent] = useState(true);
  const [wellbeingAlerts, setWellbeingAlerts] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto p-6">
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1>Settings</h1>
          <p className="text-slate-500">Configure your AI assistant preferences and course policies</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Email Drafting Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Email Drafting Preferences</CardTitle>
            <CardDescription>Customize how the AI generates draft responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tone Selector */}
            <div className="space-y-2">
              <Label htmlFor="tone">Communication Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="warm">Warm & Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="brief">Brief & Direct</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-slate-500">
                {tone === 'neutral' && 'Balanced, neither overly formal nor casual'}
                {tone === 'warm' && 'Friendly and approachable, showing empathy'}
                {tone === 'professional' && 'Formal and respectful communication style'}
                {tone === 'brief' && 'Concise responses with essential information only'}
              </p>
            </div>

            {/* Reply Length */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="length">Reply Length</Label>
                <span className="text-slate-600">{replyLength[0]}%</span>
              </div>
              <Slider
                id="length"
                value={replyLength}
                onValueChange={setReplyLength}
                min={25}
                max={100}
                step={25}
                className="w-full"
              />
              <div className="flex justify-between">
                <span className="text-slate-500">Concise</span>
                <span className="text-slate-500">Detailed</span>
              </div>
            </div>

            {/* Auto-generate Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="space-y-0.5">
                <Label htmlFor="auto-generate">Auto-generate drafts</Label>
                <p className="text-slate-500">
                  Automatically create draft responses when opening emails
                </p>
              </div>
              <Switch
                id="auto-generate"
                checked={autoGenerate}
                onCheckedChange={setAutoGenerate}
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Course Policies</CardTitle>
            <CardDescription>
              Define your course policies to help the AI generate accurate responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="late-policy">Late Submission Policy</Label>
              <Textarea
                id="late-policy"
                placeholder="Describe your policy for late assignments..."
                defaultValue="Assignments submitted after the deadline will receive a 10% penalty per day, up to 3 days. After 3 days, assignments will not be accepted unless there is a documented emergency or prior arrangement."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extension-policy">Extension Request Policy</Label>
              <Textarea
                id="extension-policy"
                placeholder="Describe your policy for extension requests..."
                defaultValue="Extension requests must be made at least 24 hours before the deadline when possible. Extensions may be granted for documented emergencies (medical, family, or technical issues). Please provide relevant documentation and specify the requested extension duration."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="honor-code">Academic Integrity Policy</Label>
              <Textarea
                id="honor-code"
                placeholder="Describe your honor code and academic integrity expectations..."
                defaultValue="All work submitted must be your own. Collaboration is permitted on homework assignments but must be acknowledged. Plagiarism, unauthorized collaboration on exams, or use of unauthorized resources will result in disciplinary action per university policy."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade-policy">Grade Appeal Process</Label>
              <Textarea
                id="grade-policy"
                placeholder="Describe your process for grade appeals..."
                defaultValue="Grade appeals must be submitted within 7 days of receiving feedback. Please reference specific rubric criteria and explain your concern in detail. I will review your submission and rubric application, and we can schedule a meeting to discuss if needed."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Risk Detection Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Detection & Student Wellbeing</CardTitle>
            <CardDescription>
              Configure how the AI identifies and alerts you to concerning patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="space-y-0.5">
                <Label htmlFor="detect-distress">Detect emotional distress</Label>
                <p className="text-slate-500">
                  Identify students showing signs of stress or anxiety in emails
                </p>
              </div>
              <Switch
                id="detect-distress"
                checked={detectDistress}
                onCheckedChange={setDetectDistress}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="space-y-0.5">
                <Label htmlFor="highlight-urgent">Highlight urgent emails</Label>
                <p className="text-slate-500">
                  Automatically flag emails requiring immediate attention
                </p>
              </div>
              <Switch
                id="highlight-urgent"
                checked={highlightUrgent}
                onCheckedChange={setHighlightUrgent}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="space-y-0.5">
                <Label htmlFor="wellbeing-alerts">Mental wellbeing alerts</Label>
                <p className="text-slate-500">
                  Suggest student support resources when concerning patterns detected
                </p>
              </div>
              <Switch
                id="wellbeing-alerts"
                checked={wellbeingAlerts}
                onCheckedChange={setWellbeingAlerts}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800">
                <strong>Privacy Note:</strong> All detection is performed locally using AI models. 
                No student data is shared externally. Alerts are suggestions only and require your professional judgment.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Outlook Integration</CardTitle>
            <CardDescription>Manage your Microsoft Outlook connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                  </svg>
                </div>
                <div>
                  <h4>Connected to Microsoft</h4>
                  <p className="text-green-700">dr.rivera@university.edu</p>
                </div>
              </div>
              <Button variant="outline">Disconnect</Button>
            </div>

            <div className="text-slate-600">
              <p>Last sync: 5 minutes ago</p>
              <p>Emails processed: 47</p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onBack}>Cancel</Button>
          <Button className="gap-2 bg-primary-600 hover:bg-primary-700 text-white">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
