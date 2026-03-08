import React from 'react'
import { requireAuth } from '@/lib/auth-guard'
import { redirect } from "next/navigation"


const DahsboardPage = async () => {
  const session = await requireAuth();
  // console.log("Session from dashboard page:", session)

  return (
    <div>DahsboardPage</div>
  )
}

export default DahsboardPage