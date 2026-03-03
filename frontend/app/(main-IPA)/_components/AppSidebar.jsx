import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Image from "next/image"


export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Image src={'/logo.png'} alt="logo" width={300} height={200} /> 
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}