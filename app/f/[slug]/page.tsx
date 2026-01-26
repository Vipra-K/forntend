'use client';

import React, { useEffect, useState, use } from 'react';
import api from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Field {
  id: string;
  label: string;
  description: string;
  required: boolean;
  type: { key: string };
  options: { id: string; label: string; value: string }[];
}

interface Form {
  id: string;
  title: string;
  fields: Field[];
}

export default function PublicForm({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchForm();
  }, [slug]);

  const fetchForm = async () => {
    try {
      const res = await api.get(`/forms/slug/${slug}`);
      setForm(res.data);
      setStatus('ready');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Form not found');
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const toggleMultiselect = (fieldId: string, optionValue: string) => {
    const currentValues = values[fieldId] || [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v: string) => v !== optionValue)
      : [...currentValues, optionValue];
    handleInputChange(fieldId, newValues);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setStatus('submitting');
    try {
      await api.post(`/forms/${form.id}/responses`, { values });
      setStatus('success');
      toast.success('Response submitted successfully!');
    } catch (err: any) {
      setStatus('ready');
      toast.error(err.response?.data?.message || 'Submission failed. Please check your answers.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 p-8 rounded-[3rem] text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">Form Unavailable</h1>
          <p className="text-slate-400">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 border border-white/10 p-12 rounded-[3.5rem] text-center shadow-2xl backdrop-blur-xl"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Response Captured</h1>
          <p className="text-slate-400 mb-8">Thank you for your input. Your data has been securely synced.</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-purple-400 font-semibold hover:text-purple-300 transition-colors"
          >
            Submit another response
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 lg:p-24 selection:bg-purple-500 selection:text-white">
      <div className="max-w-xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase">{form?.title}</h1>
          <div className="h-1 w-12 bg-purple-600 rounded-full" />
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          {form?.fields.map((field) => (
            <motion.div 
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 group"
            >
              <div className="flex items-baseline justify-between">
                <label className="text-lg font-bold tracking-tight text-slate-300 group-focus-within:text-purple-400 transition-colors">
                  {field.label}
                  {field.required && <span className="text-purple-500 ml-1">*</span>}
                </label>
              </div>
              
              {field.description && (
                <p className="text-sm text-slate-500 leading-relaxed">{field.description}</p>
              )}

              <div className="relative">
                {(field.type.key === 'text' || field.type.key === 'email' || field.type.key === 'url') && (
                  <input
                    type={field.type.key === 'email' ? 'email' : field.type.key === 'url' ? 'url' : 'text'}
                    required={field.required}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-white/5 border-b-2 border-white/10 p-4 focus:outline-none focus:border-purple-600 focus:bg-white/[0.08] transition-all text-white placeholder:text-slate-700"
                    placeholder={field.type.key === 'email' ? 'yourname@example.com' : field.type.key === 'url' ? 'https://example.com' : 'Type your answer...'}
                  />
                )}

                {field.type.key === 'number' && (
                  <input
                    type="number"
                    required={field.required}
                    onChange={(e) => handleInputChange(field.id, Number(e.target.value))}
                    className="w-full bg-white/5 border-b-2 border-white/10 p-4 focus:outline-none focus:border-purple-600 focus:bg-white/[0.08] transition-all text-white"
                  />
                )}

                {field.type.key === 'date' && (
                  <input
                    type="date"
                    required={field.required}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-white/5 border-b-2 border-white/10 p-4 focus:outline-none focus:border-purple-600 focus:bg-white/[0.08] transition-all text-white"
                  />
                )}

                {field.type.key === 'boolean' && (
                  <div className="flex items-center space-x-6">
                    {['True', 'False'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleInputChange(field.id, opt === 'True')}
                        className={`px-8 py-3 rounded-2xl font-bold transition-all border ${
                          values[field.id] === (opt === 'True')
                            ? 'bg-purple-600 border-purple-600 shadow-lg shadow-purple-500/20'
                            : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {field.type.key === 'multiselect' && (
                  <div className="flex flex-wrap gap-3">
                    {field.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleMultiselect(field.id, opt.value)}
                        className={`px-6 py-3 rounded-2xl font-medium transition-all border ${
                          (values[field.id] || []).includes(opt.value)
                            ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/20'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {field.type.key === 'select' && (
                  <select
                    required={field.required}
                    onChange={(e) => handleInputChange(field.id, [e.target.value])}
                    className="w-full bg-white/5 border-b-2 border-white/10 p-4 focus:outline-none focus:border-purple-600 focus:bg-white/[0.08] transition-all text-white appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0f172a]">Select an option</option>
                    {field.options.map((opt) => (
                      <option key={opt.id} value={opt.value} className="bg-[#0f172a]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </motion.div>
          ))}

          <div className="pt-10">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full h-16 bg-white text-black font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-purple-600 hover:text-white transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3 group"
            >
              {status === 'submitting' ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                <>
                  <span>Submit Sync</span>
                  <Send className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-600 mt-6 uppercase tracking-widest leading-loose">
              By submitting, you agree to secure data processing via FormFlow Node infra.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
