"use client";

import React, { useEffect, useState } from "react";
import { Activity, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface ActivityLog {
  id: string;
  type: string;
  status: string;
  formId: string;
  webhookUrl?: string | null;
  httpStatus?: number | null;
  error?: string | null;
  attemptNumber: number;
  duration?: number | null;
  createdAt: string;
  form?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

interface ActivityLogResponse {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ActivityLogsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<ActivityLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/activity-logs?page=${page}&limit=20&sortOrder=desc`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );
        if (!res.ok) {
          throw new Error(`Failed to load activity logs (${res.status})`);
        }
        const json = (await res.json()) as ActivityLogResponse;
        setData(json);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Failed to load activity logs", err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchLogs();

    return () => controller.abort();
  }, [page, token]);

  const logs = data?.logs ?? [];

  const getEventLabel = (type: string) => {
    switch (type) {
      case "WEBHOOK_SENT":
        return "Delivery succeeded";
      case "WEBHOOK_FAILED":
        return "Delivery failed";
      case "WEBHOOK_RETRY":
        return "Retry scheduled";
      default:
        return type.replace(/_/g, " ").toLowerCase();
    }
  };

  const getStatusLabel = (status: string) =>
    status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());

  return (
    <div className="flex flex-col h-full space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 mb-3">
            <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">
              Monitoring
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Activity
          </h1>
          <p className="text-sm text-slate-500">
            Track form response activity and delivery outcomes.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
            <span>RECENT ACTIVITY</span>
            {loading && (
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            )}
          </div>
          {data && (
            <span className="text-[11px] font-medium text-slate-400">
              {data.pagination.total} events
            </span>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {loading && logs.length === 0 && (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                  <div className="h-6 w-28 bg-slate-50 rounded-full animate-pulse" />
                  <div className="h-6 w-20 bg-slate-50 rounded-full animate-pulse" />
                  <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-40 bg-slate-50 rounded animate-pulse flex-1" />
                  <div className="h-4 w-12 bg-slate-50 rounded animate-pulse" />
                  <div className="h-4 w-8 bg-slate-50 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-slate-50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {logs.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
              <Activity className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">
                No Activity Logs Yet
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Once your forms receive responses, you&apos;ll see activity here.
              </p>
            </div>
          )}

          {logs.length > 0 && (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Time</th>
                  <th className="px-4 py-2 text-left font-semibold">Event</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Form</th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Attempts
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2 align-top text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <div className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200/70">
                        {getEventLabel(log.type)}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-top">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : log.status === "FAILED"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {getStatusLabel(log.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-slate-600">
                      {log.form?.title ?? "Untitled Form"}
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-slate-600">
                      {log.attemptNumber}
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-red-500 max-w-sm">
                      {log.error && (
                        <span className="inline-flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 mt-0.5" />
                          <span className="line-clamp-2">{log.error}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between text-xs text-slate-500 bg-slate-50/60">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 rounded-md border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>
            <span>
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <button
              disabled={page >= data.pagination.totalPages}
              onClick={() =>
                setPage((p) =>
                  data ? Math.min(data.pagination.totalPages, p + 1) : p,
                )
              }
              className="px-2 py-1 rounded-md border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
