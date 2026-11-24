import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProjectGrid from '../components/ProjectGrid';
import { studentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heart, Compass } from 'lucide-react';

const FavoritesPage: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast('Please log in to view your saved favorites.', 'info');
      router.push('/login?redirect=/favorites');
    }
  }, [authLoading, isAuthenticated, router, toast]);

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['my-favorites'],
    queryFn: () => studentsApi.getFavorites(),
    enabled: !!isAuthenticated,
  });

  const handleFavoriteToggle = () => {
    queryClient.invalidateQueries({ queryKey: ['my-favorites'] });
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
        <title>Saved Favorites &ndash; ProjectHub</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <Heart className="w-4 h-4 fill-current" />
              Saved Bookmarks
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Saved Projects
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Projects you have saved for research reference, inspiration, or follow-up.
            </p>
          </div>

          <ProjectGrid
            projects={favorites}
            loading={isLoading}
            emptyMessage="You have not saved any projects yet."
            onFavoriteToggle={handleFavoriteToggle}
          />

          {!isLoading && favorites.length === 0 && (
            <div className="text-center pt-2">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <Compass className="w-4 h-4" />
                Explore Projects Directory
              </Link>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FavoritesPage;
