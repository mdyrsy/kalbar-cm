import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type UserRole = 'super_admin' | 'account_manager'
type UserSegment =
  | 'government_service'
  | 'business_service'
  | 'enterprise_service'
  | 'PRQ'

type UpdateUserBody = {
  name?: string
  email?: string
  role?: UserRole
  segment?: UserSegment
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('users')
      .select(
        'id,name,email,role,segment,last_login,created_at,updated_at,deleted_at'
      )
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json()) as UpdateUserBody

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data untuk diupdate' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data, error } = await admin
      .from('users')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select(
        'id,name,email,role,segment,last_login,created_at,updated_at,deleted_at'
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'User berhasil diupdate', data },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = createAdminClient()

    const { error } = await admin
      .from('users')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'User berhasil dihapus (soft delete)' },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}