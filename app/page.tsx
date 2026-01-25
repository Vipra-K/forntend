'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-slate-400 font-medium tracking-widest text-xs uppercase animate-pulse">
          Synchronizing Flow...
        </p>
      </div>
    </div>
  );
}
