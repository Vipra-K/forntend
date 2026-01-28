'use client';

import React from 'react';
import { Users, TrendingUp, Clock, Calendar } from 'lucide-react';

interface Analytics {
  totalResponses: number;
  responsesLast30Days: number;
  averageResponseRate: number;
  lastResponseAt: string | null;
}

interface SummaryCardsProps {
  analytics: Analytics | null;
}

export function SummaryCards({ analytics }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        label="Total Responses" 
        value={analytics?.totalResponses || 0} 
        icon={Users} 
        color="blue"
      />
      <StatCard 
        label="Last 30 Days" 
        value={analytics?.responsesLast30Days || 0} 
        icon={TrendingUp} 
        color="green" 
      />
      <StatCard 
        label="Daily Average" 
        value={analytics?.averageResponseRate || 0} 
        icon={Clock} 
        color="purple" 
      />
      <StatCard 
        label="Latest Activity" 
        value={analytics?.lastResponseAt ? new Date(analytics.lastResponseAt).toLocaleDateString() : 'None'} 
        icon={Calendar} 
        color="orange" 
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
      <div className={`w-10 h-10 ${colors[color]} rounded-2xl flex items-center justify-center mb-6`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
}
