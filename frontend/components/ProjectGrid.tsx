import React from 'react';
import ProjectCard from './ProjectCard';
import { Project } from '../types';
import { FolderSearch } from 'lucide-react';

interface ProjectGridProps {
  projects?: Project[];
  loading?: boolean;
  emptyMessage?: string;
  onFavoriteToggle?: (projectId: number, isFav: boolean) => void;
}

export default function ProjectGrid({
  projects = [],
  loading = false,
  emptyMessage = 'No projects found.',
  onFavoriteToggle,
}: ProjectGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse shadow-sm"
          >
            <div className="w-full h-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <FolderSearch className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{emptyMessage}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          Try adjusting your search criteria, clearing selected filters, or exploring other categories.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onFavoriteToggle={onFavoriteToggle} />
      ))}
    </div>
  );
}
