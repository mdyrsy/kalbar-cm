import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const admin = createAdminClient()

    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 10)
    const contractId = searchParams.get('contract_id')

    let query = admin
      .from('contract_links')
      .select(
        'id,contract_id,label,url,is_primary,created_at',
        { count: 'exact' }
      )

    if (contractId) {
      query = query.eq('contract_id', contractId)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      meta: {
        total: count ?? 0,
        page,
        limit,
        total_pages: count ? Math.ceil(count / limit) : 0,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { contract_id, label, url, is_primary } = await request.json()
    const admin = createAdminClient()

    if (!contract_id || !url) {
      return NextResponse.json(
        { error: 'contract_id dan url wajib diisi' },
        { status: 400 }
      )
    }

    const { data, error } = await admin
      .from('contract_links')
      .insert({
        contract_id,
        label: label ?? null,
        url,
        is_primary: is_primary ?? false,
      })
      .select(
        'id,contract_id,label,url,is_primary,created_at'
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}