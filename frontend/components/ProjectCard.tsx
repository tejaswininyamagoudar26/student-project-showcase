import React, { useState } from 'react';
import Link from 'next/link';
import { Project } from '../types';
import { getAssetUrl, projectsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heart, ThumbsUp, ExternalLink, MessageSquare, Sparkles } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onFavoriteToggle?: (projectId: number, isFav: boolean) => void;
}

export default function ProjectCard({ project, onFavoriteToggle }: ProjectCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [imgError, setImgError] = useState(false);
  const [likesCount, setLikesCount] = useState(project.likes_count || 0);
  const [isLiked, setIsLiked] = useState(project.is_liked || false);
  const [isFavorited, setIsFavorited] = useState(project.is_favorited || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  // Parse technologies
  const techList = project.technology
    ? project.technology
        .split(/[,|]/)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast('Please log in to like this project.', 'info');
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      if (isLiked) {
        const res = await projectsApi.unlike(project.id);
        setIsLiked(false);
        setLikesCount(res.likes_count);
      } else {
        const res = await projectsApi.like(project.id);
        setIsLiked(true);
        setLikesCount(res.likes_count);
      }
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast('Please log in to save this project.', 'info');
      return;
    }
    if (isFavoriting) return;
    setIsFavoriting(true);
    try {
      if (isFavorited) {
        await projectsApi.unfavorite(project.id);
        setIsFavorited(false);
        onFavoriteToggle?.(project.id, false);
        toast('Removed from favorites', 'info');
      } else {
        await projectsApi.favorite(project.id);
        setIsFavorited(true);
        onFavoriteToggle?.(project.id, true);
        toast('Saved to favorites', 'success');
      }
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setIsFavoriting(false);
    }
  };

  const imageUrl = !imgError && project.image_url ? getAssetUrl(project.image_url) : null;

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 overflow-hidden">
      {/* Project Image / Cover banner */}
      <Link href={`/projects/${project.id}`} className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden block">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={project.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-850 p-4 text-center">
            <span className="text-2xl font-bold text-slate-400 dark:text-slate-600 tracking-wider">
              {project.category || 'PROJECT'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">ProjectHub Showcase</span>
          </div>
        )}

        {/* Category Badge */}
        {project.category && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
              {project.category}
            </span>
          </div>
        )}

        {/* Featured Badge */}
        {project.is_featured && (
          <div className="absolute top-3 right-11">
            <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 p-1.5 rounded-md backdrop-blur-sm transition-colors ${
            isFavorited
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200/50 dark:border-slate-700/50'
          }`}
          title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          aria-label="Save project"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
            <Link href={`/projects/${project.id}`}>{project.title}</Link>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {project.short_description || project.description || 'No description provided.'}
          </p>

          {/* Tech tags */}
          {techList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {techList.map((tech) => (
                <span
                  key={tech}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer info: Author, Comments, Likes, View button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          {/* Creator */}
          <Link
            href={`/students/${project.user_id}`}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-medium truncate max-w-[140px]"
          >
            <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
              {project.owner_avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.owner_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                (project.owner_name || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <span className="truncate">{project.owner_name || 'Student Creator'}</span>
          </Link>

          {/* Social Stats & Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                isLiked
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Like project"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <span className="flex items-center gap-1 text-slate-400 text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{project.comments_count || 0}</span>
            </span>

            <Link
              href={`/projects/${project.id}`}
              className="ml-1 p-1.5 rounded-md text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View Project Details"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
