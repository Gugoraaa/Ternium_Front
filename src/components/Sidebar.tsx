"use client"

import { MdOutlineDashboard, MdLogout } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { FaTruck, FaBriefcase } from "react-icons/fa";
import { HiOutlineChartSquareBar } from "react-icons/hi";
import { GiCargoCrane } from "react-icons/gi";
import { FaGear } from "react-icons/fa6";
import { LuPackageOpen } from "react-icons/lu";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="flex flex-col w-72 h-screen bg-sidebar-bg text-sidebar-text p-4 border-r border-[#26151c]">
      
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
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-[#422128] text-[#f85c7d]' 
                  : 'hover:bg-[#26151c] hover:text-gray-200'}
              `}
            >
              <span className="flex-shrink-0">
                {item.icon}
              </span>
              
              <span className="text-[15px] font-medium tracking-wide">
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-[#26151c]">
        <div className="flex items-center justify-between px-2">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d9d9d9] flex items-center justify-center overflow-hidden">
               <div className="w-6 h-6 border-2 border-[#140a0e] rounded-full mt-4" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-widest text-white leading-none italic uppercase">
                (User)
              </span>
              <span className="text-[10px] font-bold uppercase text-[#5a424b] mt-1">
                Admin
              </span>
            </div>
          </div>

          <button 
            className="p-2 hover:bg-[#26151c] rounded-lg transition-colors group text-[#b08d99] hover:text-white"
            onClick={() => router.push('/login')}
          >
            <MdLogout size={20} />
          </button>
          
        </div>
      </div>
    </aside>
  );
}