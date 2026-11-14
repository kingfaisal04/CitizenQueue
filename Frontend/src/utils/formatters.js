/**
 * CitizenQueue - Formatting & Display Utilities
 * 
 * Provides consistent formatting for dates, times, file sizes,
 * telephone numbers, and status badges.
 */

/**
 * Format ISO date string into readable English date
 * e.g., "Monday, 16 November 2026" or "16 Nov 2026"
 */
export function formatDate(dateString, format = 'medium') {
  if (!dateString) return 'Not set';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    if (format === 'short') {
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }

    if (format === 'long') {
      return d.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    // Default 'medium'
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Format 24hr or 12hr time string
 */
export function formatTime(timeString) {
  if (!timeString) return '';
  return timeString;
}

/**
 * Format bytes into readable KB/MB string
 */
export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format Ghanaian phone number with readable spacing
 */
export function formatGhanaPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  if (digits.length === 12 && digits.startsWith('233')) {
    return `+233 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return phone;
}

/**
 * Truncate long strings with ellipsis
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Return human-readable label and color classes for document/item review statuses
 */
export function getStatusDisplay(status) {
  switch (status) {
    case 'accepted':
    case 'verified':
    case 'completed':
      return {
        label: 'Approved',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotClass: 'bg-emerald-500'
      };
    case 'submitted':
    case 'under_review':
    case 'awaiting_review':
    case 'pending':
      return {
        label: 'Under Review',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-500'
      };
    case 'changes_required':
    case 'action_required':
      return {
        label: 'Action Required',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        dotClass: 'bg-rose-500'
      };
    case 'not_submitted':
    case 'missing':
    default:
      return {
        label: 'Not Submitted',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        dotClass: 'bg-slate-400'
      };
  }
}

