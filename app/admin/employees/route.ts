import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, designation, department,
       cell_phone, email, work_phone, ip_address,
       created_by, created_date, modified_by, modified_date
       FROM contact ORDER BY department, first_name`
    )
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}