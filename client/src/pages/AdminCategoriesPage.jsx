import React, { useState, useEffect } from 'react';
import { categoriesApi } from '../api/categories';
import { Modal } from '../components/Modal';
import {
  FolderTree,
  PlusCircle,
  CheckCircle,
  XCircle,
  Tag,
  AlertCircle,
  Edit2,
  Trash2,
} from 'lucide-react';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'Wrench' });
  const [modalError, setModalError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getCategories(true); // all = true
      setCategories(res.categories || []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: 'Wrench' });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'Wrench',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Category name is required.');
      return;
    }

    setActionLoading(true);
    setModalError('');
    try {
      if (editingCategory) {
        await categoriesApi.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          icon: formData.icon,
        });
      } else {
        await categoriesApi.createCategory({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          icon: formData.icon,
        });
      }
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err) {
      setModalError(err.message || 'Failed to save category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (cat) => {
    const nextState = !cat.isActive;
    try {
      await categoriesApi.updateCategory(cat.id, { isActive: nextState });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: nextState } : c))
      );
    } catch (err) {
      alert(err.message || 'Failed to update category status');
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? If existing issues reference it, deletion will be blocked.`)) {
      return;
    }
    try {
      await categoriesApi.deleteCategory(cat.id);
      await fetchCategories();
    } catch (err) {
      alert(err.message || 'Cannot delete category');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Category Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure campus maintenance service domains and issue classifications
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className={`p-5 rounded-2xl border bg-slate-900/80 flex flex-col justify-between transition ${
                c.isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-white">{c.name}</h3>
                  </div>

                  {c.isActive ? (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      Deactivated
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {c.description || 'No description provided.'}
                </p>

                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                  <strong className="text-slate-400">{c._count?.issues || 0}</strong> issues
                  associated
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 mt-4 text-xs">
                <button
                  onClick={() => handleToggleActive(c)}
                  className={`font-semibold hover:underline ${
                    c.isActive ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {c.isActive ? 'Deactivate' : 'Reactivate'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(c)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Elevators & Lifts"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of issues covered under this category..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md disabled:opacity-50"
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
