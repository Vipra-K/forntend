'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { 
  ChevronLeft, 
  Download, 
  Search, 
  Trash2, 
  Calendar, 
  Users, 
  BarChart3,
  ExternalLink,
  Loader2,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Response {
  id: string;
  submittedAt: string;
  answers: {
    fieldId: string;
    label: string;
    value: any;
  }[];
}

interface FormMetadata {
  id: string;
  title: string;
  fields: { id: string; label: string; order: number }[];
}

export default function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<{ formId: string; title: string, fields: any[], responses: Response[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResponses();
  }, [id]);

  const fetchResponses = async () => {
    try {
      const res = await api.get(`/forms/${id}/responses`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load responses', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return '-';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'boolean') return val ? 'True' : 'False';
    
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
    
    return String(val);
  };

  const exportCsv = async () => {
    try {
      const res = await api.get(`/forms/${id}/responses/export/csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${data?.title}_responses.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <main className="p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Form Submissions</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">View and manage all received data for this form.</p>
            </div>
            <button 
              onClick={exportCsv}
              className="flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submission ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Received</th>
                    {data.fields.map(f => (
                      <th key={f.id} className="px-6 py-4 text-[10px] font-bold text-slate-700 uppercase tracking-widest min-w-[200px]">{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.responses.length === 0 ? (
                    <tr>
                      <td colSpan={data.fields.length + 2} className="px-6 py-32 text-center text-slate-400">
                        <div className="flex flex-col items-center">
                          <Search className="w-10 h-10 mb-4 opacity-20" />
                          <p className="font-semibold text-sm">No submissions received yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.responses.map((resp) => (
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={resp.id} 
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-[11px] font-mono text-slate-400 truncate max-w-[120px]">{resp.id}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                          {new Date(resp.submittedAt).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        {data.fields.map(field => {
                          const answer = resp.answers.find(a => a.fieldId === field.id);
                          return (
                            <td key={field.id} className="px-6 py-4 text-sm text-slate-700">
                              {formatValue(answer?.value)}
                            </td>
                          );
                        })}
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
