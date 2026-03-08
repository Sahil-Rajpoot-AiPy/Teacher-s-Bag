import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { createClass, listClasses, removeClass, updateClass } from '../../services/admin';
import { ClassData } from '../../types';
import { DataTable } from '../../components/admin/DataTable';
import { AdminModal } from '../../components/admin/AdminModal';

export const AdminClasses: React.FC = () => {
  const [rows, setRows] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<ClassData | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', order: 1 });

  const load = async () => {
    try {
      setRows(await listClasses());
    } catch (err) {
      console.error('Failed loading classes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', order: rows.length + 1 });
    setIsOpen(true);
  };

  const openEdit = (row: ClassData) => {
    setEditing(row);
    setForm({ name: row.name, order: row.order });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateClass(editing.id, form);
      } else {
        await createClass(form);
      }
      setIsOpen(false);
      await load();
    } catch (err) {
      console.error('Failed saving class', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this class?')) return;
    try {
      await removeClass(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      console.error('Failed deleting class', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-stone-900">Classes</h2>
          <p className="text-sm text-stone-500">Manage class names and ordering.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class</span>
        </button>
      </div>

      <DataTable<ClassData>
        rows={rows}
        getRowKey={(row) => row.id}
        emptyText={loading ? 'Loading classes...' : 'No classes found.'}
        columns={[
          { key: 'name', header: 'Class Name', render: (row) => <span className="font-medium text-stone-900">{row.name}</span> },
          { key: 'order', header: 'Order', render: (row) => row.order },
          {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
              <div className="flex items-center gap-3">
                <button onClick={() => openEdit(row)} className="inline-flex items-center gap-1 text-stone-700 hover:text-stone-900">
                  <Pencil className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button onClick={() => handleDelete(row.id)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            ),
          },
        ]}
      />

      {isOpen && (
        <AdminModal title={editing ? 'Edit Class' : 'Add Class'} onClose={() => setIsOpen(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Class Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Order</label>
              <input
                type="number"
                min={1}
                value={form.order}
                onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2"
              />
            </div>
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
                {saving ? 'Saving...' : editing ? 'Update Class' : 'Create Class'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
};
