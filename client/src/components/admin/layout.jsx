import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './sidebar'
import AdminHeader from './header'

function AdminLayout() {
  const [openSidebar,setOpenSideabar]=useState(false)
  return (
    <div className='min-h-screen flex w-full'>
      {/* admin sidebar */}
      <AdminSidebar open={openSidebar} setOpen={setOpenSideabar}/>
      <div className='flex flex-1 flex-col'>
        {/* admin header */}
        <AdminHeader setOpen={setOpenSideabar} />
        <main className='flex-1 flex-col bg-muted/40 p-4 md:p-6'>
        <Outlet/>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout


// here we take admin side bar and inside that we take header because we want the side bar stick from top of page

//he <div className='flex flex-1 flex-col'> will grow to fill the space not taken by the sidebar, making your layout responsive and balanced.

//bg-muted sets the background color to a "muted" (soft, subtle, low-contrast) color, usually for secondary backgrounds or to visually separate sections without strong emphasis