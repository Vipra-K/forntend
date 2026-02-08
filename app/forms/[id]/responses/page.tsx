"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";
import {
  ChevronLeft,
  Loader2,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { ResponsesTable } from "../insights/components/ResponsesTable";
import { motion } from "framer-motion";

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

interface FormSettings {
  maxSubmissions: number | null;
  allowMultipleSubmissions: boolean;
  openAt: string | null;
  closeAt: string | null;
  successMessage: string | null;
  redirectUrl: string | null;
}

interface ResponseData {
  formId: string;
  title: string;
  fields: { id: string; label: string; order: number }[];
  responses: ResponseRecord[];
  settings: FormSettings | null;
  responseCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchResponses();
  }, [id, currentPage, sortOrder, startDate, endDate]);

  const fetchResponses = async () => {
    try {
      const res = await api.get(`/forms/${id}/responses`, {
        params: {
          page: currentPage,
          limit: 10,
          sortOrder,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      setResponseData(res.data);
    } catch (err) {
      toast.error("Failed to load responses");
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get(`/forms/${id}/responses/export/csv`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `responses-${id}.csv`);
      document.body.appendChild(link);
      link.click();
      toast.success("CSV Exported");
    } catch (err) {
      toast.error("Export failed");
    }
  };

  const exportJSON = async () => {
    try {
      const res = await api.get(`/forms/${id}/responses/export/json`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `responses-${id}.json`);
      document.body.appendChild(link);
      link.click();
      toast.success("JSON Exported");
    } catch (err) {
      toast.error("Export failed");
    }
  };

  const getFormStatus = () => {
    if (!responseData?.settings)
      return { status: "Active", color: "green", icon: CheckCircle2 };

    const now = new Date();
    const openAt = responseData.settings.openAt
      ? new Date(responseData.settings.openAt)
      : null;
    const closeAt = responseData.settings.closeAt
      ? new Date(responseData.settings.closeAt)
      : null;

    if (openAt && openAt > now) {
      return { status: "Scheduled", color: "orange", icon: Clock };
    }

    if (closeAt && closeAt < now) {
      return { status: "Closed", color: "red", icon: XCircle };
    }

    if (
      responseData.settings.maxSubmissions &&
      responseData.responseCount >= responseData.settings.maxSubmissions
    ) {
      return { status: "Limit Reached", color: "amber", icon: Calendar };
    }

    return { status: "Active", color: "green", icon: CheckCircle2 };
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto scrollbar-hide bg-slate-50">
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          <div className="mb-10">
            <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-3" />
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="h-10 w-64 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-72 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-9 w-24 bg-slate-100 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-100 p-5 rounded-xl"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse mb-3" />
                  <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between">
              <div className="h-9 w-48 bg-slate-100 rounded animate-pulse" />
              <div className="h-9 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-4 border-b border-slate-50 flex space-x-4"
              >
                <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-48 bg-slate-50 rounded animate-pulse" />
                <div className="h-4 w-24 bg-slate-50 rounded animate-pulse" />
                <div className="h-4 w-20 bg-slate-50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formStatus = getFormStatus();

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="mb-10">
          <div className="flex items-center space-x-2 text-blue-600 mb-3">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Form Responses
            </span>
          </div>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                {responseData?.title}
              </h1>
              <p className="text-slate-500 font-medium">
                View and export all form submissions.
              </p>
            </div>
            <div
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${
                formStatus.color === "green"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : formStatus.color === "red"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : formStatus.color === "orange"
                      ? "bg-orange-50 border-orange-200 text-orange-700"
                      : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              <formStatus.icon className="w-4 h-4" />
              <span className="text-sm font-bold">{formStatus.status}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {responseData?.settings?.maxSubmissions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {responseData.settings.maxSubmissions}
                </div>
                <div className="text-xs font-bold text-slate-600 mt-1">
                  Maximum Limit
                </div>
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (responseData.responseCount / responseData.settings.maxSubmissions) * 100)}%`,
                    }}
                  />
                </div>
              </motion.div>
            )}

            {responseData?.settings?.openAt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="text-sm font-black text-slate-900">
                  {new Date(responseData.settings.openAt).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )}
                </div>
                <div className="text-xs font-bold text-slate-600 mt-1">
                  Opens On
                </div>
              </motion.div>
            )}

            {responseData?.settings?.closeAt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="text-sm font-black text-slate-900">
                  {new Date(responseData.settings.closeAt).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )}
                </div>
                <div className="text-xs font-bold text-slate-600 mt-1">
                  Closes On
                </div>
              </motion.div>
            )}
          </div>
        </header>

        <ResponsesTable
          responseData={responseData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onExportCSV={exportCSV}
          onExportJSON={exportJSON}
        />
      </div>
    </div>
  );
}
