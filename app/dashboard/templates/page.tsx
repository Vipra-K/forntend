'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { 
  Search, 
  Sparkles, 
  FileText, 
  Users, 
  Calendar,
  ClipboardList,
  MessageSquare,
  ShoppingCart,
  Heart,
  Briefcase,
  GraduationCap,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: any;
}

const categoryIcons: Record<string, any> = {
  'Contact': MessageSquare,
  'Survey': ClipboardList,
  'Registration': Users,
  'Event': Calendar,
  'Order': ShoppingCart,
  'Feedback': Heart,
  'Application': Briefcase,
  'Education': GraduationCap,
};

const categoryColors: Record<string, string> = {
  'Contact': 'bg-blue-100 text-blue-700 border-blue-200',
  'Survey': 'bg-purple-100 text-purple-700 border-purple-200',
  'Registration': 'bg-green-100 text-green-700 border-green-200',
  'Event': 'bg-orange-100 text-orange-700 border-orange-200',
  'Order': 'bg-pink-100 text-pink-700 border-pink-200',
  'Feedback': 'bg-red-100 text-red-700 border-red-200',
  'Application': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Education': 'bg-teal-100 text-teal-700 border-teal-200',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
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
      toast.error('Failed to load templates');
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
      console.error('Failed to create form from template', err);
      toast.error('Failed to create form');
    }
  };

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl px-8 lg:px-12 py-12">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center space-x-2 text-purple-600 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Templates</span>
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Form Templates</h1>
        <p className="text-slate-500 font-medium text-base">Start with a professionally designed template and customize it to your needs.</p>
      </header>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-3xl border border-slate-100">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 mb-6">
            <Search className="w-9 h-9 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No templates found</h3>
          <p className="text-slate-500 font-medium text-center max-w-sm">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              onUse={() => createFromTemplate(template.id)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template, onUse, index }: { template: Template, onUse: () => void, index: number }) {
  const Icon = categoryIcons[template.category] || FileText;
  const colorClass = categoryColors[template.category] || 'bg-slate-100 text-slate-700 border-slate-200';
  const fieldCount = Array.isArray(template.fields) ? template.fields.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group cursor-pointer flex flex-col"
      onClick={onUse}
    >
      {/* Template Icon & Category */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl group-hover:from-blue-50 group-hover:to-blue-100/50 transition-all duration-300">
          <Icon className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" />
        </div>
        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
          {template.category}
        </span>
      </div>

      {/* Template Info */}
      <div className="flex-1 mb-5">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {template.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {template.description || 'A professionally designed form template ready to use.'}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <FileText className="w-3.5 h-3.5" />
          <span>{fieldCount} fields</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onUse(); }}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100"
        >
          Use Template
        </button>
      </div>
    </motion.div>
  );
}
