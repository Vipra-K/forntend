'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../../../lib/api';
import { 
  ChevronLeft, 
  Rocket, 
  Eye, 
  Settings2, 
  BarChart3, 
  Layers, 
  MessageSquare,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FormManagementLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode; 
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const navItems = [
    { label: 'Editor', icon: Layers, path: `/forms/${id}/edit` },
    { label: 'Responses', icon: MessageSquare, path: `/forms/${id}/responses` },
    { label: 'Insights', icon: BarChart3, path: `/forms/${id}/insights` },
    { label: 'Settings', icon: Settings2, path: `/forms/${id}/settings` },
  ];

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      const res = await api.get(`/forms/${id}`);
      setForm(res.data);
    } catch (err) {
      console.error('Failed to fetch form', err);
    } finally {
      setIsLoading(false);
    }
  };

  const publishForm = async () => {
    if (!form) return;
    setIsPublishing(true);
    try {
      const versionsRes = await api.get(`/forms/${id}/versions`);
      const latestDraft = versionsRes.data.find((v: any) => !v.publishedAt && !v.closedAt);
      const activeVer = versionsRes.data.find((v: any) => v.isActive);
      const targetVersionId = latestDraft?.id || activeVer?.id;

      if (!targetVersionId) throw new Error('No version found');

      await api.put(`/forms/${id}/versions/${targetVersionId}/publish`);
      await api.put(`/forms/${id}/versions/${targetVersionId}/activate`);
      
      await fetchForm();
      setShowPublishModal(true);
    } catch (err) {
      alert('Failed to publish form.');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyPublicUrl = () => {
    const url = `${window.location.origin}/f/${form.slug}`;
    navigator.clipboard.writeText(url);
  };

  if (isLoading || !form) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Professional Minimal Header */}
      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => router.push('/dashboard')} 
            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          
          <div className="flex items-center space-x-2">
            <h1 className="font-semibold text-sm">{form.title}</h1>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-medium">v{form.version}</span>
          </div>
        </div>

        {/* Simplified Navigation */}
        <nav className="flex space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.open(`/f/${form.slug}`, '_blank')}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public</span>
          </button>
          
          <button 
            onClick={publishForm}
            disabled={isPublishing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
            <span>Publish</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Simplified Publish Success Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-2xl"
            >
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-lg font-bold mb-2">Form Published Successfully</h2>
                <p className="text-sm text-slate-500 mb-6">Your form is now live and accepting submissions.</p>
                
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-md flex items-center justify-between mb-8">
                  <span className="text-xs font-mono text-slate-600 truncate">{window.location.origin}/f/{form.slug}</span>
                  <button onClick={copyPublicUrl} className="text-blue-600 hover:text-blue-700 p-2"><Copy className="w-4 h-4" /></button>
                </div>
                
                <button 
                  onClick={() => setShowPublishModal(false)}
                  className="w-full py-2 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
