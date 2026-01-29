'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Bell, 
  CreditCard, 
  Save,
  Loader2,
  Key,
  Check
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
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="max-w-6xl px-8 lg:px-12 py-12">
      <header className="mb-12">
        <div className="flex items-center space-x-2 text-blue-600 mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Account</span>
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Settings</h1>
        <p className="text-slate-500 font-medium text-base">Manage your account preferences and security settings.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
                {activeTab === item.id && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm"
              >
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="pb-6 border-b border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 mb-1">Profile Information</h3>
                    <p className="text-sm text-slate-500">Update your account email address and personal details.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="email"
                        required
                        value={profile.email}
                        onChange={(e) => setProfile({ email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
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
                className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm"
              >
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="pb-6 border-b border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 mb-1">Security Settings</h3>
                    <p className="text-sm text-slate-500">Keep your account secure with a strong password.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="password"
                        required
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="password"
                        required
                        minLength={6}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="password"
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        placeholder="Re-enter new password"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-slate-100 rounded-2xl p-16 shadow-sm text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Notification Preferences</h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
                  Configure how and when you want to receive alerts about form submissions and account activity.
                </p>
                <div className="inline-flex px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">
                  Coming Soon
                </div>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div 
                key="billing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-slate-100 rounded-2xl p-16 shadow-sm text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Billing & Subscription</h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
                  Manage your subscription plan, payment methods, and view billing history.
                </p>
                <div className="inline-flex px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">
                  Coming Soon
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
