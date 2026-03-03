'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Проверяем есть ли пользователь
    const user = localStorage.getItem('rkt_user')
    
    if (user) {
      router.push('/projects')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-text2">Загрузка...</p>
      </div>
    </div>
  )
}
