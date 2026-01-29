'use client';

import React from 'react';
import { Search, Download, FileText, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

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
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export function ResponsesTable({
  responseData,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  sortOrder,
  setSortOrder,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onExportCSV,
  onExportJSON
}: ResponsesTableProps) {
  
  const formatValue = (val: any) => {
    if (val === null || val === undefined) return '-';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
    }
    return String(val);
  };

  const filteredResponses = responseData?.responses.filter(resp => {
    if (!searchQuery) return true;
    return resp.answers.some(ans => 
      String(ans.value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) || [];

  const hasResponses = responseData && responseData.responses.length > 0;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search responses..."
                className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 transition-all"
            >
              <TrendingUp className={`w-3.5 h-3.5 ${sortOrder === 'asc' ? 'rotate-180' : ''} transition-transform`} />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
            <button 
              onClick={onExportJSON}
              className="flex items-center justify-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button 
              onClick={onExportCSV}
              className="flex items-center justify-center space-x-2 bg-blue-600 px-4 py-2.5 rounded-lg text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Range:</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            <span className="text-slate-400">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs font-bold text-red-600 hover:underline ml-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {hasResponses ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wide border-b border-slate-100 w-48 sticky left-0 bg-slate-50 z-10">
                    Submitted
                  </th>
                  {responseData?.fields.map(f => (
                    <th key={f.id} className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wide border-b border-slate-100">
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResponses.map((resp) => (
                  <tr key={resp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium sticky left-0 bg-white group-hover:bg-slate-50/50">
                      <div>{new Date(resp.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        {new Date(resp.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    {resp.answers.map((ans, idx) => (
                      <td key={idx} className="px-6 py-4 text-sm font-medium text-slate-700">
                        <div className="max-w-xs truncate" title={formatValue(ans.value)}>
                          {formatValue(ans.value)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
              <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
                Page {responseData?.pagination.page} of {responseData?.pagination.totalPages}
              </span>
              <span className="text-sm font-medium text-slate-500">
                Total Responses: <span className="text-slate-900 font-bold">{responseData?.pagination.total}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, responseData?.pagination.totalPages || 0))].map((_, i) => {
                  const pageNum = i + 1;
                  // Simple pagination logic for now (showing first 5 pages)
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(responseData?.pagination.totalPages || 1, prev + 1))}
                disabled={currentPage === responseData?.pagination.totalPages}
                className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold text-slate-600"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No Responses Yet</h3>
          <p className="text-slate-500 font-medium">Responses will appear here once your form is submitted.</p>
        </div>
      )}
    </div>
  );
}
