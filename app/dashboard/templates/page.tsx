'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  FileText, 
  ChevronRight,
  Mail,
  Users,
  Star,
  Zap,
  LayoutGrid,
  Search,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '../../../lib/api';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/form-templates');
      setTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch templates', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createFromTemplate = async (templateId: string) => {
    try {
      const res = await api.post(`/forms/template/${templateId}`);
      toast.success('Form created from template!');
      router.push(`/forms/${res.data.formId}/edit`);
    } catch (err) {
      toast.error('Failed to create form from template');
    }
  };

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'contact', label: 'Contact Forms' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'marketing', label: 'Marketing' },
  ];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-8 lg:px-12 py-12">
      {/* Header */}
      <header className="mb-16">
            <div className="flex items-center space-x-2 text-blue-600 mb-2 font-black uppercase tracking-[0.3em] text-[10px]">
              <LayoutGrid className="w-3 h-3" />
              <span>Library</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Templates</h1>
                <p className="text-slate-500 mt-2 font-medium">Kickstart your workflow with industry-standard form designs.</p>
              </div>
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-12 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 mt-12 overflow-x-auto pb-4 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </header>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                <Search className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">No templates found</h3>
              <p className="text-slate-500 mt-2 font-medium max-w-xs">We couldn't find any templates matching your current filters.</p>
              <button 
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="mt-8 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Blank Form Card */}
              <motion.button
                whileHover={{ y: -8 }}
                onClick={() => document.getElementById('create-form-btn')?.click()} // This might require a shared state or layout modal
                className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] hover:border-blue-600 hover:bg-blue-50 transition-all group min-h-[300px]"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-[1.2rem] flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm border border-slate-100">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Blank Form</h3>
                <p className="text-[11px] text-slate-500 font-medium text-center px-4 leading-relaxed">Starting from scratch? Build your unique data model from the ground up.</p>
              </motion.button>

              {filteredTemplates.map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                  onUse={() => createFromTemplate(template.id)} 
                />
              ))}
            </div>
          )}
    </div>
  );
}

function TemplateCard({ template, onUse }: { template: Template; onUse: () => void }) {
  const getIcon = (category: string) => {
    switch (category) {
      case 'contact': return <Mail className="w-6 h-6" />;
      case 'marketing': return <Zap className="w-6 h-6" />;
      case 'feedback': return <Users className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white border border-slate-200 p-8 rounded-[2.5rem] flex flex-col hover:border-slate-900 hover:shadow-2xl hover:shadow-slate-200 transition-all group overflow-hidden h-[300px]"
    >
      <div className="w-14 h-14 bg-slate-50 rounded-[1.2rem] flex items-center justify-center mb-8 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-sm border border-slate-100">
        {getIcon(template.category)}
      </div>

      <div className="flex-1 mb-6">
        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-2 truncate">
          {template.name}
        </h3>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3">
          {template.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{template.category}</span>
        <button 
          onClick={onUse}
          className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center group-hover:translate-x-1 transition-transform"
        >
          <span>Use Template</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </motion.div>
  );
}
