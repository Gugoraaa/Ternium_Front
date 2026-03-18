"use client"

import { MdOutlineDashboard, MdLogout } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { FaTruck, FaBriefcase } from "react-icons/fa";
import { HiOutlineChartSquareBar, HiUser } from "react-icons/hi";
import { GiCargoCrane } from "react-icons/gi";
import { FaGear } from "react-icons/fa6";
import { LuPackageOpen } from "react-icons/lu";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useSidebar } from '@/context/SidebarContext';
import { HiMenu } from "react-icons/hi";

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: <MdOutlineDashboard size={20} />, path: '/ternium/dashboard' },
  { name: 'Usuarios', icon: <FiUsers size={20} />, path: '/ternium/usuarios' },
  { name: 'Gestión de Órdenes', icon: <LuPackageOpen size={20} />, path: '/ternium/gestion' },
  { name: 'Clientes', icon: <FaBriefcase size={20} />, path: '/ternium/clientes' },
  { name: 'Programación', icon: <HiOutlineChartSquareBar size={20} />, path: '/ternium/programacion' },
  { name: 'Operaciones', icon: <GiCargoCrane size={20} />, path: '/ternium/operaciones' },
  { name: 'Order Management', icon: <FaGear size={20} />, path: '/ternium/management' },
  { name: 'Despacho', icon: <FaTruck size={20} />, path: '/ternium/despacho' },
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
      flex flex-col h-screen bg-sidebar-bg text-sidebar-text p-4 border-r border-[#26151c] 
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-72'}
    `}>
      
      {/* Header con título y botón toggle */}
      <div className="flex items-center justify-between mb-6">
        {!isCollapsed && (
          <h1 className="text-2xl font-bold text-white">Ternium</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#26151c] rounded-lg transition-colors group text-[#b08d99] hover:text-white flex justify-center"
          title={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          <HiMenu size={24} />
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = mounted 
            ? (pathname === item.path || pathname.startsWith(`${item.path}/`)) 
            : false;

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-[#422128] text-[#f85c7d]' 
                  : 'hover:bg-[#26151c] hover:text-gray-200'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.name : ''}
            >
              <span className="flex-shrink-0">
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-[15px] font-medium tracking-wide">
                  {item.name}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-[#26151c]">
        <div className={`
          ${isCollapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between px-2'}
        `}>
          
          <div className={`
            ${isCollapsed ? 'flex flex-col items-center' : 'flex items-center gap-3'}
          `}>
            <div className="w-10 h-10 rounded-full bg-[#d9d9d9] flex items-center justify-center overflow-hidden">
              <HiUser size={20} className="text-[#140a0e]" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                {loading ? (
                  <div className="flex flex-col gap-1">
                    <div className="h-3 w-24 bg-[#422128] rounded animate-pulse" />
                    <div className="h-2 w-16 bg-[#26151c] rounded animate-pulse mt-1" />
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-bold tracking-widest text-white leading-none italic">
                      {user?.user_metadata.name}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-[#5a424b] mt-1">
                      {user?.role_name}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <button 
            className={`
              p-2 hover:bg-[#26151c] rounded-lg transition-colors group text-[#b08d99] hover:text-white
              ${isCollapsed ? 'mt-2' : ''}
            `}
            onClick={handleSignOut}
            title="Cerrar sesión"
          >
            <MdLogout size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}