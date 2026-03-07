import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

const DEMO_VIDEOS = [
  'Y-Xp-G2Z-6M', 'L-Xp-G2Z-6M', 'eY52Zsg-KVI', 'w6eK9S-6n-8', '75p-N9YKqNo',
  '5_s8m_p-j_Y', 'D0Ajq682yrA', 'uRoJ5E-x97I', 'jY-Xp-G2Z-6M', 'k-Xp-G2Z-6M'
];

export const clearDatabase = async () => {
  if (!db) return;
  console.log("Clearing existing data...");
  const collections = ['classes', 'subjects', 'materials'];
  
  for (const colName of collections) {
    const snapshot = await getDocs(collection(db, colName));
    if (snapshot.empty) continue;
    
    // Firestore batches are limited to 500 operations. 
    // Our total docs (5 classes + 20 subjects + 100 materials) = 125, so one batch is fine.
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Cleared collection: ${colName}`);
  }
};

export const seedDemoData = async (force = false) => {
  if (!db) {
    throw new Error("Firestore is not initialized. Check your Firebase config.");
  }

  if (force) {
    await clearDatabase();
  } else {
    // Check if data already exists to avoid duplicates
    const classesRef = collection(db, 'classes');
    const existingClasses = await getDocs(query(classesRef, limit(1)));
    if (!existingClasses.empty) {
      console.log("Data already exists. Skipping seed.");
      return "Already seeded.";
    }
  }

  try {
    console.log("Starting expanded seed...");

    const classNames = ['PG', 'Nursery', 'Prep', 'Grade 1', 'Grade 2'];
    const subjectNames = ['English', 'Mathematics', 'General Knowledge', 'Islamiat'];

    for (let i = 0; i < classNames.length; i++) {
      const className = classNames[i];
      console.log(`Creating Class: ${className}`);
      
      const classRef = await addDoc(collection(db, 'classes'), {
        name: className,
        order: i + 1
      });

      for (let j = 0; j < subjectNames.length; j++) {
        const subjectName = subjectNames[j];
        const subjectRef = await addDoc(collection(db, 'subjects'), {
          name: subjectName,
          classId: classRef.id,
          order: j + 1
        });

        // Create 5 materials for each subject
        for (let k = 1; k <= 5; k++) {
          let title = '';
          let description = '';
          let videoId = DEMO_VIDEOS[(i + j + k) % DEMO_VIDEOS.length];

          if (subjectName === 'English') {
            title = `${className} English Lesson ${k}: ${k === 1 ? 'Phonics' : k === 2 ? 'Alphabet' : k === 3 ? 'Reading' : k === 4 ? 'Writing' : 'Vocabulary'}`;
            description = `In this ${className} English lesson, we will explore fundamental language skills. Students will learn through interactive activities designed to improve their communication. This session focuses on building a strong foundation for future learning.`;
          } else if (subjectName === 'Mathematics') {
            title = `${className} Math Lesson ${k}: ${k === 1 ? 'Numbers' : k === 2 ? 'Shapes' : k === 3 ? 'Counting' : k === 4 ? 'Addition' : 'Subtraction'}`;
            description = `This ${className} Mathematics module introduces core numerical concepts. We use visual aids and practical examples to make math fun and accessible. Teachers will find effective strategies to engage young minds in logical thinking.`;
          } else if (subjectName === 'General Knowledge') {
            title = `${className} GK Lesson ${k}: ${k === 1 ? 'Animals' : k === 2 ? 'Plants' : k === 3 ? 'Weather' : k === 4 ? 'My Body' : 'Our World'}`;
            description = `Explore the world around us in this ${className} General Knowledge session. We cover diverse topics ranging from nature to human biology. This material is curated to spark curiosity and encourage observation in students.`;
          } else if (subjectName === 'Islamiat') {
            title = `${className} Islamiat Lesson ${k}: ${k === 1 ? 'Basic Duas' : k === 2 ? 'Pillars of Islam' : k === 3 ? 'Prophets' : k === 4 ? 'Ethics' : 'Stories'}`;
            description = `This ${className} Islamiat lesson provides an introduction to moral and spiritual values. We focus on simple concepts suitable for young learners to understand their faith. The material includes stories and basic teachings to build character.`;
          }

          await addDoc(collection(db, 'materials'), {
            title,
            subjectId: subjectRef.id,
            youtubeVideoId: videoId,
            description,
            order: k
          });
        }
      }
    }

    console.log("Expanded seed complete!");
    return "Seed successful!";
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
};
