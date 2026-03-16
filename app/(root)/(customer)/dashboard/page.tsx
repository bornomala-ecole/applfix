import React from 'react'
import { requireAuth } from '@/lib/auth-guard'


const DahsboardPage = async () => {
  const session = await requireAuth();
  // console.log("Session from dashboard page:", session)

  return (
    <div>Customer Dahsboard Page</div>
  )
}

export default DahsboardPage