import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { projectsApi, categoriesApi, uploadApi, getAssetUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Upload,
  X,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

const SubmitProjectPage: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect guests to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast('Please sign in to submit a project.', 'info');
      router.push('/login?redirect=/submit');
    }
  }, [authLoading, isAuthenticated, router, toast]);

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSubmitting]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast('Image exceeds maximum allowed size of 5MB.', 'error');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setIsDirty(true);
    setIsUploading(true);

    try {
      const res = await uploadApi.uploadImage(file);
      setImageUrl(res.url);
      toast('Cover image uploaded successfully.', 'success');
    } catch (err: any) {
      toast(err.message || 'Image upload failed.', 'error');
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageUrl('');
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast('Project title is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await projectsApi.create({
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

      setIsDirty(false);
      toast('Project submitted successfully!', 'success');
      router.push(`/projects/${created.id}`);
    } catch (err: any) {
      toast(err.message || 'Failed to submit project.', 'error');
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-sm text-slate-500">Checking credentials...</div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Submit Your Project &ndash; ProjectHub</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar />

        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              <PlusCircle className="w-4 h-4" />
              Creator Submission
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Submit Your Student Project
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Share your project details, architecture, repository, and live demo with students and faculty.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="e.g. Distributed Task Scheduler with Raft Consensus"
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
                onChange={(e) => {
                  setShortDescription(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Brief summary that appears in project cards (1-2 sentences)"
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
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setIsDirty(true);
                  }}
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
                  onChange={(e) => {
                    setTechnology(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Next.js, FastAPI, Docker, PostgreSQL"
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
                  onChange={(e) => {
                    setProblemStatement(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="What specific engineering or user problem does this project address?"
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
                  onChange={(e) => {
                    setProposedSolution(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="How did you solve this problem? Explain your system design, algorithms, or framework choices."
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
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Full walkthrough: installation instructions, key features, performance benchmarks, and lessons learned..."
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
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="https://github.com/username/project"
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
                  onChange={(e) => {
                    setDemoUrl(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="https://myproject.demo.com"
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Cover Image (Max 5MB: JPG, PNG, WebP)
              </label>

              {imagePreview || imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-48 w-full sm:w-80 bg-slate-100 dark:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview || getAssetUrl(imageUrl)}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-teal-500 dark:hover:border-teal-400 cursor-pointer bg-slate-50 dark:bg-slate-800/50 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isUploading ? 'Uploading image...' : 'Click to upload project cover image'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WebP up to 5MB</span>
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

            {/* Publication Status */}
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
                  Publish Immediately
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  Save as Draft
                </label>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Project...' : status === 'published' ? 'Publish Project' : 'Save Draft'}
                </button>
              </div>
            </div>
          </form>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SubmitProjectPage;
