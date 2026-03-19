import { LayoutDashboard, Users, FileText, Globe, BarChart3, MessageSquare, ArrowLeft } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

export default function AdminSidebar() {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const items = [
    { title: t("admin.dashboard"), url: "/admin", icon: LayoutDashboard },
    { title: t("admin.users"), url: "/admin/users", icon: Users },
    { title: t("admin.resumes"), url: "/admin/resumes", icon: FileText },
    { title: t("admin.websites"), url: "/admin/websites", icon: Globe },
    { title: t("admin.analytics"), url: "/admin/analytics", icon: BarChart3 },
    { title: t("admin.contacts"), url: "/admin/contacts", icon: MessageSquare },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("admin.administration")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/admin"} className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard" className="hover:bg-muted/50" activeClassName="">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {!collapsed && <span>{t("admin.backToSite")}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
