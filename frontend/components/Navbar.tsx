import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Code,
  Compass,
  PlusCircle,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Heart,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Info,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [router.asPath]);

  const isActive = (path: string) => {
    if (path === '/' && router.pathname === '/') return true;
    if (path !== '/' && router.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
              <Code className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                Project<span className="text-teal-600 dark:text-teal-400">Hub</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                Student Showcase
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-50/70 dark:bg-teal-950/40'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Home
            </Link>
            <Link
              href="/projects"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/projects')
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-50/70 dark:bg-teal-950/40'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Projects
            </Link>
            <Link
              href="/#categories"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/#how-it-works"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              How It Works
            </Link>
          </nav>

          {/* Right Actions: Theme toggle, Submit button, Auth / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  href="/submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 shadow-sm transition-all hover:shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit Project
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center font-semibold text-xs overflow-hidden">
                      {user?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                      {user?.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize font-medium">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Edit Profile
                        </Link>
                        <Link
                          href="/favorites"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          Saved Favorites
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            Admin Moderation
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive('/') ? 'text-teal-600 bg-teal-50 dark:bg-teal-950/50' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              Home
            </Link>
            <Link
              href="/projects"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive('/projects') ? 'text-teal-600 bg-teal-50 dark:bg-teal-950/50' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              Explore Projects
            </Link>
            <Link
              href="/#categories"
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200"
            >
              Categories
            </Link>
            <Link
              href="/#how-it-works"
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200"
            >
              How It Works
            </Link>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1 text-xs text-slate-500 dark:text-slate-400">
                  Signed in as <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
                </div>
                <Link
                  href="/submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white bg-teal-600 hover:bg-teal-700 font-medium text-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit Project
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-medium"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
                <Link
                  href="/favorites"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-medium"
                >
                  <Heart className="w-4 h-4" />
                  Saved Favorites
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-600 dark:text-amber-400 text-sm font-medium"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Moderation
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 text-sm font-medium text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="w-full text-center px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="w-full text-center px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
