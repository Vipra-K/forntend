'use client';

import React from 'react';
import { 
  Type, 
  Hash, 
  ChevronDown, 
  ListChecks, 
  Calendar, 
  CheckSquare, 
  Mail, 
  Link2,
  Phone,
  Star
} from 'lucide-react';
import { ThemePanel } from './ThemePanel';
import { SettingsPanel } from './SettingsPanel';
import { FieldType, Form } from '../types';

interface EditorSidebarProps {
  activeSidebarTab: 'elements' | 'theme' | 'settings';
  setActiveSidebarTab: (tab: 'elements' | 'theme' | 'settings') => void;
  fieldTypes: FieldType[];
  addField: (typeId: string) => Promise<void>;
  form: Form;
  onThemeUpdate: (updates: Partial<Form>) => Promise<void>;
  onSettingsUpdate: (updates: any) => Promise<void>;
}

export function EditorSidebar({
  activeSidebarTab,
  setActiveSidebarTab,
  fieldTypes,
  addField,
  form,
  onThemeUpdate,
  onSettingsUpdate
}: EditorSidebarProps) {
  return (
    <aside className="w-80 border-r border-slate-200 flex flex-col bg-white flex-shrink-0">
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveSidebarTab('elements')}
          className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            activeSidebarTab === 'elements' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Elements
        </button>
        <button 
          onClick={() => setActiveSidebarTab('theme')}
          className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            activeSidebarTab === 'theme' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Theme
        </button>
        <button 
          onClick={() => setActiveSidebarTab('settings')}
          className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            activeSidebarTab === 'settings' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Settings
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {activeSidebarTab === 'elements' ? (
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Add Elements</h3>
            <div className="grid grid-cols-1 gap-2">
              {fieldTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addField(type.id)}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all text-sm group"
                >
                  <div className="w-8 h-8 bg-slate-50 rounded flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    {type.key === 'text' && <Type className="w-4 h-4" />}
                    {type.key === 'number' && <Hash className="w-4 h-4" />}
                    {type.key === 'select' && <ChevronDown className="w-4 h-4" />}
                    {type.key === 'multiselect' && <ListChecks className="w-4 h-4" />}
                    {type.key === 'date' && <Calendar className="w-4 h-4" />}
                    {type.key === 'boolean' && <CheckSquare className="w-4 h-4" />}
                    {type.key === 'email' && <Mail className="w-4 h-4" />}
                    {type.key === 'url' && <Link2 className="w-4 h-4" />}
                    {type.key === 'phone' && <Phone className="w-4 h-4" />}
                    {type.key === 'rating' && <Star className="w-4 h-4" />}
                  </div>
                  <span className="font-semibold text-slate-600 group-hover:text-blue-600 capitalize">{type.key}</span>
                </button>
              ))}
            </div>
          </div>
        ) : activeSidebarTab === 'theme' ? (
          <ThemePanel
            form={form}
            onUpdate={onThemeUpdate}
          />
        ) : (
          <SettingsPanel
            form={form}
            onUpdate={onSettingsUpdate}
          />
        )}

        <div className="pt-8 border-t border-slate-100">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Support</h3>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              {activeSidebarTab === 'elements'
                ? 'Click elements to add them to your form. Drag fields to reorder.'
                : activeSidebarTab === 'theme'
                  ? 'Customize your form style. These changes affect the public view.'
                  : 'Configure submission limits, scheduling, and post-submission actions.'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
