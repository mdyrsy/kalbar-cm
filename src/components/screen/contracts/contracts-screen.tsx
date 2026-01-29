'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Search, Plus, FileText, ArrowUpDown,
  ChevronLeft, ChevronRight, AlertTriangle,
  Pencil, Trash2, X, Loader2, Save, RefreshCw,
  ChevronRight as ChevronIcon, Filter, DollarSign, Calendar, ExternalLink, Link as LinkIcon
} from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'

type Contract = {
  id: string
  segment: 'government_service' | 'business_service' | 'enterprise_service' | 'PRQ'
  pic_user_id: string | null
  service_id: string | null
  contract_type_id: string | null
  contract_progress_id: string | null
  contract_kind: string | null
  customer_name: string
  contract_number: string
  contract_value: number
  progress_note: string | null
  payment_note: string | null
  contract_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

type ContractLink = {
  id: string
  contract_id: string
  label: string | null
  url: string
  is_primary: boolean
  created_at: string
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatSegment = (seg: string) => {
  if (seg === 'PRQ') return 'PRQ'
  if (seg === 'government_service') return 'GOV'
  if (seg === 'enterprise_service') return 'ENT'
  if (seg === 'business_service') return 'BIS'
  return '-'
}

export default function ContractsScreen() {
  const { showToast } = useToast()

  const [data, setData] = useState<Contract[]>([])

  const [serviceTypes, setServiceTypes] = useState<any[]>([])
  const [contractTypes, setContractTypes] = useState<any[]>([])
  const [progressStatus, setProgressStatus] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [filterSegment, setFilterSegment] = useState('')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLinksOpen, setIsLinksOpen] = useState(false)

  const [selectedItem, setSelectedItem] = useState<Contract | null>(null)
  const [contractLinks, setContractLinks] = useState<ContractLink[]>([])
  const [newLink, setNewLink] = useState({ label: '', url: '' })

  const initialFormState = {
    customer_name: '',
    contract_number: '',
    contract_value: 0,
    segment: 'government_service',
    contract_date: new Date().toISOString().split('T')[0],
    pic_user_id: '',
    service_id: '',
    contract_type_id: '',
    contract_progress_id: '',
    contract_kind: '',
    progress_note: '',
    payment_note: ''
  }

  const [formData, setFormData] = useState(initialFormState)

  const fetchContracts = useCallback(async (background = false) => {
    if (!background) setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(filterSegment && { segment: filterSegment })
      })

      const res = await fetch(`/api/contracts?${params}`)
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) throw new Error("API Error")

      const json = await res.json()
      if (res.ok) {
        setData(json.data)
        setTotalPages(json.meta.total_pages)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [page, search, filterSegment])

  const fetchOptions = async () => {
    try {
      const [svcRes, typeRes, progRes, userRes] = await Promise.all([
        fetch('/api/services?limit=100').then(r => r.ok ? r.json() : { data: [] }),
        fetch('/api/contract-types?limit=100').then(r => r.ok ? r.json() : { data: [] }),
        fetch('/api/contract-progress?limit=100').then(r => r.ok ? r.json() : { data: [] }),
        fetch('/api/users?limit=100').then(r => r.ok ? r.json() : { data: [] })
      ])

      setServiceTypes(svcRes.data || [])
      setContractTypes(typeRes.data || [])
      setProgressStatus(progRes.data || [])
      setUsers(userRes.data || [])
    } catch (e) { console.error("Gagal load options", e) }
  }

  const fetchLinks = async (contractId: string) => {
    try {
      const res = await fetch(`/api/contract-links?contract_id=${contractId}`)
      const json = await res.json()
      if (res.ok) setContractLinks(json.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchOptions()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchContracts(), 500)
    return () => clearTimeout(timer)
  }, [fetchContracts])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchContracts(true)
  }

  const getUserId = () => {
    try {
      const session = localStorage.getItem('auth_session')
      if (session) return JSON.parse(session)?.user?.id
    } catch { }
    return null
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        contract_value: Number(formData.contract_value),
        pic_user_id: formData.pic_user_id || null,
        service_id: formData.service_id || null,
        contract_type_id: formData.contract_type_id || null,
        contract_progress_id: formData.contract_progress_id || null,
        created_by: getUserId()
      }

      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()

      if (!res.ok) throw new Error('Gagal membuat kontrak')

      showToast('Kontrak berhasil dibuat', 'success')
      setIsCreateOpen(false)
      setFormData(initialFormState)

      // Auto open links modal for the newly created contract
      if (json.data) {
        setSelectedItem(json.data)
        setContractLinks([])
        setIsLinksOpen(true)
      }

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
      const payload = {
        ...formData,
        contract_value: Number(formData.contract_value),
        pic_user_id: formData.pic_user_id || null,
        service_id: formData.service_id || null,
        contract_type_id: formData.contract_type_id || null,
        contract_progress_id: formData.contract_progress_id || null,
      }

      const res = await fetch(`/api/contracts/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Gagal update kontrak')

      showToast('Kontrak berhasil diperbarui', 'success')
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
      const res = await fetch(`/api/contracts/${selectedItem.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus data')

      showToast('Kontrak berhasil dihapus', 'success')
      setIsDeleteOpen(false)
      handleRefresh()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !newLink.url) return

    try {
      const res = await fetch('/api/contract-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_id: selectedItem.id,
          label: newLink.label || null,
          url: newLink.url,
          is_primary: false
        })
      })

      if (res.ok) {
        setNewLink({ label: '', url: '' })
        fetchLinks(selectedItem.id)
        showToast('Link berhasil ditambahkan', 'success')
      }
    } catch (error) {
      showToast('Gagal menambah link', 'error')
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      const res = await fetch(`/api/contract-links/${linkId}`, { method: 'DELETE' })
      if (res.ok) {
        setContractLinks(prev => prev.filter(l => l.id !== linkId))
        showToast('Link dihapus', 'success')
      }
    } catch (error) {
      showToast('Gagal hapus link', 'error')
    }
  }

  const openEdit = (item: Contract) => {
    setSelectedItem(item)
    setFormData({
      customer_name: item.customer_name,
      contract_number: item.contract_number,
      contract_value: item.contract_value,
      segment: item.segment,
      contract_date: item.contract_date ? new Date(item.contract_date).toISOString().split('T')[0] : '',
      pic_user_id: item.pic_user_id || '',
      service_id: item.service_id || '',
      contract_type_id: item.contract_type_id || '',
      contract_progress_id: item.contract_progress_id || '',
      contract_kind: item.contract_kind || '',
      progress_note: item.progress_note || '',
      payment_note: item.payment_note || ''
    })
    setIsEditOpen(true)
  }

  const openLinks = (item: Contract) => {
    setSelectedItem(item)
    setContractLinks([])
    fetchLinks(item.id)
    setIsLinksOpen(true)
  }

  const getServiceName = (serviceId: string | null) => {
    if (!serviceId) return '-'
    const service = serviceTypes.find(s => s.id === serviceId)
    if (!service) return '-'

    // Asumsi serviceTypes object punya relasi service_type (jika di-join) 
    // atau kita fetch service_types terpisah.
    // Di sini kita tampilkan format simpel dulu: Nama Layanan
    // Jika backend support join, bisa: `${service.name} - ${service.service_type?.name}`
    return service.name
  }

  return (
    <div className="flex flex-col gap-6 pb-20 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <Link href="/dashboard" className="hover:text-[#1C2A55] transition-colors">Dashboard</Link>
            <ChevronIcon size={12} strokeWidth={2} />
            <span className="text-[#1C2A55]">Kontrak</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1C2A55]">Daftar Kontrak</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data kontrak kerjasama pelanggan.</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={isRefreshing || isLoading} className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-[#1C2A55] transition-all disabled:opacity-70">
            <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { setFormData(initialFormState); setIsCreateOpen(true) }} className="flex h-9 items-center gap-2 rounded-md bg-[#DA061A] px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-all active:scale-95">
            <Plus size={16} />
            <span>Buat Kontrak</span>
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-gray-100">
          <div className="relative w-full md:max-w-sm">
            <Search size={16} className="pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-[#1C2A55] focus:border-[#1C2A55] focus:outline-none focus:ring-1 focus:ring-[#1C2A55]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">No. Kontrak</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Pelanggan</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Layanan</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Nilai</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Segmen</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-5 w-24 rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-40 rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-32 rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-24 rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-16 rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                      <FileText size={24} className="opacity-30" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Belum ada kontrak</p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-600">
                      {item.contract_number}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1C2A55]">
                      {item.customer_name}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {getServiceName(item.service_id)}
                    </td>
                    <td className="px-4 py-3 font-medium text-emerald-600">
                      {formatCurrency(item.contract_value)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider
                        ${item.segment === 'government_service' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${item.segment === 'enterprise_service' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                        ${item.segment === 'business_service' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                        ${item.segment === 'PRQ' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                      `}>
                        {formatSegment(item.segment)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openLinks(item)} className="rounded p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all" title="Manage Links">
                          <LinkIcon size={14} />
                        </button>
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
          <p className="text-xs text-gray-500">Hal. <span className="font-bold text-[#1C2A55]">{page}</span> dari {totalPages}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl ring-1 ring-gray-100 scrollbar-hide">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <h3 className="text-lg font-bold text-[#1C2A55]">
                {isCreateOpen ? 'Buat Kontrak Baru' : 'Edit Kontrak'}
              </h3>
              <button onClick={() => { setIsCreateOpen(false); setIsEditOpen(false) }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={isCreateOpen ? handleCreate : handleUpdate} className="p-6 space-y-6">

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">Informasi Umum</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Nomor Kontrak</label>
                    <input
                      required
                      type="text"
                      value={formData.contract_number}
                      onChange={e => setFormData({ ...formData, contract_number: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none"
                      placeholder="Contoh: 001/SPK/2024"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Nama Pelanggan</label>
                    <input
                      required
                      type="text"
                      value={formData.customer_name}
                      onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none"
                      placeholder="Nama PT / Instansi"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">
                      Nilai Kontrak (IDR)
                    </label>

                    <div className="relative">
                      <DollarSign
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        value={
                          formData.contract_value
                            ? formData.contract_value.toLocaleString('id-ID')
                            : ''
                        }
                        onChange={e => {
                          const raw = e.target.value.replace(/[^\d]/g, '')
                          setFormData({
                            ...formData,
                            contract_value: raw ? Number(raw) : 0,
                          })
                        }}
                        className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    <p className="text-[11px] text-gray-400">
                      Contoh: 1.500.000.000
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Tanggal Kontrak</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={formData.contract_date}
                        onChange={e => setFormData({ ...formData, contract_date: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">Klasifikasi & Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Segmen Bisnis</label>
                    <select
                      value={formData.segment}
                      onChange={e => setFormData({ ...formData, segment: e.target.value as any })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none"
                    >
                      <option value="government_service">Government</option>
                      <option value="enterprise_service">Enterprise</option>
                      <option value="business_service">Business</option>
                      <option value="PRQ">PRQ</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">PIC (Account Manager)</label>
                    <select
                      value={formData.pic_user_id}
                      onChange={e => setFormData({ ...formData, pic_user_id: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none"
                    >
                      <option value="">Pilih PIC</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Layanan</label>
                    <select
                      value={formData.service_id}
                      onChange={e => setFormData({ ...formData, service_id: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none"
                    >
                      <option value="">Pilih Layanan</option>
                      {serviceTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Tipe Kontrak</label>
                    <select
                      value={formData.contract_type_id}
                      onChange={e => setFormData({ ...formData, contract_type_id: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none"
                    >
                      <option value="">Pilih Tipe</option>
                      {contractTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Status Progress</label>
                    <select
                      value={formData.contract_progress_id}
                      onChange={e => setFormData({ ...formData, contract_progress_id: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none"
                    >
                      <option value="">Pilih Status</option>
                      {progressStatus.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Jenis Kontrak</label>
                    <input
                      type="text"
                      value={formData.contract_kind}
                      onChange={e => setFormData({ ...formData, contract_kind: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none"
                      placeholder="Baru / Perpanjangan"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">Catatan Tambahan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Catatan Progress</label>
                    <textarea
                      rows={2}
                      value={formData.progress_note}
                      onChange={e => setFormData({ ...formData, progress_note: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none resize-none"
                      placeholder="..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Catatan Pembayaran</label>
                    <textarea
                      rows={2}
                      value={formData.payment_note}
                      onChange={e => setFormData({ ...formData, payment_note: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none resize-none"
                      placeholder="..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1C2A55] py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/10 hover:bg-blue-900 active:scale-95 disabled:opacity-70 transition-all"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan Kontrak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLinksOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl ring-1 ring-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-[#1C2A55]">Link Dokumen</h3>
                <p className="text-xs text-gray-500 font-mono">{selectedItem.contract_number}</p>
              </div>
              <button onClick={() => setIsLinksOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <form onSubmit={handleAddLink} className="flex gap-2 mb-4">
                <div className="flex-1 space-y-2">
                  <input
                    required
                    value={newLink.label}
                    onChange={e => setNewLink({ ...newLink, label: e.target.value })}
                    placeholder="Label (Contoh: Drive, SPK)"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none"
                  />
                  <input
                    required
                    type="url"
                    value={newLink.url}
                    onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#1C2A55] focus:outline-none"
                  />
                </div>
                <button type="submit" className="h-[88px] w-12 flex items-center justify-center rounded-md bg-[#1C2A55] text-white hover:bg-blue-900 transition-all">
                  <Plus size={20} />
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {contractLinks.length === 0 && <p className="text-center text-xs text-gray-400 py-4">Belum ada link tersimpan</p>}
                {contractLinks.map(link => (
                  <div key={link.id} className="group flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 hover:border-gray-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#1C2A55] shadow-sm">
                        <LinkIcon size={14} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-gray-700 truncate">{link.label}</span>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline truncate block">
                          {link.url}
                        </a>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteLink(link.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-xs rounded-lg bg-white shadow-xl p-6 text-center ring-1 ring-gray-100">
            <div className="mb-4 flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-red-50 text-[#DA061A]">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#1C2A55]">Hapus Kontrak?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Yakin hapus kontrak <b>{selectedItem?.contract_number}</b>? Tindakan ini permanen.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setIsDeleteOpen(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 rounded-lg bg-[#DA061A] py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
                {isSubmitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}