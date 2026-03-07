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
  youtubeVideoId: string;
  description: string;
  order: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}
