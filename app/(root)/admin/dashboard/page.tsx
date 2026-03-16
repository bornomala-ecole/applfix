import React from 'react'
import { auth } from '@/auth'

const AdminDashboardPage = async () => {
  const session = await auth();
  return (
    <>
      <h1>Hi {session?.user?.name}!</h1>
    </>
  )
}

export default AdminDashboardPage