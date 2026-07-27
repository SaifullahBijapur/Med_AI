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
  Settings,
  MedalIcon,
  BedIcon,
  AlertCircle,
  ArrowDownAZ,
  Building2,
  Globe,
  BrainCircuit,
  LogOut,
} from "lucide-react"
import { Link, useNavigate } from 'react-router-dom'

const AppSidebar = () => {
  const { state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar } = useSidebar()
  const navigate = useNavigate()
  const userRole = localStorage.getItem("userRole")
  const hospitalName = localStorage.getItem("hospitalName") || "MediHive"

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  // Role-based navigation items
  const getNavItems = () => {
    const items = []

    if (userRole === "superadmin") {
      items.push(
        { title: "Dashboard", url: "/superadmin/dashboard", icon: LayoutDashboard },
        { title: "Hospitals", url: "/superadmin/hospitals", icon: Building2 },
        { title: "Global Analytics", url: "/superadmin/analytics", icon: Globe },
        { title: "Settings", url: "/superadmin/settings", icon: Settings },
      )
    } else {
      items.push(
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Patients", url: "/patients", icon: Users },
        { title: "Emergency", url: "/emergency", icon: AlertCircle },
        { title: "Doctors", url: "/doctors", icon: MedalIcon },
        { title: "Appointments", url: "/appointments", icon: Calendar },
        { title: "Reports", url: "/reports", icon: FileText },
        { title: "Bed Management", url: "/bedmanagement", icon: BedIcon },
        { title: "Analytics", url: "/analytics", icon: ArrowDownAZ },
        { title: "AI Assistant", url: "/assistant", icon: BrainCircuit },
        { title: "Settings", url: "/settings", icon: Settings },
      )
    }

    return items
  }

  const items = getNavItems()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <div>
            <h1 className="font-bold text-sm">MediHive AI</h1>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
              {userRole === "superadmin" ? "Super Admin" : hospitalName}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex-1">
            <p className="text-sm font-medium">{localStorage.getItem("userName") || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole?.replace("_", " ")}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
