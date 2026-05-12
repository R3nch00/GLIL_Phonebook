import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { ip_address, work_phone } = await req.json()

    const [result]: any = await pool.query(
      `UPDATE contact SET ip_address=?, work_phone=?, modified_date=NOW() WHERE id=?`,
      [ip_address, work_phone, id]
    )

    return NextResponse.json({ success: true, affectedRows: result.affectedRows })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}