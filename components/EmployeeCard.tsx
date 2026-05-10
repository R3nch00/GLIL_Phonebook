'use client'

import { Employee } from '@/types/employee'
import { TableCell, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface Props {
  employee: Employee
  index: number
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500',
    'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

export default function EmployeeCard({ employee, index }: Props) {
 

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value)
    toast(`${label} copied to clipboard`)
  }

  return (
    <TableRow>
      <TableCell>{index}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={`text-white text-xs ${getAvatarColor(employee.fullName)}`}>
              {getInitials(employee.fullName)}
            </AvatarFallback>
          </Avatar>
          {employee.fullName}
        </div>
      </TableCell>
      <TableCell>{employee.designation}</TableCell>
      <TableCell>{employee.department}</TableCell>
      <TableCell
        className="cursor-pointer hover:text-blue-500"
        onClick={() => copy(employee.mobile, 'Mobile')}
      >
        {employee.mobile}
      </TableCell>
      <TableCell
        className="cursor-pointer hover:text-blue-500"
        onClick={() => copy(employee.email, 'Email')}
      >
        {employee.email}
      </TableCell>
      <TableCell
        className="cursor-pointer hover:text-blue-500"
        onClick={() => copy(employee.extension, 'Extension')}
      >
        {employee.extension}
      </TableCell>
    </TableRow>
  )
}