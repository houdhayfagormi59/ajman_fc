export const STAFF_ROLE_CATEGORIES: { category: string; emoji: string; color: string; bg: string; roles: string[] }[] = [
  {
    category: 'Coaching Staff', emoji: '🎽', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20',
    roles: ['Head Coach','Manager','Assistant Coach','First Team Coach','Tactical Coach','Offensive Coach','Defensive Coach','Set Piece Coach','Goalkeeper Coach','Individual Development Coach','Technical Coach','Youth Coach'],
  },
  {
    category: 'Performance & Fitness', emoji: '💪', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    roles: ['Fitness Coach','Strength and Conditioning Coach','Performance Coach','Sports Scientist','Nutritionist','Conditioning Specialist'],
  },
  {
    category: 'Medical Staff', emoji: '🏥', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20',
    roles: ['Team Doctor','Physiotherapist','Rehabilitation Specialist','Massage Therapist','Injury Prevention Specialist','Medical Coordinator'],
  },
  {
    category: 'Analysis & Data', emoji: '📊', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20',
    roles: ['Performance Analyst','Match Analyst','Video Analyst','Opposition Analyst','Data Analyst','Data Scientist'],
  },
  {
    category: 'Scouting & Recruitment', emoji: '🔍', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20',
    roles: ['Chief Scout','Talent Scout','Opposition Scout','Recruitment Analyst','Head of Recruitment'],
  },
  {
    category: 'Club Management', emoji: '🏢', color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800/50',
    roles: ['Sporting Director','Technical Director','Director of Football','General Manager','Chief Executive Officer','Club President'],
  },
  {
    category: 'Support Staff', emoji: '🛠', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    roles: ['Kit Manager','Equipment Manager','Team Coordinator','Logistics Manager','Operations Manager','Security Staff'],
  },
  {
    category: 'Youth Academy', emoji: '🌱', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20',
    roles: ['Academy Director','Head of Youth Development','Youth Coach','Development Officer'],
  },
  {
    category: 'Elite / Modern Roles', emoji: '🤖', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    roles: ['Sports Psychologist','Mental Coach','Sleep Specialist','Set Piece Analyst','AI Performance Engineer','Data Engineer'],
  },
];

export const ALL_ROLES = STAFF_ROLE_CATEGORIES.flatMap(c => c.roles);

export function getRoleCategory(role: string): { category: string; emoji: string; color: string; bg: string } | null {
  return STAFF_ROLE_CATEGORIES.find(c => c.roles.includes(role)) ?? null;
}

export function getRoleBadgeColor(role: string): string {
  const cat = getRoleCategory(role);
  if (!cat) return 'pill-slate';
  if (cat.category === 'Coaching Staff') return 'pill-orange';
  if (cat.category === 'Medical Staff') return 'pill-red';
  if (cat.category === 'Performance & Fitness') return 'pill-green';
  if (cat.category === 'Analysis & Data') return 'pill-blue';
  if (cat.category === 'Scouting & Recruitment') return 'pill-blue';
  if (cat.category === 'Club Management') return 'pill-slate';
  if (cat.category === 'Youth Academy') return 'pill-green';
  if (cat.category === 'Elite / Modern Roles') return 'pill-blue';
  return 'pill-slate';
}
