'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Employee } from '@/types/employee'
import { getEmployees } from '@/lib/api'
import EmployeeCard from '@/components/EmployeeCard'
import SearchBar from '@/components/SearchBar'
import DepartmentFilter from '@/components/DepartmentFilter'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import DarkMode from '@/components/DarkMode'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Clock from '@/components/Clock'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<keyof Employee | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  useEffect(() => {
    getEmployees().then((data) => {
      setEmployees(data)
      setLoading(false)
    })
  }, [])

  function handleSort(key: keyof Employee) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))]

  const filtered = employees
    .filter((e) => {
      const matchSearch =
        (e.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (e.designation ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (e.department ?? '').toLowerCase().includes(search.toLowerCase())
      const matchDept = department === 'all' || e.department === department
      return matchSearch && matchDept
    })
    .sort((a, b) => {
      if (!sortKey) return 0
      return sortAsc
        ? (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '')
        : (b[sortKey] ?? '').localeCompare(a[sortKey] ?? '')
    })

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

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} />
        <DepartmentFilter departments={departments} value={department} onChange={setDepartment} />
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-md border w-full overflow-hidden">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="w-[17%] cursor-pointer select-none" onClick={() => handleSort('fullName')}>
                    Full Name {sortKey === 'fullName' ? (sortAsc ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead className="w-[18%] cursor-pointer select-none" onClick={() => handleSort('designation')}>
                    Designation {sortKey === 'designation' ? (sortAsc ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead className="w-[18%] cursor-pointer select-none" onClick={() => handleSort('department')}>
                    Department {sortKey === 'department' ? (sortAsc ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead className="w-[13%] cursor-pointer select-none" onClick={() => handleSort('mobile')}>
                    Mobile {sortKey === 'mobile' ? (sortAsc ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead className="w-[20%] cursor-pointer select-none" onClick={() => handleSort('email')}>
                    Email {sortKey === 'email' ? (sortAsc ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead className="w-[10%] cursor-pointer select-none" onClick={() => handleSort('extension')}>
                    Ext {sortKey === 'extension' ? (sortAsc ? '↑' : '↓') : ''}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((employee, i) => (
                  <EmployeeCard key={employee.id} employee={employee} index={i + 1} />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((employee, i) => (
              <div key={employee.id} className="border rounded-lg p-4 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-muted-foreground text-xs">{i + 1}</span>
                  <span className="font-medium">{employee.fullName}</span>
                </div>
                <div className="text-muted-foreground text-xs mb-1">{employee.designation} · {employee.department}</div>
                <div className="flex flex-col gap-1 mt-2">
                  {employee.mobile && <span>{employee.mobile}</span>}
                  {employee.email && <span>{employee.email}</span>}
                  {employee.extension && <span>Ext: {employee.extension}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <Toaster />
    </main>
  )
}