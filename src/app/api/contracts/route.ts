import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const admin = createAdminClient()

    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 10)
    const segment = searchParams.get('segment')
    const search = searchParams.get('search') || ''

    let query = admin
      .from('contracts')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)

    if (segment) query = query.eq('segment', segment)
    if (search) query = query.ilike('customer_name', `%${search}%`)

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await query
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
    const body = await request.json()
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('contracts')
      .insert(body)
      .select()
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