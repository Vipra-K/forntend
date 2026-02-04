"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import {
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
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
  id: string;
  formId: string;
  formTitle: string;
  formSlug: string;
  responseId: string;
  payload: {
    event: string;
    formId: string;
    formVersionId: string;
    responseId: string;
    submittedAt: string;
    values: LeadPayloadValue[];
  };
  submittedAt: string;
  createdAt: string;
}

interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function LeadsPage() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [page, sortOrder]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<LeadsResponse>("/leads", {
        params: { page, limit: 15, sortOrder },
      });
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
              Form responses as leads
            </span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">
            Leads
          </h1>
          <p className="text-slate-500 font-medium text-base">
            Form submissions captured here for testing and CRM integration.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 bg-slate-50 rounded-2xl border border-slate-100">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : !data?.leads?.length ? (
        <div className="flex flex-col items-center justify-center py-24 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl border border-slate-100">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 mb-6">
            <Users className="w-9 h-9 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            No leads yet
          </h3>
          <p className="text-slate-500 font-medium text-center max-w-sm">
            Submit a form response (from a published form) and it will appear
            here as a lead. Useful for testing before connecting your CRM.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.leads.map((lead) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId(expandedId === lead.id ? null : lead.id)
                }
                className="w-full flex items-center justify-between gap-4 p-6 text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-3 bg-blue-50 rounded-xl shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">
                      {lead.formTitle || "Untitled form"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {new Date(lead.submittedAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-[11px] font-mono text-slate-400">
                      <span title={lead.formId}>
                        Form:{" "}
                        <span className="text-slate-500">{lead.formId}</span>
                      </span>
                      <span title={lead.responseId}>
                        Response:{" "}
                        <span className="text-slate-500">
                          {lead.responseId}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {typeof lead.payload === "object" &&
                    lead.payload?.values?.length > 0 && (
                      <span className="text-xs font-semibold text-slate-400">
                        {lead.payload.values.length} field
                        {lead.payload.values.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  {expandedId === lead.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {expandedId === lead.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-100 bg-slate-50/50"
                  >
                    <div className="p-6 pt-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                        Webhook IDs
                      </p>
                      <div className="grid gap-1.5 mb-4 text-xs font-mono text-slate-600">
                        <div>
                          <span className="text-slate-400">Form ID:</span>{" "}
                          <span className="break-all">{lead.formId}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Response ID:</span>{" "}
                          <span className="break-all">{lead.responseId}</span>
                        </div>
                        {typeof lead.payload === "object" &&
                          lead.payload?.formVersionId && (
                            <div>
                              <span className="text-slate-400">
                                Form version ID:
                              </span>{" "}
                              <span className="break-all">
                                {String(lead.payload.formVersionId)}
                              </span>
                            </div>
                          )}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
                        Response data (webhook payload)
                      </p>
                      <div className="space-y-2">
                        {typeof lead.payload === "object" &&
                          lead.payload?.values?.map(
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
                            )
                          )}
                        {(!lead.payload?.values ||
                          lead.payload.values.length === 0) && (
                          <p className="text-slate-400 text-sm">
                            No field values
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6">
              <p className="text-sm font-semibold text-slate-500">
                Page {data.pagination.page} of {data.pagination.totalPages} ·{" "}
                {data.pagination.total} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(data.pagination.totalPages, p + 1))
                  }
                  disabled={page >= data.pagination.totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
