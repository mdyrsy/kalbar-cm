'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Sun, Moon, CloudSun, Sparkles } from 'lucide-react'

export default function DashboardHeader() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    const storedSession = localStorage.getItem('auth_session')
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession)
        setUser({
          name: session?.user?.name || session?.user?.user_metadata?.name || 'User',
          role: session?.user?.role || 'User'
        })
      } catch (e) { }
    }
    setTimeout(() => setIsLoading(false), 500) 
  }, [])

  useEffect(() => {
    setCurrentDate(new Date())
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getGreetingData = () => {
    if (!currentDate) return { text: 'Halo', icon: CloudSun, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' }
    const hour = currentDate.getHours()
    if (hour >= 5 && hour < 11) return { text: 'Selamat Pagi', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' }
    if (hour >= 11 && hour < 15) return { text: 'Selamat Siang', icon: CloudSun, color: 'text-sky-500', bg: 'bg-sky-50 border-sky-100' }
    if (hour >= 15 && hour < 18) return { text: 'Selamat Sore', icon: CloudSun, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100' }
    return { text: 'Selamat Malam', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50 border-indigo-100' }
  }

  const greeting = getGreetingData()

  const dateStr = currentDate?.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-1 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-500 hover:bg-white/80 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)]">
      
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-[#1C2A55]/5 via-[#DA061A]/5 to-transparent blur-3xl transition-transform duration-700 group-hover:scale-110" />

      <div className="relative z-10 flex flex-col gap-6 rounded-[20px] bg-white/40 p-6 ring-1 ring-white/50 md:flex-row md:items-center md:justify-between">
        
        <div className="flex items-center gap-6">
          <div className={`hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 shadow-sm transition-transform duration-300 group-hover:rotate-6 ${greeting.bg} ${greeting.color}`}>
             <greeting.icon size={36} strokeWidth={1.5} />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#1C2A55] shadow-sm ring-1 ring-gray-100">
                {greeting.text} <Sparkles size={12} className="text-[#DA061A]" fill="#DA061A" />
              </span>
            </div>
            
            <h1 className="text-3xl font-black tracking-tight text-[#1C2A55] md:text-4xl">
              {isLoading ? (
                <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200/50" />
              ) : (
                <span className="bg-gradient-to-r from-[#1C2A55] to-[#2a3f7d] bg-clip-text text-transparent transition-all hover:to-[#DA061A]">
                  {user?.name}
                </span>
              )}
            </h1>
            
            <p className="text-sm font-medium text-gray-500">
              Overview aktivitas dan performa hari ini
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          
          <div className="flex min-w-[150px] flex-col justify-center rounded-2xl border border-white bg-white/50 px-5 py-4 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[#DA061A]">
                <Calendar size={12} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Kalender</span>
            </div>
            <span className="text-lg font-bold text-[#1C2A55]">
              {dateStr}
            </span>
          </div>

          <div className="relative flex min-w-[180px] flex-col justify-center overflow-hidden rounded-2xl bg-[#1C2A55] px-6 py-4 text-white shadow-xl shadow-[#1C2A55]/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#1C2A55]/30">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-[#DA061A]/20 blur-xl" />
            
            <div className="relative z-10">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Waktu (WIB))</span>
                <Clock size={14} className="text-[#DA061A]" strokeWidth={2.5} />
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-3xl font-black tracking-widest">
                  {currentDate?.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')}
                </span>
                <span className="font-mono text-sm font-bold text-[#DA061A] opacity-80">
                  {currentDate?.toLocaleTimeString('id-ID', { hour12: false, second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}