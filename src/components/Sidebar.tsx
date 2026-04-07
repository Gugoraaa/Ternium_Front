"use client"

import { MdOutlineDashboard, MdLogout } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { FaTruck, FaBriefcase } from "react-icons/fa";
import { HiOutlineChartSquareBar, HiUser } from "react-icons/hi";
import { GiCargoCrane } from "react-icons/gi";
import { FaGear } from "react-icons/fa6";
import { LuPackageOpen } from "react-icons/lu";
import { RiMenu2Fill } from "react-icons/ri";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useSidebar } from '@/context/SidebarContext';
import { isAllowed } from '@/lib/permissions';

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  section?: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  // GENERAL
  { name: 'Dashboard', icon: <MdOutlineDashboard size={18} />, path: '/ternium/dashboard', section: 'GENERAL' },
  { name: 'Usuarios', icon: <FiUsers size={18} />, path: '/ternium/usuarios', section: 'GENERAL' },
  { name: 'Clientes', icon: <FaBriefcase size={18} />, path: '/ternium/clientes', section: 'GENERAL' },
  
  // OPERATIVO
  { name: 'Gestión de Órdenes', icon: <LuPackageOpen size={18} />, path: '/ternium/gestion', section: 'OPERATIVO' },
  { name: 'Programación', icon: <HiOutlineChartSquareBar size={18} />, path: '/ternium/programacion', section: 'OPERATIVO'},
  { name: 'Operaciones', icon: <GiCargoCrane size={18} />, path: '/ternium/operaciones', section: 'OPERATIVO' },
  
  // LOGÍSTICA
  { name: 'Order Management', icon: <FaGear size={18} />, path: '/ternium/management', section: 'LOGÍSTICA' },
  { name: 'Despacho', icon: <FaTruck size={18} />, path: '/ternium/despacho', section: 'LOGÍSTICA' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useUser();
  const supabase = createClient();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className={`
      flex flex-col h-screen bg-[#0f0d0d] text-white font-dm-sans transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-72'}
    `}>
      
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.07)] p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white">Ternium</h1>
          )}
          <button
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
            aria-expanded={!isCollapsed}
            className="p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors text-[rgba(255,255,255,0.45)] hover:text-[rgba(255,255,255,0.75)] flex justify-center"
          >
            <RiMenu2Fill size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav className="flex-1 py-2 px-3">
        {(() => {
          const visibleSections = ['GENERAL', 'OPERATIVO', 'LOGÍSTICA']
            .map(section => ({
              section,
              items: menuItems
                .filter(item => item.section === section)
                .filter(item => isAllowed(user?.role_name, item.path)),
            }))
            .filter(({ items }) => items.length > 0);

          return visibleSections.map(({ section, items }, idx) => (
            <div key={section} className="mb-6">
              {/* Section Label */}
              {!isCollapsed && (
                <div className="mb-2">
                  <h3 className="text-[10px] font-medium tracking-[1.5px] text-[rgba(255,255,255,0.45)] uppercase">
                    {section}
                  </h3>
                </div>
              )}

              {/* Section Items */}
              <div className="flex flex-col gap-[2px]">
                {items.map((item) => {
                  const isActive = mounted
                    ? (pathname === item.path || pathname.startsWith(`${item.path}/`))
                    : false;

                  return (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.path)}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={isCollapsed ? item.name : undefined}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-[10px] transition-all duration-200 relative group
                        ${isActive
                          ? 'bg-gradient-to-r from-[rgba(224,82,82,0.18)] to-[rgba(224,82,82,0.06)] border-l-[3px] border-l-[#e05252] text-[#f28080] font-medium'
                          : 'text-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[rgba(255,255,255,0.75)]'}
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                    >
                      <span className="flex-shrink-0">
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <>
                          <span className="text-[14px] font-medium">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="ml-auto bg-[rgba(224,82,82,0.2)] text-[#f28080] text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Section Divider — only between visible sections */}
              {idx < visibleSections.length - 1 && !isCollapsed && (
                <div className="my-4 border-t border-[rgba(255,255,255,0.06)]" />
              )}
            </div>
          ));
        })()}
      </nav>

      {/* Footer / Perfil de Usuario */}
      <div className="border-t border-[rgba(255,255,255,0.07)] p-4">
        <div className={`
          ${isCollapsed ? 'flex flex-col items-center gap-3' : 'flex items-center justify-between'}
        `}>
          
          <div className={`
            ${isCollapsed ? 'flex flex-col items-center' : 'flex items-center gap-3'}
          `}>
            {/* Avatar */}
            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#e05252] to-[#a02020] flex items-center justify-center overflow-hidden">
              <span className="text-white font-bold text-sm">
                {user?.user_metadata?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                {loading ? (
                  <div className="flex flex-col gap-1">
                    <div className="h-3 w-24 bg-[rgba(255,255,255,0.1)] rounded animate-pulse" />
                    <div className="h-2 w-16 bg-[rgba(255,255,255,0.05)] rounded animate-pulse mt-1" />
                  </div>
                ) : (
                  <>
                    <span className="text-white font-medium text-[13px] leading-none">
                      {user?.user_metadata?.name}
                    </span>
                    <span className="text-[10px] font-medium uppercase text-[rgba(255,255,255,0.3)] mt-1">
                      {user?.role_name}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button 
              className="p-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg transition-colors text-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
              onClick={handleSignOut}
            >
              <MdLogout size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}