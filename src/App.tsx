import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OrientationOverlay } from './components/OrientationOverlay';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Subjects } from './pages/Subjects';
import { Materials } from './pages/Materials';
import { VideoView } from './pages/VideoView';
import { isFirebaseConfigured } from './services/firebase';
import { AlertCircle, Settings } from 'lucide-react';

const ConfigError = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-stone-100 text-center">
      <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Settings className="w-8 h-8 text-amber-600 animate-spin-slow" />
      </div>
      <h1 className="text-2xl font-bold text-stone-900 mb-4">Configuration Required</h1>
      <p className="text-stone-500 mb-8 leading-relaxed">
        Firebase is not yet configured. Please add your Firebase API keys to the <strong>Secrets</strong> panel in AI Studio to get started.
      </p>
      <div className="bg-stone-50 p-4 rounded-xl flex items-start gap-3 text-left border border-stone-100">
        <AlertCircle className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-stone-500">
          Required keys: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, etc.
        </p>
      </div>
    </div>
  </div>
);

export default function App() {
  if (!isFirebaseConfigured) {
    return <ConfigError />;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-stone-50 selection:bg-emerald-100 selection:text-emerald-900">
          <OrientationOverlay />
          <Navbar />
          <main className="relative z-10">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/class/:classId" element={
                <ProtectedRoute>
                  <Subjects />
                </ProtectedRoute>
              } />
              
              <Route path="/subject/:subjectId" element={
                <ProtectedRoute>
                  <Materials />
                </ProtectedRoute>
              } />
              
              <Route path="/video/:materialId" element={
                <ProtectedRoute>
                  <VideoView />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
