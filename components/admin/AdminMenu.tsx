import React from 'react'
import Link from 'next/link'

const AdminMenu = () => {
  return (
    <>
      <ul className='flex flex-col gap-2'>
        <li><Link href="/admin/dashboard">Dashboard</Link></li>
        <li><Link href="/admin/dashboard/products">Products</Link></li>
      </ul>
    </>
  )
}

export default AdminMenu