import { NextResponse } from 'next/server'

import { searchEmployees } from '@/lib/ldap'



function getAttr(attrs: any[], name: string): string {

 const found = attrs.find((a: any) => a.type === name)

 return found?.values?.[0] ?? ''

}



export async function GET() {

 try {
const entries = await searchEmployees()



const employees = entries.map((attrs, index) => ({

   id: String(index),

fullName: getAttr(attrs, 'displayName') || getAttr(attrs, 'cn'),

 designation: getAttr(attrs, 'title'),

 department: getAttr(attrs, 'department'),
 mobile: getAttr(attrs, 'mobile'),
 email: getAttr(attrs, 'mail'),

 extension: getAttr(attrs, 'telephoneNumber'),

 }))



return NextResponse.json(employees, {

 headers: { 'Cache-Control': 'no-store' }

 })

} catch (error) {

 console.error('LDAP error:', error)

return NextResponse.json({ error: 'Failed to fetch from LDAP' }, { status: 500 })

 }

}