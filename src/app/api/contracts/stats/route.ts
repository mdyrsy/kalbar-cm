import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const admin = createAdminClient()

  const month = Number(searchParams.get('month'))
  const year = Number(searchParams.get('year'))

  if (!year) {
    return NextResponse.json(
      { error: 'Year wajib diisi' },
      { status: 400 }
    )
  }

  let startDate: string
  let endDate: string

  if (month) {
    startDate = new Date(year, month - 1, 1).toISOString()
    endDate = new Date(year, month, 1).toISOString()
  } else {
    startDate = new Date(year, 0, 1).toISOString()
    endDate = new Date(year + 1, 0, 1).toISOString()
  }

  const { data, error } = await admin
    .from('contracts')
    .select(
      'id,segment,contract_value,created_at'
    )
    .is('deleted_at', null)
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  const rows = data ?? []

  const segments = ['government_service', 'business_service', 'enterprise_service', 'PRQ'] as const

  const count_per_segment: Record<string, number> = {}
  const sum_per_segment: Record<string, number> = {}

  let total_contract = 0
  let total_value = 0

  for (const seg of segments) {
    count_per_segment[seg] = 0
    sum_per_segment[seg] = 0
  }

  for (const row of rows) {
    const seg = row.segment as string
    const value = Number(row.contract_value || 0)

    total_contract += 1
    total_value += value

    if (count_per_segment[seg] !== undefined) {
      count_per_segment[seg] += 1
      sum_per_segment[seg] += value
    }
  }

  return NextResponse.json({
    meta: {
      year,
      month: month || null,
      start_date: startDate,
      end_date: endDate
    },
    total: {
      count_contract: total_contract,
      sum_contract_value: total_value
    },
    per_segment: segments.map(seg => ({
      segment: seg,
      count_contract: count_per_segment[seg],
      sum_contract_value: sum_per_segment[seg]
    }))
  })
}