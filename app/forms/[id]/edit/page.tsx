'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { 
  Settings2, 
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Shared Types
import { Form, FieldType, Field } from './types';

// Components
import { InspectorPanel } from './components/InspectorPanel';
import { EditorSidebar } from './components/EditorSidebar';
import { EditorCanvas } from './components/EditorCanvas';

export default function FormEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'elements' | 'theme' | 'settings'>('elements');

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

      // Ensure form data includes settings from response
      const formData = formRes.data;
      
      const versions = versionsRes.data;
      const latestDraft = versions.find((v: any) => !v.publishedAt && !v.closedAt);
      const activeVer = versions.find((v: any) => v.isActive);

      if (latestDraft) {
        setActiveVersionId(latestDraft.id);
        try {
          const draftDetails = await api.get(`/forms/${id}/versions/${latestDraft.id}`);
          setForm({ 
            ...formData, 
            version: latestDraft.version,
            fields: draftDetails.data.fields 
          }); 
        } catch (err) {
          console.error("Failed to load draft details, falling back to form defaults", err);
          setForm(formData);
        }
      } else if (activeVer) {
        try {
          const newVersionRes = await api.post(`/forms/${id}/versions`);
          setActiveVersionId(newVersionRes.data.versionId);
          setForm({
             ...formData,
             version: newVersionRes.data.version,
             fields: newVersionRes.data.fields
          });
          toast.success(`Started new draft: Version ${newVersionRes.data.version}`);
        } catch (err) {
          console.error("Failed to auto-create draft", err);
          setActiveVersionId(activeVer.id);
          setForm(formData);
        }
      } else {
        setForm(formData);
      }
    } catch (err) {
      console.error('Failed to load editor', err);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const ensureDraft = async (fieldId?: string) => {
    if (!form) return { vid: null, fid: fieldId };
    
    const versionsRes = await api.get(`/forms/${id}/versions`);
    const current = versionsRes.data.find((v: any) => v.id === activeVersionId);

    if (current && (current.publishedAt || current.closedAt)) {
      const newVersionRes = await api.post(`/forms/${id}/versions`);
      const { versionId: newVid, fields: newFields } = newVersionRes.data;
      
      let newFid = null;
      
      if (fieldId) {
        const oldField = form.fields.find(f => f.id === fieldId);
        if (oldField) {
          let match = newFields.find((f: any) => 
            f.label === oldField.label && 
            f.order === oldField.order &&
            f.type.key === oldField.type.key
          );

          if (!match) {
            match = newFields.find((f: any) => f.order === oldField.order);
          }

          if (!match) {
            const oldIndex = form.fields.findIndex(f => f.id === fieldId);
            if (oldIndex >= 0 && newFields[oldIndex]) {
              match = newFields[oldIndex];
            }
          }

          if (match) newFid = match.id;
        }
      }

      setForm({
        ...form,
        fields: newFields,
        version: newVersionRes.data.version
      });
      setActiveVersionId(newVid);
      
      if (newFid) {
        setActiveFieldId(newFid);
        return { vid: newVid, fid: newFid };
      } else {
        setActiveFieldId(null);
        return { vid: newVid, fid: null };
      }
    }
    return { vid: activeVersionId, fid: fieldId };
  };

  const addField = async (typeId: string) => {
    if (!form) return;
    const type = fieldTypes.find(t => t.id === typeId);
    if (!type) return;

    try {
      const { vid } = await ensureDraft();
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
      toast.success('Field added');
    } catch (err) {
      toast.error('Failed to add field');
    }
  };

  const deleteField = async (fieldId: string) => {
    try {
      const { vid, fid } = await ensureDraft(fieldId);
      if (!vid || !fid) return;
      await api.delete(`/form-versions/${vid}/fields/${fid}`);
      await fetchData();
      toast.success('Field deleted');
    } catch (err) {
      toast.error('Failed to delete field');
    }
  };

  const handleReorder = async (newFields: Field[]) => {
    if (!activeVersionId || !form) return;
    
    // Optimistic Update: Sync local state with new array order
    setForm(prev => prev ? { ...prev, fields: [...newFields] } : null);

    try {
      const payload = {
        fields: newFields.map((f, index) => ({
          fieldId: f.id,
          order: index
        }))
      };

      await api.put(`/form-versions/${activeVersionId}/fields/reorder`, payload);
      // Optional: No need to fetch data again if API succeeds, 
      // as our local state is already correct.
    } catch (err) {
      toast.error('Failed to save order');
      await fetchData(); // Revert on failure
    }
  };

  const handleThemeUpdate = async (updates: Partial<Form>) => {
    try {
      await api.patch(`/forms/${id}`, updates);
      if (form) setForm({ ...form, ...updates });
      toast.success('Theme updated');
    } catch (err) {
      toast.error('Failed to update theme');
    }
  };

  const handleSettingsUpdate = async (updates: any) => {
    try {
      const res = await api.patch(`/forms/${id}`, updates);
      if (form) setForm({ ...form, settings: res.data.settings });
      toast.success('Settings updated');
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  if (isLoading || !form) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const activeField = form.fields.find(f => f.id === activeFieldId);

  return (
    <div className="h-full flex overflow-hidden bg-slate-50">
      <EditorSidebar 
        activeSidebarTab={activeSidebarTab}
        setActiveSidebarTab={setActiveSidebarTab}
        fieldTypes={fieldTypes}
        addField={addField}
        form={form}
        onThemeUpdate={handleThemeUpdate}
        onSettingsUpdate={handleSettingsUpdate}
      />

      <EditorCanvas 
        form={form}
        activeFieldId={activeFieldId}
        setActiveFieldId={setActiveFieldId}
        handleReorder={handleReorder}
        deleteField={deleteField}
        addField={addField}
        fieldTypes={fieldTypes}
      />

      <aside className="w-80 border-l border-slate-200 flex flex-col bg-white flex-shrink-0">
        {activeFieldId && activeField ? (
          <InspectorPanel 
            key={activeFieldId}
            field={activeField} 
            onClose={() => setActiveFieldId(null)}
            onSave={async (updates) => {
              try {
                const { vid, fid } = await ensureDraft(activeFieldId);
                if (!vid || !fid) {
                  toast.error('Could not find draft version.');
                  return;
                }
                await api.patch(`/form-versions/${vid}/fields/${fid}`, updates);
                toast.success('Field saved');
                await fetchData();
              } catch (err) {
                toast.error('Failed to save field');
              }
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/20">
            <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center mb-3 shadow-sm">
              <Settings2 className="w-5 h-5 text-slate-300" />
            </div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Properties</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed max-w-[140px]">
              Select a field to edit its properties.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
