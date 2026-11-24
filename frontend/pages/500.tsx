import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

const ServerErrorPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Server Error &ndash; ProjectHub</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar />

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 border border-rose-200 dark:border-rose-900 shadow-sm">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Unexpected System Error
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-3 leading-relaxed">
            An error occurred while loading this page. Please try refreshing or return to the main showcase.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ServerErrorPage;
