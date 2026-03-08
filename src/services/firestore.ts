import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit,
  orderBy, 
  doc, 
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { ClassData, SubjectData, MaterialData, UserDoc } from '../types';

export const fetchClasses = async (): Promise<ClassData[]> => {
  const classesRef = collection(db, 'classes');
  const q = query(classesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassData));
};

export const fetchClassById = async (classId: string): Promise<ClassData | null> => {
  const classRef = doc(db, 'classes', classId);
  const snapshot = await getDoc(classRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as ClassData;
  }
  return null;
};

export const fetchSubjectById = async (subjectId: string): Promise<SubjectData | null> => {
  const subjectRef = doc(db, 'subjects', subjectId);
  const snapshot = await getDoc(subjectRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as SubjectData;
  }
  return null;
};

export const fetchSubjectsByClass = async (classId: string): Promise<SubjectData[]> => {
  const subjectsRef = collection(db, 'subjects');
  const q = query(
    subjectsRef, 
    where('classId', '==', classId)
  );
  const snapshot = await getDocs(q);
  const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubjectData));
  return subjects.sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const fetchMaterialsBySubject = async (subjectId: string): Promise<MaterialData[]> => {
  const materialsRef = collection(db, 'materials');
  const q = query(
    materialsRef, 
    where('subjectId', '==', subjectId)
  );
  const snapshot = await getDocs(q);
  const materials = snapshot.docs.map((materialDoc) => {
    const data = materialDoc.data();
    return {
      id: materialDoc.id,
      ...data,
      youtubeVideoId: data.youtubeVideoId ?? extractVideoId(data.videoUrl),
    } as MaterialData;
  });
  return materials.sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const fetchMaterialById = async (materialId: string): Promise<MaterialData | null> => {
  const materialRef = doc(db, 'materials', materialId);
  const snapshot = await getDoc(materialRef);
  if (snapshot.exists()) {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      youtubeVideoId: data.youtubeVideoId ?? extractVideoId(data.videoUrl),
    } as MaterialData;
  }
  return null;
};

export const fetchUserProfile = async (uid: string, email?: string | null): Promise<UserDoc | null> => {
  try {
    const byUidRef = doc(db, 'users', uid);
    const byUidSnap = await getDoc(byUidRef);
    if (byUidSnap.exists()) {
      return normalizeUserDoc(byUidSnap.id, byUidSnap.data(), uid, email);
    }
  } catch (error: any) {
    // Continue to legacy email-id lookup if uid lookup is blocked by rules.
    if (error?.code !== 'permission-denied') {
      throw error;
    }
  }

  // Backward compatibility for projects where email was used as users doc id.
  if (email) {
    const emailCandidates = email.toLowerCase() === email ? [email] : [email, email.toLowerCase()];

    try {
      for (const emailCandidate of emailCandidates) {
        const byEmailRef = doc(db, 'users', emailCandidate);
        const byEmailSnap = await getDoc(byEmailRef);
        if (byEmailSnap.exists()) {
          return normalizeUserDoc(byEmailSnap.id, byEmailSnap.data(), uid, email);
        }
      }
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
        throw error;
      }
    }
  }

  // Additional compatibility for users docs with auto-id and uid/email fields.
  try {
    const usersRef = collection(db, 'users');
    const byUidQuery = query(usersRef, where('uid', '==', uid), limit(1));
    const byUidSnap = await getDocs(byUidQuery);
    if (!byUidSnap.empty) {
      const profileDoc = byUidSnap.docs[0];
      return normalizeUserDoc(profileDoc.id, profileDoc.data(), uid, email);
    }
  } catch (error: any) {
    if (error?.code !== 'permission-denied') {
      throw error;
    }
  }

  if (email) {
    const emailCandidates = email.toLowerCase() === email ? [email] : [email, email.toLowerCase()];
    try {
      const usersRef = collection(db, 'users');
      for (const emailCandidate of emailCandidates) {
        const byEmailQuery = query(usersRef, where('email', '==', emailCandidate), limit(1));
        const byEmailSnap = await getDocs(byEmailQuery);
        if (!byEmailSnap.empty) {
          const profileDoc = byEmailSnap.docs[0];
          return normalizeUserDoc(profileDoc.id, profileDoc.data(), uid, email);
        }
      }
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
        throw error;
      }
    }
  }

  return null;
};

export const toggleLessonCompletion = async (
  userId: string,
  materialId: string,
  subjectId: string,
  completed: boolean,
  email?: string | null
) => {
  const refs = buildCompletionDocRefs(userId, materialId, email);
  let lastError: any = null;

  if (!completed) {
    let deletedAny = false;
    for (const completionRef of refs) {
      try {
        await deleteDoc(completionRef);
        deletedAny = true;
      } catch (error: any) {
        lastError = error;
        if (error?.code !== 'permission-denied' && error?.code !== 'not-found') {
          throw error;
        }
      }
    }
    if (!deletedAny && lastError?.code === 'permission-denied') {
      throw lastError;
    }
    return;
  }

  for (const completionRef of refs) {
    try {
      await setDoc(completionRef, {
        completed: true,
        completedAt: new Date().toISOString(),
        subjectId,
      });
      return;
    } catch (error: any) {
      lastError = error;
      if (error?.code !== 'permission-denied') {
        throw error;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
};

export const fetchCompletedLessons = async (
  userId: string,
  subjectId?: string,
  email?: string | null
): Promise<string[]> => {
  const refs = buildCompletionCollectionRefs(userId, email);
  const completionIds = new Set<string>();
  let readableSourceCount = 0;
  let lastError: any = null;

  for (const completionsRef of refs) {
    try {
      let q = query(completionsRef);
      if (subjectId) {
        q = query(completionsRef, where('subjectId', '==', subjectId));
      }
      const snapshot = await getDocs(q);
      readableSourceCount += 1;
      snapshot.docs.forEach((completionDoc) => {
        completionIds.add(completionDoc.id);
      });
    } catch (error: any) {
      lastError = error;
      if (error?.code !== 'permission-denied') {
        throw error;
      }
    }
  }

  if (readableSourceCount === 0 && lastError?.code === 'permission-denied') {
    throw lastError;
  }

  return Array.from(completionIds);
};

const extractVideoId = (videoUrl?: string): string => {
  if (!videoUrl) return '';
  if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
    return videoUrl;
  }

  try {
    if (videoUrl.includes('youtu.be/')) {
      return videoUrl.split('youtu.be/')[1]?.split(/[?&]/)[0] || '';
    }

    const parsed = new URL(videoUrl);
    return parsed.searchParams.get('v') || '';
  } catch {
    return '';
  }
};

const normalizeUserDoc = (
  id: string,
  data: Record<string, any>,
  uid: string,
  email?: string | null
): UserDoc => {
  const rawRole = String(data.role ?? data.userRole ?? 'teacher').trim().toLowerCase();
  return {
    id,
    uid: data.uid ?? uid,
    name: data.name ?? data.schoolName ?? '',
    email: data.email ?? (email ? email.toLowerCase() : ''),
    role: rawRole === 'admin' ? 'admin' : 'teacher',
  };
};

const buildCompletionDocRefs = (uid: string, materialId: string, email?: string | null) => {
  const pathIds = new Set<string>([uid]);

  if (email) {
    pathIds.add(email);
    pathIds.add(email.toLowerCase());
  }

  return Array.from(pathIds).map((pathId) => doc(db, 'users', pathId, 'completions', materialId));
};

const buildCompletionCollectionRefs = (uid: string, email?: string | null) => {
  const pathIds = new Set<string>([uid]);

  if (email) {
    pathIds.add(email);
    pathIds.add(email.toLowerCase());
  }

  return Array.from(pathIds).map((pathId) => collection(db, 'users', pathId, 'completions'));
};
