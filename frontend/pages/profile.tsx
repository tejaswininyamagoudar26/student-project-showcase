import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { studentsApi, uploadApi, getAssetUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Upload,
  X,
  Building2,
  GraduationCap,
  Calendar,
  Save,
} from 'lucide-react';

const ProfileEditPage: NextPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [graduationYear, setGraduationYear] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast('Please log in to edit your profile.', 'info');
      router.push('/login?redirect=/profile');
    }
  }, [authLoading, isAuthenticated, router, toast]);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCollege(user.college || '');
      setDepartment(user.department || '');
      setGraduationYear(user.graduation_year || '');
      setBio(user.bio || '');
      setSkills(user.skills || '');
      setGithubUrl(user.github_url || '');
      setLinkedinUrl(user.linkedin_url || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast('Photo exceeds 5MB limit.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      setAvatarUrl(res.url);
      toast('Avatar photo uploaded.', 'success');
    } catch (err: any) {
      toast(err.message || 'Avatar upload failed.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Name is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await studentsApi.updateProfile({
        name: name.trim(),
        college: college.trim() || undefined,
        department: department.trim() || undefined,
        graduation_year: graduationYear ? Number(graduationYear) : undefined,
        bio: bio.trim() || undefined,
        skills: skills.trim() || undefined,
        github_url: githubUrl.trim() || undefined,
        linkedin_url: linkedinUrl.trim() || undefined,
        avatar_url: avatarUrl || undefined,
      });

      await refreshUser();
      toast('Profile updated successfully!', 'success');
      if (user) {
        router.push(`/students/${user.id}`);
      }
    } catch (err: any) {
      toast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-sm text-slate-500">Loading student profile...</div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Profile &ndash; ProjectHub</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar />

        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              <User className="w-4 h-4" />
              Account Settings
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Student Profile
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Customize how other students and recruiters view your academic portfolio.
            </p>
          </div>

          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Avatar Photo Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 rounded-2xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-2xl overflow-hidden shadow-sm shrink-0 border border-teal-200 dark:border-teal-800">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={getAssetUrl(avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (name || 'U').charAt(0).toUpperCase()
                )}
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Profile Photo
                </span>
                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full p-3 text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* University & Department & Graduation Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  University / College
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. UC Berkeley, IIT Bombay"
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Department / Degree
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Graduation Year
                </label>
                <input
                  type="number"
                  min={2000}
                  max={2035}
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2026"
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Short Biography
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your technical interests, research areas, and what you enjoy building..."
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Skills & Technical Tags (Comma separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Python, PyTorch, Docker, Kubernetes"
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProfileEditPage;
