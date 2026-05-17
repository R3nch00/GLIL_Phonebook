import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    const [rows]: any = await pool.query(
      `SELECT first_name, last_name, cell_phone, work_phone
       FROM contact ORDER BY department, first_name`
    )

    const lines: string[] = []
    lines.push('<?xml version="1.0" encoding="UTF-8"?>')
    lines.push('<AddressBook>')
    lines.push('\t<pbgroup>')
    lines.push('\t\t<id>1</id>')
    lines.push('\t\t<name>Work</name>')
    lines.push('\t</pbgroup>')
    lines.push('\t<pbgroup>')
    lines.push('\t\t<id>2</id>')
    lines.push('\t\t<name>Mobile</name>')
    lines.push('\t</pbgroup>')

    rows.forEach((e: any, index: number) => {
      lines.push('\t<Contact>')
      lines.push(`\t\t<id>${index + 1}</id>`)
      lines.push(`\t\t<FirstName>${e.first_name ?? ''}</FirstName>`)
      lines.push(`\t\t<LastName>${e.last_name ?? ''}</LastName>`)
      lines.push('\t\t<Frequent>0</Frequent>')
      lines.push('\t\t<Phone type="Cell">')
      lines.push(`\t\t\t<phonenumber>${e.cell_phone ?? ''}</phonenumber>`)
      lines.push('\t\t\t<accountindex>1</accountindex>')
      lines.push('\t\t</Phone>')
      lines.push('\t\t<Phone type="Work">')
      lines.push(`\t\t\t<phonenumber>${e.work_phone ?? ''}</phonenumber>`)
      lines.push('\t\t\t<accountindex>1</accountindex>')
      lines.push('\t\t</Phone>')
      lines.push('\t\t<Primary>0</Primary>')
      lines.push('\t</Contact>')
    })

    lines.push('</AddressBook>')

    const dir = path.join(process.cwd(), 'phonebook-xml')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)

    const filePath = path.join(dir, 'phonebook.xml')
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8')

    return NextResponse.json({ success: true, path: filePath })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to generate XML' }, { status: 500 })
  }
}