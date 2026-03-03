'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Lock, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [open, setOpen] = useState({ basics: true, data: true, usage: true, rights: true, contact: true });

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/60 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-purple-300 hover:text-purple-200 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <div className="text-xs text-gray-400">Last updated: Oct 2025</div>
        </div>
      </div>

      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
              <Shield className="w-4 h-4 text-emerald-300" />
              <span className="text-sm text-purple-200">Your privacy matters</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Privacy <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">How AI Career Guide collects, uses, and protects your data.</p>
          </div>

          {/* Summary */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8 mb-8">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Secure by design</div>
                  <div className="text-gray-400 text-xs">Data encrypted in transit and at rest where applicable.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Minimal collection</div>
                  <div className="text-gray-400 text-xs">We only collect what we need to provide the service.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">You’re in control</div>
                  <div className="text-gray-400 text-xs">Access, update, or delete your data anytime.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {/* Basics */}
            <article className="border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => toggle('basics')} className="w-full text-left bg-white/5 px-5 py-4 flex items-center justify-between">
                <span className="text-white font-semibold">1. Who we are</span>
                <span className="text-purple-300 text-sm">{open.basics ? 'Hide' : 'Show'}</span>
              </button>
              {open.basics && (
                <div className="p-5 text-gray-300 text-sm leading-6 bg-slate-900/30">
                  AI Career Guide is a platform that helps Sri Lankan job seekers build resumes, prepare for interviews, and discover careers using AI.
                </div>
              )}
            </article>

            {/* Data We Collect */}
            <article className="border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => toggle('data')} className="w-full text-left bg-white/5 px-5 py-4 flex items-center justify-between">
                <span className="text-white font-semibold">2. Data we collect</span>
                <span className="text-purple-300 text-sm">{open.data ? 'Hide' : 'Show'}</span>
              </button>
              {open.data && (
                <div className="p-5 text-gray-300 text-sm leading-6 bg-slate-900/30 space-y-3">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Account data: name, email, login metadata.</li>
                    <li>Profile content: resume fields, cover letters, preferences.</li>
                    <li>Usage data: feature interactions, device info, approximate location.</li>
                    <li>Cookies/local storage for session and preferences.</li>
                  </ul>
                </div>
              )}
            </article>

            {/* How We Use Data */}
            <article className="border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => toggle('usage')} className="w-full text-left bg-white/5 px-5 py-4 flex items-center justify-between">
                <span className="text-white font-semibold">3. How we use your data</span>
                <span className="text-purple-300 text-sm">{open.usage ? 'Hide' : 'Show'}</span>
              </button>
              {open.usage && (
                <div className="p-5 text-gray-300 text-sm leading-6 bg-slate-900/30 space-y-3">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Provide features like resume generation and interview prep.</li>
                    <li>Improve accuracy and performance of AI features.</li>
                    <li>Communicate important updates and support responses.</li>
                    <li>Ensure security, prevent abuse, and maintain service reliability.</li>
                  </ul>
                </div>
              )}
            </article>

            {/* Your Rights */}
            <article className="border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => toggle('rights')} className="w-full text-left bg-white/5 px-5 py-4 flex items-center justify-between">
                <span className="text-white font-semibold">4. Your choices & rights</span>
                <span className="text-purple-300 text-sm">{open.rights ? 'Hide' : 'Show'}</span>
              </button>
              {open.rights && (
                <div className="p-5 text-gray-300 text-sm leading-6 bg-slate-900/30 space-y-3">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Access, update, or delete your profile data in your account.</li>
                    <li>Opt-out of non-essential emails via unsubscribe links.</li>
                    <li>Control cookies via your browser settings.</li>
                  </ul>
                </div>
              )}
            </article>

            {/* Contact */}
            <article className="border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => toggle('contact')} className="w-full text-left bg-white/5 px-5 py-4 flex items-center justify-between">
                <span className="text-white font-semibold">5. Contact us</span>
                <span className="text-purple-300 text-sm">{open.contact ? 'Hide' : 'Show'}</span>
              </button>
              {open.contact && (
                <div className="p-5 text-gray-300 text-sm leading-6 bg-slate-900/30 space-y-2">
                  For privacy questions, reach us at <a className="text-purple-300 underline" href="mailto:support@aicareer.lk">support@aicareer.lk</a> or use our <Link href="/contact" className="text-purple-300 underline">contact page</Link>.
                </div>
              )}
            </article>
          </div>

          {/* Footer note */}
          <div className="mt-8 text-xs text-gray-400">
            This policy may change as we improve our services. We will notify you of material updates.
          </div>
        </div>
      </section>
    </div>
  );
}


