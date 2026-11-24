import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Category } from '../types';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  technology: string;
  onTechnologyChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  categories: Category[];
  onReset: () => void;
}

export default function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  technology,
  onTechnologyChange,
  sort,
  onSortChange,
  categories,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(search || category || technology || sort !== 'newest');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="relative sm:col-span-2 lg:col-span-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects, topics, tags..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Category Dropdown */}
        <div className="lg:col-span-3">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tech Tag Input */}
        <div className="lg:col-span-3">
          <input
            type="text"
            value={technology}
            onChange={(e) => onTechnologyChange(e.target.value)}
            placeholder="Filter by tech (e.g. React, Python)"
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="lg:col-span-2">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clear Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Filters applied</span>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
