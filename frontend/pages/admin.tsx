import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import { adminApi, categoriesApi, projectsApi, getAssetUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Project, User, ProjectReport, Category } from '../types';
import {
  ShieldAlert,
  Users,
  FolderCode,
  Flag,
  Tag,
  Eye,
  EyeOff,
  Sparkles,
  Trash2,
  CheckCircle2,
  XCircle,
  PlusCircle,
  AlertTriangle,
  Lock,
} from 'lucide-react';

const AdminDashboardPage: NextPage = () => {
  const router = useRouter();
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'users' | 'reports' | 'categories'>('overview');

  // Category creation state
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Auth & Role Guard
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast('Please log in as an administrator.', 'error');
        router.push('/login?redirect=/admin');
      } else if (!isAdmin) {
        toast('Administrative privileges required.', 'error');
        router.push('/');
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, router, toast]);

  // Fetch Admin Stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    enabled: !!isAdmin,
  });

  // Fetch All Projects
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => adminApi.getAllProjects(),
    enabled: !!isAdmin,
  });

  // Fetch All Users
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getAllUsers(),
    enabled: !!isAdmin,
  });

  // Fetch Reports
  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => adminApi.getReports(),
    enabled: !!isAdmin,
  });

  // Fetch Categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesApi.list(),
    enabled: !!isAdmin,
  });

  // Moderate Project Mutation
  const moderateProjectMutation = useMutation({
    mutationFn: ({ id, is_hidden, is_featured }: { id: number; is_hidden?: boolean; is_featured?: boolean }) =>
      adminApi.moderateProject(id, { is_hidden, is_featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast('Project status updated.', 'success');
    },
    onError: (err: any) => {
      toast(err.message, 'error');
    },
  });

  // Toggle User Active Mutation
  const toggleUserMutation = useMutation({
    mutationFn: ({ id, is_active, role }: { id: number; is_active?: boolean; role?: string }) =>
      adminApi.updateUserStatus(id, { is_active, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast('User updated.', 'success');
    },
    onError: (err: any) => {
      toast(err.message, 'error');
    },
  });

  // Update Report Status Mutation
  const reportMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'reviewed' | 'dismissed' }) =>
      adminApi.updateReportStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast('Report updated.', 'success');
    },
    onError: (err: any) => {
      toast(err.message, 'error');
    },
  });

  // Create Category Mutation
  const createCatMutation = useMutation({
    mutationFn: (payload: { name: string; slug: string; description?: string }) =>
      adminApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setNewCatName('');
      setNewCatSlug('');
      setNewCatDesc('');
      toast('Category created.', 'success');
    },
    onError: (err: any) => {
      toast(err.message, 'error');
    },
  });

  // Delete Category Mutation
  const deleteCatMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast('Category removed.', 'info');
    },
    onError: (err: any) => {
      toast(err.message, 'error');
    },
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) return;
    createCatMutation.mutate({
      name: newCatName.trim(),
      slug: newCatSlug.trim().toLowerCase(),
      description: newCatDesc.trim() || undefined,
    });
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-sm text-slate-500">Authenticating administrator...</div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Administration & Moderation &ndash; ProjectHub</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
          {/* Admin Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                Moderation Panel
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                ProjectHub Administration
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Manage platform users, moderate flagged projects, review submitted reports, and manage categories.
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Overview Stats
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <FolderCode className="w-4 h-4" />
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'reports'
                  ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Flag className="w-4 h-4" />
              Report Queue ({reports.filter((r) => r.status === 'pending').length} Pending)
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'categories'
                  ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Tag className="w-4 h-4" />
              Categories ({categories.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Total Users</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.total_users || 0}</p>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Total Projects</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.total_projects || 0}</p>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Published</span>
                  <p className="text-2xl font-extrabold text-emerald-600">{stats?.published_projects || 0}</p>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Pending Reports</span>
                  <p className="text-2xl font-extrabold text-rose-600">{stats?.pending_reports || 0}</p>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Categories</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.total_categories || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALL PROJECTS */}
          {activeTab === 'projects' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Catalog Moderation</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((p) => (
                  <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/projects/${p.id}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-teal-600">
                          {p.title}
                        </Link>
                        {p.is_hidden && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                            Hidden
                          </span>
                        )}
                        {p.is_featured && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                            Featured
                          </span>
                        )}
                        <span className="text-slate-400 capitalize">({p.status})</span>
                      </div>
                      <p className="text-slate-500 line-clamp-1">{p.short_description || p.description}</p>
                      <span className="text-slate-400">Owner ID: {p.user_id} &bull; Created: {new Date(p.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          moderateProjectMutation.mutate({ id: p.id, is_featured: !p.is_featured })
                        }
                        className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 ${
                          p.is_featured
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {p.is_featured ? 'Unfeature' : 'Feature'}
                      </button>

                      <button
                        onClick={() =>
                          moderateProjectMutation.mutate({ id: p.id, is_hidden: !p.is_hidden })
                        }
                        className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 ${
                          p.is_hidden
                            ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {p.is_hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {p.is_hidden ? 'Restore' : 'Hide'}
                      </button>

                      <Link
                        href={`/projects/${p.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REPORTS */}
          {activeTab === 'reports' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">User Moderation Queue</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-400">No reports found in the queue.</p>
                ) : (
                  reports.map((r) => (
                    <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            Project: {r.project_title || `Project #${r.project_id}`}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.status === 'pending'
                                ? 'bg-rose-100 text-rose-700'
                                : r.status === 'reviewed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{r.reason}</p>
                        <span className="text-slate-400">Reported by: {r.reporter_name || 'Anonymous'} &bull; {new Date(r.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => reportMutation.mutate({ id: r.id, status: 'reviewed' })}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Mark Reviewed
                            </button>
                            <button
                              onClick={() => reportMutation.mutate({ id: r.id, status: 'dismissed' })}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                        <Link
                          href={`/projects/${r.project_id}`}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                        >
                          View Project
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: USERS */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Registered Accounts</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{u.name}</span>
                        <span className="text-slate-500">({u.email})</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300">
                          {u.role}
                        </span>
                        {!u.is_active && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                            Deactivated
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400">Joined: {new Date(u.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {u.id !== user?.id && (
                        <button
                          onClick={() => toggleUserMutation.mutate({ id: u.id, is_active: !u.is_active })}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                            u.is_active
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                      <Link
                        href={`/students/${u.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                      >
                        Public Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Add category form */}
              <form onSubmit={handleCreateCategory} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Add New Category</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Category Name (e.g. Quantum Computing)"
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }}
                    className="p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    placeholder="URL Slug (e.g. quantum-computing)"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Brief Description"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={createCatMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create Category
                  </button>
                </div>
              </form>

              {/* Categories list */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                {categories.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{c.name}</span>
                      <span className="text-slate-400 ml-2 font-mono">({c.slug})</span>
                      <p className="text-slate-500 mt-0.5">{c.description || 'No description'}</p>
                    </div>
                    <button
                      onClick={() => deleteCatMutation.mutate(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-2"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminDashboardPage;
