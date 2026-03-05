'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Mic, Plus, LayoutDashboard, Calendar, FileText, Settings, Home, ClipboardList, LogOut } from "lucide-react"

const menuItems = [
  {
    title: "Home",
    icon: Home,
    url: "/InterviewHome",
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/InterviewDashboard",
  },
  {
    title: "Create Interview",
    icon: Plus,
    url: "/InterviewDashboard/CreateInterview",
  },
  {
    title: "Scheduled Interview",
    icon: Calendar,
    url: "/InterviewDashboard/ScheduledInterview",
  },
  {
    title: "Interview History",
    icon: ClipboardList,
    url: "/InterviewDashboard/History",
  },
]

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (url) => {
    // Exact match for home
    if (url === "/InterviewHome") {
      return pathname === "/InterviewHome";
    }
    
    // Exact match for Dashboard (not matching child routes)
    if (url === "/InterviewDashboard") {
      return pathname === "/InterviewDashboard";
    }
    
    // For other routes, check if pathname starts with the url
    return pathname === url || pathname.startsWith(url + '/');
  };

  const handleLogout = () => {
    // Add any logout logic here (e.g., clearing tokens, session data)
    // For example:
    // localStorage.removeItem('token');
    // sessionStorage.clear();
    
    // Navigate to home page
    router.push('/');
  };

  return (
    <Sidebar className="bg-slate-900/95 backdrop-blur-lg border-r border-purple-500/10">
      <SidebarHeader className="p-6 border-b border-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 rounded-xl blur-md opacity-50"></div>
            <Mic className="w-6 h-6 text-white relative z-10" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse shadow-lg shadow-green-400/50"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              VoicePrep AI
            </span>
            <span className="text-sm text-gray-400">
              Interview Assistant
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 bg-slate-900/95">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {/* Menu Items */}
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a 
                      href={item.url} 
                      className={`flex items-center gap-4 py-4 px-4 rounded-xl transition-all duration-200 ${
                        isActive(item.url)
                          ? 'bg-purple-600/20 border-l-4 border-purple-500 shadow-lg shadow-purple-500/10'
                          : 'hover:bg-white/5 border-l-4 border-transparent'
                      }`}
                    >
                      <item.icon 
                        className={`w-6 h-6 ${
                          isActive(item.url)
                            ? 'text-purple-400'
                            : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      />
                      <span 
                        className={`text-base font-medium ${
                          isActive(item.url)
                            ? 'text-purple-300'
                            : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Logout Button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 py-4 px-4 rounded-xl transition-all duration-200 hover:bg-red-600/20 border-l-4 border-transparent hover:border-red-500 w-full text-left group"
                  >
                    <LogOut className="w-6 h-6 text-gray-400 group-hover:text-red-400" />
                    <span className="text-base font-medium text-gray-300 group-hover:text-red-300">
                      Logout
                    </span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-purple-500/10 bg-slate-900/95">
        <div className="text-sm text-gray-500">
          © 2025 VoicePrep AI
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}