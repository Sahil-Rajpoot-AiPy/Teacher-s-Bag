import { UserDoc } from '../types';

const parseAdminEmails = (): string[] => {
  const raw = import.meta.env.VITE_ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((item: string) => item.trim().toLowerCase())
    .filter(Boolean);
};

export const isAdminByEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return parseAdminEmails().includes(email.toLowerCase());
};

export const resolveUserRole = (profile: UserDoc | null, email?: string | null): 'admin' | 'teacher' => {
  if (profile?.role === 'admin') return 'admin';
  if (isAdminByEmail(email)) return 'admin';
  return 'teacher';
};
