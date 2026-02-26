'use client'
import { 
  FaRegAddressCard, 
  FaRegBuilding, 
  FaGlobeAmericas,
  FaRegSave
} from 'react-icons/fa';
import { IoChevronDown } from 'react-icons/io5';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
export default function CreateUserForm() {
  const supabase = createClient(); 
  const [userCategory, setUserCategory] = useState('employee');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rol: '',
    cliente: '',
    contraseña: '',
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.contraseña,
      options: {
        data: {
          name: formData.nombre,
          second_name: formData.apellido,
          role_id: parseInt(formData.rol),
        }
      }
    });
    
    if (error) {
      console.error('Error al crear usuario:', error);
    } else {
      console.log('Usuario creado exitosamente:', data);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-slate-50">
        <div className="p-6 md:p-12 font-sans text-slate-600 w-full">
          <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-[#1a2b49] tracking-tight">Crear Nuevo Usuario</h1>
            <p className="text-gray-400 mt-2 font-medium">
              Registre nuevos empleados o clientes externos en el ecosistema digital de Ternium.
            </p>
          </div>
        </div>

        <div className="p-8 space-y-12">
          
          {/* SECCIÓN 1: DATOS GENERALES */}
          <section>
            <div className="flex items-center gap-3 text-[#ff3d00] mb-8">
              <FaRegAddressCard size={22} />
              <h2 className="font-extrabold tracking-[0.2em] text-xs uppercase">1. Datos Generales</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan" 
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Apellido</label>
                <input 
                  type="text" 
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  placeholder="Ej: Pérez Maldonado" 
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Correo Electrónico Corporativo</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="usuario@ternium.com" 
                className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
              />
            </div>
            <div className="space-y-3 mb-8">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contraseña</label>
              <input 
                type="password" 
                name="password"
                value={formData.contraseña}
                onChange={handleInputChange}
                placeholder="usuario@ternium.com" 
                className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
              />
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría de Usuario</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Empleado Ternium */}
                <div 
                  className={`relative p-5 border-2 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${
                    userCategory === 'employee' 
                      ? 'border-[#ff3d00] bg-orange-50/20' 
                      : 'border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-gray-200'
                  }`}
                  onClick={() => setUserCategory('employee')}
                >
                  <div className={`p-3 rounded-xl shadow-sm border ${
                    userCategory === 'employee' 
                      ? 'bg-white border-orange-100' 
                      : 'bg-white border-gray-50'
                  }`}>
                    <FaRegBuilding className={userCategory === 'employee' ? 'text-slate-700' : 'text-gray-300'} size={24} />
                  </div>
                  <div>
                    <p className={`font-bold text-base ${userCategory === 'employee' ? 'text-slate-900' : 'text-gray-400'}`}>Empleado Ternium</p>
                    <p className={`text-xs ${userCategory === 'employee' ? 'text-gray-400' : 'text-gray-300'}`}>Acceso a red interna y ERP</p>
                  </div>
                </div>
                {/* Cliente Externo */}
                <div 
                  className={`relative p-5 border-2 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${
                    userCategory === 'external' 
                      ? 'border-[#ff3d00] bg-orange-50/20' 
                      : 'border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-gray-200'
                  }`}
                  onClick={() => setUserCategory('external')}
                >
                  <div className={`p-3 rounded-xl shadow-sm border ${
                    userCategory === 'external' 
                      ? 'bg-white border-orange-100' 
                      : 'bg-white border-gray-50'
                  }`}>
                    <FaGlobeAmericas className={userCategory === 'external' ? 'text-slate-700' : 'text-gray-300'} size={24} />
                  </div>
                  <div>
                    <p className={`font-bold text-base ${userCategory === 'external' ? 'text-slate-900' : 'text-gray-400'}`}>Cliente Externo</p>
                    <p className={`text-xs ${userCategory === 'external' ? 'text-gray-400' : 'text-gray-300'}`}>Acceso a portal comercial</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[150px]">
                {userCategory === 'employee' ? 'Rol' : 'Cliente'}
              </label>
              <div className="relative flex-1">
                <select 
                  name={userCategory === 'employee' ? 'rol' : 'cliente'}
                  value={userCategory === 'employee' ? formData.rol : formData.cliente}
                  onChange={handleInputChange}
                  className="w-full appearance-none p-3 px-4 border border-gray-200 rounded-lg bg-white text-slate-500 focus:ring-2 focus:ring-orange-500/20 outline-none font-medium"
                >
                  {userCategory === 'employee' ? (
                    <>
                      
                      <option value={1}>Administrador</option>
                      
                    </>
                  ) : (
                    <>
                      <option>Seleccione un cliente</option>
                      <option>Cliente A</option>
                      <option>Cliente B</option>
                      <option>Cliente C</option>
                    </>
                  )}
                </select>
                <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </section>



          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-8 pt-6">
            <button className="text-gray-400 font-bold hover:text-gray-600 transition-colors tracking-tight">
              Cancelar
            </button>
            <button 
              type="submit"
              className="bg-[#ff3d00] hover:bg-[#e63600] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-[0_10px_20px_rgba(255,61,0,0.2)] transition-all hover:-translate-y-1 active:scale-95 text-sm"
            >
              <FaRegSave size={18} />
              GUARDAR Y CREAR CUENTA
            </button>
          </div>

        </div>
          </div>
        </div>
      </div>
    </form>
  );
};

