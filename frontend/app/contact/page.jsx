'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Linkedin, Facebook, Twitter, Instagram, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ submitting: false, success: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: null });
    try {
      // Simulate request latency. Replace with a real API call when backend is ready.
      await new Promise((r) => setTimeout(r, 900));
      setStatus({ submitting: false, success: true });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ submitting: false, success: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Top bar / breadcrumb */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/60 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-purple-300 hover:text-purple-200 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <div className="text-xs text-gray-400">We reply within 24 hours</div>
        </div>
      </div>

      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
              <Clock className="w-4 h-4 text-yellow-300" />
              <span className="text-sm text-purple-200">Support: 9:00 - 18:00 (GMT+5:30)</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Contact <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Have a question about resumes, interviews or careers? We are here to help.
            </p>
          </div>

          {/* Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Contact Info */}
            <div className="lg:col-span-1">
              <div className="h-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Get in touch</h2>
                <div className="space-y-5">
                  <a href="mailto:support@aicareer.lk" className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition border border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Email</div>
                      <div className="text-gray-300 text-sm">dulajdjhansa@gmail.com</div>
                    </div>
                  </a>

                  <a href="tel:+94771234567" className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition border border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Phone</div>
                      <div className="text-gray-300 text-sm">+94 77 123 4567</div>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Address</div>
                      <div className="text-gray-300 text-sm">Colombo, Sri Lanka</div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="text-sm text-gray-400 mb-3">Follow us</div>
                    <div className="flex gap-3">
                      <a href="#" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition" aria-label="LinkedIn">
                        <Linkedin className="w-5 h-5 text-white" />
                      </a>
                      <a href="#" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition" aria-label="Facebook">
                        <Facebook className="w-5 h-5 text-white" />
                      </a>
                      <a href="#" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition" aria-label="Twitter">
                        <Twitter className="w-5 h-5 text-white" />
                      </a>
                      <a href="#" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition" aria-label="Instagram">
                        <Instagram className="w-5 h-5 text-white" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Send us a message</h2>

                {status.success === true && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-600/30 bg-emerald-600/10 p-4 text-emerald-200">
                    <CheckCircle2 className="w-5 h-5 mt-0.5" />
                    <div>
                      <div className="font-medium">Message sent successfully</div>
                      <div className="text-sm opacity-80">We will get back to you shortly.</div>
                    </div>
                  </div>
                )}

                {status.success === false && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-600/30 bg-red-600/10 p-4 text-red-200">
                    <div className="font-medium">Something went wrong. Please try again.</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="sm:col-span-1">
                    <label className="block text-sm text-gray-300 mb-2">Full name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm text-gray-300 mb-2">Email address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      required
                      className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">Message</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      rows={6}
                      required
                      className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 resize-y"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between gap-4">
                    <p className="text-xs text-gray-400">By sending, you agree to our privacy policy.</p>
                    <button
                      type="submit"
                      disabled={status.submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-700/20 hover:shadow-purple-600/30 transition disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      {status.submitting ? 'Sending...' : 'Send message'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Map / Illustration */}
          <div className="mt-10">
            <div className="w-full h-64 rounded-3xl border border-white/10 bg-[url('/globe.svg')] bg-cover bg-center opacity-80" />
          </div>
        </div>
      </section>
    </div>
  );
}


