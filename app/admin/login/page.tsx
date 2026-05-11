'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import DarkMode from '@/components/DarkMode'
import Clock from '@/components/Clock'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (res.ok) {
      router.push('/admin')
    } else {
      setError(data.error || 'Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="absolute top-4 right-4 flex items-center gap-3">
        <DarkMode />
        <Clock />
        
        </div>
      <div className="bg-background border rounded-xl p-8 w-full max-w-sm shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.png" alt="Logo" width={48} height={48} className="mb-3" />
          <h1 className="text-xl font-semibold">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mt-1">Guardian Phonebook</p>
        </div>
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleLogin} disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </div>
      </div>
    </main>
  )
}