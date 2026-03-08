import React, { useEffect, useState } from 'react';
import { getAdminCounts } from '../../services/admin';
import { Users, Layers, BookOpen, Library } from 'lucide-react';

const cards = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'classes', label: 'Classes', icon: Layers },
  { key: 'subjects', label: 'Subjects', icon: BookOpen },
  { key: 'materials', label: 'Lessons', icon: Library },
] as const;

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    users: 0,
    classes: 0,
    subjects: 0,
    materials: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminCounts();
        setCounts(data);
      } catch (error) {
        console.error('Failed loading admin dashboard counts', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-stone-900">Dashboard</h2>
        <p className="text-sm text-stone-500 mt-1">System overview across users and learning content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.key} className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-stone-500">{card.label}</p>
              <card.icon className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-semibold text-stone-900">
              {loading ? <span className="text-lg text-stone-400">...</span> : counts[card.key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
