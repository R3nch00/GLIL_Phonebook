import { Employee } from '@/types/employee'
import {
  TableCell,
  TableRow,
} from '@/components/ui/table'

interface Props {
  employee: Employee
  index: number
}

export default function EmployeeCard({ employee, index }: Props) {
  return (
    <TableRow>
      <TableCell>{index}</TableCell>
      <TableCell>{employee.fullName}</TableCell>
      <TableCell>{employee.designation}</TableCell>
      <TableCell>{employee.department}</TableCell>
      <TableCell>{employee.mobile}</TableCell>
      <TableCell>{employee.email}</TableCell>
      <TableCell>{employee.extension}</TableCell>
    </TableRow>
  )
}