import React, { useState, useEffect } from 'react';
import {
  FolderPlus,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  Sparkles,
  Layers,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminCatalogApi, type CategoryItem } from '../../api/adminCatalog.api';
import { DynamicMetaKeyValueBuilder, type KeyValuePair } from './DynamicMetaKeyValueBuilder';
import { AdminPagination } from '../AdminPagination';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [parent, setParent] = useState<number | ''>('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [status, setStatus] = useState<'active' | 'hidden'>('active');
  const [seoTitle, setSeoTitle] = useState<string>('');
  const [seoDescription, setSeoDescription] = useState<string>('');
  const [metaPairs, setMetaPairs] = useState<KeyValuePair[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await adminCatalogApi.getCategoriesDetailed();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories from API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setParent('');
    setSortOrder(0);
    setStatus('active');
    setSeoTitle('');
    setSeoDescription('');
    setMetaPairs([
      { id: '1', key: 'show_on_homepage', value: 'true' },
      { id: '2', key: 'banner_subtitle', value: 'High quality medicines' },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setParent(cat.parent || '');
    setSortOrder(cat.sort_order || 0);
    setStatus((cat.status as 'active' | 'hidden') || 'active');

    const meta = cat.metadata || {};
    setSeoTitle(meta.seo_title || '');
    setSeoDescription(meta.seo_description || '');

    const pairs: KeyValuePair[] = [];
    Object.entries(meta).forEach(([k, v]) => {
      if (k !== 'seo_title' && k !== 'seo_description') {
        pairs.push({
          id: Math.random().toString(36).substr(2, 9),
          key: k,
          value: typeof v === 'object' ? JSON.stringify(v) : String(v),
        });
      }
    });
    setMetaPairs(pairs);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const metadata: Record<string, any> = {
        show_on_homepage: true,
        seo_title: seoTitle || name,
        seo_description: seoDescription,
      };

      metaPairs.forEach((p) => {
        if (p.key.trim()) {
          metadata[p.key.trim()] = p.value.trim();
        }
      });

      const payload = {
        name,
        parent: parent === '' ? null : Number(parent),
        sort_order: sortOrder,
        status,
        metadata,
      };

      if (editingCategory) {
        await adminCatalogApi.updateCategory(editingCategory.id, payload);
        toast.success(`Category "${name}" updated successfully!`);
      } else {
        await adminCatalogApi.createCategory(payload);
        toast.success(`Category "${name}" created successfully!`);
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch {
      toast.error('Failed to save category via API');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminCatalogApi.deleteCategory(id);
      toast.success('Category deleted successfully!');
      setDeleteConfirmId(null);
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-bg-card border border-bg-border shadow-card">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-primary-500/15 text-primary-400 border border-primary-500/30">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-head font-bold text-xl text-content-primary">
              Category & Hierarchy Management
            </h2>
            <p className="text-xs text-content-muted">
              Organize main categories & sub-categories with SEO meta fields
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCategories}
            className="p-2.5 rounded-xl bg-bg-surface hover:bg-bg-hover text-content-secondary border border-bg-border transition-colors"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-glow transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Category</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-content-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-card border border-bg-border text-content-primary text-xs outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs font-mono text-content-muted">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-bg-card border border-bg-border text-content-primary text-xs font-medium outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active Only</option>
            <option value="hidden">Hidden Only</option>
          </select>
        </div>
      </div>

      {/* Category Table */}
      <div className="rounded-3xl bg-bg-card border border-bg-border overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto" />
            <p className="text-xs text-content-muted">Loading categories from API...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderPlus className="w-10 h-10 text-content-muted mx-auto opacity-40" />
            <p className="text-sm font-bold text-content-secondary">No Categories Found</p>
            <p className="text-xs text-content-muted">Click &quot;Create New Category&quot; to add one</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-content-secondary">
                <thead className="bg-bg-surface text-content-muted font-mono uppercase text-[10px] border-b border-bg-border">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">ID</th>
                    <th className="py-3.5 px-4 font-bold">Category Name</th>
                    <th className="py-3.5 px-4 font-bold">Parent & Type</th>
                    <th className="py-3.5 px-4 font-bold">Sort Order</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border">
                  {paginatedCategories.map((cat) => {
                    const isSub = !!cat.parent;
                    const parentName = cat.parent
                      ? categories.find((c) => c.id === cat.parent)?.name || `ID #${cat.parent}`
                      : 'None (Top-Level)';

                    return (
                      <tr key={cat.id} className="hover:bg-bg-hover/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-content-muted">
                          #{cat.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-head font-bold text-content-primary text-sm flex items-center space-x-2">
                            <span>{cat.name}</span>
                            {cat.children && cat.children.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-primary-500/15 text-primary-400 font-mono text-[9px]">
                                {cat.children.length} subs
                              </span>
                            )}
                          </div>
                          {cat.slug && (
                            <div className="text-[10px] font-mono text-content-muted">{cat.slug}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            <Layers className="w-3.5 h-3.5 text-primary-400" />
                            <span className={isSub ? 'text-amber-400 font-medium' : 'text-content-primary font-bold'}>
                              {parentName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-content-primary">
                          {cat.sort_order ?? 0}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center space-x-1 ${
                              cat.status === 'active'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-bg-surface text-content-muted border border-bg-border'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cat.status === 'active' ? 'bg-emerald-400' : 'bg-content-muted'
                              }`}
                            />
                            <span className="capitalize">{cat.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(cat)}
                              className="p-1.5 rounded-lg bg-bg-surface hover:bg-primary-500/20 text-primary-400 border border-bg-border transition-colors"
                              title="Edit Category"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(cat.id)}
                              className="p-1.5 rounded-lg bg-bg-surface hover:bg-rose-500/20 text-rose-400 border border-bg-border transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCategories.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-bg-card border border-bg-border rounded-3xl p-6 shadow-glow space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-bg-border pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-primary-500/15 text-primary-400 border border-primary-500/30">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-head font-bold text-lg text-content-primary">
                    {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Category'}
                  </h3>
                  <p className="text-xs text-content-muted">
                    Configure multi-level hierarchy & SEO metadata form fields
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-content-muted hover:text-content-primary hover:bg-bg-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-content-muted mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Antibiotics & Anti-infectives"
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-surface border border-bg-border text-content-primary text-xs font-medium outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-content-muted mb-1.5">
                    Parent Category (Optional for Sub-category)
                  </label>
                  <select
                    value={parent}
                    onChange={(e) => setParent(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-surface border border-bg-border text-content-primary text-xs font-medium outline-none focus:border-primary-500"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {categories
                      .filter((c) => !editingCategory || c.id !== editingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-content-muted mb-1.5">
                    Sort Order Priority
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-surface border border-bg-border text-content-primary text-xs font-mono font-bold outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-content-muted mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'hidden')}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-surface border border-bg-border text-content-primary text-xs font-medium outline-none focus:border-primary-500"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="hidden">Hidden (Draft)</option>
                  </select>
                </div>
              </div>

              {/* SEO Box */}
              <div className="p-4 rounded-2xl bg-bg-surface border border-bg-border space-y-3">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-content-muted uppercase">
                  <Sparkles className="w-4 h-4 text-accent-400" />
                  <span>SEO Title & Description (`metadata`)</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-content-muted mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="e.g. Buy Prescription Antibiotics Online in Bangladesh"
                      className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-bg-border text-content-primary text-xs outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-content-muted mb-1">SEO Description</label>
                    <textarea
                      rows={2}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Meta description for search engines..."
                      className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-bg-border text-content-primary text-xs outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC META FORM BUILDER */}
              <DynamicMetaKeyValueBuilder
                title="Dynamic Metadata Form Builder"
                description="Fill up extra category attributes like a form"
                pairs={metaPairs}
                onChange={setMetaPairs}
                presetSuggestions={[
                  'show_on_homepage',
                  'banner_subtitle',
                  'discount_tag',
                  'icon_name',
                ]}
              />

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-bg-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-bg-surface hover:bg-bg-hover border border-bg-border text-content-secondary font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-xs shadow-glow transition-all flex items-center space-x-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-bg-card border border-rose-500/40 rounded-3xl p-6 shadow-glow space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-head font-bold text-lg text-content-primary">Delete Category</h3>
            <p className="text-xs text-content-muted">
              Are you sure you want to delete category #{deleteConfirmId}? This communicates directly with DRF API.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2 rounded-xl bg-bg-surface hover:bg-bg-hover border border-bg-border text-content-secondary text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-glow transition-all"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
