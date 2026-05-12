'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export default function DarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <Button variant="outline" size="icon" onClick={toggle}>
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}