

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookCopy, Settings, Users, BarChart3, MessagesSquare, Activity, Ticket, Image as ImageIcon, LayoutList } from 'lucide-react'; // Added Ticket, ImageIcon, LayoutList
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  {
    group: 'Management',
    items: [
      { href: '/admin/programs', label: 'Programs', icon: BookCopy },
      { href: '/admin/week-content', label: 'Week Content', icon: LayoutList },
      { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
      { href: '/admin/program-discussions', label: 'Program Discussions', icon: MessagesSquare },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/vouchers', label: 'Vouchers', icon: Ticket }, 
    ]
  },
  {
    group: 'Tools & Analytics',
    items: [
        { href: '/admin/program-progress', label: 'Program Progress', icon: Activity },
        { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 }, 
        // { href: '/admin/content-builder', label: 'Content Builder', icon: Blocks }, // Future
    ]
  },
  {
    group: 'Settings',
    items: [
        // { href: '/admin/settings', label: 'General Settings', icon: Settings }, // Future
    ]
  }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {adminNavItems.map((section, index) => (
        section.group ? (
          <SidebarGroup key={`group-${index}`}>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">
                {section.icon && <section.icon />}
                <span className="group-data-[collapsible=icon]:hidden">{section.group}</span>
            </SidebarGroupLabel>
            {section.items.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, side: 'right', className: 'ml-2' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        ) : (
          <SidebarMenuItem key={section.href}>
             <SidebarMenuButton
                asChild
                isActive={pathname === section.href}
                tooltip={{ children: section.label, side: 'right', className: 'ml-2' }}
              >
              <Link href={section.href}>
                <section.icon />
                <span className="group-data-[collapsible=icon]:hidden">{section.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      ))}
    </SidebarMenu>
  );
}


