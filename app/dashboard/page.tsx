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
  MoreVertical, 
  Trash2,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Modular Components
import { Sidebar } from './components/Sidebar';

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
  const { user, authLoading } = useAuth() as any; // Cast as any if context types are strict
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchForms();
    }
  }, [user]);

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

  const openCreateModal = () => {
    document.getElementById('global-create-form-trigger')?.click();
  };

  return (
    <div className="max-w-6xl px-8 lg:px-12 py-12">
      {/* Dashboard Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Workspace</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your forms and monitor live response activity.</p>
        </div>
        
        <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push('/dashboard/templates')}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm"
            >
              Browse Templates
            </button>
            <button 
            id="create-form-btn"
            onClick={openCreateModal}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center space-x-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Form</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2rem] border border-slate-100" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm border border-slate-100 mb-8">
            <FileText className="w-8 h-8 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Your workspace is empty</h3>
          <p className="text-slate-500 mt-2 font-medium text-center max-w-xs px-6">
            Ready to collect data? Create your first form or start from a professional template.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={openCreateModal}
              className="px-8 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
            >
              Create from Scratch
            </button>
            <button 
              onClick={() => router.push('/dashboard/templates')}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:border-slate-400 hover:text-slate-900 transition-all"
            >
              View Templates
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {forms.map((form) => (
            <FormCard 
              key={form.id} 
              form={form} 
              onDelete={() => fetchForms()} 
              onEdit={() => router.push(`/forms/${form.id}/edit`)}
              onViewInsights={() => router.push(`/forms/${form.id}/insights`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FormCard({ form, onDelete, onEdit, onViewInsights }: { form: Form, onDelete: () => void, onEdit: () => void, onViewInsights: () => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/forms/${form.id}`);
      toast.success('Form deleted successfully');
      onDelete();
    } catch (err) {
      toast.error('Failed to delete form');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-8 rounded-[2rem] flex flex-col hover:border-slate-900 hover:shadow-2xl hover:shadow-slate-200 transition-all group relative overflow-hidden h-[300px]">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
          <FileText className="w-6 h-6" />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-400 hover:text-slate-900 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 py-2.5 overflow-hidden font-bold"
                >
                  <button 
                    onClick={() => { setShowMenu(false); router.push(`/f/${form.slug}`); }}
                    className="w-full flex items-center space-x-3 px-5 py-3 text-xs text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Live</span>
                  </button>
                  <div className="h-px bg-slate-100 mx-5 my-1" />
                  <button 
                    onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                    className="w-full flex items-center space-x-3 px-5 py-3 text-xs text-red-600 hover:bg-red-50 transition-colors uppercase tracking-widest"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 min-w-0 mb-6">
        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-2 truncate pr-6">
          {form.title}
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {new Date(form.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-slate-50/50 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-100/50">
          <span className="text-sm font-black text-slate-900">{form.fieldCount}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fields</span>
        </div>
        <div className="bg-slate-50/50 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-100/50">
          <span className="text-sm font-black text-slate-900">v{form.version}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Build</span>
        </div>
      </div>

      {/* Hover Actions Bar */}
      <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white border-t border-slate-200 p-4 flex items-center space-x-2 z-10 bg-white/95 backdrop-blur-sm">
        <button 
          onClick={onEdit}
          className="flex-1 py-3 bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center space-x-2"
        >
          <Settings className="w-3 h-3" />
          <span>Edit Design</span>
        </button>
        <button 
          onClick={onViewInsights}
          className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-black text-[9px] uppercase tracking-widest rounded-xl hover:border-slate-900 hover:text-slate-900 transition-all flex items-center justify-center space-x-2"
        >
          <BarChart3 className="w-3 h-3" />
          <span>Analytics</span>
        </button>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white border border-slate-200 p-10 rounded-[3rem] shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-600 border border-red-100">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Delete Form?</h2>
              <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium">
                This will permanently erase <span className="font-bold text-slate-900 px-1 italic">"{form.title}"</span> and all gathered results. This action is terminal.
              </p>

              <div className="flex flex-col gap-3">
                 <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-red-100 disabled:opacity-50"
                >
                  {isDeleting ? 'ERASING...' : 'CONFIRM DELETE'}
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all text-[10px] uppercase tracking-[0.2em]"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
