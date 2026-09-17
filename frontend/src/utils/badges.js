export function attendanceBadgeClass(status) {
  switch (status) {
    case 'Present': return 'badge badge-present';
    case 'Absent': return 'badge badge-absent';
    case 'Half-day': return 'badge badge-half';
    case 'Leave': return 'badge badge-pending';
    default: return 'badge';
  }
}

export function leaveBadgeClass(status) {
  switch (status) {
    case 'Approved': return 'badge badge-approved';
    case 'Rejected': return 'badge badge-rejected';
    case 'Pending': return 'badge badge-pending';
    default: return 'badge';
  }
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
