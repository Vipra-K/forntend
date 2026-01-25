'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { 
  Plus, 
  FileText, 
  Settings, 
  BarChart3, 
  LogOut, 
  MoreVertical, 
  Globe, 
  Lock,
  Clock,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Form {
  id: string;
  title: string;
  description: string;
  slug: string;
  fieldCount: number;
  version: number;
  createdAt: string;
}

export default function Dashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    } else if (user) {
      fetchForms();
    }
  }, [user, authLoading, router]);

  const fetchForms = async () => {
    try {
      const res = await api.get('/forms');
      setForms(res.data);
    } catch (err) {
      console.error('Failed to fetch forms', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createForm = async () => {
    const title = prompt('Enter form title:', 'New Dynamic Form');
    if (!title) return;

    try {
      const res = await api.post('/forms', { title });
      router.push(`/forms/${res.data.formId}/edit`);
    } catch (err) {
      alert('Failed to create form');
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex overflow-hidden">
      {/* Professional Minimal Sidebar */}
      <aside className="w-64 border-r border-slate-200 flex flex-col p-6 bg-slate-50/50">
        <div className="flex items-center space-x-2 px-2 mb-10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">FormBuilder</span>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { label: 'My Forms', icon: FileText, active: true },
            { label: 'Connections', icon: Globe, active: false },
            { label: 'Settings', icon: Settings, active: false },
          ].map((item) => (
            <button 
              key={item.label}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active 
                  ? 'bg-slate-200 text-slate-900' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-auto"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your forms and view recent activity.</p>
          </div>
          <button 
            onClick={createForm}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Form</span>
          </button>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl border border-slate-200" />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">No forms found</h3>
            <p className="text-sm text-slate-500 mb-6">Create your first form to start collecting data.</p>
            <button 
              onClick={createForm}
              className="text-blue-600 font-semibold text-sm hover:underline"
            >
              Get started +
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div 
                key={form.id}
                className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 truncate">
                  {form.title}
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Created {new Date(form.createdAt).toLocaleDateString()}
                </p>

                <div className="flex bg-slate-50 rounded-lg p-3 space-x-4 mb-6">
                  <div className="flex-1 text-center border-r border-slate-200">
                    <div className="text-sm font-bold">{form.fieldCount}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Fields</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-sm font-bold">v{form.version}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Version</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <button 
                    onClick={() => router.push(`/forms/${form.id}/edit`)}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center space-x-1.5 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Manage</span>
                  </button>
                  <button 
                    onClick={() => router.push(`/forms/${form.id}/responses`)}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center space-x-1.5 transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Responses</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
