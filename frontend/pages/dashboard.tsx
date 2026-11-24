import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import { studentsApi, projectsApi, getAssetUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Project } from '../types';
import {
  LayoutDashboard,
  PlusCircle,
  FolderCode,
  FileCheck2,
  FileEdit,
  ThumbsUp,
  Heart,
  Eye,
  Edit,
  Trash2,
  Globe,
  Lock,
  User,
  AlertTriangle,
} from 'lucide-react';

const DashboardPage: NextPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast('Please log in to access your student dashboard.', 'info');
      router.push('/login?redirect=/dashboard');
    }
  }, [authLoading, isAuthenticated, router, toast]);

  // Fetch Dashboard Stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => studentsApi.getDashboardStats(),
    enabled: !!isAuthenticated,
  });

  // Fetch My Projects
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: () => studentsApi.getDashboardProjects(),
    enabled: !!isAuthenticated,
  });

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: 'published' | 'draft' }) =>
      projectsApi.update(id, { status: nextStatus }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast(`Project is now ${updated.status}.`, 'success');
    },
    onError: (err: any) => {
      toast(err.message, 'error');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast('Project deleted successfully.', 'info');
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    },
    onError: (err: any) => {
      toast(err.message, 'error');
    },
  });

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'published') return p.status === 'published';
    if (activeTab === 'draft') return p.status === 'draft';
    return true;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-sm text-slate-500">Loading student dashboard...</div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Student Dashboard &ndash; ProjectHub</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                <LayoutDashboard className="w-4 h-4" />
                Student Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back, {user?.name.split(' ')[0]}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Manage your submitted projects, monitor student engagement, and review drafts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {user && (
                <Link
                  href={`/students/${user.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  View Public Profile
                </Link>
              )}
              <Link
                href="/submit"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Create New Project
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                <span>Total Projects</span>
                <FolderCode className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.total_projects || 0}</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                <span>Published</span>
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.published_projects || 0}</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                <span>Drafts</span>
                <FileEdit className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.draft_projects || 0}</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                <span>Total Likes</span>
                <ThumbsUp className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.total_likes || 0}</p>
            </div>
          </div>

          {/* Projects Management Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {/* Tabs Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">My Projects</h3>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All ({projects.length})
                </button>
                <button
                  onClick={() => setActiveTab('published')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeTab === 'published'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Published ({stats?.published_projects || 0})
                </button>
                <button
                  onClick={() => setActiveTab('draft')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeTab === 'draft'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Drafts ({stats?.draft_projects || 0})
                </button>
              </div>
            </div>

            {/* Project List Table */}
            {loadingProjects ? (
              <div className="p-8 space-y-4 animate-pulse">
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-sm text-slate-500">No projects found in this category.</p>
                <Link
                  href="/submit"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700"
                >
                  <PlusCircle className="w-4 h-4" /> Submit your first project
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getAssetUrl(p.image_url)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                            DOC
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/projects/${p.id}`}
                            className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-teal-600 transition-colors line-clamp-1"
                          >
                            {p.title}
                          </Link>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              p.status === 'published'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {p.short_description || p.description || 'No description.'}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                          <span>{p.category || 'Uncategorized'}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-teal-500" /> {p.likes_count}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-500" /> {p.favorites_count}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: p.id,
                            nextStatus: p.status === 'published' ? 'draft' : 'published',
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                        title={p.status === 'published' ? 'Switch to draft' : 'Publish project'}
                      >
                        {p.status === 'published' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                        <span>{p.status === 'published' ? 'Make Draft' : 'Publish'}</span>
                      </button>

                      <Link
                        href={`/projects/${p.id}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Public Page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/projects/${p.id}/edit`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Project"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => {
                          setProjectToDelete(p);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Delete Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setProjectToDelete(null);
          }}
          title="Delete Project"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <p>
                Are you sure you want to delete <strong>{projectToDelete?.title}</strong>? All engagement data and comments will be permanently erased.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => projectToDelete && deleteMutation.mutate(projectToDelete.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>

        <Footer />
      </div>
    </>
  );
};

export default DashboardPage;
