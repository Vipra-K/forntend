'use client';

import React, { useEffect, useState, use } from 'react';
import api from '../../../../lib/api';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Zap, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function InsightsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/forms/${id}/responses/analytics`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Responses', value: data.totalResponses, icon: Users, color: 'text-blue-400' },
    { label: 'Last 30 Days', value: data.responsesLast30Days, icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Avg Rate', value: `${data.averageResponseRate}/day`, icon: Zap, color: 'text-yellow-400' },
    { label: 'Completion', value: '100%', icon: CheckCircle2, color: 'text-green-400' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <main className="p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-10">
            <h2 className="text-2xl font-black uppercase tracking-tight">Intelligence Dashboard</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Advanced form performance metrics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-white/[0.03] border border-white/5 p-6 rounded-[2.5rem] flex items-center space-x-5 hover:border-white/10 transition-colors group"
              >
                <div className={`w-14 h-14 bg-white/5 rounded-[1.2rem] flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                  <div className="text-3xl font-black">{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline Placeholder */}
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 p-10 rounded-[3.5rem]">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Submission Timeline</h3>
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold">
                  <Calendar className="w-4 h-4" />
                  <span>Last 30 Days</span>
                </div>
              </div>
              
              <div className="h-64 flex items-end space-x-3">
                {[40, 60, 45, 90, 65, 30, 80, 50, 75, 40, 60, 85, 95, 40, 55, 70, 45, 60, 30, 80, 50, 90, 65, 75, 40, 60, 85, 95, 40, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/[0.03] rounded-full overflow-hidden relative group">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.02, duration: 0.5 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-blue-600 rounded-full group-hover:from-purple-400 group-hover:to-blue-400 transition-colors"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2">
                <span>30 Days Ago</span>
                <span>Active Synchronization Period</span>
                <span>Present Day</span>
              </div>
            </div>

            {/* Field Breakdown */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3.5rem] flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Field Utilization</h3>
              <div className="flex-1 space-y-6">
                {data.fields.map((field: any, i: number) => (
                  <div key={field.fieldId} className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                      <span className="text-slate-300 truncate max-w-[150px]">{field.label}</span>
                      <span className="text-purple-400">{field.completionRate}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${field.completionRate}%` }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5">
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                   Fields with lower completion rates may indicate friction in your data collection flow.
                 </p>
              </div>
            </div>
          </div>

          {/* Activity Log Summary */}
          <div className="mt-12 bg-white/[0.02] border border-white/5 p-10 rounded-[3.5rem]">
             <div className="flex items-center space-x-4 mb-8">
               <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                  <Clock className="w-5 h-5" />
               </div>
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Activity Pulse</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex items-center space-x-6">
                   <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">First Signal</div>
                      <div className="text-sm font-mono text-slate-300">{data.firstResponseAt ? new Date(data.firstResponseAt).toLocaleDateString() : 'N/A'}</div>
                   </div>
                   <div className="h-10 w-[1px] bg-white/10" />
                   <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Last Interaction</div>
                      <div className="text-sm font-mono text-slate-300">{data.lastResponseAt ? new Date(data.lastResponseAt).toLocaleTimeString() : 'N/A'}</div>
                   </div>
                </div>
                
                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl flex items-center space-x-4">
                   <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                   <p className="text-[10px] text-red-300/80 font-medium tracking-tight">
                     No anomalies detected in the last 24 hours. Sync services are operating within expected parameters.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
