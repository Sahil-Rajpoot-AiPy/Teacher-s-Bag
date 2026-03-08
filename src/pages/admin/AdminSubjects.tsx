import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { createSubject, listClasses, listSubjects, removeSubject, updateSubject } from '../../services/admin';
import { ClassData, SubjectData } from '../../types';
import { DataTable } from '../../components/admin/DataTable';
import { AdminModal } from '../../components/admin/AdminModal';

export const AdminSubjects: React.FC = () => {
  const [rows, setRows] = useState<SubjectData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [classFilter, setClassFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'order-asc' | 'order-desc' | 'name-asc'>('order-asc');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectData | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', classId: '', order: 1 });

  const classMap = useMemo(
    () =>
      classes.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {}),
    [classes]
  );

  const load = async () => {
    try {
      const [subjectsData, classesData] = await Promise.all([listSubjects(), listClasses()]);
      setRows(subjectsData);
      setClasses(classesData);
      if (!form.classId && classesData.length) {
        setForm((prev) => ({ ...prev, classId: classesData[0].id }));
      }
    } catch (err) {
      console.error('Failed loading subjects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    const filtered = rows.filter((row) => (classFilter === 'all' ? true : row.classId === classFilter));
    if (sortBy === 'order-asc') return [...filtered].sort((a, b) => a.order - b.order);
    if (sortBy === 'order-desc') return [...filtered].sort((a, b) => b.order - a.order);
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [rows, classFilter, sortBy]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      classId: classFilter !== 'all' ? classFilter : classes[0]?.id || '',
      order: rows.length + 1,
    });
    setIsOpen(true);
  };

  const openEdit = (row: SubjectData) => {
    setEditing(row);
    setForm({ name: row.name, classId: row.classId, order: row.order });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateSubject(editing.id, form);
      } else {
        await createSubject(form);
      }
      setIsOpen(false);
      await load();
    } catch (err) {
      console.error('Failed saving subject', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await removeSubject(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      console.error('Failed deleting subject', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-stone-900">Subjects</h2>
          <p className="text-sm text-stone-500">Manage subjects and assign them to classes.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">Class Filter</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All Classes</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'order-asc' | 'order-desc' | 'name-asc')}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
            >
              <option value="order-asc">Order: Low to High</option>
              <option value="order-desc">Order: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-stone-600">
          Showing <span className="font-semibold text-stone-900">{filteredRows.length}</span> of {rows.length} subjects
        </p>
      </div>
      <DataTable<SubjectData>
        rows={filteredRows}
        getRowKey={(row) => row.id}
        emptyText={loading ? 'Loading subjects...' : 'No subjects found.'}
        columns={[
          { key: 'name', header: 'Subject Name', render: (row) => <span className="font-medium text-stone-900">{row.name}</span> },
          { key: 'class', header: 'Class', render: (row) => classMap[row.classId] || row.classId },
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
        <AdminModal title={editing ? 'Edit Subject' : 'Add Subject'} onClose={() => setIsOpen(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Subject Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Class</label>
              <select
                value={form.classId}
                onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value }))}
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2"
              >
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
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
                {saving ? 'Saving...' : editing ? 'Update Subject' : 'Create Subject'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
};
