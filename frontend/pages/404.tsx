import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Compass, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Page Not Found &ndash; ProjectHub</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar />

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6 border border-teal-200 dark:border-teal-900 shadow-sm">
            <span className="text-3xl font-extrabold font-mono">404</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Page Not Found
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-3 leading-relaxed">
            The page, project, or student profile you are looking for has been moved, renamed, or does not exist.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow transition-colors"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              <Compass className="w-4 h-4" />
              Browse Projects
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default NotFoundPage;
