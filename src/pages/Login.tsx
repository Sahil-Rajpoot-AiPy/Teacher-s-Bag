import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { motion } from 'framer-motion';
import { seedDemoData } from '../services/seed';
import { Database } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSeed = async (force = false) => {
    setSeeding(true);
    setSeedMessage('');
    try {
      const result = await seedDemoData(force);
      setSeedMessage(result);
    } catch (err: any) {
      setSeedMessage('Error seeding data. Check console.');
    } finally {
      setSeeding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !isFirebaseConfigured) {
      setError('Firebase is not configured. Please set your API keys in the Secrets panel.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-8 border border-stone-100">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-200 mb-6">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Teacher's Bag</h1>
            <p className="text-stone-500 mt-2">Sign in to access training materials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="teacher@school.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-stone-100 text-center space-y-4">
            <p className="text-stone-400 text-sm">
              Contact administrator if you forgot your credentials.
            </p>
            
            <div className="pt-4 flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleSeed(false)}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 text-[10px] font-bold text-stone-400 hover:text-emerald-600 transition-colors uppercase tracking-widest"
                >
                  <Database className="w-3 h-3" />
                  <span>Seed Data</span>
                </button>
                
                <button
                  onClick={() => handleSeed(true)}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 text-[10px] font-bold text-stone-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                  title="Clears existing classes/subjects/materials and re-seeds"
                >
                  <Database className="w-3 h-3" />
                  <span>Clear & Seed</span>
                </button>
              </div>

              {seeding && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Processing...</span>
                </div>
              )}

              {seedMessage && (
                <p className={`text-[10px] font-bold uppercase tracking-tighter ${
                  seedMessage.includes('Error') ? 'text-red-400' : 'text-emerald-500'
                }`}>
                  {seedMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
