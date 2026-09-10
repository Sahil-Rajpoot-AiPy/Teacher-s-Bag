import { UserDoc } from '../types';

export const resolveUserRole = (profile: UserDoc | null): 'admin' | 'teacher' =>
  profile?.role === 'admin' ? 'admin' : 'teacher';
