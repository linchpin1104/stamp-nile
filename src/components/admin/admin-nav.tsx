"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookCopy, Users, BarChart3, MessagesSquare, Activity, Ticket, Image as ImageIcon, LayoutList } from 'lucide-react'; // Added Ticket, ImageIcon, LayoutList
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  key?: string;
}

interface NavSection {
  group?: string;
  href?: string;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavItem[];
}

const adminNavItems: NavSection[] = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard, key: 'admin.dashboard' } as NavItem,
  {
    group: '관리',
    items: [
      { href: '/admin/programs', label: '프로그램 관리', icon: BookCopy, key: 'admin.programs' },
      { href: '/admin/week-content', label: '주차별 콘텐츠', icon: LayoutList, key: 'admin.weekContent' },
      { href: '/admin/banners', label: '배너 관리', icon: ImageIcon, key: 'admin.banners' },
      { href: '/admin/program-discussions', label: '프로그램 토론', icon: MessagesSquare, key: 'admin.programDiscussions' },
      { href: '/admin/users', label: '사용자 관리', icon: Users, key: 'admin.users' },
      { href: '/admin/vouchers', label: '바우처 관리', icon: Ticket, key: 'admin.vouchers' }, 
    ]
  },
  {
    group: '도구 및 분석',
    items: [
        { href: '/admin/program-progress', label: '프로그램 진행 현황', icon: Activity, key: 'admin.programProgress' },
        { href: '/admin/analytics', label: '분석', icon: BarChart3, key: 'admin.analytics' },
        // { href: '/admin/content-builder', label: '콘텐츠 빌더', icon: Blocks }, // Future
    ]
  },
  {
    group: '설정',
    items: [
        // { href: '/admin/settings', label: '일반 설정', icon: _Settings }, // Future
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
            {section.items?.map(item => (
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
              <Link href={section.href || '#'}>
                {section.icon && <section.icon />}
                <span className="group-data-[collapsible=icon]:hidden">{section.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      ))}
    </SidebarMenu>
  );
}


