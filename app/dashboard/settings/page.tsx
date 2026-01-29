'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Bell, 
  Globe, 
  Save,
  Loader2,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import { toast } from 'sonner';

type TabId = 'profile' | 'security' | 'notifications' | 'billing';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/me');
      setProfile({ email: res.data.email });
    } catch (err) {
      console.error('Failed to fetch profile', err);
      toast.error('Failed to load profile settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch('/auth/me', { email: profile.email });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      await api.patch('/auth/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl px-8 lg:px-12 py-12">
      <header className="mb-12">
        <div className="flex items-center space-x-2 text-blue-600 mb-2">
          <Shield className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Account</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your personal profile and account preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-2">
          {( [
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'billing', label: 'Billing', icon: Globe },
          ] as const).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 ripple-effect' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm"
              >
                <form onSubmit={handleProfileUpdate} className="space-y-8">
                  <div className="pb-8 border-b border-slate-100 mb-8">
                    <h3 className="text-lg font-black text-slate-900">Profile Information</h3>
                    <p className="text-sm text-slate-500 font-medium">Update your account email address.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="email"
                        required
                        value={profile.email}
                        onChange={(e) => setProfile({ email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="bg-slate-900 text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center space-x-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-70"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{isSaving ? 'Updating...' : 'Save Profile'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm"
              >
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="pb-8 border-b border-slate-100 mb-8">
                    <h3 className="text-lg font-black text-slate-900">Security</h3>
                    <p className="text-sm text-slate-500 font-medium">Protect your account with a secure password.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="password"
                        required
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="password"
                        required
                        minLength={6}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                        placeholder="Min. 6 characters"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="password"
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                        placeholder="Re-type new password"
                      />
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="bg-slate-900 text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center space-x-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-70"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{isSaving ? 'Saving...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                className="bg-white border border-slate-200 rounded-[2.5rem] p-16 shadow-sm text-center"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Notification Settings</h3>
                <p className="text-slate-500 mt-2 font-medium">Configure how and when you want to receive alerts.</p>
                <button className="mt-8 px-8 py-3 bg-slate-100 text-slate-400 cursor-not-allowed rounded-xl text-[10px] font-black uppercase tracking-widest">Coming Soon</button>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div 
                key="billing"
                className="bg-white border border-slate-200 rounded-[2.5rem] p-16 shadow-sm text-center"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Billing & Plans</h3>
                <p className="text-slate-500 mt-2 font-medium">Manage your subscription and view payment history.</p>
                <button className="mt-8 px-8 py-3 bg-slate-100 text-slate-400 cursor-not-allowed rounded-xl text-[10px] font-black uppercase tracking-widest">Coming Soon</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
