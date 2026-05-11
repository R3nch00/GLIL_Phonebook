import { Input } from '@/components/ui/input'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <Input
      placeholder="Search by name, department, designation..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="max-w-md"
    />
  )
}