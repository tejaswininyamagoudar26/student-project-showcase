import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Modal from '../../../components/Modal';
import { projectsApi, categoriesApi, uploadApi, getAssetUrl } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  Upload,
  X,
  Trash2,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

const EditProjectPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const projectId = typeof id === 'string' ? parseInt(id, 10) : NaN;

  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Fetch Existing Project Details
  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project-edit', projectId],
    queryFn: () => projectsApi.getById(projectId),
    enabled: !isNaN(projectId),
  });

  // Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  // Form State
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [category, setCategory] = useState('');
  const [technology, setTechnology] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pre-fill form when project loads
  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setShortDescription(project.short_description || '');
      setDescription(project.description || '');
      setProblemStatement(project.problem_statement || '');
      setProposedSolution(project.proposed_solution || '');
      setCategory(project.category || '');
      setTechnology(project.technology || '');
      setGithubUrl(project.github_url || '');
      setDemoUrl(project.demo_url || '');
      setImageUrl(project.image_url || '');
      setStatus(project.status || 'published');
    }
  }, [project]);

  // Authorization Guard
  useEffect(() => {
    if (!authLoading && !loadingProject && project && user) {
      const isOwner = user.id === project.user_id;
      if (!isOwner && !isAdmin) {
        toast('You do not have permission to edit this project.', 'error');
        router.push(`/projects/${projectId}`);
      }
    }
  }, [authLoading, loadingProject, project, user, isAdmin, projectId, router, toast]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast('Image exceeds maximum allowed size of 5MB.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      setImageUrl(res.url);
      toast('Image uploaded successfully.', 'success');
    } catch (err: any) {
      toast(err.message || 'Image upload failed.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast('Project title is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await projectsApi.update(projectId, {
        title: title.trim(),
        short_description: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        problem_statement: problemStatement.trim() || undefined,
        proposed_solution: proposedSolution.trim() || undefined,
        category: category || undefined,
        technology: technology.trim() || undefined,
        github_url: githubUrl.trim() || undefined,
        demo_url: demoUrl.trim() || undefined,
        image_url: imageUrl || undefined,
        status,
      });

      toast('Project updated successfully!', 'success');
      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      toast(err.message || 'Failed to update project.', 'error');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await projectsApi.delete(projectId);
      toast('Project deleted successfully.', 'info');
      router.push('/dashboard');
    } catch (err: any) {
      toast(err.message || 'Failed to delete project.', 'error');
      setIsDeleting(false);
    }
  };

  if (loadingProject || authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-sm text-slate-500">Loading project details...</div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Project &ndash; {project?.title || 'ProjectHub'}</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar />

        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/projects/${projectId}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Project
              </Link>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Edit Project
              </h1>
            </div>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Project
            </button>
          </div>

          <form onSubmit={handleUpdate} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Project Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={255}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Tagline / Short Summary
                </label>
                <span className="text-slate-400">{shortDescription.length}/500</span>
              </div>
              <input
                type="text"
                maxLength={500}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Category and Tech Stack */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="">Select a discipline</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Technologies Used
                </label>
                <input
                  type="text"
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  placeholder="e.g. Next.js, FastAPI, Docker"
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Problem Statement & Proposed Solution */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Problem Statement
                </label>
                <textarea
                  rows={3}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Proposed Solution & Technical Approach
                </label>
                <textarea
                  rows={3}
                  value={proposedSolution}
                  onChange={(e) => setProposedSolution(e.target.value)}
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Full Project Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Full Project Documentation
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Cover Image Upload / Current */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Cover Image
              </label>

              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-48 w-full sm:w-80 bg-slate-100 dark:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAssetUrl(imageUrl)}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-teal-500 cursor-pointer bg-slate-50 dark:bg-slate-800/50 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isUploading ? 'Uploading image...' : 'Click to upload replacement cover image'}
                  </span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>

            {/* Status */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'published'}
                    onChange={() => setStatus('published')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  Published
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  Draft (Private)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/projects/${projectId}`)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </main>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Project"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <p>
                Are you sure you want to permanently delete <strong>{project?.title}</strong>? This action cannot be undone. All associated likes, favorites, and comments will be deleted.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Keep Project
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>

        <Footer />
      </div>
    </>
  );
};

export default EditProjectPage;
