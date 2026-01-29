import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const admin = createAdminClient()

    const [
      totalRes,
      govRes,
      entRes,
      bizRes,
      prqRes,
      adminRes,
      amRes,
    ] = await Promise.all([
      admin.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      admin.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('segment', 'government_service'),
      admin.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('segment', 'enterprise_service'),
      admin.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('segment', 'business_service'),
      admin.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('segment', 'PRQ'),
      admin.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('role', 'super_admin'),
      admin.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('role', 'account_manager'),
    ])

    return NextResponse.json(
      {
        stats: {
          total: totalRes.count ?? 0,
          segments: {
            government: govRes.count ?? 0,
            enterprise: entRes.count ?? 0,
            business: bizRes.count ?? 0,
            prq: prqRes.count ?? 0,
          },
          roles: {
            super_admin: adminRes.count ?? 0,
            account_manager: amRes.count ?? 0,
          },
        },
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Stats Error:', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}