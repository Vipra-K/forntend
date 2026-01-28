'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { 
  Plus, 
  FileText, 
  ChevronRight,
  Mail,
  LogOut,
  Users,
  Star,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

export function TemplateSuggestion() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) return null;
  if (templates.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Start with a template</h2>
          <p className="text-xs text-slate-500 mt-1">Accelerate your workflow with pre-built forms.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <motion.button
            key={template.id}
            whileHover={{ y: -2 }}
            onClick={() => createFromTemplate(template.id)}
            className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              {template.category === 'contact' && <Mail className="w-5 h-5" />}
              {template.category === 'marketing' && <Zap className="w-5 h-5" />}
              {template.category === 'feedback' && <Users className="w-5 h-5" />}
              {!['contact', 'marketing', 'feedback'].includes(template.category || '') && <FileText className="w-5 h-5" />}
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{template.name}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 mb-4">{template.description}</p>
            <div className="mt-auto flex items-center text-[10px] font-bold text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Use Template</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </motion.button>
        ))}
        
        {/* Custom Start Blank Option */}
        <motion.button
          whileHover={{ y: -2 }}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
          onClick={() => {
             // This would normally trigger the same modal as "Create New Form"
             // For now we'll just let the dashboard handle it
             document.getElementById('create-form-btn')?.click();
          }}
        >
          <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white transition-colors">
            <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
          </div>
          <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 uppercase tracking-widest">Blank Form</span>
        </motion.button>
      </div>
    </div>
  );
}
