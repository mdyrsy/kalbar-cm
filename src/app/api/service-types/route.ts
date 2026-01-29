import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const admin = createAdminClient()

    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 10)
    const search = searchParams.get('search') || ''
    
    const sortByParam = searchParams.get('sort_by') || 'created_at'
    const allowedSorts = ['created_at', 'name', 'updated_at']
    const sortBy = allowedSorts.includes(sortByParam) ? sortByParam : 'created_at'
    
    const sortOrder = searchParams.get('sort_order') === 'asc' ? true : false

    let query = admin
      .from('service_types')
      .select('id, name, created_by, created_at, updated_at, deleted_at', { count: 'exact' })
      .is('deleted_at', null)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder })
      .range(from, to)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        data,
        meta: {
          total: count ?? 0,
          page,
          limit,
          total_pages: count ? Math.ceil(count / limit) : 0,
        },
      },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, created_by } = body

    if (!name) {
      return NextResponse.json({ error: 'Nama tipe layanan wajib diisi' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data, error } = await admin
      .from('service_types')
      .insert({
        name,
        created_by: created_by ?? null,
      })
      .select('id, name, created_by, created_at, updated_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}