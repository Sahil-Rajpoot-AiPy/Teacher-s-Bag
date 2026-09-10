import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchClasses } from '../services/firestore';
import { ClassData } from '../types';
import { BookOpen, ChevronRight, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoadError } from '../components/LoadError';

export const Dashboard: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadClasses = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const data = await fetchClasses();
        setClasses(data);
      } catch (error) {
        console.error('Error loading classes:', error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <LayoutGrid className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Training Portal</h2>
        </div>
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight">Select Your Class</h1>
        <p className="text-stone-500 mt-2 text-lg">Choose a class to view available training subjects.</p>
      </div>

      {loadError && <LoadError onRetry={loadClasses} />}

      {!loadError && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {classes.map((cls, index) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={`/portal/class/${cls.id}`}
              className="group block bg-white p-8 rounded-3xl border border-stone-200 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-stone-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <BookOpen className="w-7 h-7 text-stone-400 group-hover:text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                    Official Curriculum
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">{cls.name}</h3>
                <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                  Explore specialized training resources and curriculum modules designed for {cls.name}.
                </p>
                
                <div className="flex items-center text-emerald-600 font-bold gap-1 group-hover:gap-2 transition-all">
                  <span>View Subjects</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      )}

      {classes.length === 0 && !loading && !loadError && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
          <p className="text-stone-400 text-lg italic">
            No classes found in the database.
          </p>
        </div>
      )}
    </div>
  );
};
