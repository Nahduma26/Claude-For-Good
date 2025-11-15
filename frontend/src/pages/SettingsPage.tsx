import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };
  const [tone, setTone] = useState('professional');
  const [replyLength, setReplyLength] = useState([50]);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [detectDistress, setDetectDistress] = useState(true);
  const [highlightUrgent, setHighlightUrgent] = useState(true);
  const [wellbeingAlerts, setWellbeingAlerts] = useState(true);

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  const handleDisconnectMicrosoft = () => {
    toast.info('Microsoft account disconnected');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-none mx-auto p-8">
          <Button variant="ghost" onClick={onBack} className="gap-3 mb-6 text-slate-600 hover:text-slate-900 hover:bg-blue-50 px-4 py-3 text-base">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-500 text-lg">Configure your AI assistant preferences and course policies</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-none mx-auto p-10 space-y-8">
        {/* Email Drafting Preferences */}
        <Card className="hover:bg-blue-50 transition-colors">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl">Email Drafting Preferences</CardTitle>
            <CardDescription className="text-base mt-2">Customize how the AI generates draft responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            {/* Tone Selector */}
            <div className="space-y-3">
              <Label htmlFor="tone" className="text-base font-semibold">Communication Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone" className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="warm">Warm & Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="brief">Brief & Direct</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-slate-500 text-base">
                {tone === 'neutral' && 'Balanced, neither overly formal nor casual'}
                {tone === 'warm' && 'Friendly and approachable, showing empathy'}
                {tone === 'professional' && 'Formal and respectful communication style'}
                {tone === 'brief' && 'Concise responses with essential information only'}
              </p>
            </div>

            {/* Reply Length */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="length" className="text-base font-semibold">Reply Length</Label>
                <span className="text-slate-600 text-base">{replyLength[0]}%</span>
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
                <span className="text-slate-500 text-base">Concise</span>
                <span className="text-slate-500 text-base">Detailed</span>
              </div>
            </div>

            {/* Auto-generate Toggle */}
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-lg border border-slate-200 hover:bg-blue-50 transition-colors">
              <div className="space-y-1">
                <Label htmlFor="auto-generate" className="text-base font-semibold">Auto-generate drafts</Label>
                <p className="text-slate-500 text-base">
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
        <Card className="hover:bg-blue-50 transition-colors">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl">Course Policies</CardTitle>
            <CardDescription className="text-base mt-2">
              Define your course policies to help the AI generate accurate responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="space-y-3">
              <Label htmlFor="late-policy" className="text-base font-semibold">Late Submission Policy</Label>
              <Textarea
                id="late-policy"
                placeholder="Describe your policy for late assignments..."
                defaultValue="Assignments submitted after the deadline will receive a 10% penalty per day, up to 3 days. After 3 days, assignments will not be accepted unless there is a documented emergency or prior arrangement."
                rows={5}
                className="text-base p-4"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="extension-policy" className="text-base font-semibold">Extension Request Policy</Label>
              <Textarea
                id="extension-policy"
                placeholder="Describe your policy for extension requests..."
                defaultValue="Extension requests must be made at least 24 hours before the deadline when possible. Extensions may be granted for documented emergencies (medical, family, or technical issues). Please provide relevant documentation and specify the requested extension duration."
                rows={5}
                className="text-base p-4"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="honor-code" className="text-base font-semibold">Academic Integrity Policy</Label>
              <Textarea
                id="honor-code"
                placeholder="Describe your honor code and academic integrity expectations..."
                defaultValue="All work submitted must be your own. Collaboration is permitted on homework assignments but must be acknowledged. Plagiarism, unauthorized collaboration on exams, or use of unauthorized resources will result in disciplinary action per university policy."
                rows={5}
                className="text-base p-4"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="grade-policy" className="text-base font-semibold">Grade Appeal Process</Label>
              <Textarea
                id="grade-policy"
                placeholder="Describe your process for grade appeals..."
                defaultValue="Grade appeals must be submitted within 7 days of receiving feedback. Please reference specific rubric criteria and explain your concern in detail. I will review your submission and rubric application, and we can schedule a meeting to discuss if needed."
                rows={5}
                className="text-base p-4"
              />
            </div>
          </CardContent>
        </Card>

        {/* Risk Detection Controls */}
        <Card className="hover:bg-blue-50 transition-colors">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl">Risk Detection & Student Wellbeing</CardTitle>
            <CardDescription className="text-base mt-2">
              Configure how the AI identifies and alerts you to concerning patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-lg border border-slate-200 hover:bg-blue-50 transition-colors">
              <div className="space-y-1">
                <Label htmlFor="detect-distress" className="text-base font-semibold">Detect emotional distress</Label>
                <p className="text-slate-500 text-base">
                  Identify students showing signs of stress or anxiety in emails
                </p>
              </div>
              <Switch
                id="detect-distress"
                checked={detectDistress}
                onCheckedChange={setDetectDistress}
              />
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-lg border border-slate-200 hover:bg-blue-50 transition-colors">
              <div className="space-y-1">
                <Label htmlFor="highlight-urgent" className="text-base font-semibold">Highlight urgent emails</Label>
                <p className="text-slate-500 text-base">
                  Automatically flag emails requiring immediate attention
                </p>
              </div>
              <Switch
                id="highlight-urgent"
                checked={highlightUrgent}
                onCheckedChange={setHighlightUrgent}
              />
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-lg border border-slate-200 hover:bg-blue-50 transition-colors">
              <div className="space-y-1">
                <Label htmlFor="wellbeing-alerts" className="text-base font-semibold">Mental wellbeing alerts</Label>
                <p className="text-slate-500 text-base">
                  Suggest student support resources when concerning patterns detected
                </p>
              </div>
              <Switch
                id="wellbeing-alerts"
                checked={wellbeingAlerts}
                onCheckedChange={setWellbeingAlerts}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <p className="text-amber-800 text-base">
                <strong>Privacy Note:</strong> All detection is performed locally using AI models. 
                No student data is shared externally. Alerts are suggestions only and require your professional judgment.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card className="hover:bg-blue-50 transition-colors">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl">Outlook Integration</CardTitle>
            <CardDescription className="text-base mt-2">Manage your Microsoft Outlook connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center justify-between p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-semibold">Connected to Microsoft</h4>
                  <p className="text-green-700 text-base">dr.rivera@university.edu</p>
                </div>
              </div>
              <Button onClick={handleDisconnectMicrosoft} variant="outline" className="px-4 py-2 text-base hover:bg-blue-50">Disconnect</Button>
            </div>

            <div className="text-slate-600 text-base space-y-1">
              <p>Last sync: 5 minutes ago</p>
              <p>Emails processed: 47</p>
            </div>
          </CardContent>
        </Card>

        {/* Save & Logout Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
          <Button variant="outline" onClick={onBack} className="px-6 py-3 text-base hover:bg-blue-50">Cancel</Button>
          <Button 
            onClick={handleSaveSettings}
            className="gap-3 px-6 py-3 text-base bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="px-6 py-3 text-base text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
