import { NextResponse } from 'next/server'
import { syncEmployeesFromLDAP } from '@/lib/sync'

const SYNC_SECRET = process.env.SYNC_SECRET

export async function POST(req: Request) {
  try {
    const { secret } = await req.json()

    if (!secret || secret !== SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await syncEmployeesFromLDAP()

    return NextResponse.json({
      success: true,
      message: `Sync complete`,
      inserted: result.inserted,
      updated: result.updated,
      failed: result.failed,
      total: result.total,
      syncedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}