import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [rows]: any = await pool.query(
      `SELECT id, CONCAT(first_name, ' ', last_name) as fullName,
       designation, department, cell_phone as mobile,
       email, work_phone as extension
       FROM contact WHERE id = ?`,
      [params.id]
    )
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 })
  }
}