import React from 'react'
import {
  Sidebar,
  SidebarMenu,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton
} from "../components/ui/sidebar"
import { useSidebar } from "../components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,MedalIcon,
  BedIcon,
  AlertCircle,
  ArrowDownAZ
} from "lucide-react"

import { Link } from 'react-router-dom'
const AppSidebar = () => {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar()

  const items = [
    {
      title: "Dashboard",
      url: "dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Patients",
      url: "patients",
      icon: Users,
    },
    {
      title:"Emergency",
      url:"emergency",
      icon:AlertCircle,
    },
    {
      title: "Doctors",
      url: "doctors",
      icon: MedalIcon,
    },
    {
      title: "Appointments",
      url: "appointments",
      icon: Calendar,
    },
    {
      title: "Reports",
      url: "reports",
      icon: FileText,
    },
    {
      title:"Bed Management",
      url:"bedmanagement",
      icon:BedIcon,
    },
    {
      title:"Analytics",
      url:"analytics",
      icon:ArrowDownAZ,

    },
    {
      title: "Settings",
      url: "settings",
      icon: Settings,
    }
  ]
  return (
    <Sidebar>
       <SidebarHeader className="border-b p-4">
        <h2 className="text-xl font-bold">
          Hospital AI
        </h2>
      </SidebarHeader>
     

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupAction>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu className=''>
              {
                items.map((item)=>(
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                     <Link to={item.url}>
                     <item.icon className='w-5 h-5'/>
                     <span>{item.title}</span>
                     </Link>
                    </SidebarMenuButton>

                  </SidebarMenuItem>
                ))
              }

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        Admin Panel
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
