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
  AlertTriangle,
  BarChart3
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
  const [openMenus, setOpenMenus] = useState<string[]>(['Dashboard', 'Pengguna'])
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

  const formatSegment = (seg: string | null) => {
    if (!seg) return '-'
    return seg.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

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
        { title: 'Government', href: '/dashboard/government', allowedRoles: ['super_admin'], allowedSegments: ['government_service'] },
        { title: 'Enterprise', href: '/dashboard/enterprise', allowedRoles: ['super_admin'], allowedSegments: ['enterprise_service'] },
        { title: 'Business', href: '/dashboard/business', allowedRoles: ['super_admin'], allowedSegments: ['business_service'] },
      ]
    },
    {
      title: 'Kontrak',
      href: '/dashboard/contracts',
      icon: FileText,
      allowedRoles: ['all']
    },
    {
      title: 'Layanan',
      icon: Layers,
      allowedRoles: ['super_admin'],
      submenu: [
        { title: 'Tipe Layanan', href: '/dashboard/service-type' },
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
    { id: 'government_service', label: 'GOV', activeClass: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 'enterprise_service', label: 'ENT', activeClass: 'bg-purple-50 text-purple-600 border-purple-200' },
    { id: 'business_service', label: 'BIS', activeClass: 'bg-amber-50 text-amber-600 border-amber-200' },
    { id: 'PRQ', label: 'PRQ', activeClass: 'bg-red-50 text-red-600 border-red-200' },
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
                group flex w-full items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium transition-all
                ${isActiveParent || isOpen ? 'bg-gray-50 text-[#1C2A55] font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-[#1C2A55]'}
              `}
            >
              <div className="flex items-center">
                <item.icon size={16} className={isActiveParent ? 'text-[#1C2A55]' : 'text-gray-400 group-hover:text-[#1C2A55]'} />
                <span className="ml-3">{item.title}</span>
              </div>
              <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <ul className="mt-1 space-y-0.5 pl-8 pr-2">
                {visibleSubmenu.map((sub, subIndex) => {
                  const isSubActive = pathname === sub.href;
                  return (
                    <li key={subIndex}>
                      <Link href={sub.href} className={`block rounded-md py-1.5 pl-3 text-[12px] font-medium transition-colors ${isSubActive ? 'bg-[#1C2A55]/5 text-[#DA061A] border-l-2 border-[#DA061A]' : 'text-gray-500 hover:text-[#1C2A55] border-l-2 border-transparent'}`}>
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
          <Link href={item.href || '#'} className={`group relative flex items-center rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-200 ease-in-out ${isActive ? 'bg-[#1C2A55] text-white shadow-md shadow-[#1C2A55]/20 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-[#1C2A55]'}`}>
            {isActive && <div className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-[#DA061A]" />}
            <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors duration-200 ${isActive ? 'text-[#DA061A]' : 'text-gray-400 group-hover:text-[#1C2A55]'}`} />
            <span className="ml-3 flex-1">{item.title}</span>
            {isActive && <ChevronRight size={13} className="text-white/40" />}
          </Link>
        </li>
      )
    })
  }

  if (!isMounted) return null

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-gray-100 bg-white shadow-xl shadow-blue-900/5 transition-all duration-300 font-sans">
        <div className="flex-none px-4 pt-6 pb-2">
          <div className="flex flex-col items-center">
            <div className="relative mb-2 h-14 w-auto">
               <Image 
                 src="/kapuas.png" 
                 alt="Logo Kapuas" 
                 width={50} 
                 height={50} 
                 className="object-contain"
                 priority
               />
            </div>
            
            <h1 className="text-sm font-bold tracking-tight text-[#1C2A55] uppercase text-center leading-tight">
              Kontrak Manajemen
            </h1>

            <div className="mt-3 flex w-full flex-wrap justify-center gap-1">
              {segmentBadges.map((badge) => {
                const isActive = userSegment === badge.id;
                
                return (
                  <span 
                    key={badge.id}
                    className={`
                      flex items-center justify-center rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all duration-300
                      ${isActive 
                        ? `${badge.activeClass} shadow-sm ring-1 ring-black/5` 
                        : 'border border-gray-100 bg-white text-gray-300'}
                    `}
                  >
                    {badge.label}
                  </span>
                )
              })}
            </div>

            <div className="mt-4 w-full border-t border-gray-100"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
          <ul className="space-y-0.5 pb-4">
            {renderMenu()}
          </ul>
        </div>

        <div className="flex-none px-3 py-3 border-t border-gray-50 bg-white">
          <div className="relative" ref={profileRef}>
            
            {isProfileMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full animate-in slide-in-from-bottom-2 fade-in duration-200">
                <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg shadow-blue-900/10">
                  <div className="p-1">
                    <Link href="/dashboard/profile" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 hover:text-[#1C2A55]">
                      <User size={14} />
                      Profil Saya
                    </Link>
                    
                    <div className="my-1 h-px bg-gray-100" />
                    <button 
                      onClick={handleLogoutClick}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[12px] font-medium text-red-500 hover:bg-red-50"
                    >
                      <LogOut size={14} />
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`
                group relative flex w-full items-center gap-2.5 overflow-hidden rounded-lg border p-2 text-left transition-all duration-200
                ${isProfileMenuOpen ? 'border-[#1C2A55] bg-[#1C2A55]/5' : 'border-gray-100 bg-[#FAFAFA] hover:border-gray-200 hover:bg-gray-50'}
              `}
            >
               <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${userRole === 'super_admin' ? 'border-[#DA061A]/20 bg-[#DA061A]/10 text-[#DA061A]' : 'border-blue-200 bg-blue-50 text-blue-600'}`}>
                  <ShieldCheck size={14} />
               </div>
               
               <div className="min-w-0 flex-1">
                 <p className="truncate text-[12px] font-bold text-[#1C2A55]">
                   {userData?.name}
                 </p>
                 <p className="truncate text-[10px] text-gray-400">
                   {userData?.email}
                 </p>
               </div>

               <MoreVertical size={12} className="text-gray-400 group-hover:text-[#1C2A55]" />
            </button>
          </div>
        </div>
      </aside>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C2A55]/40 p-4 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="w-full max-w-xs overflow-hidden rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-[#DA061A]">
                <AlertTriangle size={20} strokeWidth={2} />
              </div>
              <h3 className="text-base font-bold text-[#1C2A55]">Konfirmasi Keluar</h3>
              <p className="mt-1 text-xs text-gray-500">
                Apakah Anda yakin ingin mengakhiri sesi ini?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="rounded-lg border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#1C2A55]"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="rounded-lg bg-[#DA061A] py-2 text-xs font-semibold text-white shadow-md shadow-red-900/20 transition-all hover:bg-red-700 active:scale-95"
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