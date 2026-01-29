import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (authError || !authData.user || !authData.session) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    const admin = createAdminClient()
    const now = new Date().toISOString()

    const { data: profileData, error: profileError } = await admin
      .from('users')
      .update({
        last_login: now,
      })
      .eq('id', authData.user.id)
      .select(
        'id, name, email, role, segment, last_login, created_at, updated_at, deleted_at'
      )
      .single()

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: 'Gagal mengambil profil user' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        user: profileData,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_in: authData.session.expires_in,
        },
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('Login Server Error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}