import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const admin = createAdminClient()

    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 10)
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const ascending = searchParams.get('sort_order') === 'asc'

    let query = admin
      .from('contract_types')
      .select('id,name,created_by,created_at,updated_at', { count: 'exact' })

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order(sortBy, { ascending })
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
    const { name, created_by } = await request.json()
    const admin = createAdminClient()

    if (!name) {
      return NextResponse.json(
        { error: 'Name wajib diisi' },
        { status: 400 }
      )
    }

    const { data, error } = await admin
      .from('contract_types')
      .insert({
        name,
        created_by: created_by ?? null,
      })
      .select('id,name,created_by,created_at,updated_at')
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