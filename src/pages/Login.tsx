import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { motion } from 'framer-motion';
import { fetchUserProfile } from '../services/firestore';
import { resolveUserRole } from '../utils/roles';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !isFirebaseConfigured) {
      setError('Firebase is not configured. Add the required values to .env.local and restart the app.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      let profile = null;
      try {
        profile = await fetchUserProfile(cred.user.uid, cred.user.email);
      } catch (profileErr: any) {
        // If profile read is blocked by rules, default to teacher portal.
        if (profileErr?.code !== 'permission-denied') {
          throw profileErr;
        }
      }

      const role = resolveUserRole(profile);
      const destination = role === 'admin' ? '/admin' : '/portal';
      if (from && from !== '/' && from.startsWith(destination)) {
        navigate(from, { replace: true });
      } else {
        navigate(destination, { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const code = err?.code || 'auth/unknown';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Unable to sign in right now. Please try again or contact your administrator.');
      }
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
                  autoComplete="email"
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
                  autoComplete="current-password"
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
              Contact your administrator if you need access or forgot your password.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
