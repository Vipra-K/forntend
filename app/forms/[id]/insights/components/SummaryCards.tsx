'use client';

import React from 'react';
import { Users, TrendingUp, Clock, Calendar, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface Analytics {
  totalResponses: number;
  responsesLast30Days: number;
  averageResponseRate: number;
  lastResponseAt: string | null;
  firstResponseAt: string | null;
}

interface SummaryCardsProps {
  analytics: Analytics | null;
}

export function SummaryCards({ analytics }: SummaryCardsProps) {
  const calculateGrowth = () => {
    if (!analytics || analytics.totalResponses === 0) return 0;
    const last30 = analytics.responsesLast30Days || 0;
    const total = analytics.totalResponses || 0;
    if (total === last30) return 100;
    return Math.round((last30 / total) * 100);
  };

  const getDaysSinceFirst = () => {
    if (!analytics?.firstResponseAt) return 0;
    const first = new Date(analytics.firstResponseAt);
    const now = new Date();
    return Math.max(1, Math.floor((now.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const stats = [
    {
      label: 'Total Responses',
      value: analytics?.totalResponses || 0,
      icon: Users,
      color: 'blue',
      subtitle: 'All time submissions'
    },
    {
      label: 'Last 30 Days',
      value: analytics?.responsesLast30Days || 0,
      icon: TrendingUp,
      color: 'green',
      subtitle: `${calculateGrowth()}% of total`
    },
    {
      label: 'Latest Response',
      value: analytics?.lastResponseAt 
        ? new Date(analytics.lastResponseAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'No data',
      icon: Calendar,
      color: 'orange',
      subtitle: analytics?.lastResponseAt 
        ? new Date(analytics.lastResponseAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : 'Waiting for first submission'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{stats.map((stat, index) => (
        <StatCard key={stat.label} {...stat} index={index} />
      ))}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  subtitle,
  icon: Icon, 
  color,
  index 
}: { 
  label: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: string;
  index: number;
}) {
  const colors: Record<string, { bg: string; text: string; gradient: string }> = {
    blue: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-600',
      gradient: 'from-blue-50 to-blue-100/50'
    },
    green: { 
      bg: 'bg-green-50', 
      text: 'text-green-600',
      gradient: 'from-green-50 to-green-100/50'
    },
    purple: { 
      bg: 'bg-purple-50', 
      text: 'text-purple-600',
      gradient: 'from-purple-50 to-purple-100/50'
    },
    orange: { 
      bg: 'bg-orange-50', 
      text: 'text-orange-600',
      gradient: 'from-orange-50 to-orange-100/50'
    },
  };

  const colorScheme = colors[color];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all group"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${colorScheme.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${colorScheme.text}`} />
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-xs font-bold text-slate-900 mb-1">{label}</div>
      <div className="text-xs text-slate-400 font-medium">{subtitle}</div>
    </motion.div>
  );
}
