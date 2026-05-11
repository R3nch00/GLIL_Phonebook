'use client'

import { Employee } from '@/types/employee'
import EmployeeCard from '@/components/phonebook/EmployeeCard'
import SearchBar from '@/components/phonebook/SearchBar'
import DepartmentFilter from '@/components/phonebook/DepartmentFilter'
import LoadingSkeleton from '@/components/phonebook/LoadingSkeleton'
import EmptyState from '@/components/phonebook/EmptyState'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Props {
  employees: Employee[]
  loading: boolean
}

export default function PhonebookTable({ employees, loading }: Props) {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [sortKey, setSortKey] = useState<keyof Employee | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

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
    <>
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
    </>
  )
}