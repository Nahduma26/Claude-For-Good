import { Email } from '../components/EmailCard';

export const mockEmails: Email[] = [
  {
    id: '1',
    studentName: 'Sarah Chen',
    subject: 'Question about Final Project Requirements',
    summary: 'Student is asking for clarification on the project scope and deliverables for the final assignment.',
    priority: 4,
    category: 'clarification',
    emotion: 'anxious',
    timestamp: '5 minutes ago',
    unread: true
  },
  {
    id: '2', 
    studentName: 'Marcus Johnson',
    subject: 'Grade Appeal Request',
    summary: 'Student is requesting a grade review for their midterm exam, citing calculation errors.',
    priority: 3,
    category: 'grades',
    emotion: 'frustrated',
    timestamp: '1 hour ago',
    unread: true
  },
  {
    id: '3',
    studentName: 'Emma Rodriguez', 
    subject: 'Lab Report Submission Issue',
    summary: 'Student had technical difficulties submitting their lab report and is requesting an extension.',
    priority: 2,
    category: 'extension',
    emotion: 'confused',
    timestamp: '2 hours ago',
    unread: false
  },
  {
    id: '4',
    studentName: 'David Kim',
    subject: 'Office Hours Scheduling',
    summary: 'Student would like to schedule a meeting to discuss research opportunities.',
    priority: 2,
    category: 'logistics',
    emotion: 'neutral',
    timestamp: '3 hours ago',
    unread: false
  },
  {
    id: '5',
    studentName: 'Lisa Thompson',
    subject: 'Course Material Access',
    summary: 'Student is unable to access some course materials on the learning management system.',
    priority: 3,
    category: 'logistics',
    emotion: 'confused',
    timestamp: '4 hours ago',
    unread: false
  },
  {
    id: '6',
    studentName: 'Alex Martinez',
    subject: 'Research Paper Topic Approval',
    summary: 'Student is requesting approval for their chosen research paper topic and methodology.',
    priority: 2,
    category: 'clarification',
    emotion: 'neutral',
    timestamp: '5 hours ago',
    unread: false
  },
  {
    id: '7',
    studentName: 'Jessica Wu',
    subject: 'Absence Notification',
    summary: 'Student notifying about medical absence and requesting makeup assignments.',
    priority: 3,
    category: 'extension',
    emotion: 'calm',
    timestamp: '1 day ago',
    unread: false
  },
  {
    id: '8',
    studentName: 'Robert Anderson',
    subject: 'Group Project Concerns',
    summary: 'Student expressing concerns about team dynamics and unequal work distribution.',
    priority: 4,
    category: 'urgent',
    emotion: 'frustrated',
    timestamp: '1 day ago',
    unread: false
  },
  {
    id: '9',
    studentName: 'Michelle Davis',
    subject: 'Academic Integrity Concern',
    summary: 'Student reporting suspected plagiarism in group assignment submission.',
    priority: 5,
    category: 'honor',
    emotion: 'anxious',
    timestamp: '2 days ago',
    unread: false
  }
];

export const emailCategories = [
  { id: 'all', name: 'All Emails', count: mockEmails.length },
  { id: 'clarification', name: 'Clarification Questions', count: mockEmails.filter(e => e.category === 'clarification').length },
  { id: 'extension', name: 'Extension Requests', count: mockEmails.filter(e => e.category === 'extension').length },
  { id: 'logistics', name: 'Logistics', count: mockEmails.filter(e => e.category === 'logistics').length },
  { id: 'grades', name: 'Grade Disputes', count: mockEmails.filter(e => e.category === 'grades').length },
  { id: 'urgent', name: 'Urgent / Emergency', count: mockEmails.filter(e => e.category === 'urgent').length },
  { id: 'honor', name: 'Honor Code Concerns', count: mockEmails.filter(e => e.category === 'honor').length }
];
