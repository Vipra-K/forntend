'use client';

import React from 'react';
import { Search, Download, FileText, ChevronLeft } from 'lucide-react';

interface ResponseRecord {
  id: string;
  submittedAt: string;
  answers: { fieldId: string; label: string; value: any }[];
}

interface ResponseData {
  fields: { id: string; label: string; order: number }[];
  responses: ResponseRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ResponsesTableProps {
  responseData: ResponseData | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export function ResponsesTable({
  responseData,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  onExportCSV,
  onExportJSON
}: ResponsesTableProps) {
  
  const formatValue = (val: any) => {
    if (val === null || val === undefined) return '-';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'boolean') return val ? 'True' : 'False';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) return date.toLocaleString();
    }
    return String(val);
  };

  const filteredResponses = responseData?.responses.filter(resp => {
    if (!searchQuery) return true;
    return resp.answers.some(ans => 
      String(ans.value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) || [];

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search responses..."
              className="w-full bg-white border border-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onExportJSON}
            className="flex items-center justify-center space-x-2 bg-white border border-slate-200 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button 
            onClick={onExportCSV}
            className="flex items-center justify-center space-x-2 bg-slate-900 px-6 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/30">
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 w-48">Timestamp</th>
              {responseData?.fields.map(f => (
                <th key={f.id} className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredResponses.map((resp) => (
              <tr key={resp.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6 text-xs text-slate-400 font-medium font-mono">
                  {new Date(resp.submittedAt).toLocaleString()}
                </td>
                {resp.answers.map((ans, idx) => (
                  <td key={idx} className="px-8 py-6 text-sm font-semibold text-slate-700">
                    {formatValue(ans.value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {responseData?.responses.length === 0 && (
        <div className="py-24 text-center">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No responses yet.</p>
        </div>
      )}
      
      <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400">
          Page {responseData?.pagination.page} of {responseData?.pagination.totalPages} ({responseData?.pagination.total} total)
        </span>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(responseData?.pagination.totalPages || 1, prev + 1))}
            disabled={currentPage === responseData?.pagination.totalPages}
            className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
