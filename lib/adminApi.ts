import { AdminEmployee } from '@/types/employee'

export async function fetchAdminEmployees(): Promise<AdminEmployee[]> {
  const res = await fetch('/api/admin/employees', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export async function updateEmployee(id: number, data: Partial<AdminEmployee>): Promise<void> {
  const res = await fetch(`/api/admin/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update')
}

export async function logoutAdmin(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
}