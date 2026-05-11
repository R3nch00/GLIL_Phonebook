'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<AdminEmployee[]>([])
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [editing, setEditing] = useState<AdminEmployee | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
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

  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))]
  const modifiedToday = employees.filter((e) => {
    if (!e.modified_date) return false
    return new Date(e.modified_date).toDateString() === new Date().toDateString()
  })
  const noEmail = employees.filter((e) => !e.email)
  const noMobile = employees.filter((e) => !e.cell_phone)

  const filtered = employees
    .filter((e) => {
      const matchSearch = `${e.first_name} ${e.last_name} ${e.department} ${e.designation} ${e.email} ${e.cell_phone}`
        .toLowerCase().includes(search.toLowerCase())
      const matchDept = department === 'all' || e.department === department
      return matchSearch && matchDept
    })

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
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />

    <Select value={department} onValueChange={setDepartment}>
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
          <p className="text-sm text-muted-foreground">{filtered.length} results</p>
        </div>

        {/* Table */}
        <div className="rounded-md border bg-background overflow-x-auto">
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
                <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">No employees found</td></tr>
              ) : filtered.map((e, i) => (
                <tr key={e.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-muted-foreground text-xs">{i + 1}</td>
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
                  <td className="p-3 max-w-[130px] truncate">{e.designation}</td>
                  <td className="p-3 max-w-[130px] truncate">{e.department}</td>
                  <td className="p-3 whitespace-nowrap cursor-pointer hover:text-blue-500" onClick={() => copyToClipboard(e.cell_phone, 'Mobile')}>{e.cell_phone}</td>
                  <td className="p-3 max-w-[160px] truncate cursor-pointer hover:text-blue-500" onClick={() => copyToClipboard(e.email, 'Email')}>{e.email}</td>
                  <td className="p-3 cursor-pointer hover:text-blue-500" onClick={() => copyToClipboard(e.work_phone, 'Extension')}>{e.work_phone}</td>
                  <td className="p-3 text-muted-foreground cursor-pointer hover:text-blue-500" onClick={() => copyToClipboard(e.ip_address, 'IP Address')}>{e.ip_address}</td>
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
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl border shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-1">Edit Employee</h2>
            <p className="text-sm text-muted-foreground mb-4">{editing.first_name} {editing.last_name}</p>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">First Name</label>
                  <Input value={editing.first_name} onChange={(e) => setEditing({ ...editing, first_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Last Name</label>
                  <Input value={editing.last_name} onChange={(e) => setEditing({ ...editing, last_name: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Designation</label>
                <Input value={editing.designation ?? ''} onChange={(e) => setEditing({ ...editing, designation: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Department</label>
                <Input value={editing.department ?? ''} onChange={(e) => setEditing({ ...editing, department: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Mobile</label>
                <Input value={editing.cell_phone ?? ''} onChange={(e) => setEditing({ ...editing, cell_phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                <Input value={editing.email ?? ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
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