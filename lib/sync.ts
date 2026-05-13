import pool from '@/lib/db'
import { searchEmployees } from '@/lib/ldap'

function getAttr(attrs: any[], name: string): string {
  const found = attrs.find((a: any) => a.type === name)
  return found?.values?.[0] ?? ''
}

export async function syncEmployeesFromLDAP() {
  const entries = await searchEmployees()

  let inserted = 0
  let updated = 0
  let failed = 0

  for (const attrs of entries) {
    const firstName = getAttr(attrs, 'givenName') || getAttr(attrs, 'cn').split(' ')[0]
    const lastName = getAttr(attrs, 'sn') || getAttr(attrs, 'cn').split(' ').slice(1).join(' ')
    const email = getAttr(attrs, 'mail')
    const mobile = getAttr(attrs, 'mobile')
    const extension = getAttr(attrs, 'telephoneNumber')
    const department = getAttr(attrs, 'department')
    const designation = getAttr(attrs, 'title')

    if (!email && !firstName) {
      failed++
      continue
    }

    try {
      const [existing]: any = await pool.query(
        'SELECT id FROM contact WHERE email = ?',
        [email]
      )

      if (existing.length > 0) {
        await pool.query(
          `UPDATE contact SET
            first_name=?, last_name=?, designation=?,
            department=?, cell_phone=?, work_phone=?,
            modified_date=NOW()
           WHERE email=?`,
          [firstName, lastName, designation, department, mobile, extension, email]
        )
        updated++
      } else {
        await pool.query(
          `INSERT INTO contact
            (first_name, last_name, designation, department, cell_phone, email, work_phone, created_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [firstName, lastName, designation, department, mobile, email, extension]
        )
        inserted++
      }
    } catch (error) {
      console.error('Failed to sync entry:', email, error)
      failed++
    }
  }

  return { inserted, updated, failed, total: entries.length }
}