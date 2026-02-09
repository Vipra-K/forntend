"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { TrendingUp, CheckCircle2 } from "lucide-react";

interface FieldStat {
  fieldId: string;
  label: string;
  type: string;
  totalResponses: number;
  uniqueValues: number;
  completionRate: number;
  valueDistribution: { name: string; value: number }[];
}

interface FieldAnalysisProps {
  fields: FieldStat[];
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export function FieldAnalysis({ fields }: FieldAnalysisProps) {
  // Include rating fields as analyzable
  const analyzableFields = fields.filter((field) =>
    ["select", "multiselect", "boolean", "rating"].includes(field.type),
  );

  if (!analyzableFields.length) {
    return (
      <section className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">
          No Analyzable Fields
        </h3>
        <p className="text-slate-500 font-medium">
          Add select, boolean, or rating fields to see analytics.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Field Analytics
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Response distribution by field
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analyzableFields.map((field, index) => (
          <FieldCard key={field.fieldId} field={field} index={index} />
        ))}
      </div>
    </section>
  );
}

function FieldCard({ field, index }: { field: FieldStat; index: number }) {
  const hasDistribution =
    field.valueDistribution && field.valueDistribution.length > 0;

  const isCategorical = ["select", "multiselect", "boolean"].includes(
    field.type,
  );
  const isRating = field.type === "rating";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase">
              {field.type}
            </span>
            {field.completionRate === 100 && (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
          </div>
          <h3 className="font-bold text-slate-900 text-base leading-tight">
            {field.label}
          </h3>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">
            {field.completionRate}%
          </div>
          <div className="text-xs font-medium text-slate-500">Complete</div>
        </div>
      </div>

      {/* Chart */}
      {hasDistribution ? (
        <div className="h-56 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            {isCategorical ? (
              <PieChart>
                <Pie
                  data={field.valueDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {field.valueDistribution.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
                />
              </PieChart>
            ) : (
              <BarChart data={field.valueDistribution}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {field.valueDistribution.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-56 mb-6 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-dashed border-slate-200">
          <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-400">
            Text-based responses
          </p>
          <p className="text-xs text-slate-400 mt-1">View in Responses tab</p>
        </div>
      )}

      {/* Stats */}
      <div className="space-y-3">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${field.completionRate}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500"
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600">
            {field.totalResponses}{" "}
            {field.totalResponses === 1 ? "response" : "responses"}
          </span>
          <span className="font-medium text-slate-500">
            {field.uniqueValues} unique{" "}
            {field.uniqueValues === 1 ? "value" : "values"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
