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
import {
  Mic, Plus, LayoutDashboard, Calendar,
  Home, ClipboardList, LogOut, Target,
  TrendingUp, Bot, FileText, Settings
} from "lucide-react"

const NAV_GROUPS = [
  {
    label: "MAIN",
    items: [
      { title: "Home", icon: Home, url: "/InterviewHome" },
      { title: "Dashboard", icon: LayoutDashboard, url: "/InterviewDashboard" },
      { title: "Create Interview", icon: Plus, url: "/InterviewDashboard/CreateInterview" },
      { title: "Scheduled Interview", icon: Calendar, url: "/InterviewDashboard/ScheduledInterview" },
    ]
  },
  {
    label: "PRACTICE",
    items: [
      { title: "Practice Mode", icon: Target, url: "/InterviewDashboard/PracticeMode" },
    ]
  },
  {
    label: "INSIGHTS",
    items: [
      { title: "Progress Tracker", icon: TrendingUp, url: "/InterviewDashboard/Progress" },
      { title: "Interview History", icon: ClipboardList, url: "/InterviewDashboard/History" },
      { title: "AI Coach", icon: Bot, url: "/InterviewDashboard/AICoach" },
    ]
  },
  {
    label: "TOOLS",
    items: [
      { title: "Resume Analyzer", icon: FileText, url: "/InterviewDashboard/ResumeAnalyzer" },
      { title: "Settings", icon: Settings, url: "/InterviewDashboard/Settings" },
    ]
  }
];

function NavItem({ item, active }) {
  const linkClass = active
    ? "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 bg-purple-600/20 border-l-4 border-purple-500 shadow-lg shadow-purple-500/10"
    : "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 hover:bg-white/5 border-l-4 border-transparent";

  const iconClass = active
    ? "w-5 h-5 flex-shrink-0 text-purple-400"
    : "w-5 h-5 flex-shrink-0 text-gray-400";

  const textClass = active
    ? "text-sm font-medium text-purple-300"
    : "text-sm font-medium text-gray-300";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <a href={item.url} className={linkClass}>
          <item.icon className={iconClass} />
          <span className={textClass}>{item.title}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (url) => {
    if (url === "/InterviewHome") return pathname === "/InterviewHome";
    if (url === "/InterviewDashboard") return pathname === "/InterviewDashboard";
    return pathname === url || pathname.startsWith(url + '/');
  };

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <Sidebar className="bg-slate-900/95 backdrop-blur-lg border-r border-purple-500/10">

      <SidebarHeader className="p-6 border-b border-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 rounded-xl blur-md opacity-50" />
            <Mic className="w-6 h-6 text-white relative z-10" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse shadow-lg shadow-green-400/50" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              VoicePrep AI
            </span>
            <span className="text-sm text-gray-400">Interview Assistant</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 bg-slate-900/95 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label} className="mb-1">
            <div className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-widest text-slate-600">
              {group.label}
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem
                    key={item.title}
                    item={item}
                    active={isActive(item.url)}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            <div className="mt-2 border-b border-white/5" />
          </SidebarGroup>
        ))}

        <SidebarGroup className="mt-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 hover:bg-red-600/20 border-l-4 border-transparent hover:border-red-500 w-full text-left group"
                  >
                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-red-300">
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
        <div className="text-xs text-slate-600">© 2025 VoicePrep AI</div>
      </SidebarFooter>

    </Sidebar>
  );
}