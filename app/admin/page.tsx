'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import * as XLSX from 'xlsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DarkMode from '@/components/DarkMode'
import Clock from '@/components/Clock'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { AdminEmployee } from '@/types/employee'
import { fetchAdminEmployees, updateEmployee, logoutAdmin } from '@/lib/adminApi'

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
}

function getAvatarColor(name: string) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500']
  return colors[(name?.charCodeAt(0) ?? 0) % colors.length]
}

function copyToClipboard(value: string, label: string) {
  if (!value) return
  navigator.clipboard.writeText(value)
  toast(`${label} copied to clipboard`)
}

function nullDisplay(value: string | null | undefined) {
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
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<AdminEmployee[]>([])
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [editing, setEditing] = useState<AdminEmployee | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const router = useRouter()

  useEffect(() => { loadEmployees() }, [])

  async function loadEmployees() {
    const data = await fetchAdminEmployees()
    setEmployees(data)
    setLoading(false)
  }

  async function logout() {
    await logoutAdmin()
    router.push('/')
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    await updateEmployee(editing.id, editing)
    setSaving(false)
    setEditing(null)
    toast('Employee updated successfully')
    loadEmployees()
  }

  async function downloadXML() {
    const res = await fetch('/api/admin/export/xml', { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      toast('XML file saved to phonebook-xml/phonebook.xml')
    } else {
      toast('Failed to generate XML')
    }
  }

  function downloadExcel() {
    const data = employees.map((e, i) => ({
      '#': i + 1,
      'First Name': e.first_name ?? '',
      'Last Name': e.last_name ?? '',
      'Designation': e.designation ?? '',
      'Department': e.department ?? '',
      'Mobile': e.cell_phone ?? '',
      'Email': e.email ?? '',
      'Extension': e.work_phone ?? '',
      'IP Address': e.ip_address ?? '',
      'Modified Date': e.modified_date ? new Date(e.modified_date).toLocaleDateString() : '',
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Employees')
    XLSX.writeFile(wb, `phonebook_${new Date().toISOString().split('T')[0]}.xlsx`)
  }
  

  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))]
  const modifiedToday = employees.filter((e) => {
    if (!e.modified_date) return false
    return new Date(e.modified_date).toDateString() === new Date().toDateString()
  })
  const noEmail = employees.filter((e) => !e.email)
  const noMobile = employees.filter((e) => !e.cell_phone)

  const filtered = employees.filter((e) => {
    const matchSearch = [e.first_name, e.last_name, e.department, e.designation, e.email, e.cell_phone, e.work_phone, e.ip_address]
      .map(v => (v ?? '').toLowerCase())
      .some(v => v.includes(search.toLowerCase()))
    const matchDept = department === 'all' || e.department === department
    return matchSearch && matchDept
  })

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <main className="min-h-screen bg-muted/20">
      <Toaster />

      {/* Topbar */}
      <div className="border-b bg-background px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={36} height={36} />
          <div>
            <h1 className="font-semibold text-lg leading-tight">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Guardian Phonebook</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock />
          <DarkMode />
          <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
        </div>
      </div>

      <div className="p-6 max-w-screen-2xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Employees', value: employees.length, sub: `across ${departments.length} departments` },
            { label: 'Departments', value: departments.length, sub: 'active departments' },
            { label: 'Modified Today', value: modifiedToday.length, sub: 'records updated today' },
            { label: 'Incomplete Records', value: noEmail.length + noMobile.length, sub: `${noEmail.length} no email · ${noMobile.length} no mobile` },
          ].map((stat) => (
            <div key={stat.label} className="bg-background border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center justify-between">
          <div className="flex gap-3">
            <Input
              placeholder="Search all columns..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="max-w-sm"
            />
            <Select value={department} onValueChange={(v) => { setDepartment(v); setPage(1) }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button variant="outline" size="sm" onClick={downloadXML}>Generate XML</Button>
            <Button variant="outline" size="sm" onClick={downloadExcel}>Download Excel</Button>
            
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
              className="border rounded px-2 py-1 text-sm bg-background text-foreground"
            >
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>{filtered.length} results</span>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-md border bg-background overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium w-10">#</th>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Designation</th>
                <th className="text-left p-3 font-medium">Department</th>
                <th className="text-left p-3 font-medium">Mobile</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Ext</th>
                <th className="text-left p-3 font-medium">IP Address</th>
                <th className="text-left p-3 font-medium">Modified</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="p-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">No employees found</td></tr>
              ) : paginated.map((e, i) => (
                <tr key={e.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-muted-foreground text-xs">{(page - 1) * pageSize + i + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className={`text-white text-xs ${getAvatarColor(e.first_name)}`}>
                          {getInitials(e.first_name, e.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium whitespace-nowrap">{e.first_name} {e.last_name}</span>
                    </div>
                  </td>
                  <td className="p-3 max-w-[130px] truncate">{nullDisplay(e.designation)}</td>
                  <td className="p-3 max-w-[130px] truncate">{nullDisplay(e.department)}</td>
                  <td className="p-3 whitespace-nowrap cursor-pointer hover:text-blue-500" onClick={() => copyToClipboard(e.cell_phone, 'Mobile')}>{nullDisplay(e.cell_phone)}</td>
                  <td className="p-3 max-w-[160px] truncate cursor-pointer hover:text-blue-500" onClick={() => copyToClipboard(e.email, 'Email')}>{nullDisplay(e.email)}</td>
                  <td className="p-3 cursor-pointer hover:text-blue-500" onClick={() => copyToClipboard(e.work_phone, 'Extension')}>{nullDisplay(e.work_phone)}</td>
                  <td className="p-3 text-muted-foreground cursor-pointer hover:text-blue-500" onClick={() => copyToClipboard(e.ip_address, 'IP Address')}>{nullDisplay(e.ip_address)}</td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap text-xs">
                    {e.modified_date ? new Date(e.modified_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" onClick={() => setEditing({ ...e })}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3 mb-3" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No employees found</div>
          ) : paginated.map((e, i) => (
            <div key={e.id} className="border rounded-lg p-4 text-sm bg-background">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className={`text-white text-xs ${getAvatarColor(e.first_name)}`}>
                      {getInitials(e.first_name, e.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{e.first_name} {e.last_name}</p>
                    <p className="text-xs text-muted-foreground">{(page - 1) * pageSize + i + 1}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditing({ ...e })}>Edit</Button>
              </div>
              <div className="text-muted-foreground text-xs mb-2">
                {nullDisplay(e.designation)} · {nullDisplay(e.department)}
              </div>
              <div className="flex flex-col gap-1">
                <span onClick={() => copyToClipboard(e.cell_phone, 'Mobile')} className="cursor-pointer hover:text-blue-500">{nullDisplay(e.cell_phone)}</span>
                <span onClick={() => copyToClipboard(e.email, 'Email')} className="cursor-pointer hover:text-blue-500">{nullDisplay(e.email)}</span>
                <span onClick={() => copyToClipboard(e.work_phone, 'Extension')} className="cursor-pointer hover:text-blue-500">Ext: {nullDisplay(e.work_phone)}</span>
                <span onClick={() => copyToClipboard(e.ip_address, 'IP')} className="cursor-pointer hover:text-blue-500 text-muted-foreground text-xs">IP: {nullDisplay(e.ip_address)}</span>
                <span className="text-muted-foreground text-xs">
                  Modified: {e.modified_date ? new Date(e.modified_date).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm text-muted-foreground">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-muted">Previous</button>
              <PageButtons page={page} totalPages={totalPages} onPage={setPage} />
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-muted">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl border shadow-lg w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-1">Edit Record</h2>
            <p className="text-sm text-muted-foreground mb-4">{editing.first_name} {editing.last_name}</p>
            <div className="flex flex-col gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground font-medium mb-1">Read-only information</p>
              {[
                { label: 'Full Name', value: `${editing.first_name} ${editing.last_name}` },
                { label: 'Designation', value: editing.designation },
                { label: 'Department', value: editing.department },
                { label: 'Mobile', value: editing.cell_phone },
                { label: 'Email', value: editing.email },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <span className="text-muted-foreground text-xs">{value || '—'}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">IP Address</label>
                <Input value={editing.ip_address ?? ''} onChange={(e) => setEditing({ ...editing, ip_address: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Extension</label>
                <Input value={editing.work_phone ?? ''} onChange={(e) => setEditing({ ...editing, work_phone: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button className="flex-1" onClick={saveEdit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}