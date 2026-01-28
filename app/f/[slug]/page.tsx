'use client';

import React, { useEffect, useState, use } from 'react';
import api from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Send, Star, ChevronDown } from 'lucide-react';
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
  primaryColor: string;
  backgroundColor: string;
  buttonColor: string;
  textColor: string;
  fields: Field[];
}


export default function PublicForm({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [submissionSettings, setSubmissionSettings] = useState<{ successMessage: string | null; redirectUrl: string | null } | null>(null);

  useEffect(() => {
    fetchForm();
  }, [slug]);

  // Handle auto-redirect
  useEffect(() => {
    if (status === 'success' && submissionSettings?.redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = submissionSettings.redirectUrl!;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, submissionSettings]);

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
      const res = await api.post(`/forms/${form.id}/responses`, { values });
      setSubmissionSettings(res.data.settings);
      setStatus('success');
      toast.success('Response submitted successfully!');
    } catch (err: any) {
      setStatus('ready');
      toast.error(err.response?.data?.message || 'Submission failed. Please check your answers.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl text-center shadow-sm">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Form Unavailable</h1>
          <p className="text-slate-500">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: form?.backgroundColor }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-slate-100 p-12 rounded-[3rem] text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]"
        >
          <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-10 text-green-500 border border-green-100 shadow-sm shadow-green-100">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
            {submissionSettings?.redirectUrl ? 'Redirecting...' : 'Response Captured'}
          </h1>
          <p className="text-slate-500 mb-10 font-medium leading-relaxed">
            {submissionSettings?.successMessage || 'Thank you for your valuable input. Your data has been securely synced to our servers.'}
          </p>
          
          {!submissionSettings?.redirectUrl ? (
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all text-xs uppercase tracking-[0.2em] shadow-lg shadow-slate-200"
            >
              Submit another response
            </button>
          ) : (
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
              Taking you to the next step...
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-12 md:py-24 px-6 transition-colors duration-500 flex items-center justify-center"
      style={{ backgroundColor: form?.backgroundColor }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] overflow-hidden"
      >
        <div className="p-8 md:p-16">
          <header className="mb-12">
            <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase text-slate-900">{form?.title}</h1>
            <div 
              className="h-1.5 w-16 rounded-full" 
              style={{ backgroundColor: form?.primaryColor }}
            />
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
                <label 
                  className="text-sm font-bold tracking-tight text-slate-700 uppercase"
                >
                  {field.label}
                  {field.required && <span className="ml-1" style={{ color: form?.primaryColor }}>*</span>}
                </label>
              </div>
              
              {field.description && (
                <p 
                  className="text-[13px] leading-relaxed text-slate-500 font-medium"
                >
                  {field.description}
                </p>
              )}

              <div className="relative">
                {(field.type.key === 'text' || field.type.key === 'email' || field.type.key === 'url' || field.type.key === 'phone') && (
                  <input
                    type={field.type.key === 'email' ? 'email' : field.type.key === 'url' ? 'url' : field.type.key === 'phone' ? 'tel' : 'text'}
                    required={field.required}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium"
                    placeholder={
                      field.type.key === 'email' ? 'yourname@example.com' : 
                      field.type.key === 'url' ? 'https://example.com' : 
                      field.type.key === 'phone' ? '+1 (555) 000-0000' : 
                      'Type your answer...'
                    }
                  />
                )}

                {field.type.key === 'number' && (
                  <input
                    type="number"
                    required={field.required}
                    onChange={(e) => handleInputChange(field.id, Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-5 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium"
                  />
                )}

                {field.type.key === 'date' && (
                  <input
                    type="date"
                    required={field.required}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-5 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium"
                  />
                )}

                {field.type.key === 'boolean' && (
                  <div className="flex items-center space-x-4">
                    {['True', 'False'].map((opt) => {
                      const isSelected = values[field.id] === (opt === 'True');
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleInputChange(field.id, opt === 'True')}
                          style={{ 
                            backgroundColor: isSelected ? form?.primaryColor : 'transparent',
                            borderColor: isSelected ? form?.primaryColor : '#e2e8f0',
                            color: isSelected ? '#fff' : '#475569'
                          }}
                          className={`px-8 py-3 rounded-xl font-bold transition-all border text-sm ${
                            isSelected ? 'shadow-lg shadow-blue-100' : 'hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {field.type.key === 'select' && (
                  <div className="space-y-3">
                    {field.options.map((opt) => {
                      const isSelected = (values[field.id] || [])[0] === opt.value;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleInputChange(field.id, [opt.value])}
                          className="w-full flex items-center p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 transition-all group"
                        >
                          <div 
                            style={{ 
                              borderColor: isSelected ? form?.primaryColor : '#e2e8f0',
                              backgroundColor: isSelected ? form?.primaryColor : 'white'
                            }}
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mr-4"
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className={`text-sm tracking-tight ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}`}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {field.type.key === 'multiselect' && (
                  <div className="space-y-3">
                    {field.options.map((opt) => {
                      const isSelected = (values[field.id] || []).includes(opt.value);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleMultiselect(field.id, opt.value)}
                          className="w-full flex items-center p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 transition-all group"
                        >
                          <div 
                            style={{ 
                              borderColor: isSelected ? form?.primaryColor : '#e2e8f0',
                              backgroundColor: isSelected ? form?.primaryColor : 'white'
                            }}
                            className="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all mr-4"
                          >
                            {isSelected && (
                              <motion.svg 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-3 h-3 text-white" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor" 
                                strokeWidth={4}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </motion.svg>
                            )}
                          </div>
                          <span className={`text-sm tracking-tight ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}`}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {field.type.key === 'rating' && (
                  <div className="flex items-center space-x-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleInputChange(field.id, star)}
                        className="transition-transform active:scale-95"
                      >
                        <Star 
                          className={`w-10 h-10 transition-all ${values[field.id] >= star ? 'fill-current' : 'fill-transparent'}`}
                          style={{ 
                            color: values[field.id] >= star ? form?.primaryColor : '#cbd5e1',
                            fill: values[field.id] >= star ? form?.primaryColor : 'transparent'
                          }}
                        />
                      </button>
                    ))}
                    {values[field.id] && (
                      <span className="text-xl font-black ml-4" style={{ color: form?.primaryColor }}>{values[field.id]}</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          <div className="pt-10">
            <button
              type="submit"
              disabled={status === 'submitting'}
              style={{ 
                backgroundColor: form?.buttonColor, 
              }}
              className="w-full h-16 font-black uppercase tracking-[0.2em] rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3 group shadow-xl shadow-blue-100 hover:brightness-110 text-white"
            >
              {status === 'submitting' ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                <>
                  <span>Submit Response</span>
                  <Send className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold mt-8 uppercase tracking-[0.15em] leading-loose">
              By submitting, you agree to secure data processing via FormFlow Node infra.
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  </div>
  );
}
