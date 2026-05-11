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
    if (!value) return
    navigator.clipboard.writeText(value)
    toast(`${label} copied to clipboard`)
  }

  return (
    <TableRow className="hover:bg-muted/50 cursor-default">
      <TableCell className="text-sm w-8">{index}</TableCell>
      <TableCell className="w-[160px]">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className={`text-white text-xs ${getAvatarColor(employee.fullName ?? '')}`}>
              {getInitials(employee.fullName ?? '')}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium">{employee.fullName}</span>
        </div>
      </TableCell>
      <TableCell className="w-[150px] text-sm">
        <span className="line-clamp-1">{employee.designation}</span>
      </TableCell>
      <TableCell className="w-[150px] text-sm">
        <span className="line-clamp-1">{employee.department}</span>
      </TableCell>
      <TableCell
        className="w-[120px] text-sm cursor-pointer hover:text-blue-500"
        onClick={() => copy(employee.mobile ?? '', 'Mobile')}
      >
        {employee.mobile}
      </TableCell>
      <TableCell
        className="w-[180px] text-sm cursor-pointer hover:text-blue-500"
        onClick={() => copy(employee.email ?? '', 'Email')}
      >
        <span className="line-clamp-1">{employee.email}</span>
      </TableCell>
      <TableCell
        className="w-[80px] text-sm cursor-pointer hover:text-blue-500"
        onClick={() => copy(employee.extension ?? '', 'Extension')}
      >
        {employee.extension}
      </TableCell>
    </TableRow>
  )
}