import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { first_name, last_name, designation, department, cell_phone, email, work_phone } = await req.json()
    
    const [result]: any = await pool.query(
      `UPDATE contact SET first_name=?, last_name=?, designation=?, department=?,
       cell_phone=?, email=?, work_phone=?, modified_date=NOW() WHERE id=?`,
      [first_name, last_name, designation, department, cell_phone, email, work_phone, id]
    )

    console.log('affectedRows:', result.affectedRows)
    return NextResponse.json({ success: true, affectedRows: result.affectedRows })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}