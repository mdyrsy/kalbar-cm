'use client'

import DashboardHeader from './dashboard-header'

export default function DashboardScreen() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <DashboardHeader />

      <div className="min-h-[400px] rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
        <p className="text-sm font-bold text-gray-400">Konten Dashboard akan dimuat di sini...</p>
      </div>

    </div>
  )
}