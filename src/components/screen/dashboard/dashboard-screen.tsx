'use client'

import { useEffect, useState } from 'react'
import DashboardHeader from './dashboard-header'
import {
  Briefcase,
  Layers,
  Landmark,
  Building2,
  TrendingUp,
  Calendar,
} from 'lucide-react'

type SegmentStat = {
  segment: 'government_service' | 'business_service' | 'enterprise_service'
  count_contract: number
  sum_contract_value: number
}

type StatsResponse = {
  total: {
    count_contract: number
    sum_contract_value: number
  }
  per_segment: SegmentStat[]
}

const SEGMENT_META = {
  government_service: {
    label: 'Government',
    icon: Landmark,
  },
  business_service: {
    label: 'Business',
    icon: Building2,
  },
  enterprise_service: {
    label: 'Enterprise',
    icon: Layers,
  },
} as const

const SEGMENT_BADGE = {
  government_service:
    'bg-blue-100 text-blue-800 border border-blue-200',
  business_service:
    'bg-emerald-100 text-emerald-800 border border-emerald-200',
  enterprise_service:
    'bg-purple-100 text-purple-800 border border-purple-200',
} as const

const MONTHS = [
  { value: '', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

export default function DashboardScreen() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState('')
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    const params = new URLSearchParams({
      year: year.toString(),
      ...(month && { month }),
    })

    fetch(`/api/contracts/stats?${params}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .finally(() => setLoading(false))
  }, [year, month])

  const segments = (
    Object.keys(SEGMENT_META) as Array<
      keyof typeof SEGMENT_META
    >
  ).map(segment => {
    const found = stats?.per_segment.find(
      s => s.segment === segment
    )

    return {
      segment,
      count_contract: found?.count_contract ?? 0,
      sum_contract_value: found?.sum_contract_value ?? 0,
    }
  })

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeader />

      {/* FILTER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600">
          <Calendar size={18} />
          <span>Filter Periode</span>
        </div>

        <div className="flex gap-3">
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-900/20"
          >
            {MONTHS.map(m => (
              <option key={m.label} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-900/20"
          >
            {Array.from({ length: 6 }).map((_, i) => {
              const y = now.getFullYear() - i
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-blue-900 to-blue-700 p-6 text-white shadow-xl">
          <p className="text-xs uppercase opacity-80">
            Total Kontrak
          </p>
          <p className="mt-2 text-4xl font-extrabold">
            {loading ? '-' : stats?.total.count_contract}
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-500 p-6 text-white shadow-xl">
          <p className="text-xs uppercase opacity-80">
            Total Nilai Kontrak
          </p>
          <p className="mt-2 text-2xl font-extrabold">
            {loading
              ? '-'
              : `Rp ${stats?.total.sum_contract_value.toLocaleString(
                  'id-ID'
                )}`}
          </p>
        </div>
      </div>

      {/* SEGMENT CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map(seg => {
          const meta = SEGMENT_META[seg.segment]
          const Icon = meta.icon

          return (
            <div
              key={seg.segment}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-[#1C2A55]">
                    <Icon size={24} />
                  </div>

                  <div>
                    <p className="text-xl font-extrabold text-[#1C2A55]">
                      {seg.count_contract} Kontrak
                    </p>
                    <p className="text-xs font-semibold text-gray-400">
                      Total Kontrak
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${SEGMENT_BADGE[seg.segment]}`}
                >
                  {meta.label}
                </span>
              </div>

              <div className="mt-5 text-sm font-semibold text-gray-600">
                Nilai:{' '}
                <span className="text-[#1C2A55]">
                  Rp{' '}
                  {seg.sum_contract_value.toLocaleString(
                    'id-ID'
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}