import React from 'react';
import Link from 'next/link';
import { Code, Heart, Sparkles } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold shadow-sm">
                <Code className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                Project<span className="text-teal-400">Hub</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              An academic and developer portfolio platform for students to showcase innovative projects, exchange feedback, and connect with peers.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-slate-200 tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/projects" className="hover:text-teal-400 transition-colors">
                  Explore All Projects
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-teal-400 transition-colors">
                  Submit a Project
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-teal-400 transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-teal-400 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Links */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-slate-200 tracking-wider mb-3">Top Fields</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/projects?category=Web+Development" className="hover:text-teal-400 transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/projects?category=AI+%26+Machine+Learning" className="hover:text-teal-400 transition-colors">
                  AI & Machine Learning
                </Link>
              </li>
              <li>
                <Link href="/projects?category=IoT+%26+Embedded+Systems" className="hover:text-teal-400 transition-colors">
                  IoT & Robotics
                </Link>
              </li>
              <li>
                <Link href="/projects?category=Cybersecurity" className="hover:text-teal-400 transition-colors">
                  Cybersecurity
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Safety */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-slate-200 tracking-wider mb-3">Community</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="hover:text-teal-400 transition-colors">
                  Join as Student Creator
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Student Project Showcase &copy; {new Date().getFullYear()}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p className="text-slate-500 flex items-center gap-1">
            Built for student creators and open-source collaboration.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Responsive &bull; Secure &bull; Fast</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
