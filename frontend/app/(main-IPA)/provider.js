
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import { AppSidebar } from './_components/AppSidebar'
import WelcomeContainer from './InterviewDashboard/_components/WelcomeContainer'

function DashboardProvider({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen px-10 pt-6 space-y-6"> 
        {/* 🟢 Always visible Welcome section at the top */}
        <WelcomeContainer />
        {/* 🟢 Page content below */}
        {children}
      </div>
    </SidebarProvider>
  )
}

export default DashboardProvider