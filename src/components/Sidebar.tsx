import React from 'react';
import { Map, LayoutDashboard, HomeIcon } from 'lucide-react';

// reusable Link Component
interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  isActive?: boolean;
  label: string;
}

export function SidebarLink({ href, icon: Icon, isActive, label }: SidebarLinkProps) {
  return (
    <a
      href={href}
      className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group relative ${
        isActive 
          ? 'bg-[#E6D7BD] text-[#12352B] shadow-sm' 
          : 'text-[#8C7466] hover:bg-[#E6D7BD]/60 hover:text-[#12352B]'
      }`}
      aria-label={label}
    >
      <Icon size={22} />
      
      {/* Tooltip appears on hover */}
      <span className="absolute left-14 bg-[#12352B] text-[#F7F1E4] text-xs font-medium px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
        {label}
      </span>
    </a>
  );
}

// 2. Main Sidebar Component
export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-[72px] h-screen flex-col items-center py-6 border-r border-[#E6D7BD] bg-[#F7F1E4] z-20">
      <nav className="flex flex-col gap-4">
        
        <SidebarLink 
          href="/" 
          icon={HomeIcon} 
          label="Home" 
          isActive={location.pathname === '/'}
        />

        <SidebarLink 
          href="/livemap" 
          icon={Map} 
          label="Livemap"
          isActive={location.pathname === '/livemap'} 
        
        />
        
        <SidebarLink 
          href="/dashboard" 
          icon={LayoutDashboard} 
          label="Dashboard"
          isActive={location.pathname === '/dashboard'} 
        />
        
      </nav>
    </aside>
  );
}