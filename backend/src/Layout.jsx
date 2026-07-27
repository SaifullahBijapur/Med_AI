import React, { Children } from 'react'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import AppSidebar from './elements/AppSidebar'
import { Outlet } from 'react-router-dom'
const Layout = ({ children }) => {
  return (
    
    <SidebarProvider>
        <div className='flex h-screen w-full'>
        <AppSidebar/>

          <main className='flex-1 p-4 overflow-y-auto'>
            <SidebarTrigger />

            <Outlet />
          </main>


       
    </div>
      </SidebarProvider>

  )
}

export default Layout
