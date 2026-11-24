import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';
import ProjectCard from '../../components/ProjectCard';
import { GithubIcon } from '../../components/Icons';
import { projectsApi, commentsApi, getAssetUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  ExternalLink,
  ThumbsUp,
  Heart,
  MessageSquare,
  Calendar,
  Layers,
  Cpu,
  User,
  ShieldAlert,
  Send,
  Trash2,
  Share2,
  Sparkles,
  AlertCircle,
  Flag,
} from 'lucide-react';

const ProjectDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const projectId = typeof id === 'string' ? parseInt(id, 10) : NaN;

  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [imgError, setImgError] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Fetch Project Details
  const {
    data: project,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['project-detail', projectId],
    queryFn: () => projectsApi.getById(projectId),
    enabled: !isNaN(projectId),
  });

  // Fetch Comments
  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['project-comments', projectId],
    queryFn: () => commentsApi.list(projectId),
    enabled: !isNaN(projectId),
  });

  // Fetch Related Projects
  const { data: relatedData } = useQuery({
    queryKey: ['related-projects', project?.category],
    queryFn: () =>
      projectsApi.list({
        category: project?.category || undefined,
        page_size: 3,
      }),
    enabled: !!project?.category,
  });

  const relatedProjects = (relatedData?.projects || []).filter((p) => p.id !== projectId).slice(0, 3);

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: () => (project?.is_liked ? projectsApi.unlike(projectId) : projectsApi.like(projectId)),
    onSuccess: (data) => {
      queryClient.setQueryData(['project-detail', projectId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_liked: data.is_liked,
          likes_count: data.likes_count,
        };
      });
    },
    onError: (err: any) => {
      toast(err.message, 'error');
    },
  });

  // Favorite Mutation
  const favoriteMutation = useMutation({
    mutationFn: () => (project?.is_favorited ? projectsApi.unfavorite(projectId) : projectsApi.favorite(projectId)),
    onSuccess: (data) => {
      queryClient.setQueryData(['project-detail', projectId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_favorited: data.is_favorited,
          favorites_count: data.favorites_count,
        };
      });
      toast(data.is_favorited ? 'Added to favorites' : 'Removed from favorites', 'success');
    },
    onError: (err: any) => {
      toast(err.message, 'error');
    },
  });

  // Add Comment Mutation
  const commentMutation = useMutation({
    mutationFn: (text: string) => commentsApi.create(projectId, text),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['project-comments', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-detail', projectId] });
      toast('Comment posted successfully!', 'success');
    },
    onError: (err: any) => {
      toast(err.message, 'error');
    },
  });

  // Delete Comment Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => commentsApi.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-comments', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-detail', projectId] });
      toast('Comment deleted.', 'info');
    },
    onError: (err: any) => {
      toast(err.message, 'error');
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Please sign in to join the discussion.', 'info');
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Please sign in to report a project.', 'info');
      return;
    }
    if (!reportReason.trim()) return;
    setIsSubmittingReport(true);
    try {
      await projectsApi.report(projectId, reportReason);
      toast('Report submitted for moderation review.', 'success');
      setReportModalOpen(false);
      setReportReason('');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast('Project link copied to clipboard!', 'success');
    }
  };

  // Safe external URL helper
  const sanitizeUrl = (url?: string | null) => {
    if (!url) return null;
    let clean = url.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = `https://${clean}`;
    }
    return clean;
  };

  const githubUrl = sanitizeUrl(project?.github_url);
  const demoUrl = sanitizeUrl(project?.demo_url);

  // Parse technologies
  const techList = project?.technology
    ? project.technology
        .split(/[,|]/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  // Parse screenshots
  let screenshotsList: string[] = [];
  if (project?.screenshots) {
    try {
      screenshotsList = JSON.parse(project.screenshots);
    } catch {
      screenshotsList = project.screenshots.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  const isOwner = user && project && user.id === project.user_id;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full space-y-6 animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Not Found</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
            {(error as Error)?.message || 'The requested project does not exist, has been removed, or is currently private.'}
          </p>
          <Link
            href="/projects"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-medium text-sm hover:bg-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects Directory
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = !imgError && project.image_url ? getAssetUrl(project.image_url) : null;

  return (
    <>
      <Head>
        <title>{project.title} &ndash; ProjectHub</title>
        <meta
          name="description"
          content={project.short_description || project.description || `Explore ${project.title} on ProjectHub`}
        />
        <meta property="og:title" content={`${project.title} - ProjectHub`} />
        <meta property="og:description" content={project.short_description || ''} />
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar />

        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
          {/* Breadcrumbs & Back link */}
          <div className="flex items-center justify-between">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Link>

            {/* Owner Edit Action */}
            {(isOwner || isAdmin) && (
              <Link
                href={`/projects/${project.id}/edit`}
                className="text-xs px-3 py-1.5 rounded-lg border border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 font-medium transition-colors"
              >
                Edit Project
              </Link>
            )}
          </div>

          {/* Project Title & Key Metadata */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {project.category && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {project.category}
                </span>
              )}
              {project.is_featured && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              )}
              <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                <Calendar className="w-3.5 h-3.5" />
                Published {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {project.title}
            </h1>

            {project.short_description && (
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {project.short_description}
              </p>
            )}
          </div>

          {/* Cover Image */}
          <div className="w-full h-72 sm:h-96 rounded-2xl bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-sm">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={project.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-850 p-6 text-center">
                <span className="text-3xl font-extrabold text-slate-400 dark:text-slate-600">
                  {project.category || 'PROJECT'}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">ProjectHub Showcase</span>
              </div>
            )}
          </div>

          {/* Action Bar (Links, Likes, Favorites, Share, Report) */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  GitHub Repository
                </a>
              )}
              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Like Button */}
              <button
                onClick={() => {
                  if (!isAuthenticated) return toast('Sign in to like this project.', 'info');
                  likeMutation.mutate();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  project.is_liked
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${project.is_liked ? 'fill-current' : ''}`} />
                <span>{project.likes_count} Likes</span>
              </button>

              {/* Favorite Button */}
              <button
                onClick={() => {
                  if (!isAuthenticated) return toast('Sign in to save this project.', 'info');
                  favoriteMutation.mutate();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  project.is_favorited
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${project.is_favorited ? 'fill-current' : ''}`} />
                <span>{project.favorites_count} Saves</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                title="Copy share link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Report */}
              <button
                onClick={() => setReportModalOpen(true)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors"
                title="Report Project"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid Layout: Main Details (Left) & Author / Tech Stack Sidebar (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Problem, Solution, Full Description */}
            <div className="lg:col-span-8 space-y-8">
              {/* Problem Statement */}
              {project.problem_statement && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-2 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Problem Statement
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {project.problem_statement}
                  </p>
                </div>
              )}

              {/* Proposed Solution */}
              {project.proposed_solution && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-2 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    Proposed Solution & Architecture
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {project.proposed_solution}
                  </p>
                </div>
              )}

              {/* Full Description */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Project Overview & Implementation
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.description || 'No detailed overview has been written for this project yet.'}
                </div>
              </div>

              {/* Screenshots Gallery if available */}
              {screenshotsList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Project Screenshots</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {screenshotsList.map((src, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 h-48"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getAssetUrl(src)}
                          alt={`Screenshot ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                    Discussion & Peer Reviews ({comments.length})
                  </h3>
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={
                      isAuthenticated
                        ? 'Share constructive feedback, ask questions, or review the architecture...'
                        : 'Sign in to join the discussion and share feedback.'
                    }
                    disabled={!isAuthenticated || commentMutation.isPending}
                    className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-50"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!isAuthenticated || !commentText.trim() || commentMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Post Comment
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4 pt-2">
                  {loadingComments ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                      <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No comments yet. Be the first to share feedback!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <Link
                            href={`/students/${comment.user_id}`}
                            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-teal-600 flex items-center gap-1.5"
                          >
                            <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] font-bold">
                              {comment.user_name?.charAt(0).toUpperCase()}
                            </div>
                            <span>{comment.user_name}</span>
                            {comment.user_role === 'admin' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                                Admin
                              </span>
                            )}
                          </Link>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                            {(user?.id === comment.user_id || isAdmin) && (
                              <button
                                onClick={() => deleteCommentMutation.mutate(comment.id)}
                                className="text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Author card & Technical Stack */}
            <div className="lg:col-span-4 space-y-6">
              {/* Creator Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Created By
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-base overflow-hidden">
                    {project.owner?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.owner.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (project.owner_name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      <Link href={`/students/${project.user_id}`} className="hover:text-teal-600 transition-colors">
                        {project.owner_name || 'Student Creator'}
                      </Link>
                    </h4>
                    {project.owner?.college && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{project.owner.college}</p>
                    )}
                  </div>
                </div>

                {project.owner?.bio && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {project.owner.bio}
                  </p>
                )}

                <Link
                  href={`/students/${project.user_id}`}
                  className="block w-full text-center px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  View Student Profile
                </Link>
              </div>

              {/* Technologies List */}
              {techList.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Tech Stack & Tools
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {techList.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Projects Section */}
          {relatedProjects.length > 0 && (
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Related Projects in {project.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Report Modal Dialog */}
        <Modal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          title="Report Project for Moderation"
        >
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please specify why this project violates platform standards (e.g. copyright infringement, inappropriate content, spam).
            </p>
            <textarea
              rows={4}
              required
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReport || !reportReason.trim()}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </Modal>

        <Footer />
      </div>
    </>
  );
};

export default ProjectDetailPage;
