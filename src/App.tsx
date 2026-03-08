import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OrientationOverlay } from './components/OrientationOverlay';
import { Navbar } from './components/Navbar';
import { isFirebaseConfigured } from './services/firebase';
import { AlertCircle, Settings } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { AdminRoute } from './routes/AdminRoute';

const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Subjects = lazy(() => import('./pages/Subjects').then((m) => ({ default: m.Subjects })));
const Materials = lazy(() => import('./pages/Materials').then((m) => ({ default: m.Materials })));
const VideoView = lazy(() => import('./pages/VideoView').then((m) => ({ default: m.VideoView })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then((m) => ({ default: m.AdminUsers })));
const AdminClasses = lazy(() => import('./pages/admin/AdminClasses').then((m) => ({ default: m.AdminClasses })));
const AdminSubjects = lazy(() => import('./pages/admin/AdminSubjects').then((m) => ({ default: m.AdminSubjects })));
const AdminMaterials = lazy(() => import('./pages/admin/AdminMaterials').then((m) => ({ default: m.AdminMaterials })));

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
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

const AppRoutes = () => {
  const { user, loading, profile } = useAuth();
  const role = profile?.role || 'teacher';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-emerald-100 selection:text-emerald-900">
      <OrientationOverlay />
      <Navbar />
      <main className="relative z-10">
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/class/:classId"
              element={
                <ProtectedRoute>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/subject/:subjectId"
              element={
                <ProtectedRoute>
                  <Materials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/video/:materialId"
              element={
                <ProtectedRoute>
                  <VideoView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="classes" element={<AdminClasses />} />
              <Route path="subjects" element={<AdminSubjects />} />
              <Route path="materials" element={<AdminMaterials />} />
            </Route>

            <Route
              path="/"
              element={
                user ? <Navigate to={role === 'admin' ? '/admin' : '/portal'} replace /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="*"
              element={<Navigate to={user ? (role === 'admin' ? '/admin' : '/portal') : '/login'} replace />}
            />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] bg-stone-50">
    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);
