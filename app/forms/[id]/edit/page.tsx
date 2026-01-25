'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  Settings2, 
  Eye, 
  Rocket, 
  GripVertical,
  Type,
  Hash,
  CheckSquare,
  ChevronDown,
  Calendar,
  Layers,
  ArrowRight,
  Mail,
  ListChecks,
  Link2,
  Loader2,
  Globe,
  Lock,
  ShieldAlert,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

interface FieldType {
  id: string;
  key: string;
  valueKind: string;
  hasOptions: boolean;
}

interface Field {
  id: string;
  label: string;
  description: string;
  required: boolean;
  order: number;
  type: { key: string; id: string };
  options: { id: string; label: string; value: string }[];
}

interface Form {
  id: string;
  title: string;
  slug: string;
  version: number;
  fields: Field[];
}

export default function FormEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [formRes, typesRes, versionsRes] = await Promise.all([
        api.get(`/forms/${id}`),
        api.get('/field-types'),
        api.get(`/forms/${id}/versions`)
      ]);
      
      const fieldTypesData = typesRes.data;
      setFieldTypes(fieldTypesData);

      // 🎯 Logic: Find the latest DRAFT version. 
      // If no draft exists, use the active version but note that it's published.
      const versions = versionsRes.data;
      const latestDraft = versions.find((v: any) => !v.publishedAt && !v.closedAt);
      const activeVer = versions.find((v: any) => v.isActive);

      const targetVersion = latestDraft || activeVer;

      if (targetVersion) {
        setActiveVersionId(targetVersion.id);
        
        // If we are looking at a version that's NOT the 'active' one returned by /forms/:id,
        // we might need to fetch THAT specific version's fields if /forms/:id only returns active.
        // Actually our backend /forms/:id returns the ACTIVE version's fields.
        // If we want to edit a draft that isn't active yet, we need a way to get its fields.
        // I'll assume for now that the user is editing the latest version.
        setForm(formRes.data);
      }
    } catch (err) {
      console.error('Failed to load editor', err);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const ensureDraft = async () => {
    if (!form) return null;
    
    // Check if current activeVersionId is published
    const versionsRes = await api.get(`/forms/${id}/versions`);
    const current = versionsRes.data.find((v: any) => v.id === activeVersionId);

    if (current && (current.publishedAt || current.closedAt)) {
      // Create new draft
      const newVersionRes = await api.post(`/forms/${id}/versions`);
      const newId = newVersionRes.data.versionId;
      setActiveVersionId(newId);
      await fetchData();
      return newId;
    }
    return activeVersionId;
  };

  const addField = async (typeId: string) => {
    if (!form) return;
    const type = fieldTypes.find(t => t.id === typeId);
    if (!type) return;

    try {
      const vid = await ensureDraft();
      if (!vid) return;

      const payload: any = {
        label: `New ${type.key}`,
        fieldTypeId: typeId,
        required: false,
        order: form.fields.length
      };

      if (type.hasOptions) {
        payload.options = ['Option 1'];
      }

      const res = await api.post(`/form-versions/${vid}/fields`, payload);
      await fetchData();
      setActiveFieldId(res.data.id);
    } catch (err) {
      alert('Failed to add field');
    }
  };

  const deleteField = async (fieldId: string) => {
    try {
      const vid = await ensureDraft();
      if (!vid) return;
      await api.delete(`/form-versions/${vid}/fields/${fieldId}`);
      await fetchData();
    } catch (err) {
      alert('Failed to delete field');
    }
  };

  const publishForm = async () => {
    try {
      if (!activeVersionId) return;

      // 1. Publish current draft
      await api.put(`/forms/${id}/versions/${activeVersionId}/publish`);

      // 2. Activate it
      await api.put(`/forms/${id}/versions/${activeVersionId}/activate`);

      alert('Form published & live!');
      await fetchData();
    } catch (err) {
      alert('Publishing failed');
    }
  };


  if (isLoading || !form) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden bg-white">
      {/* Left Toolbar */}
      <aside className="w-72 border-r border-slate-200 p-6 space-y-8 bg-slate-50/50 overflow-y-auto">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Add Elements</h3>
          <div className="grid grid-cols-1 gap-2">
            {fieldTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => addField(type.id)}
                className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all text-sm group shadow-sm"
              >
                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  {type.key === 'text' && <Type className="w-4 h-4" />}
                  {type.key === 'number' && <Hash className="w-4 h-4" />}
                  {type.key === 'select' && <ChevronDown className="w-4 h-4" />}
                  {type.key === 'multiselect' && <ListChecks className="w-4 h-4" />}
                  {type.key === 'date' && <Calendar className="w-4 h-4" />}
                  {type.key === 'boolean' && <CheckSquare className="w-4 h-4" />}
                  {type.key === 'email' && <Mail className="w-4 h-4" />}
                  {type.key === 'url' && <Link2 className="w-4 h-4" />}
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-blue-600 capitalize">{type.key}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Support</h3>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Click elements to add them to your form. Drag to reorder, and click to configure settings.
            </p>
          </div>
        </div>
      </aside>

      {/* Center Canvas */}
      <main className="flex-1 bg-slate-50 p-12 overflow-y-auto scrollbar-hide">
        <div className="max-w-2xl mx-auto flex flex-col space-y-6">
          {form.fields.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white shadow-sm">
              <Layers className="w-10 h-10 text-slate-300 mb-4" />
              <p className="text-slate-400 font-medium text-sm">Your form is empty. Add elements to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {form.fields.map((field) => (
                <motion.div
                  key={field.id}
                  layoutId={field.id}
                  onClick={() => setActiveFieldId(field.id)}
                  className={`group bg-white border p-6 rounded-xl transition-all cursor-pointer relative shadow-sm ${
                    activeFieldId === field.id ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="absolute left-[-32px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-slate-300" />
                  </div>

                  <div className="flex justify-between items-start mb-3">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 rounded">
                      {field.type.key}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                      className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 mb-1">{field.label || 'Untitled Question'}</h4>
                  <p className="text-xs text-slate-500 mb-6">{field.description || 'No description provided'}</p>
                  
                  <div className="w-full h-10 bg-slate-50 border border-slate-100 rounded px-4 flex items-center text-slate-300 text-[11px] font-medium">
                    Input field preview...
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <button 
            onClick={() => addField(fieldTypes[0]?.id)}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 transition-all font-semibold flex items-center justify-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Field</span>
          </button>
        </div>
      </main>

      {/* Right Inspector */}
      <AnimatePresence>
        {activeFieldId && (
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className="w-80 border-l border-slate-200 bg-white shadow-xl overflow-hidden"
          >
            <div key={activeFieldId} className="h-full p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-10">
                <h3 className="font-bold flex items-center space-x-2 text-slate-900 uppercase tracking-widest text-[10px]">
                  <Settings2 className="w-4 h-4 text-blue-600" />
                  <span>Field Properties</span>
                </h3>
                <button onClick={() => setActiveFieldId(null)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Label</label>
                  <input 
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                    placeholder="e.g. Full Name"
                    defaultValue={form.fields.find(f => f.id === activeFieldId)?.label}
                    onBlur={async (e) => {
                      try {
                        await api.patch(`/form-versions/${activeVersionId}/fields/${activeFieldId}`, { label: e.target.value });
                        await fetchData();
                      } catch (err) {}
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 h-24 transition-all"
                    placeholder="Describe how to answer this..."
                    defaultValue={form.fields.find(f => f.id === activeFieldId)?.description}
                    onBlur={async (e) => {
                      try {
                        await api.patch(`/form-versions/${activeVersionId}/fields/${activeFieldId}`, { description: e.target.value });
                        await fetchData();
                      } catch (err) {}
                    }}
                  />
                </div>

                {(form.fields.find(f => f.id === activeFieldId)?.type.key === 'select' || 
                  form.fields.find(f => f.id === activeFieldId)?.type.key === 'multiselect') && (
                   <div className="space-y-4 pt-4 border-t border-slate-100">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Options (One per line)</label>
                      <textarea 
                        className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 h-32 transition-all"
                        placeholder="Option 1&#10;Option 2..."
                        defaultValue={form.fields.find(f => f.id === activeFieldId)?.options.map(o => o.label).join('\n')}
                        onBlur={async (e) => {
                          const options = e.target.value.split('\n').filter(l => l.trim().length > 0);
                          try {
                            await api.patch(`/form-versions/${activeVersionId}/fields/${activeFieldId}`, { options });
                            await fetchData();
                          } catch (err) {}
                        }}
                      />
                   </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700">Required</span>
                  <button 
                    onClick={async () => {
                      const field = form.fields.find(f => f.id === activeFieldId);
                      if (!field || !activeVersionId) return;
                      
                      try {
                        setForm({
                          ...form,
                          fields: form.fields.map(f => 
                            f.id === activeFieldId ? { ...f, required: !f.required } : f
                          )
                        });
                        
                        await api.patch(`/form-versions/${activeVersionId}/fields/${activeFieldId}`, { 
                          required: !field.required 
                        });
                        await fetchData();
                      } catch (err) {
                        await fetchData();
                      }
                    }}
                    className={`w-10 h-5 rounded-full transition-all relative ${
                      form.fields.find(f => f.id === activeFieldId)?.required ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                      form.fields.find(f => f.id === activeFieldId)?.required ? 'left-[22px]' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
