import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import AdminGuard from "./AdminGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center border-b bg-background/80 backdrop-blur-md px-4">
              <SidebarTrigger className="mr-4" />
              <span className="text-sm font-semibold text-foreground">Admin Panel</span>
            </header>
            <main className="flex-1 p-6 overflow-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AdminGuard>
  );
}
