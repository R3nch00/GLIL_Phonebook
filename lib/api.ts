import { Employee } from '@/types/employee'

export async function getEmployees(): Promise<Employee[]> {
  const res = await fetch('/api/employees')
  if (!res.ok) throw new Error('Failed to fetch employees')
  return res.json()
}

export async function getEmployee(id: string): Promise<Employee> {
  const res = await fetch(`/api/employees/${id}`)
  if (!res.ok) throw new Error('Failed to fetch employee')
  return res.json()
}