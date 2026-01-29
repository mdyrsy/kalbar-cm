'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  FileText, 
  ChevronDown,
  Layers,
  MoreVertical,
  User,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'

type SubMenuItem = {
  title: string
  href: string
  allowedRoles?: string[]
  allowedSegments?: string[]
}

type MenuItem = {
  title: string
  href?: string
  icon: any
  allowedRoles: string[] 
  submenu?: SubMenuItem[]
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { showToast } = useToast()
  
  const profileRef = useRef<HTMLDivElement>(null)

  const [userRole, setUserRole] = useState<string | null>(null)
  const [userSegment, setUserSegment] = useState<string | null>(null)
  const [userData, setUserData] = useState<{ name: string, email: string } | null>(null)
  
  const [isMounted, setIsMounted] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>(['Dashboard', 'Kontrak'])
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const storedSession = localStorage.getItem('auth_session')
    
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession)
        const user = session.user
        
        setUserRole(user?.role || 'user')
        setUserSegment(user?.segment || '-')
        setUserData({ 
          name: user?.name || 'User', 
          email: user?.email || '' 
        })
      } catch (e) {
        setUserRole('user')
      }
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogoutClick = () => {
    setIsProfileMenuOpen(false)
    setIsLogoutModalOpen(true)
  }

  const confirmLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('auth_session')
      showToast('Berhasil keluar', 'success')
      router.push('/auth/login')
    } catch (error) {
      showToast('Gagal logout', 'error')
      setIsLogoutModalOpen(false)
    }
  }

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => 
      prev.includes(title) ? prev.filter(item => item !== title) : [...prev, title]
    )
  }

  const menuConfig: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['all'],
      submenu: [
        { title: 'Overview', href: '/dashboard', allowedRoles: ['all'] },
      ]
    },
    {
      title: 'Kontrak',
      icon: FileText,
      allowedRoles: ['all'],
      submenu: [
        { title: 'Daftar Kontrak', href: '/dashboard/contracts' },
        { title: 'Tipe Kontrak', href: '/dashboard/contract-types' },
        { title: 'Progress Kontrak', href: '/dashboard/contract-progress' },
      ]
    },
    {
      title: 'Layanan',
      icon: Layers,
      allowedRoles: ['super_admin'],
      submenu: [
        { title: 'Tipe Layanan', href: '/dashboard/service-types' },
        { title: 'Daftar Layanan', href: '/dashboard/services' },
      ]
    },
    {
      title: 'Pengguna',
      icon: Users,
      allowedRoles: ['super_admin'],
      submenu: [
        { title: 'Overview', href: '/dashboard/users/overview' },
        { title: 'Daftar Pengguna', href: '/dashboard/users' },
      ]
    }
  ]

  const segmentBadges = [
    { id: 'government_service', label: 'GOV', activeClass: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100' },
    { id: 'enterprise_service', label: 'ENT', activeClass: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-100' },
    { id: 'business_service', label: 'BIS', activeClass: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100' },
    { id: 'PRQ', label: 'PRQ', activeClass: 'bg-red-50 text-red-700 border-red-200 ring-red-100' },
  ]

  const renderMenu = () => {
    return menuConfig.map((item, index) => {
      if (item.allowedRoles[0] !== 'all' && !item.allowedRoles.includes(userRole || '')) {
        return null
      }

      if (item.submenu) {
        const visibleSubmenu = item.submenu.filter(sub => {
          if (userRole === 'super_admin') return true;
          if (userRole === 'account_manager') {
            if (sub.allowedSegments) return sub.allowedSegments.includes(userSegment || '');
            return true;
          }
          return false;
        });

        if (visibleSubmenu.length === 0) return null;
        const isOpen = openMenus.includes(item.title);
        const isActiveParent = visibleSubmenu.some(sub => pathname === sub.href);

        return (
          <li key={index}>
            <button
              onClick={() => toggleMenu(item.title)}
              className={`
                group flex w-full items-center justify-between rounded-xl px-4 py-3 text-[13px] font-medium transition-all duration-300
                ${isActiveParent || isOpen ? 'bg-gray-50 text-[#1C2A55] font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50/80 hover:text-[#1C2A55]'}
              `}
            >
              <div className="flex items-center">
                <item.icon size={18} className={`transition-colors duration-300 ${isActiveParent ? 'text-[#1C2A55]' : 'text-gray-400 group-hover:text-[#1C2A55]'}`} />
                <span className="ml-3.5 tracking-wide">{item.title}</span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <ul className="mt-1 space-y-1 pl-4 pr-2">
                {visibleSubmenu.map((sub, subIndex) => {
                  const isSubActive = pathname === sub.href;
                  return (
                    <li key={subIndex}>
                      <Link href={sub.href} className={`relative flex items-center rounded-lg py-2 pl-9 text-[12px] font-medium transition-all duration-300 ${isSubActive ? 'bg-[#1C2A55]/5 text-[#DA061A]' : 'text-gray-500 hover:text-[#1C2A55] hover:bg-gray-50'}`}>
                        {isSubActive && (
                          <div className="absolute left-4 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#DA061A]" />
                        )}
                        {sub.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </li>
        )
      }

      const isActive = pathname === item.href
      return (
        <li key={index}>
          <Link href={item.href || '#'} className={`group relative flex items-center rounded-xl px-4 py-3 text-[13px] font-medium transition-all duration-300 ease-in-out ${isActive ? 'bg-[#1C2A55] text-white shadow-lg shadow-[#1C2A55]/20 font-bold' : 'text-gray-500 hover:bg-gray-50/80 hover:text-[#1C2A55]'}`}>
            {isActive && <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#DA061A]" />}
            <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors duration-300 ${isActive ? 'text-[#DA061A]' : 'text-gray-400 group-hover:text-[#1C2A55]'}`} />
            <span className="ml-3.5 flex-1 tracking-wide">{item.title}</span>
            {isActive && <ChevronRight size={14} className="text-white/40" />}
          </Link>
        </li>
      )
    })
  }

  if (!isMounted) return null

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-100 bg-white/90 backdrop-blur-sm shadow-2xl shadow-blue-900/5 transition-all duration-300 font-sans">
        
        <div className="flex-none px-6 pt-10 pb-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-5 h-16 w-auto transition-transform duration-300 hover:scale-105">
               <Image 
                 src="/kapuas.png" 
                 alt="Logo Kapuas" 
                 width={60} 
                 height={60} 
                 className="object-contain drop-shadow-md"
                 priority
               />
            </div>
            
            <div className="text-center space-y-0.5">
              <h1 className="text-sm font-black tracking-widest text-[#1C2A55] uppercase leading-tight">
                Kontrak
              </h1>
              <h2 className="text-xs font-bold tracking-widest text-[#DA061A] uppercase leading-tight">
                Manajemen
              </h2>
            </div>

            {/* Segment Badges */}
            <div className="mt-6 grid w-full grid-cols-4 gap-2 px-1">
              {segmentBadges.map((badge) => {
                const isActive = userSegment === badge.id;
                return (
                  <div 
                    key={badge.id}
                    className={`
                      flex h-7 items-center justify-center rounded-lg text-[9px] font-bold transition-all duration-300 border
                      ${isActive 
                        ? `${badge.activeClass} shadow-md ring-2 ring-offset-1 scale-105` 
                        : 'border-gray-100 bg-gray-50 text-gray-300'}
                    `}
                  >
                    {badge.label}
                  </div>
                )
              })}
            </div>

            <div className="mt-8 w-full border-t border-dashed border-gray-200"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-transparent">
          <ul className="space-y-2 pb-6">
            {renderMenu()}
          </ul>
        </div>

        <div className="flex-none px-4 py-4 border-t border-gray-100 bg-white">
          <div className="relative" ref={profileRef}>
            {isProfileMenuOpen && (
              <div className="absolute bottom-full left-0 mb-3 w-full animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-blue-900/10 ring-1 ring-gray-50">
                  <div className="p-1.5 space-y-0.5">
                    <Link href="/dashboard/profile" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50 hover:text-[#1C2A55] transition-colors">
                      <User size={15} />
                      Profil Saya
                    </Link>
                    <div className="h-px bg-gray-100 mx-2" />
                    <button 
                      onClick={handleLogoutClick}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`
                group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-2.5 text-left transition-all duration-300
                ${isProfileMenuOpen ? 'border-[#1C2A55] bg-[#1C2A55]/5 ring-2 ring-[#1C2A55]/10' : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-white hover:shadow-sm'}
              `}
            >
               <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-all duration-300 ${userRole === 'super_admin' ? 'border-[#DA061A]/20 bg-[#DA061A]/10 text-[#DA061A]' : 'border-blue-200 bg-blue-50 text-blue-600'}`}>
                  <ShieldCheck size={16} strokeWidth={2.5} />
               </div>
               
               <div className="min-w-0 flex-1">
                 <p className="truncate text-[12px] font-bold text-[#1C2A55]">
                   {userData?.name}
                 </p>
                 <p className="truncate text-[10px] font-medium text-gray-400 group-hover:text-gray-500">
                   {userData?.email}
                 </p>
               </div>

               <MoreVertical size={14} className="text-gray-400 transition-colors group-hover:text-[#1C2A55]" />
            </button>
          </div>
        </div>
      </aside>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C2A55]/60 p-4 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="w-full max-w-xs overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-white/20">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#DA061A] ring-4 ring-red-50">
                <AlertTriangle size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-[#1C2A55]">Konfirmasi Keluar</h3>
              <p className="mt-2 text-xs font-medium text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin mengakhiri sesi ini? Anda harus login kembali untuk mengakses dashboard.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-600 transition-all hover:bg-gray-100 hover:text-[#1C2A55] active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="rounded-xl bg-[#DA061A] py-2.5 text-xs font-bold text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-700 active:scale-95"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}