'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Lock, 
  Mail, 
  Save, 
  Loader2, 
  ChevronLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, updateProfile, changePassword, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    } else if (user) {
      setEmail(user.email);
    }
  }, [user, authLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setMessage(null);
    try {
      await updateProfile(email);
      toast.success('Profile updated successfully');
      setMessage({ type: 'success', text: 'Email updated successfully.' });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Update failed';
      toast.error(msg);
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    setMessage(null);
    try {
      await changePassword(oldPassword, newPassword);
      toast.success('Password changed successfully');
      setMessage({ type: 'success', text: 'Password changed successfully.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Change failed';
      toast.error(msg);
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8 lg:p-12">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold uppercase tracking-widest mb-10 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        <header className="mb-12">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your personal information and security.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Navigation */}
          <div className="md:col-span-1 space-y-2">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Preferences</div>
             <button className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-100 text-blue-600 rounded-xl font-bold text-sm">
                <User className="w-4 h-4" />
                <span>My Profile</span>
             </button>
          </div>

          {/* Forms */}
          <div className="md:col-span-2 space-y-12">
            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-xl border text-xs font-semibold flex items-center space-x-3 ${
                    message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile Section */}
            <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-8 border-b border-slate-100 pb-4">
                <Mail className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[11px]">Primary Credentials</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Email Address</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isUpdatingProfile || email === user.email}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Update Profile</span>
                  </button>
                </div>
              </form>
            </section>

            {/* Security Section */}
            <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-8 border-b border-slate-100 pb-4">
                <ShieldCheck className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[11px]">Password & Security</h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Current Password</label>
                  <input 
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">New Password</label>
                    <input 
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Confirm New</label>
                    <input 
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isChangingPassword}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isChangingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>Change Password</span>
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
