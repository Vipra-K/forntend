'use client';

import React, { useState } from 'react';
import { Settings, Save, Loader2, Globe, Clock, ShieldCheck, MessageSquare } from 'lucide-react';
import { Form } from '../types';

interface SettingsPanelProps {
  form: Form;
  onUpdate: (updates: any) => Promise<void>;
}

export function SettingsPanel({ form, onUpdate }: SettingsPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState(form.settings || {
    maxSubmissions: null,
    allowMultipleSubmissions: true,
    openAt: null,
    closeAt: null,
    successMessage: 'Thank you for your response!',
    redirectUrl: null,
  });

  // Helper to format date for datetime-local without UTC shift
  const formatToLocalISO = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate({ settings });
    setIsSaving(false);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Submission Limits */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-slate-800">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <h4 className="text-[11px] font-black uppercase tracking-widest">Submission Control</h4>
        </div>
        
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700">Multiple Submissions</span>
              <p className="text-[10px] text-slate-400 font-medium">Allow one user to submit multiple times</p>
            </div>
            <button 
              onClick={() => updateSetting('allowMultipleSubmissions', !settings.allowMultipleSubmissions)}
              className={`w-9 h-5 rounded-full transition-all relative ${
                settings.allowMultipleSubmissions ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                settings.allowMultipleSubmissions ? 'left-[18px]' : 'left-0.5'
              }`} />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Max Submissions</label>
            <input 
              type="number"
              value={settings.maxSubmissions || ''}
              onChange={(e) => updateSetting('maxSubmissions', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Unlimited"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
            />
          </div>
        </div>
      </section>

      {/* Scheduling */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-slate-800">
          <Clock className="w-4 h-4 text-orange-500" />
          <h4 className="text-[11px] font-black uppercase tracking-widest">Scheduling</h4>
        </div>
        
        <div className="grid grid-cols-1 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Open At</label>
            <input 
              type="datetime-local"
              value={formatToLocalISO(settings.openAt)}
              onChange={(e) => updateSetting('openAt', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Close At</label>
            <input 
              type="datetime-local"
              value={formatToLocalISO(settings.closeAt)}
              onChange={(e) => updateSetting('closeAt', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
            />
          </div>
        </div>
      </section>

      {/* Post-Submission */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-slate-800">
          <MessageSquare className="w-4 h-4 text-purple-500" />
          <h4 className="text-[11px] font-black uppercase tracking-widest">Post-Submission</h4>
        </div>
        
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Success Message</label>
            <textarea 
              value={settings.successMessage || ''}
              onChange={(e) => updateSetting('successMessage', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 h-20 transition-all resize-none font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Redirect URL</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                value={settings.redirectUrl || ''}
                onChange={(e) => updateSetting('redirectUrl', e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-3 py-3 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="pt-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-xs flex items-center justify-center space-x-2 shadow-lg shadow-slate-100 active:scale-[0.98] disabled:opacity-70 uppercase tracking-widest"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
}
