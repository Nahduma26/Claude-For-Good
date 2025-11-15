import { HelpCircle, Clock, MapPin, AlertTriangle, AlertCircle, ShieldAlert, Inbox } from 'lucide-react';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const config = {
    clarification: {
      label: 'Clarification',
      icon: HelpCircle,
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
    extension: {
      label: 'Extension',
      icon: Clock,
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    logistics: {
      label: 'Logistics',
      icon: MapPin,
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    grades: {
      label: 'Grade Dispute',
      icon: AlertTriangle,
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
    urgent: {
      label: 'Urgent',
      icon: AlertCircle,
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    honor: {
      label: 'Honor Code',
      icon: ShieldAlert,
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    all: {
      label: 'General',
      icon: Inbox,
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
    },
  };

  const cfg = config[category as keyof typeof config] || config.all;
  const Icon = cfg.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 gap-1' : 'px-3 py-1 gap-1.5';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <Icon className={iconSize} />
      <span>{cfg.label}</span>
    </span>
  );
}
