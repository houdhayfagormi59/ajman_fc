export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch { return dateStr; }
}

/** Used by player detail page */
export function ageFromDOB(dob: string | null | undefined): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function calculateAge(dob: string): number { return ageFromDOB(dob); }

/** Used by player detail page */
export function passAccuracy(completed: number, attempted: number): string {
  if (!attempted || attempted === 0) return '0';
  return ((completed / attempted) * 100).toFixed(0);
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
}

export function rpeLabel(rpe: number): string {
  if (rpe <= 2) return 'Very Light';
  if (rpe <= 4) return 'Light';
  if (rpe <= 6) return 'Moderate';
  if (rpe <= 8) return 'Hard';
  return 'Maximal';
}
