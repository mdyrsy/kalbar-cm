import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

type UserRole = 'super_admin' | 'account_manager'
type UserSegment =
  | 'government_service'
  | 'business_service'
  | 'enterprise_service'
  | 'PRQ'

function applySearchAndFilters(
  query: any,
  search: string,
  role: UserRole | null,
  segment: UserSegment | null
) {
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }
  if (role) query = query.eq('role', role)
  if (segment) query = query.eq('segment', segment)
  return query
}

function applySorting(query: any, sortBy: string, ascending: boolean) {
  const validColumns = ['created_at', 'name', 'email', 'last_login']
  const column = validColumns.includes(sortBy) ? sortBy : 'created_at'
  return query.order(column, { ascending })
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const admin = createAdminClient()

    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 10)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') as UserRole | null
    const segment = searchParams.get('segment') as UserSegment | null
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const ascending = searchParams.get('sort_order') === 'asc'

    let query = admin
      .from('users')
      .select(
        'id,name,email,role,segment,last_login,created_at,updated_at,deleted_at',
        { count: 'exact' }
      )
      .is('deleted_at', null)

    query = applySearchAndFilters(query, search, role, segment)

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await applySorting(
      query,
      sortBy,
      ascending
    ).range(from, to)

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
          has_next_page: count ? to < count - 1 : false,
        },
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

type CreateUserBody = {
  name: string
  email: string
  password: string
  role?: UserRole
  segment?: UserSegment
}

export async function POST(request: Request) {
  let createdUserId: string | null = null
  const admin = createAdminClient()

  try {
    const { name, email, password, role = 'account_manager', segment = 'PRQ' } =
      await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, Email, dan Password wajib diisi' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      )
    }

    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role, segment },
      })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Gagal membuat user' },
        { status: 400 }
      )
    }

    createdUserId = authData.user.id

    const password_hash = await bcrypt.hash(password, 10)

    const { data, error } = await admin
      .from('users')
      .upsert({
        id: createdUserId,
        name,
        email,
        password_hash,
        role,
        segment,
        last_login: null,
      })
      .select(
        'id,name,email,role,segment,last_login,created_at,updated_at,deleted_at'
      )
      .single()

    if (error) {
      await admin.auth.admin.deleteUser(createdUserId)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'User berhasil dibuat',
        user: data,
      },
      { status: 201 }
    )
  } catch {
    if (createdUserId) {
      await admin.auth.admin.deleteUser(createdUserId)
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}