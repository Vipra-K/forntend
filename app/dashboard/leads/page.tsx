"use client";

import React, { useEffect, useRef, useState } from "react";
import eziyoApi from "../../../lib/eziyoApi";
import api from "../../../lib/api";
import {
  Users,
  Loader2,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface LeadPayloadValue {
  key: string;
  fieldName: string;
  value: unknown;
}

interface Lead {
  lead_id: number;
  form_id: string;
  identifier: string | null;
  created_at: string;
  submitted_at: string;
  lead_data: Record<string, unknown>;
}

// Helper to normalize payload data to values array format
function getPayloadValues(data: Lead["lead_data"]): LeadPayloadValue[] {
  if (!data || typeof data !== "object") return [];
  return Object.entries(data).map(([fieldName, value]) => ({
    key: fieldName,
    fieldName,
    value,
  }));
}

interface LeadsResponse {
  success: boolean;
  message: string;
  count: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  lastPage: number;
  data: Lead[];
}

export default function LeadsPage() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formTitles, setFormTitles] = useState<Record<string, string>>({});
  const formTitleCacheRef = useRef<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchLeads();
  }, [page, pageSize]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("eziyoAccessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const res = await eziyoApi.get<LeadsResponse>("/api/v1/leads", {
        params: { page, limit: pageSize },
        headers,
      });

      const uniqueFormIds = Array.from(
        new Set(res.data.data.map((lead) => lead.form_id).filter(Boolean)),
      );
      const missingFormIds = uniqueFormIds.filter(
        (formId) => !formTitleCacheRef.current[formId],
      );

      if (missingFormIds.length > 0) {
        const formEntries = await Promise.all(
          missingFormIds.map(async (formId) => {
            try {
              const res = await api.get(`/forms/${formId}`);
              return [formId, res.data?.title || "Untitled Form"] as const;
            } catch {
              return [formId, "Untitled Form"] as const;
            }
          }),
        );

        formTitleCacheRef.current = {
          ...formTitleCacheRef.current,
          ...Object.fromEntries(formEntries),
        };
      }

      setFormTitles({ ...formTitleCacheRef.current });
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl px-8 lg:px-12 py-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 mb-3">
            <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">
              Leads
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Leads
          </h1>
          <p className="text-slate-500 font-medium text-base">
            These leads belong to the Form Builder.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(Number(e.target.value));
              }}
              className="appearance-none px-4 py-2.5 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </header>

      {data && data.lastPage > 1 && (
        <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">
            Page {data.currentPage} of {data.lastPage} · {data.count} total
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={data.prevPage === null}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(data.lastPage, p + 1))}
              disabled={data.nextPage === null}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-3 w-40 bg-slate-50 rounded animate-pulse" />
                  <div className="h-3 w-64 bg-slate-50 rounded animate-pulse" />
                </div>
                <div className="w-20 h-4 bg-slate-50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : !data?.data?.length ? (
        <div className="flex flex-col items-center justify-center py-24 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl border border-slate-100">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 mb-6">
            <Users className="w-9 h-9 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            No Leads Yet
          </h3>
          <p className="text-slate-500 font-medium text-center max-w-sm">
            New submissions will appear here as leads.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map((lead) => (
            <motion.div
              key={lead.lead_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId(
                    expandedId === String(lead.lead_id)
                      ? null
                      : String(lead.lead_id),
                  )
                }
                className="w-full flex items-center justify-between gap-4 p-6 text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-3 bg-blue-50 rounded-xl shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">
                      {formTitles[lead.form_id] || "Untitled Form"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {new Date(lead.submitted_at).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getPayloadValues(lead.lead_data).length > 0 && (
                    <span className="text-xs font-semibold text-slate-400">
                      {getPayloadValues(lead.lead_data).length} field
                      {getPayloadValues(lead.lead_data).length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {expandedId === String(lead.lead_id) ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {expandedId === String(lead.lead_id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-100 bg-slate-50/50"
                  >
                    <div className="p-6 pt-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
                        Submission Fields
                      </p>
                      <div className="space-y-2">
                        {(() => {
                          const values = getPayloadValues(lead.lead_data);
                          if (values.length === 0) {
                            return (
                              <p className="text-slate-400 text-sm">
                                No field values available
                              </p>
                            );
                          }
                          return values.map(
                            (v: LeadPayloadValue, i: number) => (
                              <div
                                key={i}
                                className="flex flex-wrap gap-2 items-baseline text-sm"
                              >
                                <span className="font-semibold text-slate-600">
                                  {v.fieldName}:
                                </span>
                                <span className="text-slate-800">
                                  {v.value === null || v.value === undefined ? (
                                    <em className="text-slate-400">—</em>
                                  ) : typeof v.value === "object" ? (
                                    JSON.stringify(v.value)
                                  ) : (
                                    String(v.value)
                                  )}
                                </span>
                              </div>
                            ),
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

        </div>
      )}

      {data && data.lastPage > 1 && (
        <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">
            Page {data.currentPage} of {data.lastPage} · {data.count} total
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={data.prevPage === null}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(data.lastPage, p + 1))}
              disabled={data.nextPage === null}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
