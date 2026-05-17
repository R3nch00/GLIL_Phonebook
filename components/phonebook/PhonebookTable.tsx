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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  employees: Employee[]
  loading: boolean
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export function nullDisplay(value: string | null | undefined) {
  return value?.trim()
    ? value
    : <span className="text-muted-foreground/40 border-b border-dashed border-muted-foreground/30">—</span>
}

function PageButtons({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const pages: (number | string)[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex gap-1">
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 py-1 text-muted-foreground">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(Number(p))}
            className={`px-3 py-1 border rounded text-sm ${page === p ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
          >
            {p}
          </button>
        )
      )}
    </div>
  )
}

export default function PhonebookTable({ employees, loading }: Props) {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [sortKey, setSortKey] = useState<keyof Employee | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  function handleSort(key: keyof Employee) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
    setPage(1)
  }

  const departments = [...new Set((employees ?? []).map((e) => e.department).filter(Boolean))]
  const filtered = (employees ?? [])
    .filter((e) => {
      const matchSearch = [e.fullName, e.designation, e.department, e.mobile, e.email, e.extension]
        .map(v => (v ?? '').toLowerCase())
        .some(v => v.includes(search.toLowerCase()))
      const matchDept = department === 'all' || e.department === department
      return matchSearch && matchDept
    })
    .sort((a, b) => {
      if (!sortKey) return 0
      return sortAsc
        ? (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '')
        : (b[sortKey] ?? '').localeCompare(a[sortKey] ?? '')
    })

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
          <DepartmentFilter departments={departments} value={department} onChange={(v) => { setDepartment(v); setPage(1) }} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page:</span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
            <SelectTrigger className="w-20 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map(n => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>{filtered.length} results</span>
        </div>
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
                {paginated.map((employee, i) => (
                  <EmployeeCard key={employee.id} employee={employee} index={(page - 1) * pageSize + i + 1} />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {paginated.map((employee, i) => (
              <div key={employee.id} className="border rounded-lg p-4 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-muted-foreground text-xs">{(page - 1) * pageSize + i + 1}</span>
                  <span className="font-medium">{employee.fullName}</span>
                </div>
                <div className="text-muted-foreground text-xs mb-1">
                  {nullDisplay(employee.designation)} · {nullDisplay(employee.department)}
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <span>{nullDisplay(employee.mobile)}</span>
                  <span>{nullDisplay(employee.email)}</span>
                  {employee.extension && <span>Ext: {employee.extension}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm text-muted-foreground">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-muted"
              >Previous</button>
              <PageButtons page={page} totalPages={totalPages} onPage={setPage} />
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-muted"
              >Next</button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
