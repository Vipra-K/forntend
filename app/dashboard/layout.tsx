'use client';

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { motion } from 'framer-motion';
import { Plus, FileText } from 'lucide-react';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [newFormDescription, setNewFormDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim()) return;

    setIsCreating(true);
    try {
      const res = await api.post('/forms', { 
        title: newFormTitle,
        description: newFormDescription 
      });
      toast.success('Form created successfully!');
      setIsCreateModalOpen(false);
      setNewFormTitle('');
      setNewFormDescription('');
      router.push(`/forms/${res.data.formId}/edit`);
    } catch (err) {
      toast.error('Failed to create form. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex overflow-hidden">
      <Sidebar />
      
      {/* Context Provider Shortcut: We'll use a custom event or just export the setter if needed, 
          but for now we'll just keep the modal here and trigger it via a window event or simple check */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>

      {/* Global Create Form Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px]">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-2xl"
          >
            <div className="mb-10">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create New Form</h2>
              <p className="text-slate-500 mt-2 font-medium">Define a title for your form to get started.</p>
            </div>

            <form onSubmit={handleCreateForm} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Form Title</label>
                <input 
                  autoFocus
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  placeholder="e.g. Weekly Operations Audit"
                  className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                <textarea 
                  value={newFormDescription}
                  onChange={(e) => setNewFormDescription(e.target.value)}
                  placeholder="e.g. Gather feedback from our weekly operations sync..."
                  className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all h-24 resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newFormTitle.trim() || isCreating}
                  className="flex-1 py-3.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Form'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Global Trigger Listener */}
      <button 
        id="global-create-form-trigger" 
        className="hidden" 
        onClick={() => setIsCreateModalOpen(true)} 
      />
    </div>
  );
}
