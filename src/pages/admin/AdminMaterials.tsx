import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  createMaterial,
  listClasses,
  listMaterials,
  listSubjects,
  removeMaterial,
  updateMaterial,
} from '../../services/admin';
import { ClassData, MaterialData, SubjectData } from '../../types';
import { DataTable } from '../../components/admin/DataTable';
import { AdminModal } from '../../components/admin/AdminModal';

export const AdminMaterials: React.FC = () => {
  const [rows, setRows] = useState<MaterialData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [classFilter, setClassFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'order-asc' | 'order-desc' | 'title-asc'>('order-asc');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialData | null>(null);
  const [saving, setSaving] = useState(false);
  const [formClassId, setFormClassId] = useState<string>('all');
  const [form, setForm] = useState({
    title: '',
    subjectId: '',
    videoUrl: '',
    description: '',
    order: 1,
  });

  const subjectMap = useMemo(
    () =>
      subjects.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {}),
    [subjects]
  );

  const subjectClassMap = useMemo(
    () =>
      subjects.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.classId;
        return acc;
      }, {}),
    [subjects]
  );

  const classMap = useMemo(
    () =>
      classes.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {}),
    [classes]
  );

  const classOrderMap = useMemo(
    () =>
      classes.reduce<Record<string, number>>((acc, item) => {
        acc[item.id] = item.order ?? 0;
        return acc;
      }, {}),
    [classes]
  );

  const sortedClasses = useMemo(
    () => [...classes].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [classes]
  );

  const sortedSubjects = useMemo(
    () =>
      [...subjects].sort((a, b) => {
        const classDiff = (classOrderMap[a.classId] ?? 0) - (classOrderMap[b.classId] ?? 0);
        if (classDiff !== 0) return classDiff;
        const orderDiff = (a.order ?? 0) - (b.order ?? 0);
        if (orderDiff !== 0) return orderDiff;
        return a.name.localeCompare(b.name);
      }),
    [subjects, classOrderMap]
  );

  const uniqueSubjectFilters = useMemo(() => {
    const entries = new Map<string, string>();
    for (const subject of sortedSubjects) {
      const normalized = subject.name.trim().toLowerCase();
      if (!entries.has(normalized)) {
        entries.set(normalized, subject.name.trim());
      }
    }
    return Array.from(entries.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [sortedSubjects]);

  const load = async () => {
    try {
      const [materialsData, subjectsData, classesData] = await Promise.all([listMaterials(), listSubjects(), listClasses()]);
      setRows(materialsData);
      setSubjects(subjectsData);
      setClasses(classesData);
      if (!form.subjectId && subjectsData.length) {
        setForm((prev) => ({ ...prev, subjectId: subjectsData[0].id }));
      }
      if (!formClassId && classesData.length) {
        setFormClassId('all');
      }
    } catch (err) {
      console.error('Failed loading materials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const subjectsForForm = useMemo(() => {
    if (formClassId === 'all') return sortedSubjects;
    return sortedSubjects.filter((item) => item.classId === formClassId);
  }, [sortedSubjects, formClassId]);

  useEffect(() => {
    if (!isOpen) return;
    const exists = subjectsForForm.some((item) => item.id === form.subjectId);
    if (!exists) {
      setForm((prev) => ({ ...prev, subjectId: subjectsForForm[0]?.id || '' }));
    }
  }, [subjectsForForm, form.subjectId, isOpen]);

  const filteredRows = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const classId = subjectClassMap[row.subjectId];
      const subjectName = (subjectMap[row.subjectId] || '').trim().toLowerCase();
      const classPass = classFilter === 'all' || classId === classFilter;
      const subjectPass = subjectFilter === 'all' || subjectName === subjectFilter;
      const searchPass =
        !search ||
        row.title.toLowerCase().includes(search) ||
        (row.description || '').toLowerCase().includes(search) ||
        (subjectMap[row.subjectId] || '').toLowerCase().includes(search);
      return classPass && subjectPass && searchPass;
    });

    if (sortBy === 'order-asc') return [...filtered].sort((a, b) => a.order - b.order);
    if (sortBy === 'order-desc') return [...filtered].sort((a, b) => b.order - a.order);
    return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }, [rows, subjectClassMap, subjectMap, classFilter, subjectFilter, sortBy, searchTerm]);

  const openCreate = () => {
    setEditing(null);
    const defaultClassId = classFilter !== 'all' ? classFilter : 'all';
    const defaultSubjectId =
      defaultClassId === 'all'
        ? sortedSubjects[0]?.id || ''
        : sortedSubjects.find((item) => item.classId === defaultClassId)?.id || '';
    setFormClassId(defaultClassId);
    setForm({
      title: '',
      subjectId: defaultSubjectId,
      videoUrl: '',
      description: '',
      order: rows.length + 1,
    });
    setIsOpen(true);
  };

  const openEdit = (row: MaterialData) => {
    setEditing(row);
    setFormClassId(subjectClassMap[row.subjectId] || sortedClasses[0]?.id || '');
    setForm({
      title: row.title,
      subjectId: row.subjectId,
      videoUrl: row.videoUrl || (row.youtubeVideoId ? `https://www.youtube.com/watch?v=${row.youtubeVideoId}` : ''),
      description: row.description || '',
      order: row.order,
    });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateMaterial(editing.id, form);
      } else {
        await createMaterial(form);
      }
      setIsOpen(false);
      await load();
    } catch (err) {
      console.error('Failed saving lesson', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await removeMaterial(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      console.error('Failed deleting lesson', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-stone-900">Lessons</h2>
          <p className="text-sm text-stone-500">Manage lesson records and video links.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lesson</span>
        </button>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search lesson title/subject"
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm w-56"
            />
          </div>
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
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">Subject Filter</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjectFilters.map(([normalizedName, displayName]) => (
                <option key={normalizedName} value={normalizedName}>
                  {displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'order-asc' | 'order-desc' | 'title-asc')}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
            >
              <option value="order-asc">Order: Low to High</option>
              <option value="order-desc">Order: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-stone-600">
          Showing <span className="font-semibold text-stone-900">{filteredRows.length}</span> of {rows.length} lessons
        </p>
      </div>
      <DataTable<MaterialData>
        rows={filteredRows}
        getRowKey={(row) => row.id}
        emptyText={loading ? 'Loading lessons...' : 'No lessons found.'}
        columns={[
          { key: 'title', header: 'Lesson Title', render: (row) => <span className="font-medium text-stone-900">{row.title}</span> },
          { key: 'class', header: 'Class', render: (row) => classMap[subjectClassMap[row.subjectId]] || '-' },
          { key: 'subject', header: 'Subject', render: (row) => subjectMap[row.subjectId] || row.subjectId },
          {
            key: 'videoUrl',
            header: 'Video URL',
            render: (row) => {
              const url = row.videoUrl || (row.youtubeVideoId ? `https://www.youtube.com/watch?v=${row.youtubeVideoId}` : '');
              return (
                <a href={url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline break-all">
                  {url || '-'}
                </a>
              );
            },
          },
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
        <AdminModal title={editing ? 'Edit Lesson' : 'Add Lesson'} onClose={() => setIsOpen(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Lesson Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Class</label>
              <select
                value={formClassId}
                onChange={(e) => setFormClassId(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2"
              >
                <option value="all">All Classes</option>
                {sortedClasses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Subject</label>
              <select
                value={form.subjectId}
                onChange={(e) => setForm((prev) => ({ ...prev, subjectId: e.target.value }))}
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2"
              >
                {subjectsForForm.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {classMap[item.classId] || 'Unknown Class'}
                  </option>
                ))}
              </select>
              {subjectsForForm.length === 0 && (
                <p className="text-xs text-amber-700">
                  No subjects found for selected class. Create a subject first.
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Video URL</label>
              <input
                value={form.videoUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
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
                disabled={saving || !form.subjectId}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white px-4 py-2 text-sm font-semibold"
              >
                {saving ? 'Saving...' : editing ? 'Update Lesson' : 'Create Lesson'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
};
