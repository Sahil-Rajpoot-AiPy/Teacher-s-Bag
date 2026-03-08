import { initializeApp, deleteApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, firebaseConfig } from './firebase';
import { ClassData, MaterialData, SubjectData, UserDoc, UserRole } from '../types';

const mapUserDoc = (snapshot: any): UserDoc => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    uid: data.uid ?? snapshot.id,
    name: data.name ?? '',
    email: data.email ?? '',
    role: (data.role ?? 'teacher') as UserRole,
  };
};

export const listUsers = async (): Promise<UserDoc[]> => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(query(usersRef, orderBy('name', 'asc')));
  return snapshot.docs.map(mapUserDoc);
};

export const createUser = async (payload: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}): Promise<UserDoc> => {
  const appName = `admin-create-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, appName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      payload.email.trim().toLowerCase(),
      payload.password
    );

    await updateProfile(cred.user, { displayName: payload.name.trim() });

    const userData: Omit<UserDoc, 'id'> = {
      uid: cred.user.uid,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      role: payload.role ?? 'teacher',
    };

    await setDoc(doc(db, 'users', cred.user.uid), userData);
    return { id: cred.user.uid, ...userData };
  } finally {
    try {
      await secondaryAuth.signOut();
    } catch {
      // ignore sign-out failures on short-lived auth instance
    }
    await deleteApp(secondaryApp);
  }
};

export const listClasses = async (): Promise<ClassData[]> => {
  const classesRef = collection(db, 'classes');
  const snapshot = await getDocs(query(classesRef, orderBy('order', 'asc')));
  return snapshot.docs.map((classDoc) => ({ id: classDoc.id, ...classDoc.data() } as ClassData));
};

export const createClass = async (payload: Omit<ClassData, 'id'>): Promise<void> => {
  await addDoc(collection(db, 'classes'), payload);
};

export const updateClass = async (id: string, payload: Omit<ClassData, 'id'>): Promise<void> => {
  await updateDoc(doc(db, 'classes', id), payload);
};

export const removeClass = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'classes', id));
};

export const listSubjects = async (): Promise<SubjectData[]> => {
  const subjectsRef = collection(db, 'subjects');
  const snapshot = await getDocs(query(subjectsRef, orderBy('order', 'asc')));
  return snapshot.docs.map((subjectDoc) => ({ id: subjectDoc.id, ...subjectDoc.data() } as SubjectData));
};

export const createSubject = async (payload: Omit<SubjectData, 'id'>): Promise<void> => {
  await addDoc(collection(db, 'subjects'), payload);
};

export const updateSubject = async (id: string, payload: Omit<SubjectData, 'id'>): Promise<void> => {
  await updateDoc(doc(db, 'subjects', id), payload);
};

export const removeSubject = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'subjects', id));
};

export const listMaterials = async (): Promise<MaterialData[]> => {
  const materialsRef = collection(db, 'materials');
  const snapshot = await getDocs(query(materialsRef, orderBy('order', 'asc')));
  return snapshot.docs.map((materialDoc) => {
    const data = materialDoc.data();
    return {
      id: materialDoc.id,
      ...data,
      videoUrl: data.videoUrl ?? '',
      youtubeVideoId: data.youtubeVideoId ?? '',
    } as MaterialData;
  });
};

export const createMaterial = async (payload: {
  title: string;
  subjectId: string;
  videoUrl: string;
  description?: string;
  order: number;
}): Promise<void> => {
  await addDoc(collection(db, 'materials'), {
    title: payload.title,
    subjectId: payload.subjectId,
    videoUrl: payload.videoUrl,
    description: payload.description ?? '',
    order: payload.order,
  });
};

export const updateMaterial = async (
  id: string,
  payload: {
    title: string;
    subjectId: string;
    videoUrl: string;
    description?: string;
    order: number;
  }
): Promise<void> => {
  await updateDoc(doc(db, 'materials', id), {
    title: payload.title,
    subjectId: payload.subjectId,
    videoUrl: payload.videoUrl,
    description: payload.description ?? '',
    order: payload.order,
  });
};

export const removeMaterial = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'materials', id));
};

export const getAdminCounts = async (): Promise<{
  users: number;
  classes: number;
  subjects: number;
  materials: number;
}> => {
  const [users, classes, subjects, materials] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'classes')),
    getDocs(collection(db, 'subjects')),
    getDocs(collection(db, 'materials')),
  ]);

  return {
    users: users.size,
    classes: classes.size,
    subjects: subjects.size,
    materials: materials.size,
  };
};
