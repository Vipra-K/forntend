"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";
import { ChevronLeft, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Modular Components
import { SummaryCards } from "./components/SummaryCards";
import { FieldAnalysis } from "./components/FieldAnalysis";

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

export default function InsightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/forms/${id}/responses/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto scrollbar-hide bg-slate-50">
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          <div className="mb-10">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-3" />
            <div className="h-10 w-72 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-80 bg-slate-100 rounded animate-pulse" />
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
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 p-6 rounded-xl"
              >
                <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-4" />
                <div className="h-32 bg-slate-50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="mb-10">
          <div className="flex items-center space-x-2 text-blue-600 mb-3">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Analytics
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            {analytics?.formTitle}
          </h1>
          <p className="text-slate-500 font-medium">
            Real-time performance analytics and response tracking.
          </p>
        </header>

        <div className="space-y-8">
          <SummaryCards analytics={analytics} />
          <FieldAnalysis fields={analytics?.fields || []} />
        </div>
      </div>
    </div>
  );
}
