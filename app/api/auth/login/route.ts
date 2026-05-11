import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import crypto from 'crypto'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    const sha1 = crypto.createHash('sha1').update(password).digest('hex')

    const [rows]: any = await pool.query(
      'SELECT * FROM user WHERE web_name = ? AND password = ?',
      [username, sha1]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}