import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchMaterialById, toggleLessonCompletion, fetchCompletedLessons } from '../services/firestore';
import { MaterialData } from '../types';
import { ArrowLeft, Share2, Bookmark, Info, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { extractYouTubeVideoId } from '../utils/youtube';

export const VideoView: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<MaterialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [completed, setCompleted] = useState(false);

  const videoId = extractYouTubeVideoId(material?.youtubeVideoId || material?.videoUrl);

  useEffect(() => {
    if (materialId && user?.uid) {
      const loadData = async () => {
        try {
          const [materialResult, completedResult] = await Promise.allSettled([
            fetchMaterialById(materialId),
            fetchCompletedLessons(user.uid, undefined, user.email),
          ]);

          if (materialResult.status === 'fulfilled') {
            setMaterial(materialResult.value);
          }

          if (completedResult.status === 'fulfilled') {
            setCompleted(completedResult.value.includes(materialId));
          } else {
            setCompleted(false);
          }
        } catch (error) {
          console.error('Error loading material:', error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [materialId, user?.uid, user?.email]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleCompleted = async () => {
    if (!materialId || !user?.uid || !material) return;
    const newState = !completed;
    setCompleted(newState);
    try {
      await toggleLessonCompletion(user.uid, materialId, material.subjectId, newState, user.email);
    } catch (error) {
      console.error('Error toggling completion:', error);
      setCompleted(!newState); // Rollback
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">Lesson Not Found</h2>
        <Link to="/portal" className="text-emerald-600 font-bold hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-600 font-medium mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Lessons</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden shadow-2xl shadow-stone-200/50"
      >
        <div className="aspect-video bg-black relative">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={material.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="p-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-emerald-600 font-bold mb-3">
                <PlayCircle className="w-5 h-5" />
                <span className="uppercase tracking-widest text-xs">Now Playing</span>
              </div>
              <h1 className="text-4xl font-bold text-stone-900 tracking-tight leading-tight">
                {material.title}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={toggleCompleted}
                className={`p-3 rounded-xl transition-all border flex items-center gap-2 ${
                  completed 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100' 
                    : 'bg-stone-50 text-stone-600 border-stone-100 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${completed ? 'fill-current' : ''}`} />
                <span className="text-sm font-bold hidden sm:inline">
                  {completed ? 'Completed' : 'Mark as Done'}
                </span>
              </button>
              <button 
                type="button"
                onClick={handleShare}
                aria-label="Copy lesson link"
                className="p-3 bg-stone-50 text-stone-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-stone-100"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[70] flex items-center gap-3"
              >
                <div className="bg-emerald-500 p-1 rounded-full">
                  <Share2 className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium">Link copied to clipboard!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-stone-900 font-bold mb-4">
                <Info className="w-5 h-5 text-emerald-500" />
                <h3>About this Lesson</h3>
              </div>
              <div className="prose prose-stone max-w-none">
                <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-wrap">
                  {material.description}
                </p>
              </div>
            </div>

            <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100 h-fit">
              <h4 className="font-bold text-stone-900 mb-4">Lesson Notes</h4>
              <ul className="space-y-4 text-sm text-stone-600">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Watch the full video to understand the core concepts.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Take notes on key teaching methodologies discussed.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Try to implement these strategies in your next class session.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
