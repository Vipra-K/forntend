'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { 
  ChevronLeft, 
  BarChart3, 
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Modular Components
import { SummaryCards } from './components/SummaryCards';
import { FieldAnalysis } from './components/FieldAnalysis';
import { ResponsesTable } from './components/ResponsesTable';

interface FieldStat {
  fieldId: string;
  label: string;
  type: string;
  totalResponses: number;
  uniqueValues: number;
  completionRate: number;
  valueDistribution: { name: string; value: number }[];
}

interface Analytics {
  formId: string;
  formTitle: string;
  totalResponses: number;
  responsesLast30Days: number;
  averageResponseRate: number;
  firstResponseAt: string | null;
  lastResponseAt: string | null;
  fields: FieldStat[];
}

interface Answer {
  fieldId: string;
  label: string;
  value: any;
}

interface ResponseRecord {
  id: string;
  submittedAt: string;
  answers: Answer[];
}

interface ResponseData {
  formId: string;
  title: string;
  fields: { id: string; label: string; order: number }[];
  responses: ResponseRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function InsightsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'responses'>('summary');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  useEffect(() => {
    fetchResponses();
  }, [id, currentPage]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/forms/${id}/responses/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    }
  };

  const fetchResponses = async () => {
    try {
      const res = await api.get(`/forms/${id}/responses`, {
        params: { page: currentPage, limit: 10 }
      });
      setResponseData(res.data);
    } catch (err) {
      toast.error('Failed to load responses');
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get(`/forms/${id}/responses/export/csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `responses-${id}.csv`);
      document.body.appendChild(link);
      link.click();
      toast.success('CSV Exported');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const exportJSON = async () => {
    try {
      const res = await api.get(`/forms/${id}/responses/export/json`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `responses-${id}.json`);
      document.body.appendChild(link);
      link.click();
      toast.success('JSON Exported');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold uppercase tracking-widest mb-10 group underline-offset-4 hover:underline"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-3">
               <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-200">
                  <BarChart3 className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Live Insights</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{analytics?.formTitle}</h1>
            <p className="text-slate-500 mt-2 font-medium">Real-time performance analytics and response tracking.</p>
          </div>

          <div className="flex items-center space-x-3 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm">
            <button 
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'summary' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('responses')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'responses' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Responses
            </button>
          </div>
        </header>

        {activeTab === 'summary' ? (
          <div className="space-y-12">
            <SummaryCards analytics={analytics} />
            <FieldAnalysis fields={analytics?.fields || []} />
          </div>
        ) : (
          <ResponsesTable 
            responseData={responseData}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onExportCSV={exportCSV}
            onExportJSON={exportJSON}
          />
        )}
      </div>
    </div>
  );
}
