import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role: 'super_admin',
          segment: 'PRQ',
        },
      })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Failed to create user' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        password_hash: passwordHash,
        role: 'super_admin',
        segment: 'PRQ',
      })

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        id: authData.user.id,
        email: authData.user.email,
        role: 'super_admin',
        segment: 'PRQ',
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}