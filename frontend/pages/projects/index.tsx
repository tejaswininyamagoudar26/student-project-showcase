import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProjectGrid from '../../components/ProjectGrid';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import { projectsApi, categoriesApi } from '../../services/api';
import { Compass, RefreshCw, AlertCircle } from 'lucide-react';

const ProjectsPage: NextPage = () => {
  const router = useRouter();

  // URL Query Synced State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [technology, setTechnology] = useState('');
  const [sort, setSort] = useState('newest');

  // Initialize from router query once ready
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.page) setPage(Number(router.query.page));
    if (router.query.search) setSearch(String(router.query.search));
    if (router.query.category) setCategory(String(router.query.category));
    if (router.query.technology) setTechnology(String(router.query.technology));
    if (router.query.sort) setSort(String(router.query.sort));
  }, [router.isReady]);

  // Push updates to URL query params
  const updateQueryParams = (newParams: Record<string, any>) => {
    const updated = {
      ...router.query,
      ...newParams,
    };
    // Clean up empty params
    Object.keys(updated).forEach((key) => {
      if (!updated[key] || (key === 'page' && updated[key] === 1) || (key === 'sort' && updated[key] === 'newest')) {
        delete updated[key];
      }
    });
    router.push({ pathname: '/projects', query: updated }, undefined, { shallow: true });
  };

  // Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  // Projects List Query
  const {
    data: projectData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects-explore', page, search, category, technology, sort],
    queryFn: () =>
      projectsApi.list({
        page,
        page_size: 12,
        search: search || undefined,
        category: category || undefined,
        technology: technology || undefined,
        sort: (sort as any) || 'newest',
      }),
  });

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
    updateQueryParams({ search: v, page: 1 });
  };

  const handleCategoryChange = (v: string) => {
    setCategory(v);
    setPage(1);
    updateQueryParams({ category: v, page: 1 });
  };

  const handleTechnologyChange = (v: string) => {
    setTechnology(v);
    setPage(1);
    updateQueryParams({ technology: v, page: 1 });
  };

  const handleSortChange = (v: string) => {
    setSort(v);
    setPage(1);
    updateQueryParams({ sort: v, page: 1 });
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    updateQueryParams({ page: p });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setTechnology('');
    setSort('newest');
    setPage(1);
    router.push({ pathname: '/projects' }, undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>Explore Student Projects &ndash; ProjectHub</title>
        <meta
          name="description"
          content="Search, filter, and discover student projects across web, AI, IoT, cybersecurity, and data science."
        />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Page Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                <Compass className="w-4 h-4" />
                Project Directory
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Explore Student Projects
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Browse student innovations across universities and institutions. Search by technologies, problem domains, or keywords.
              </p>
            </div>

            {/* Filter Bar */}
            <FilterBar
              search={search}
              onSearchChange={handleSearchChange}
              category={category}
              onCategoryChange={handleCategoryChange}
              technology={technology}
              onTechnologyChange={handleTechnologyChange}
              sort={sort}
              onSortChange={handleSortChange}
              categories={categories}
              onReset={handleReset}
            />

            {/* Results Header */}
            {!isLoading && !isError && projectData && (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Showing {projectData.projects.length} of {projectData.total} {projectData.total === 1 ? 'project' : 'projects'}
                </span>
                <span>Page {projectData.page} of {projectData.total_pages}</span>
              </div>
            )}

            {/* Error State with Retry */}
            {isError && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">Failed to load projects</h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
                  {(error as Error)?.message || 'An unexpected network error occurred while fetching the project directory.'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white font-medium text-xs shadow hover:bg-rose-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            )}

            {/* Project Grid */}
            {!isError && (
              <ProjectGrid
                projects={projectData?.projects}
                loading={isLoading}
                emptyMessage="No projects matched your criteria."
              />
            )}

            {/* Pagination */}
            {projectData && !isError && (
              <Pagination
                currentPage={projectData.page}
                totalPages={projectData.total_pages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProjectsPage;
