'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Employee } from '@/types/employee'
import { getEmployees } from '@/lib/api'
import PhonebookTable from '@/components/phonebook/PhonebookTable'
import DarkMode from '@/components/DarkMode'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Clock from '@/components/Clock'

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEmployees().then((data) => {
      setEmployees(data)
      setLoading(false)
    })
  }, [])

  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))]

  return (
    <main className="p-4 md:p-6">
      <div className="border-b mb-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Company logo" width={40} height={40} />
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Employee Directory</h1>
            <p className="text-sm text-muted-foreground">{employees.length} employees · {departments.length} departments</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
          <DarkMode />
          <Clock />
        </div>
      </div>
      <PhonebookTable employees={employees} loading={loading} />
      <Toaster />
    </main>
  )
}