/**
 * CitizenQueue - Status Badge Component
 * 
 * Renders consistent, accessible visual tags for appointment lifecycle states.
 */

import React from 'react';
import {
  Calendar,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const STATUS_CONFIGS = {
  booked: {
    label: 'Confirmed Booking',
    shortLabel: 'Confirmed',
    bgColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Calendar,
    dotColor: 'bg-blue-500'
  },
  checked_in: {
    label: 'Checked In',
    shortLabel: 'Checked In',
    bgColor: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: UserCheck,
    dotColor: 'bg-amber-500'
  },
  in_progress: {
    label: 'At Verification Desk',
    shortLabel: 'In Progress',
    bgColor: 'bg-teal-50 text-teal-800 border-teal-200',
    icon: Clock,
    dotColor: 'bg-teal-600'
  },
  completed: {
    label: 'Completed',
    shortLabel: 'Completed',
    bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
    dotColor: 'bg-emerald-600'
  },
  cancelled: {
    label: 'Cancelled',
    shortLabel: 'Cancelled',
    bgColor: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: XCircle,
    dotColor: 'bg-slate-400'
  },
  no_show: {
    label: 'Did Not Attend',
    shortLabel: 'No Show',
    bgColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertTriangle,
    dotColor: 'bg-rose-500'
  }
};

export default function StatusBadge({ status, showIcon = true, size = 'md' }) {
  const config = STATUS_CONFIGS[status] || {
    label: status || 'Unknown',
    shortLabel: status || 'Unknown',
    bgColor: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
    dotColor: 'bg-slate-400'
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium'
  }[size] || 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bgColor} ${sizeClasses}`}
    >
      {showIcon && <Icon size={size === 'lg' ? 15 : 13} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
}
