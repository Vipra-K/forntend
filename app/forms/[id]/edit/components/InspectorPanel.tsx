'use client';

import React, { useState } from 'react';
import { 
  Settings2, 
  Plus, 
  Loader2, 
  Save,
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
import { Field } from '../types';

interface InspectorPanelProps {
  field: Field;
  onClose: () => void;
  onSave: (data: Partial<Field> & { options?: string[] }) => Promise<void>;
}

export function InspectorPanel({ field, onClose, onSave }: InspectorPanelProps) {
  const [label, setLabel] = useState(field.label);
  const [description, setDescription] = useState(field.description || '');
  const [required, setRequired] = useState(field.required);
  const [options, setOptions] = useState<string[]>(field.options.map(o => o.label));
  
  // Validation state
  const [minLength, setMinLength] = useState(field.minLength?.toString() || '');
  const [maxLength, setMaxLength] = useState(field.maxLength?.toString() || '');
  const [minValue, setMinValue] = useState(field.minValue?.toString() || '');
  const [maxValue, setMaxValue] = useState(field.maxValue?.toString() || '');
  const [pattern, setPattern] = useState(field.pattern || '');
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const updates: any = { 
      label, 
      description, 
      required,
      minLength: minLength ? parseInt(minLength) : null,
      maxLength: maxLength ? parseInt(maxLength) : null,
      minValue: minValue ? parseFloat(minValue) : null,
      maxValue: maxValue ? parseFloat(maxValue) : null,
      pattern: pattern || null
    };
    
    if (field.type.key === 'select' || field.type.key === 'multiselect') {
      updates.options = options.filter(l => l.trim().length > 0);
    }

    await onSave(updates);
    setIsSaving(false);
  };

  const isStringField = ['text', 'email', 'url', 'phone'].includes(field.type.key);
  const isNumberField = ['number', 'rating'].includes(field.type.key);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-blue-50 rounded text-blue-600">
            {field.type.key === 'text' && <Type className="w-3.5 h-3.5" />}
            {field.type.key === 'number' && <Hash className="w-3.5 h-3.5" />}
            {field.type.key === 'select' && <ChevronDown className="w-3.5 h-3.5" />}
            {field.type.key === 'multiselect' && <ListChecks className="w-3.5 h-3.5" />}
            {field.type.key === 'date' && <Calendar className="w-3.5 h-3.5" />}
            {field.type.key === 'boolean' && <CheckSquare className="w-3.5 h-3.5" />}
            {field.type.key === 'email' && <Mail className="w-3.5 h-3.5" />}
            {field.type.key === 'url' && <Link2 className="w-3.5 h-3.5" />}
            {field.type.key === 'phone' && <Phone className="w-3.5 h-3.5" />}
            {field.type.key === 'rating' && <Star className="w-3.5 h-3.5" />}
          </div>
          <h3 className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">
            {field.type.key} Properties
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Label</label>
          <input 
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-slate-700"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 h-24 transition-all resize-none text-slate-600 font-medium"
          />
        </div>

        {(field.type.key === 'select' || field.type.key === 'multiselect') && (
           <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Options</label>
              <div className="space-y-2">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center space-x-2 group">
                    <div className={`w-4 h-4 border-2 border-slate-200 ${field.type.key === 'select' ? 'rounded-full' : 'rounded-md'}`} />
                    <input 
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="flex-1 bg-transparent border-b border-transparent hover:border-slate-100 focus:border-blue-600 focus:outline-none py-1.5 px-2 text-sm font-medium text-slate-700 transition-all"
                      placeholder={`Option ${index + 1}`}
                      autoFocus={index === options.length - 1 && opt === ''}
                    />
                    <button 
                      onClick={() => {
                        const newOptions = options.filter((_, i) => i !== index);
                        setOptions(newOptions);
                      }}
                      className="p-1 px-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-lg font-light"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={() => setOptions([...options, ''])}
                  className="flex items-center space-x-2 text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors p-2 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Option</span>
                </button>
              </div>
           </div>
        )}

        {/* Validation Section */}
        <div className="pt-2">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
             <div className="h-px flex-1 bg-slate-100 mr-3" />
             Validation
             <div className="h-px flex-1 bg-slate-100 ml-3" />
           </div>

           <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-slate-700">Required Field</span>
                <button 
                  onClick={() => setRequired(!required)}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    required ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                    required ? 'left-[22px]' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {field.type.key === 'text' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Min Length</label>
                    <input 
                      type="number"
                      value={minLength}
                      onChange={(e) => setMinLength(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Max Length</label>
                    <input 
                      type="number"
                      value={maxLength}
                      onChange={(e) => setMaxLength(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {field.type.key === 'number' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Min Value</label>
                    <input 
                      type="number"
                      value={minValue}
                      onChange={(e) => setMinValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Max Value</label>
                    <input 
                      type="number"
                      value={maxValue}
                      onChange={(e) => setMaxValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
           </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
