'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Loader2, ArrowRight, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welcome back!');
      } else {
        await register(email, password);
        toast.success('Account created successfully');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Authentication failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white border border-slate-200 p-8 lg:p-12 rounded-2xl shadow-xl">
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h1>
            <p className="text-sm text-slate-500">
              {isLogin 
                ? 'Welcome back. Please enter your details.' 
                : 'Enter your information below to get started.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="bg-red-50 border border-red-100 text-red-600 text-[11px] font-semibold uppercase tracking-wider p-3 rounded-lg flex items-center space-x-2"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ml-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg shadow-sm hover:bg-blue-700 flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-slate-500 hover:text-blue-600 transition-colors text-xs font-medium"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-[10px] font-medium tracking-wide">
          © 2026 FormBuilder Inc. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
