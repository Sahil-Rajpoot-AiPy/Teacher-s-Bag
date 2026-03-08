import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { createUser, listUsers } from '../../services/admin';
import { UserDoc } from '../../types';
import { DataTable } from '../../components/admin/DataTable';
import { AdminModal } from '../../components/admin/AdminModal';

export const AdminUsers: React.FC = () => {
  const [rows, setRows] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const load = async () => {
    try {
      setRows(await listUsers());
    } catch (err) {
      console.error('Failed loading users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createUser(form);
      setIsOpen(false);
      setForm({ name: '', email: '', password: '' });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Unable to create user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-stone-900">Users</h2>
          <p className="text-sm text-stone-500">Manage admin and teacher accounts.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      <DataTable<UserDoc>
        rows={rows}
        getRowKey={(row) => row.uid}
        emptyText={loading ? 'Loading users...' : 'No users found.'}
        columns={[
          {
            key: 'name',
            header: 'Name',
            render: (row) => <span className="font-medium text-stone-900">{row.name || '-'}</span>,
          },
          { key: 'email', header: 'Email', render: (row) => row.email },
          {
            key: 'role',
            header: 'Role',
            render: (row) => row.role || 'teacher',
          },
        ]}
      />

      {isOpen && (
        <AdminModal title="Create User" onClose={() => setIsOpen(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Password</label>
              <input
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2"
              />
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
              New users are created with role: <span className="font-semibold text-stone-900">teacher</span>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white px-4 py-2 text-sm font-semibold"
              >
                {saving ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
};
