import { NextResponse } from 'next/server'
import { Employee } from '@/types/employee'

const mockEmployees: Employee[] = [
  {
    id: '1',
    fullName: 'Jane Smith',
    designation: 'Senior Developer',
    department: 'Engineering',
    mobile: '555-1234',
    email: 'jane@company.com',
    extension: '101'
  },
  {
    id: '2',
    fullName: 'John Doe',
    designation: 'Product Manager',
    department: 'Product',
    mobile: '555-5678',
    email: 'john@company.com',
    extension: '102'
  },
  {
    id: '3',
    fullName: 'Sarah Johnson',
    designation: 'UX Designer',
    department: 'Design',
    mobile: '555-9012',
    email: 'sarah@company.com',
    extension: '103'
  }
]

export async function GET() {
  return NextResponse.json(mockEmployees)
}