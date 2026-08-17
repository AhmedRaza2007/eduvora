'use client';

import React, { useState } from 'react';
import { Settings, Save, Building2, Globe, Database, Shield } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: 'Eduvora Global Academy',
    type: 'School & College',
    code: 'EDUVORA-MAIN',
    address: '124 Academic Parkway, Suite 500, Education City',
    phone: '+1 (555) 234-5678',
    email: 'info@eduvora.edu',
    website: 'https://eduvora.vercel.app',
    tenantIsolation: 'Enabled (PostgreSQL Row-Level Security)',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Settings Saved!', 'Institution branding and SaaS configuration updated.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> SaaS Institution Settings
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Configure campus branding, tenant data isolation, and deployment domain</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm max-w-3xl">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" /> General Institution Profile
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Institution Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Institution Type</label>
              <input
                type="text"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Contact Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Preferred SaaS Domain</label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" /> Multi-Tenant Database Architecture
            </h4>
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-200 space-y-1">
              <p className="font-bold">PostgreSQL / Supabase Schema Readiness:</p>
              <p>All 27 models are indexed by <span className="font-mono">institutionId</span> and <span className="font-mono">branchId</span>, providing complete tenant isolation for multi-campus scale on Vercel + Supabase.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="px-5 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
