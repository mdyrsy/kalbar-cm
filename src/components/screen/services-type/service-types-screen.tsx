'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { 
  Search, Plus, Layers, ArrowUpDown, 
  ChevronLeft, ChevronRight, AlertTriangle, 
  Pencil, Trash2, X, Loader2, Save, RefreshCw, ChevronRight as ChevronIcon
} from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'

type ServiceType = {
  id: string
  name: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export default function ServiceTypesScreen() {
  const { showToast } = useToast()
  
  const [data, setData] = useState<ServiceType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'name'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  const [selectedItem, setSelectedItem] = useState<ServiceType | null>(null)
  const [formData, setFormData] = useState({ name: '' })

  // --- UPDATE: FETCH FUNCTION YANG LEBIH AMAN ---
  const fetchServiceTypes = useCallback(async (background = false) => {
    if (!background) setIsLoading(true)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(search && { search })
      })

      const res = await fetch(`/api/service-types?${params}`)
      
      // Cek Content-Type sebelum parsing JSON
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("API Error (Not JSON):", text) // Cek console browser untuk lihat error HTML-nya
        throw new Error("Terjadi kesalahan server (API Not Found/Error)")
      }

      const json = await res.json()
      
      if (res.ok) {
        setData(json.data)
        setTotalPages(json.meta.total_pages)
      } else {
        console.error("API Data Error:", json.error)
      }
    } catch (error: any) {
      console.error("Network error:", error)
      showToast(error.message || 'Gagal terhubung ke server', 'error')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [page, search, sortBy, sortOrder, showToast])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServiceTypes()
    }, 500)
    return () => clearTimeout(timer)
  }, [fetchServiceTypes])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchServiceTypes(true)
  }

  const handleSort = (field: 'created_at' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getUserId = () => {
    try {
      const session = localStorage.getItem('auth_session')
      if (session) return JSON.parse(session)?.user?.id
    } catch {}
    return null
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const userId = getUserId()
      const res = await fetch('/api/service-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, created_by: userId })
      })
      
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Gagal membuat data')
      
      showToast('Tipe layanan berhasil dibuat', 'success')
      setIsCreateOpen(false)
      setFormData({ name: '' })
      handleRefresh()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/service-types/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name })
      })
      
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Gagal update data')

      showToast('Data berhasil diperbarui', 'success')
      setIsEditOpen(false)
      handleRefresh()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/service-types/${selectedItem.id}`, { method: 'DELETE' })
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus data')

      showToast('Data berhasil dihapus', 'success')
      setIsDeleteOpen(false)
      handleRefresh()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (item: ServiceType) => {
    setSelectedItem(item)
    setFormData({ name: item.name })
    setIsEditOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 pb-20 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <Link href="/dashboard" className="hover:text-[#1C2A55] transition-colors">Dashboard</Link>
            <ChevronIcon size={12} strokeWidth={2} />
            <span className="text-[#1C2A55]">Master Data</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1C2A55]">Tipe Layanan</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola kategori layanan yang tersedia.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-[#1C2A55] transition-all disabled:opacity-70"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => { setFormData({ name: '' }); setIsCreateOpen(true) }}
            className="flex h-9 items-center gap-2 rounded-md bg-[#DA061A] px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Tambah Tipe</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-gray-100">
          <div className="relative w-full md:max-w-xs">
            <Search size={16} className="pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3 text-gray-400" />
            <input 
              type="text"
              placeholder="Cari tipe layanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none focus:ring-1 focus:ring-[#1C2A55] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th 
                  className="px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:text-[#1C2A55] transition-colors" 
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Nama Tipe 
                    <ArrowUpDown size={12} className={sortBy === 'name' ? 'text-[#DA061A]' : 'text-gray-400'}/>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:text-[#1C2A55] transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    Tanggal Dibuat 
                    <ArrowUpDown size={12} className={sortBy === 'created_at' ? 'text-[#DA061A]' : 'text-gray-400'}/>
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-6 w-48 rounded bg-gray-100"/></td>
                    <td className="px-4 py-3"><div className="h-6 w-32 rounded bg-gray-100"/></td>
                    <td className="px-4 py-3"></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-16 text-center text-gray-400">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                        <Layers size={24} className="opacity-30" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Tidak ada data ditemukan</p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau tambah data baru.</p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#1C2A55]">{item.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openEdit(item)} 
                          className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all" 
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => { setSelectedItem(item); setIsDeleteOpen(true) }} 
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all" 
                          title="Hapus"
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

        <div className="flex items-center justify-between border-t border-gray-100 p-3">
          <p className="text-xs text-gray-500">
            Halaman <span className="font-bold text-[#1C2A55]">{page}</span> dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1 || isLoading} 
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-[#1C2A55] hover:text-[#1C2A55] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages || isLoading} 
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-[#1C2A55] hover:text-[#1C2A55] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-lg bg-white shadow-xl animate-in zoom-in-95 duration-200 ring-1 ring-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-bold text-[#1C2A55]">
                {isCreateOpen ? 'Tambah Tipe Baru' : 'Edit Tipe Layanan'}
              </h3>
              <button 
                onClick={() => { setIsCreateOpen(false); setIsEditOpen(false) }} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={isCreateOpen ? handleCreate : handleUpdate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Nama Tipe Layanan</label>
                <input 
                  required
                  autoFocus
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none focus:ring-1 focus:ring-[#1C2A55] transition-all"
                  placeholder="Contoh: Perizinan, Umum, Khusus"
                />
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1C2A55] py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 hover:bg-blue-900 active:scale-95 disabled:opacity-70 transition-all"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs rounded-lg bg-white shadow-xl animate-in zoom-in-95 p-6 duration-200 ring-1 ring-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#DA061A]">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#1C2A55]">Hapus Data?</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Anda yakin ingin menghapus <b>{selectedItem?.name}</b>? <br/> Data yang dihapus tidak dapat dikembalikan.
              </p>
              
              <div className="mt-6 flex w-full gap-3">
                <button 
                  onClick={() => setIsDeleteOpen(false)} 
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-70 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={isSubmitting} 
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-[#DA061A] py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:scale-95 disabled:opacity-70 transition-all"
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