'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { 
  Search, Plus, Package, ArrowUpDown, 
  ChevronLeft, ChevronRight, AlertTriangle, 
  Pencil, Trash2, X, Loader2, Save, RefreshCw, ChevronRight as ChevronIcon, FilterX
} from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'

type Service = {
  id: string
  name: string
  service_type_id: string
  created_by: string
  created_at: string
}

type ServiceType = {
  id: string
  name: string
}

export default function ServicesScreen() {
  const { showToast } = useToast()
  
  const [data, setData] = useState<Service[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [typeMap, setTypeMap] = useState<Record<string, string>>({})
  
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  const [selectedItem, setSelectedItem] = useState<Service | null>(null)
  const [formData, setFormData] = useState({ name: '', service_type_id: '' })

  const fetchServiceTypes = async () => {
    try {
      const res = await fetch('/api/service-types?limit=100')
      const json = await res.json()
      if (res.ok) {
        setServiceTypes(json.data)
        const map: Record<string, string> = {}
        json.data.forEach((t: ServiceType) => map[t.id] = t.name)
        setTypeMap(map)
      }
    } catch {}
  }

  const fetchServices = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(search && { search }),
        ...(filterType && { service_type_id: filterType })
      })

      const res = await fetch(`/api/services?${params}`)
      const json = await res.json()
      
      if (res.ok) {
        setData(json.data)
        setTotalPages(json.meta.total_pages)
      }
    } catch (error) {
      showToast('Gagal memuat data layanan', 'error')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [page, search, sortBy, sortOrder, filterType])

  useEffect(() => {
    fetchServiceTypes()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchServices(), 500)
    return () => clearTimeout(timer)
  }, [fetchServices])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchServiceTypes()
    fetchServices()
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
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, created_by: userId })
      })
      
      if (!res.ok) throw new Error('Gagal membuat layanan')
      
      showToast('Layanan berhasil dibuat', 'success')
      setIsCreateOpen(false)
      setFormData({ name: '', service_type_id: '' })
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
      const res = await fetch(`/api/services/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error('Gagal update layanan')

      showToast('Layanan berhasil diperbarui', 'success')
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
      const res = await fetch(`/api/services/${selectedItem.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus data')

      showToast('Layanan berhasil dihapus', 'success')
      setIsDeleteOpen(false)
      handleRefresh()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (item: Service) => {
    setSelectedItem(item)
    setFormData({ name: item.name, service_type_id: item.service_type_id })
    setIsEditOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 pb-20 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <Link href="/dashboard" className="hover:text-[#1C2A55] transition-colors">Dashboard</Link>
            <ChevronIcon size={12} strokeWidth={2} />
            <span className="text-[#1C2A55]">Master Data</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1C2A55]">Daftar Layanan</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data layanan dan klasifikasinya.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={isRefreshing} className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-[#1C2A55] transition-all disabled:opacity-70">
            <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { setFormData({ name: '', service_type_id: '' }); setIsCreateOpen(true) }} className="flex h-9 items-center gap-2 rounded-md bg-[#DA061A] px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-all active:scale-95">
            <Plus size={16} />
            <span>Tambah Layanan</span>
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-gray-100">
          <div className="relative w-full md:max-w-xs">
            <Search size={16} className="pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3 text-gray-400" />
            <input 
              type="text"
              placeholder="Cari layanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none focus:ring-1 focus:ring-[#1C2A55]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:border-[#1C2A55] focus:outline-none"
            >
              <option value="">Semua Tipe</option>
              {serviceTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            
            {filterType && (
              <button onClick={() => setFilterType('')} className="flex h-9 items-center gap-1 rounded-md border border-red-100 bg-red-50 px-3 text-xs font-medium text-red-600 hover:bg-red-100">
                <FilterX size={14} /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:text-[#1C2A55]" onClick={() => {
                   if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                   else { setSortBy('name'); setSortOrder('asc') }
                }}>
                  <div className="flex items-center gap-1">Nama Layanan <ArrowUpDown size={12}/></div>
                </th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Tipe Layanan</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Tanggal Dibuat</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-6 w-40 rounded bg-gray-100"/></td>
                    <td className="px-4 py-3"><div className="h-6 w-24 rounded bg-gray-100"/></td>
                    <td className="px-4 py-3"><div className="h-6 w-24 rounded bg-gray-100"/></td>
                    <td className="px-4 py-3"></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                        <Package size={24} className="opacity-30" />
                    </div>
                    <p className="text-sm font-medium">Belum ada data layanan</p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#1C2A55]">{item.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {typeMap[item.service_type_id] || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { setSelectedItem(item); setIsDeleteOpen(true) }} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all">
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
          <p className="text-xs text-gray-500">Hal. <span className="font-semibold text-[#1C2A55]">{page}</span> dari {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-[#1C2A55] hover:text-[#1C2A55] disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-[#1C2A55] hover:text-[#1C2A55] disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-bold text-[#1C2A55]">{isCreateOpen ? 'Tambah Layanan' : 'Edit Layanan'}</h3>
              <button onClick={() => { setIsCreateOpen(false); setIsEditOpen(false) }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={isCreateOpen ? handleCreate : handleUpdate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Nama Layanan</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none"
                  placeholder="Nama layanan baru"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Tipe Layanan</label>
                <select 
                  required
                  value={formData.service_type_id}
                  onChange={e => setFormData({ ...formData, service_type_id: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none"
                >
                  <option value="">Pilih Tipe</option>
                  {serviceTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1C2A55] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 active:scale-95 disabled:opacity-70">
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
          <div className="w-full max-w-sm rounded-lg bg-white shadow-xl animate-in zoom-in-95 p-6 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#DA061A]">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1C2A55]">Hapus Layanan?</h3>
              <p className="mt-2 text-sm text-gray-500">Anda yakin ingin menghapus <b>{selectedItem?.name}</b>? Tindakan ini permanen.</p>
              <div className="mt-6 flex w-full gap-3">
                <button onClick={() => setIsDeleteOpen(false)} className="w-full rounded-md border border-gray-300 bg-white py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
                <button onClick={handleDelete} disabled={isSubmitting} className="w-full rounded-md bg-[#DA061A] py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:scale-95">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}