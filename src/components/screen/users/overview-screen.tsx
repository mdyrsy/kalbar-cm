'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Users, Building2, Landmark, Briefcase, Activity, 
  ShieldAlert, ShieldCheck, RefreshCw, 
  BarChart3, ChevronRight as ChevronIcon, AlertTriangle
} from 'lucide-react'

type StatsData = {
  total: number
  segments: {
    government: number
    enterprise: number
    business: number
    prq: number
  }
  roles: {
    super_admin: number
    account_manager: number
  }
}

export default function StatisticsScreen() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users/stats', { cache: 'no-store' })
      if (!res.ok) throw new Error('Gagal mengambil data')
      const json = await res.json()
      if (json.stats) setStats(json.stats)
      else throw new Error('Data invalid')
    } catch (e) {
      setError('Gagal memuat data.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchStats()
  }

  const segments = [
    { 
      label: 'Government', 
      sub: 'Pemerintahan', 
      value: stats?.segments.government || 0, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      border: 'hover:border-blue-200', 
      barColor: 'bg-blue-600',
      icon: Landmark 
    },
    { 
      label: 'Enterprise', 
      sub: 'Korporasi', 
      value: stats?.segments.enterprise || 0, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50', 
      border: 'hover:border-purple-200', 
      barColor: 'bg-purple-600',
      icon: Building2 
    },
    { 
      label: 'Business', 
      sub: 'Bisnis & UMKM', 
      value: stats?.segments.business || 0, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50', 
      border: 'hover:border-amber-200', 
      barColor: 'bg-amber-500',
      icon: Briefcase 
    },
    { 
      label: 'PRQ Service', 
      sub: 'Layanan Khusus', 
      value: stats?.segments.prq || 0, 
      color: 'text-[#DA061A]', 
      bg: 'bg-red-50', 
      border: 'hover:border-red-200', 
      barColor: 'bg-[#DA061A]',
      icon: Activity 
    },
  ]

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#DA061A]">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1C2A55]">Gagal Memuat Statistik</h3>
          <p className="text-xs text-gray-500">Terjadi kesalahan saat mengambil data.</p>
        </div>
        <button 
          onClick={fetchStats} 
          className="mt-1 flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-bold text-[#1C2A55] shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={14} /> Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 pb-20 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-0.5">
            <Link href="/dashboard" className="hover:text-[#1C2A55] transition-colors">Dashboard</Link>
            <ChevronIcon size={12} strokeWidth={2} />
            <span className="text-[#1C2A55]">Analytics</span>
          </div>
          <h1 className="text-xl font-bold text-[#1C2A55]">
            Statistik Pengguna
          </h1>
        </div>
        
        <button 
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="flex h-8 items-center gap-2 rounded-md bg-white px-3 text-xs font-bold text-[#1C2A55] shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:text-[#DA061A] active:scale-95 disabled:opacity-70"
        >
          <RefreshCw size={14} className={`${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Perbarui</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1C2A55] to-[#0F172A] p-5 text-white shadow-lg shadow-blue-900/10">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-8 w-8 rounded bg-white/10" />
              <div className="h-8 w-24 rounded bg-white/10" />
              <div className="h-3 w-16 rounded bg-white/10" />
            </div>
          ) : (
            <>
              <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-[#DA061A] opacity-20 blur-[40px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/10">
                      <Users size={16} className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Total User</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-white">{stats?.total}</h3>
                  <span className="text-xs text-white/50">Akun</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-red-100 hover:shadow-md">
           {isLoading ? (
             <div className="animate-pulse space-y-3">
               <div className="h-8 w-8 rounded bg-gray-100" />
               <div className="h-8 w-20 rounded bg-gray-100" />
             </div>
           ) : (
             <>
               <div className="absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full bg-red-50 opacity-0 transition-opacity group-hover:opacity-100 blur-xl" />
               <div className="relative z-10 flex items-center justify-between mb-3">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Super Admin</span>
                 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#DA061A]">
                    <ShieldAlert size={16} />
                 </div>
               </div>
               <h3 className="relative z-10 text-3xl font-black text-[#1C2A55]">{stats?.roles.super_admin}</h3>
             </>
           )}
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-100 hover:shadow-md">
           {isLoading ? (
             <div className="animate-pulse space-y-3">
               <div className="h-8 w-8 rounded bg-gray-100" />
               <div className="h-8 w-20 rounded bg-gray-100" />
             </div>
           ) : (
             <>
               <div className="absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 blur-xl" />
               <div className="relative z-10 flex items-center justify-between mb-3">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Manager</span>
                 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <ShieldCheck size={16} />
                 </div>
               </div>
               <h3 className="relative z-10 text-3xl font-black text-[#1C2A55]">{stats?.roles.account_manager}</h3>
             </>
           )}
        </div>

      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-[#1C2A55]" />
          <h3 className="text-sm font-bold text-[#1C2A55]">Distribusi Segmen</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
             [1,2,3,4].map(i => <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-gray-100" />)
          ) : (
            segments.map((seg) => {
              const percentage = stats?.total && stats.total > 0 
                ? ((seg.value / stats.total) * 100) 
                : 0
              
              return (
                <div key={seg.label} className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md ${seg.border}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#1C2A55]">{seg.label}</h4>
                      <p className="text-[10px] font-medium text-gray-400">{seg.sub}</p>
                    </div>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${seg.bg} ${seg.color}`}>
                       <seg.icon size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-black text-[#1C2A55]">{seg.value}</span>
                    <span className={`text-[10px] font-bold ${seg.color}`}>{percentage.toFixed(0)}%</span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div 
                      className={`h-full rounded-full ${seg.barColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

    </div>
  )
}