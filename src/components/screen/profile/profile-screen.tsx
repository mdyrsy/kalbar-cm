'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User, Mail, Briefcase, Calendar, 
  Clock, Pencil, X, Loader2, Save, 
  ChevronRight as ChevronIcon, ShieldCheck, Trash2, AlertTriangle
} from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'

type UserProfile = {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'account_manager'
  segment: 'government_service' | 'business_service' | 'enterprise_service' | 'PRQ'
  created_at: string
  last_login: string | null
}

export default function ProfileScreen() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    segment: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedSession = localStorage.getItem('auth_session')
        if (!storedSession) throw new Error('Sesi tidak ditemukan')

        const session = JSON.parse(storedSession)
        const id = session?.user?.id
        if (!id) throw new Error('User ID invalid')

        const res = await fetch(`/api/users/${id}`)
        const json = await res.json()
        
        if (res.ok && json.data) {
          setProfile(json.data)
        } else {
          throw new Error(json.message || 'Gagal memuat profile')
        }
      } catch (error: any) {
        showToast(error.message, 'error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleOpenEdit = () => {
    if (!profile) return
    setFormData({
      name: profile.name,
      email: profile.email,
      role: profile.role,
      segment: profile.segment
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/users/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          segment: formData.segment
        })
      })
      
      const json = await res.json()

      if (res.ok) {
        setProfile(json.data)
        showToast('Profile berhasil diperbarui', 'success')
        setIsEditOpen(false)
        
        const storedSession = localStorage.getItem('auth_session')
        if (storedSession) {
          const session = JSON.parse(storedSession)
          if (session.user) {
             session.user.name = formData.name
             session.user.role = formData.role 
             localStorage.setItem('auth_session', JSON.stringify(session))
          }
        }
      } else {
        throw new Error(json.error || 'Gagal update profile')
      }
    } catch (error: any) {
      showToast(error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!profile) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/users/${profile.id}`, {
        method: 'DELETE'
      })
      
      const json = await res.json()

      if (res.ok) {
        showToast('Akun berhasil dinonaktifkan', 'success')
        localStorage.removeItem('auth_session')
        router.push('/auth/login')
      } else {
        throw new Error(json.error || 'Gagal menghapus akun')
      }
    } catch (error: any) {
      showToast(error.message, 'error')
    } finally {
      setIsSubmitting(false)
      setIsDeleteOpen(false)
    }
  }

  const formatSegment = (seg: string) => {
    if (seg === 'PRQ') return 'PRQ Service'
    if (!seg) return '-'
    return seg.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#DA061A]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-20 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <Link href="/dashboard" className="hover:text-[#1C2A55] transition-colors">Dashboard</Link>
            <ChevronIcon size={12} strokeWidth={2} />
            <span className="text-[#1C2A55]">Profile</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1C2A55]">
            Profil Saya
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Informasi detail akun dan preferensi sistem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDeleteOpen(true)}
            className="flex h-9 items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-semibold text-[#DA061A] shadow-sm hover:bg-red-100 transition-all active:scale-95"
          >
            <Trash2 size={16} />
            <span>Hapus Akun</span>
          </button>
          
          <button 
            onClick={handleOpenEdit}
            className="flex h-9 items-center gap-2 rounded-md bg-[#1C2A55] px-5 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 hover:bg-blue-900 transition-all active:scale-95"
          >
            <Pencil size={16} />
            <span>Edit Profil</span>
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        
        <div className="relative h-32 w-full bg-gradient-to-r from-[#1C2A55] via-[#243466] to-[#DA061A]">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>

        <div className="relative px-8 pb-8">
            <div className="flex flex-col items-center md:flex-row md:items-end md:gap-6">
                <div className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[6px] border-white bg-gray-50 shadow-lg">
                    <User size={40} className="text-[#1C2A55]/80" strokeWidth={1} />
                </div>
                
                <div className="mt-4 flex-1 text-center md:mt-0 md:mb-2 md:text-left">
                    <h2 className="text-2xl font-black text-[#1C2A55] tracking-tight">{profile?.name}</h2>
                    <div className="mt-1 flex justify-center md:justify-start">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          profile?.role === 'super_admin' 
                            ? 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/20' 
                            : 'bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20'
                        }`}>
                          <ShieldCheck size={10} />
                          {profile?.role === 'super_admin' ? 'Super Administrator' : 'Account Manager'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="border-t border-gray-100"></div>

        <div className="grid grid-cols-1 gap-px bg-gray-100 md:grid-cols-2 lg:grid-cols-4">
            
            <div className="bg-white p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Mail size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Email</span>
                        <span className="text-sm font-semibold text-[#1C2A55] truncate">{profile?.email}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <Briefcase size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Segmen</span>
                        <span className="text-sm font-semibold text-[#1C2A55]">{formatSegment(profile?.segment || '')}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Calendar size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bergabung</span>
                        <span className="text-sm font-medium text-gray-700">{formatDate(profile?.created_at)}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <Clock size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Login Terakhir</span>
                        <span className="text-sm font-medium text-gray-700">{formatDate(profile?.last_login)}</span>
                    </div>
                </div>
            </div>

        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3">
            <p className="text-xs text-center md:text-left text-gray-400">User ID: <span className="font-mono text-gray-500">{profile?.id}</span></p>
        </div>

      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <h3 className="text-lg font-bold text-[#1C2A55]">Update Informasi</h3>
              <button onClick={() => setIsEditOpen(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nama Lengkap</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none focus:ring-2 focus:ring-[#1C2A55]/10 transition-all"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                <input 
                  disabled
                  type="email" 
                  value={formData.email}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Role Akses</label>
                  <select 
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none focus:ring-2 focus:ring-[#1C2A55]/10 cursor-pointer"
                  >
                      <option value="account_manager">AM</option>
                      <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Segmen</label>
                  <select 
                      value={formData.segment}
                      onChange={e => setFormData({...formData, segment: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none focus:ring-2 focus:ring-[#1C2A55]/10 cursor-pointer"
                  >
                      <option value="PRQ">PRQ</option>
                      <option value="government_service">Government</option>
                      <option value="enterprise_service">Enterprise</option>
                      <option value="business_service">Business</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1C2A55] py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/10 hover:bg-blue-900 hover:shadow-xl active:scale-[0.98] disabled:opacity-70 transition-all"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl animate-in zoom-in-95 p-6 duration-200 ring-1 ring-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#DA061A]">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#1C2A55]">Konfirmasi Hapus Akun</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin menonaktifkan akun <span className="font-bold text-[#1C2A55]">{profile?.name}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="mt-6 flex w-full gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#1C2A55] transition-all disabled:opacity-70"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#DA061A] py-2.5 text-sm font-bold text-white shadow-lg shadow-red-900/20 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}