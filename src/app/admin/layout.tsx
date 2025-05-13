import type { Metadata } from 'next';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { AdminNav } from '@/components/admin/admin-nav';
import Link from 'next/link';
import { Baby, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const metadata: Metadata = {
  title: 'Admin - Parenting Pathways',
  description: 'Admin panel for Parenting Pathways.',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Mock admin user for avatar
  const adminUserName = "Admin User";
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
            <Link href="/admin" className="flex items-center gap-2 text-primary">
              <Baby className="h-7 w-7" />
              <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">Admin Panel</span>
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <AdminNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t">
          <div className="group-data-[collapsible=icon]:hidden flex items-center justify-between">
             <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Parenting Pathways</p>
             {/* Optional: Link back to main site */}
             <Button variant="link" size="sm" asChild className="text-xs">
                <Link href="/">View Site</Link>
             </Button>
          </div>
          <div className="group-data-[collapsible=icon]:visible group-data-[state=expanded]:hidden mx-auto">
             <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex-1">
            {/* Breadcrumbs or Page Title can go here */}
          </div>
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://picsum.photos/seed/admin/100/100`} alt={adminUserName} data-ai-hint="admin avatar" />
                    <AvatarFallback>{adminUserName ? adminUserName.charAt(0).toUpperCase() : 'A'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{adminUserName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@parentingpathways.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    Exit Admin
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </header>
        <main className="flex-1 p-6 overflow-auto">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}