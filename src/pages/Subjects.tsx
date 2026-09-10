import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSubjectsByClass, fetchClassById } from '../services/firestore';
import { SubjectData, ClassData } from '../types';
import { Book, ChevronRight, ArrowLeft, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoadError } from '../components/LoadError';

export const Subjects: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [currentClass, setCurrentClass] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadData = async () => {
    if (classId) {
        setLoading(true);
        setLoadError(false);
        try {
          const [subjectsResult, classResult] = await Promise.allSettled([
            fetchSubjectsByClass(classId),
            fetchClassById(classId),
          ]);

          if (subjectsResult.status === 'fulfilled') {
            setSubjects(subjectsResult.value);
          }

          if (classResult.status === 'fulfilled') {
            setCurrentClass(classResult.value);
          }
          if (subjectsResult.status === 'rejected' && classResult.status === 'rejected') {
            setLoadError(true);
          }
        } catch (error) {
          console.error('Error loading subjects:', error);
          setLoadError(true);
        } finally {
          setLoading(false);
        }
    }
  };

  useEffect(() => {
      loadData();
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link 
        to="/portal" 
        className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-600 font-medium mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Classes</span>
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Layers className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
            {currentClass ? `${currentClass.name} Curriculum` : 'Curriculum'}
          </h2>
        </div>
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight">
          {currentClass ? `${currentClass.name} Subjects` : 'Available Subjects'}
        </h1>
        <p className="text-stone-500 mt-2 text-lg">
          Select a subject to explore lessons and training videos for {currentClass?.name || 'this class'}.
        </p>
      </div>

      {loadError && <LoadError onRetry={loadData} />}

      {!loadError && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={`/portal/subject/${subject.id}`}
              className="group flex items-center justify-between bg-white p-6 rounded-2xl border border-stone-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="bg-stone-50 p-3 rounded-xl group-hover:bg-emerald-500 transition-colors">
                  <Book className="w-6 h-6 text-stone-400 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800 group-hover:text-emerald-600 transition-colors">{subject.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Training Modules</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
        ))}
      </div>}

      {subjects.length === 0 && !loading && !loadError && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
          <p className="text-stone-400 text-lg italic">No subjects found</p>
        </div>
      )}
    </div>
  );
};
