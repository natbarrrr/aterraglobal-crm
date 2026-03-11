'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    async function test() {
      const { data, error } = await supabase.from('companies').select('*').limit(5)

      if (error) {
        setMessage(`Supabase error: ${error.message}`)
        return
      }

      setMessage(`Connected. Found ${data?.length ?? 0} companies.`)
    }

    test()
  }, [])

  return (
    <main style={{ padding: 40 }}>
      <h1>Aterra CRM</h1>
      <p>{message}</p>
    </main>
  )
}
