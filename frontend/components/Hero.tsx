import React from 'react';
import Link from 'next/link';
import { Compass, PlusCircle, Terminal, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/50 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950 py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f766e0a_1px,transparent_1px),linear-gradient(to_bottom,#0f766e0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-100/80 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>The Dedicated Academic Project Portfolio</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Discover. <span className="text-teal-600 dark:text-teal-400">Build.</span> Showcase.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Explore innovative student projects, share your work, and connect with a community of student creators.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Compass className="w-4 h-4" />
                Explore Projects
              </Link>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-300 dark:border-slate-700 shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Showcase Your Project
              </Link>
            </div>

            {/* Credibility highlights */}
            <div className="pt-4 flex flex-wrap justify-center lg:justify-start items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-500" /> Verified student profiles
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-500" /> Interactive live demos & code
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-500" /> Peer reviews & engagement
              </span>
            </div>
          </div>

          {/* Right Column: Code/Project Showcase Card Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-teal-500" />
                  <span>projecthub.preview</span>
                </div>
              </div>

              {/* Sample Project Showcase Card Preview */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-700/60 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                      Featured Project
                    </span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      Autonomous Drone Navigator
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium">
                    IoT & AI
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  Computer vision and SLAM obstacle navigation framework for GPS-denied environments.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Python', 'OpenCV', 'ROS', 'PyTorch'].map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mini Features Checklist */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Full Documentation</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Problem & solution statements</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Direct Links</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">GitHub repos and live demos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
