import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT id, CONCAT(first_name, ' ', last_name) as fullName,
       designation, department, cell_phone as mobile,
       email, work_phone as extension
       FROM contact
       WHERE first_name != '' AND last_name != ''
       ORDER BY department, first_name`
    )
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}