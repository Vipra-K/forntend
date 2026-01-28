'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function FieldAnalysis({ fields }: FieldAnalysisProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Question Analysis</h2>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deep dive into each field</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {fields.map((field) => (
          <div key={field.fieldId} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-6">
               <div className="space-y-1">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{field.type}</span>
                 <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{field.label}</h3>
               </div>
               <div className="text-right">
                  <div className="text-2xl font-black text-slate-900">{field.completionRate}%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion</div>
               </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 h-64 mt-4 mb-6">
              {field.valueDistribution && field.valueDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {field.type === 'select' || field.type === 'boolean' || field.type === 'rating' ? (
                    <PieChart>
                      <Pie
                        data={field.valueDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {field.valueDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  ) : (
                    <BarChart data={field.valueDistribution} layout="vertical" margin={{ left: -20, right: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                         cursor={{ fill: 'transparent' }}
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                         itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {field.valueDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400">Not enough data to graph</p>
                  <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest">Text responses collected</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${field.completionRate}%` }}
                  className="h-full bg-blue-600"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <span>{field.totalResponses} submissions</span>
                 <span>{field.uniqueValues} unique answers</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
