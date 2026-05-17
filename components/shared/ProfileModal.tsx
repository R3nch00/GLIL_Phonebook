'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  name: string
  designation?: string
  department?: string
  mobile?: string
  email?: string
  extension?: string
  onClose: () => void
  onEdit?: () => void
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500']
  return colors[(name?.charCodeAt(0) ?? 0) % colors.length]
}

function copy(value: string, label: string) {
  if (!value) return
  navigator.clipboard.writeText(value)
  toast(`${label} copied to clipboard`)
}

export default function ProfileModal({ name, designation, department, mobile, email, extension, onClose, onEdit }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl border shadow-lg w-full max-w-sm p-6">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-16 w-16 mb-3">
            <AvatarFallback className={`text-white text-xl ${getAvatarColor(name ?? '')}`}>
              {getInitials(name ?? '')}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold text-center">{name}</h2>
          {designation && <p className="text-sm text-muted-foreground text-center mt-0.5">{designation}</p>}
          {department && <p className="text-xs text-muted-foreground text-center mt-0.5">{department}</p>}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3 mb-6">
          {[
            { label: 'Mobile', value: mobile },
            { label: 'Email', value: email },
            { label: 'Extension', value: extension },
          ].map(({ label, value }) => (
            <div
              key={label}
              className={`flex flex-col gap-0.5 p-3 rounded-lg bg-muted/30 ${value ? 'cursor-pointer hover:bg-muted/50' : ''}`}
              onClick={() => value && copy(value, label)}
            >
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-sm break-words">{value || '—'}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {onEdit && (
            <Button className="flex-1" onClick={onEdit}>Edit</Button>
          )}
          <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}