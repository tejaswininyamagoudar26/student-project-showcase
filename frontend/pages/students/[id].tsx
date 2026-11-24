import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProjectGrid from '../../components/ProjectGrid';
import { GithubIcon, LinkedinIcon } from '../../components/Icons';
import { studentsApi, getAssetUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Building2,
  Calendar,
  FolderCode,
  Edit,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

const StudentProfilePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const studentId = typeof id === 'string' ? parseInt(id, 10) : NaN;
  const { user } = useAuth();

  const { data: student, isLoading: loadingProfile, isError } = useQuery({
    queryKey: ['student-profile', studentId],
    queryFn: () => studentsApi.getProfile(studentId),
    enabled: !isNaN(studentId),
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['student-projects', studentId],
    queryFn: () => studentsApi.getProjects(studentId),
    enabled: !isNaN(studentId),
  });

  const isOwner = user && student && user.id === student.id;

  const skillsList = student?.skills
    ? student.skills.split(/[,|]/).map((s) => s.trim()).filter(Boolean)
    : [];

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full animate-pulse space-y-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Not Found</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            This student profile does not exist or has been deactivated.
          </p>
          <Link
            href="/projects"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{student.name} &ndash; Student Portfolio &ndash; ProjectHub</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar />

        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
          {/* Student Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Avatar / Photo */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-2xl overflow-hidden shadow-sm shrink-0 border border-teal-200 dark:border-teal-800">
                  {student.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getAssetUrl(student.avatar_url)} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    student.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {student.name}
                    </h1>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                      {student.role}
                    </span>
                  </div>

                  {student.college && (
                    <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-teal-600" />
                      {student.college}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    {student.department && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {student.department}
                      </span>
                    )}
                    {student.graduation_year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Class of {student.graduation_year}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Links / Edit */}
              <div className="flex items-center gap-3 self-start sm:self-center">
                {student.github_url && (
                  <a
                    href={student.github_url.startsWith('http') ? student.github_url : `https://${student.github_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                    title="GitHub Profile"
                  >
                    <GithubIcon className="w-5 h-5" />
                  </a>
                )}
                {student.linkedin_url && (
                  <a
                    href={student.linkedin_url.startsWith('http') ? student.linkedin_url : `https://${student.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                    title="LinkedIn Profile"
                  >
                    <LinkedinIcon className="w-5 h-5" />
                  </a>
                )}
                {isOwner && (
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>

            {/* Bio */}
            {student.bio && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {student.bio}
              </div>
            )}

            {/* Skills */}
            {skillsList.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills & Tooling</span>
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Student's Published Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderCode className="w-5 h-5 text-teal-600" />
                Published Projects ({projects.length})
              </h2>
            </div>

            <ProjectGrid
              projects={projects}
              loading={loadingProjects}
              emptyMessage={`${student.name} has not published any projects yet.`}
            />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default StudentProfilePage;
