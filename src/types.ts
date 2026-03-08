export interface ClassData {
  id: string;
  name: string;
  order: number;
}

export interface SubjectData {
  id: string;
  classId: string;
  name: string;
  order: number;
}

export interface MaterialData {
  id: string;
  subjectId: string;
  title: string;
  youtubeVideoId?: string;
  videoUrl?: string;
  description: string;
  order: number;
}

export type UserRole = 'admin' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface UserDoc {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: UserRole;
}
