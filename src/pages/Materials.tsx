import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMaterialsBySubject, fetchSubjectById, fetchCompletedLessons } from '../services/firestore';
import { MaterialData, SubjectData } from '../types';
import { Play, ArrowLeft, Video, Clock, Info, CheckCircle2, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export const Materials: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [currentSubject, setCurrentSubject] = useState<SubjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subjectId && user?.email) {
      const loadData = async () => {
        try {
          const [materialsData, subjectData, completedData] = await Promise.all([
            fetchMaterialsBySubject(subjectId),
            fetchSubjectById(subjectId),
            fetchCompletedLessons(user.email, subjectId)
          ]);
          setMaterials(materialsData);
          setCurrentSubject(subjectData);
          setCompletedIds(completedData);
        } catch (error) {
          console.error('Error loading materials:', error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [subjectId, user?.email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progressCount = completedIds.length;
  const totalCount = materials.length;
  const progressPercentage = totalCount > 0 ? (progressCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link 
        to={-1 as any} 
        className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-600 font-medium mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Subjects</span>
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Video className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
              {currentSubject ? `${currentSubject.name} Curriculum` : 'Curriculum'}
            </h2>
          </div>
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight">
            {currentSubject ? `${currentSubject.name} Lessons` : 'Subject Lessons'}
          </h1>
          <p className="text-stone-500 mt-2 text-lg">
            Watch these curated lessons for {currentSubject?.name || 'this subject'} to enhance your teaching skills.
          </p>
        </div>

        {totalCount > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm min-w-[280px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-stone-900">Course Progress</span>
              </div>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {progressCount} / {totalCount}
              </span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
            <p className="text-xs text-stone-400 mt-3 font-medium">
              {progressPercentage === 100 ? 'Congratulations! You completed all lessons.' : 'Keep going to complete your training.'}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {materials.map((material, index) => {
          const isCompleted = completedIds.includes(material.id);
          return (
            <motion.div
              key={material.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/video/${material.id}`}
                className={`group block bg-white rounded-3xl border overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                  isCompleted ? 'border-emerald-200' : 'border-stone-200 hover:border-emerald-500'
                }`}
              >
                <div className="aspect-video bg-stone-100 relative overflow-hidden">
                  <img 
                    src={`https://img.youtube.com/vi/${material.youtubeVideoId}/maxresdefault.jpg`}
                    alt={material.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white fill-current ml-1" />
                    </div>
                  </div>
                  {isCompleted && (
                    <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Training Video</span>
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className={`text-2xl font-bold mb-6 transition-colors ${
                    isCompleted ? 'text-emerald-700' : 'text-stone-900 group-hover:text-emerald-600'
                  }`}>
                    {material.title}
                  </h3>
                  <div className={`flex items-center gap-2 font-bold ${
                    isCompleted ? 'text-emerald-500' : 'text-emerald-600'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    <span>{isCompleted ? 'Review Lesson' : 'Start Lesson'}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {materials.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
          <p className="text-stone-400 text-lg italic">No lessons found</p>
        </div>
      )}
    </div>
  );
};
