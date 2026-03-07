import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { ClassData, SubjectData, MaterialData } from '../types';

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
  const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaterialData));
  return materials.sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const fetchMaterialById = async (materialId: string): Promise<MaterialData | null> => {
  const materialRef = doc(db, 'materials', materialId);
  const snapshot = await getDoc(materialRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as MaterialData;
  }
  return null;
};

export const fetchSchoolProfile = async (email: string): Promise<{ schoolName: string } | null> => {
  const docRef = doc(db, 'users', email.toLowerCase());
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return snapshot.data() as { schoolName: string };
  }
  return null;
};

export const toggleLessonCompletion = async (email: string, materialId: string, subjectId: string, completed: boolean) => {
  const docRef = doc(db, 'users', email.toLowerCase(), 'completions', materialId);
  if (completed) {
    await setDoc(docRef, {
      completed: true,
      completedAt: new Date().toISOString(),
      subjectId
    });
  } else {
    await deleteDoc(docRef);
  }
};

export const fetchCompletedLessons = async (email: string, subjectId?: string): Promise<string[]> => {
  const completionsRef = collection(db, 'users', email.toLowerCase(), 'completions');
  let q = query(completionsRef);
  
  if (subjectId) {
    q = query(completionsRef, where('subjectId', '==', subjectId));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.id);
};
