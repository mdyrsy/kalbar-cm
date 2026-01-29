'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { 
  Search, Plus, Users, ArrowUpDown, 
  ChevronLeft, ChevronRight, AlertTriangle, 
  Pencil, Trash2, X, Loader2, Save, RefreshCw, FilterX, ChevronRight as ChevronIcon
} from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'

// --- Tipe Data ---
type User = {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'account_manager'
  segment: 'government_service' | 'business_service' | 'enterprise_service' | 'PRQ'
  last_login: string | null
  created_at: string
}

type DashboardStats = {
  total: number
  gov: number
  ent: number
  biz: number
  prq: number
  admin: number
  am: number
}

// --- State Awal Form ---
const initialFormState = {
  name: '',
  email: '',
  password: '',
  role: 'account_manager',
  segment: 'PRQ'
}

export default function UsersScreen() {
  const { showToast } = useToast()
  
  // --- State Data Utama ---
  const [data, setData] = useState<User[]>([])
  const [stats, setStats] = useState<DashboardStats>({ 
    total: 0, gov: 0, ent: 0, biz: 0, prq: 0, admin: 0, am: 0 
  })

  // --- State UI & Loading ---
  const [isLoading, setIsLoading] = useState(true)
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- State Filter & Pagination ---
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [filterSegment, setFilterSegment] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const isFiltered = search !== '' || filterSegment !== '' || filterRole !== ''

  // --- State Modals ---
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  // --- State Form Editing ---
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState(initialFormState)

  // --- 1. Fetch Users Data ---
  const fetchUsers = useCallback(async (background = false) => {
    if (background) setIsBackgroundLoading(true)
    else setIsLoading(true)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(search && { search }),
        ...(filterSegment && { segment: filterSegment }),
        ...(filterRole && { role: filterRole })
      })

      const res = await fetch(`/api/users?${params}`)
      const json = await res.json()
      
      if (res.ok) {
        setData(json.data)
        setTotalPages(json.meta.total_pages)
      }
    } catch (error) {
      console.error(error)
      showToast('Gagal memuat data user', 'error')
    } finally {
      setIsLoading(false)
      setIsBackgroundLoading(false)
      setIsRefreshing(false)
    }
  }, [page, search, filterSegment, filterRole, sortBy, sortOrder, showToast])

  // --- 2. Fetch Dashboard Stats ---
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/users?limit=1&stats=true')
      const json = await res.json()
      if (json.stats) {
        setStats({
          total: json.stats.total,
          gov: json.stats.segments.government,
          ent: json.stats.segments.enterprise,
          biz: json.stats.segments.business,
          prq: json.stats.segments.prq,
          admin: json.stats.roles.super_admin,
          am: json.stats.roles.account_manager
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  // --- Initial Load & Debounce ---
  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 500)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  // --- Handlers ---

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchStats()
    fetchUsers(true)
  }

  const handleResetFilters = () => {
    setSearch('')
    setFilterSegment('')
    setFilterRole('')
    setSortBy('created_at')
    setSortOrder('desc')
    setPage(1)
    showToast('Filter berhasil direset', 'success')
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const formatSegment = (seg: string) => {
    if (seg === 'PRQ') return 'PRQ Service'
    if (!seg) return '-'
    return seg.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  // --- CRUD Actions ---

  // A. Create User
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const result = await res.json()
      
      if (!res.ok) throw new Error(result.error || 'Gagal membuat user')
      
      showToast('User berhasil dibuat', 'success')
      setIsCreateOpen(false)
      setFormData(initialFormState)
      handleRefresh()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // B. Setup Edit Modal
  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Password kosong saat edit (kecuali mau reset)
      role: user.role,
      segment: user.segment
    })
    setIsEditOpen(true)
  }

  // C. Update User (Submit Edit)
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setIsSubmitting(true)
    try {
      // Kirim hanya field yang boleh diupdate (name, role, segment)
      // Backend PATCH tidak menerima password/email di endpoint ini biasanya
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          segment: formData.segment
        })
      })
      
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Gagal update user')

      showToast('User berhasil diperbarui', 'success')
      setIsEditOpen(false)
      handleRefresh()
    } catch (err: any) {
      showToast(err.message || 'Gagal update user', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // D. Setup Delete Modal
  const openDeleteModal = (user: User) => {
    setSelectedUser(user)
    setIsDeleteOpen(true)
  }

  // E. Delete User (Submit Delete)
  const handleDelete = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE'
      })
      
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Gagal hapus user')

      showToast('User berhasil dihapus', 'success')
      setIsDeleteOpen(false)
      handleRefresh()
    } catch (err: any) {
      showToast(err.message || 'Gagal hapus user', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-20 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Page */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <Link href="/dashboard" className="hover:text-[#1C2A55] transition-colors">Dashboard</Link>
            <ChevronIcon size={12} strokeWidth={2} />
            <span className="text-[#1C2A55]">Management</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1C2A55]">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola akses dan data pengguna sistem.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-[#1C2A55] transition-all disabled:opacity-70"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={() => { setFormData(initialFormState); setIsCreateOpen(true) }}
            className="flex h-9 items-center gap-2 rounded-md bg-[#DA061A] px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Tambah User</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        
        {/* Filters Toolbar */}
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-gray-100">
          <div className="relative w-full md:max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search size={16} />
            </div>
            <input 
              type="text"
              placeholder="Cari nama/email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-[#1C2A55] placeholder:text-gray-400 focus:border-[#1C2A55] focus:outline-none focus:ring-1 focus:ring-[#1C2A55] transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select 
              value={filterSegment}
              onChange={(e) => setFilterSegment(e.target.value)}
              className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:border-[#1C2A55] focus:outline-none cursor-pointer"
            >
              <option value="">Semua Segmen</option>
              <option value="government_service">Government</option>
              <option value="enterprise_service">Enterprise</option>
              <option value="business_service">Business</option>
              <option value="PRQ">PRQ</option>
            </select>

            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:border-[#1C2A55] focus:outline-none cursor-pointer"
            >
              <option value="">Semua Role</option>
              <option value="account_manager">AM</option>
              <option value="super_admin">Admin</option>
            </select>

            <button
              onClick={handleResetFilters}
              disabled={!isFiltered}
              className={`flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-all ${
                isFiltered 
                  ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
              }`}
            >
              <FilterX size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:text-[#1C2A55]" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">User Info <ArrowUpDown size={12}/></div>
                </th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Segmen</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:text-[#1C2A55]" onClick={() => handleSort('last_login')}>
                  <div className="flex items-center gap-1">Login Terakhir <ArrowUpDown size={12}/></div>
                </th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-8 w-40 rounded bg-gray-100"/></td>
                    <td className="px-4 py-3"><div className="h-6 w-20 rounded bg-gray-100"/></td>
                    <td className="px-4 py-3"><div className="h-6 w-24 rounded bg-gray-100"/></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-gray-100"/></td>
                    <td className="px-4 py-3"></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                        <Users size={24} className="opacity-30" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Data tidak ditemukan</p>
                  </td>
                </tr>
              ) : (
                data.map((user) => (
                  <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#1C2A55] text-sm">{user.name}</span>
                        <span className="text-xs text-gray-400">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium border ${
                        user.role === 'super_admin' 
                            ? 'bg-red-50 text-red-600 border-red-100' 
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Account Manager'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium border ${
                        getSegmentColor(user.segment)
                      }`}>
                        {user.segment === 'PRQ' ? 'PRQ Service' : formatSegment(user.segment)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : <span className="text-gray-300 italic">-</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                          title="Edit User"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(user)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                          title="Hapus User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 p-3">
          <p className="text-xs text-gray-500">
            Hal. <span className="font-semibold text-[#1C2A55]">{page}</span> dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-[#1C2A55] hover:text-[#1C2A55] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-[#1C2A55] hover:text-[#1C2A55] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- CREATE MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-bold text-[#1C2A55]">Tambah Pengguna</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Nama Lengkap</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none focus:ring-1 focus:ring-[#1C2A55]"
                  placeholder="Nama Lengkap"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Email</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none focus:ring-1 focus:ring-[#1C2A55]"
                  placeholder="email@perusahaan.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Password</label>
                <input 
                  required
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none focus:ring-1 focus:ring-[#1C2A55]"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Role</label>
                  <select 
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none"
                  >
                      <option value="account_manager">AM</option>
                      <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Segmen</label>
                  <select 
                      value={formData.segment}
                      onChange={e => setFormData({...formData, segment: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none"
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
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#DA061A] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:scale-95 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-bold text-[#1C2A55]">Edit Pengguna</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none focus:ring-1 focus:ring-[#1C2A55]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Email (Read Only)</label>
                <input 
                  disabled
                  type="email" 
                  value={formData.email}
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Role</label>
                  <select 
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none"
                  >
                      <option value="account_manager">AM</option>
                      <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Segmen</label>
                  <select 
                      value={formData.segment}
                      onChange={e => setFormData({...formData, segment: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none"
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
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1C2A55] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 active:scale-95 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-lg bg-white shadow-xl animate-in zoom-in-95 p-6 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#DA061A]">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1C2A55]">Hapus Pengguna?</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus user <span className="font-bold text-[#1C2A55]">{selectedUser?.name}</span>? <br/> Tindakan ini permanen.
              </p>
              <div className="mt-6 flex w-full gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-[#DA061A] py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:scale-95 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Loading Background Indicator --- */}
      {isBackgroundLoading && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-md bg-white px-4 py-3 shadow-lg border border-gray-100 animate-in slide-in-from-bottom-4">
          <Loader2 size={18} className="animate-spin text-[#DA061A]" />
          <span className="text-sm font-medium text-[#1C2A55]">Memuat data...</span>
        </div>
      )}

    </div>
  )
}

function getSegmentColor(segment: string) {
  switch (segment) {
    case 'government_service': return 'bg-blue-50 text-blue-700 border-blue-100'
    case 'enterprise_service': return 'bg-purple-50 text-purple-700 border-purple-100'
    case 'business_service': return 'bg-amber-50 text-amber-700 border-amber-100'
    case 'PRQ': return 'bg-red-50 text-red-700 border-red-100'
    default: return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}