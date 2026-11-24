import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProjectGrid from '../components/ProjectGrid';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import Footer from '../components/Footer';
import { projectsApi, categoriesApi } from '../services/api';
import { Sparkles, Layers, ArrowRight, Lightbulb, Users, Trophy, Code2, Cpu, Globe, Shield, Smartphone, Database } from 'lucide-react';

const Home: NextPage = () => {
  // Discovery State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [technology, setTechnology] = useState('');
  const [sort, setSort] = useState('newest');

  // Fetch Featured Projects
  const { data: featuredProjects = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: () => projectsApi.getFeatured(6),
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  // Fetch Discovery Projects
  const {
    data: discoveryData,
    isLoading: loadingDiscovery,
  } = useQuery({
    queryKey: ['discovery-projects', page, search, category, technology, sort],
    queryFn: () =>
      projectsApi.list({
        page,
        page_size: 9,
        search: search || undefined,
        category: category || undefined,
        technology: technology || undefined,
        sort: (sort as any) || 'newest',
      }),
  });

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setTechnology('');
    setSort('newest');
    setPage(1);
  };

  const categoryIcons: Record<string, any> = {
    'Web Development': Globe,
    'Mobile Applications': Smartphone,
    'AI & Machine Learning': Cpu,
    'Data Science & Analytics': Database,
    'Cybersecurity': Shield,
    'IoT & Embedded Systems': Cpu,
    'Cloud & DevOps': Layers,
    'Open Source Tools': Code2,
  };

  return (
    <>
      <Head>
        <title>ProjectHub &ndash; Student Project Showcase & Academic Portfolio</title>
        <meta
          name="description"
          content="Discover innovative student projects, share your research and development work, and connect with a community of student creators."
        />
        <meta property="og:title" content="ProjectHub - Student Project Showcase" />
        <meta
          property="og:description"
          content="Explore innovative student projects, share code, and connect with peers."
        />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors">
          {/* Hero Section */}
          <Hero />

          {/* Featured Projects Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Editor's Pick & Recent Highlights
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Featured Projects
                </h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
              >
                Browse all projects <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <ProjectGrid
              projects={featuredProjects}
              loading={loadingFeatured}
              emptyMessage="No featured projects available right now. Be the first to publish one!"
            />
          </section>

          {/* Popular Categories Grid */}
          <section id="categories" className="bg-white dark:bg-slate-900/60 py-16 border-y border-slate-200 dark:border-slate-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Disciplines
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                  Popular Categories
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Browse projects categorized across major computer science and engineering specializations.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((cat) => {
                  const Icon = categoryIcons[cat.name] || Layers;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.name);
                        const el = document.getElementById('discover');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`p-5 rounded-xl border text-left transition-all duration-200 group flex flex-col justify-between ${
                        category === cat.name
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-teal-400 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/80 text-teal-600 dark:text-teal-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {cat.description || 'Explore student builds in this domain'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Project Discovery Section with Live Search & Filtering */}
          <section id="discover" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Explore Database
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                Project Discovery
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Filter by technical stacks, domains, keywords, and popularity metrics.
              </p>
            </div>

            {/* Filter Bar */}
            <FilterBar
              search={search}
              onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              category={category}
              onCategoryChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
              technology={technology}
              onTechnologyChange={(v) => {
                setTechnology(v);
                setPage(1);
              }}
              sort={sort}
              onSortChange={(v) => {
                setSort(v);
                setPage(1);
              }}
              categories={categories}
              onReset={handleResetFilters}
            />

            {/* Results Grid */}
            <ProjectGrid
              projects={discoveryData?.projects}
              loading={loadingDiscovery}
              emptyMessage="No projects matched your discovery query."
            />

            {/* Pagination */}
            {discoveryData && (
              <Pagination
                currentPage={discoveryData.page}
                totalPages={discoveryData.total_pages}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="bg-slate-100/70 dark:bg-slate-900 py-16 border-t border-slate-200 dark:border-slate-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Workflow
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                  How ProjectHub Works
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  A simple three-step cycle to turn your coursework and side projects into an impactful portfolio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Document & Submit</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Outline the problem statement, proposed architectural solution, tech stack, and provide GitHub repository or live demo links.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Showcase & Get Feedback</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Publish your project to fellow students, receive reviews, code critique, and track engagement through likes and favorites.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Build Your Credibility</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your public student profile catalogs your verified contributions, university details, and skills for recruiter and academic visibility.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Banner */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-gradient-to-r from-teal-700 to-blue-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Ready to Showcase Your Project?
                </h3>
                <p className="text-teal-100 text-sm leading-relaxed">
                  Join student creators worldwide. Add your project details, live URLs, and screenshots in less than two minutes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/submit"
                  className="px-6 py-3 rounded-xl bg-white text-teal-800 font-bold text-sm shadow hover:bg-teal-50 transition-colors"
                >
                  Submit Your Project
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl bg-teal-800/80 hover:bg-teal-900 text-white font-semibold text-sm border border-teal-500/40 transition-colors"
                >
                  Create Student Account
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Home;
