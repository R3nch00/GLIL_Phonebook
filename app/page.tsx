'use client'

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

  useEffect(() => {
    getEmployees().then((data) => {
      setEmployees(data)
      setLoading(false)
    })
  }, [])

  const departments = [...new Set(employees.map((e) => e.department))]

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
    const matchDept = department === 'all' || e.department === department
    return matchSearch && matchDept
  })

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Guardian Life Phonebook</h1>
        <DarkMode />
      </div>
      <div className="flex gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} />
        <DepartmentFilter departments={departments} value={department} onChange={setDepartment} />
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Extension</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((employee, i) => (
              <EmployeeCard key={employee.id} employee={employee} index={i + 1} />
            ))}
          </TableBody>
        </Table>
      )}
      <Toaster />
    </main>
  )
}