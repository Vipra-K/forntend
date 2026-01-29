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
  Star,
  FileText,
  AlignLeft
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

const fieldIcons: Record<string, any> = {
  'text': Type,
  'number': Hash,
  'select': ChevronDown,
  'multiselect': ListChecks,
  'date': Calendar,
  'boolean': CheckSquare,
  'email': Mail,
  'url': Link2,
  'phone': Phone,
  'rating': Star,
  'textarea': AlignLeft,
  'file': FileText
};

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
    <aside className="w-80 border-r border-slate-100 flex flex-col bg-white flex-shrink-0">
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setActiveSidebarTab('elements')}
          className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeSidebarTab === 'elements' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Elements
        </button>
        <button 
          onClick={() => setActiveSidebarTab('theme')}
          className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeSidebarTab === 'theme' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Theme
        </button>
        <button 
          onClick={() => setActiveSidebarTab('settings')}
          className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeSidebarTab === 'settings' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Settings
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
        {activeSidebarTab === 'elements' ? (
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-4">Add Fields</h3>
            <div className="grid grid-cols-1 gap-2">
              {fieldTypes.map((type) => {
                const Icon = fieldIcons[type.key] || Type;
                return (
                  <button
                    key={type.id}
                    onClick={() => addField(type.id)}
                    className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all text-sm group"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                    </div>
                    <span className="font-semibold text-slate-700 group-hover:text-blue-600 capitalize">{type.key}</span>
                  </button>
                );
              })}
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

        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Tips</h3>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {activeSidebarTab === 'elements'
                ? 'Click to add fields to your form. Drag the grip icon to reorder them.'
                : activeSidebarTab === 'theme'
                  ? 'Customize colors and fonts. Changes apply to the public form view.'
                  : 'Configure submission limits, scheduling, and success messages.'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
