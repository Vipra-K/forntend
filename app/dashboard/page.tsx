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
import { toast } from 'sonner';

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

  /* New Form State */
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim()) return;

    setIsCreating(true);
    try {
      const res = await api.post('/forms', { title: newFormTitle });
      toast.success('Form created successfully!');
      router.push(`/forms/${res.data.formId}/edit`);
    } catch (err) {
      toast.error('Failed to create form. Please try again.');
      setIsCreating(false);
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
            onClick={() => setIsCreateModalOpen(true)}
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
              onClick={() => setIsCreateModalOpen(true)}
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

      {/* Create Form Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px]">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Create New Form</h2>
              <p className="text-sm text-slate-500">Give your form a clear, descriptive title to get started.</p>
            </div>

            <form onSubmit={handleCreateForm} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wide">Form Title</label>
                <input 
                  autoFocus
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  placeholder="e.g. Customer Satisfaction Survey"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newFormTitle.trim() || isCreating}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Form'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
