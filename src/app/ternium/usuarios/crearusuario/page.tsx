'use client'
import { 
  FaRegAddressCard, 
  FaRegBuilding, 
  FaGlobeAmericas,
  FaRegSave
} from 'react-icons/fa';
import { IoChevronDown } from 'react-icons/io5';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UUID } from 'crypto';
import { useUser } from '@/context/AuthContext';
import {useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

interface Role {
  id: number;    
  name: string;   
}

interface Client {
  id: UUID;    
  name: string;   
}

export default function CreateUserForm() {
  const router = useRouter();
  const { user } = useUser();
  const supabase = createClient(); 
  const [userCategory, setUserCategory] = useState('employee');
  const [roles, setRoles] = useState<Role[]|null>([]);
  const [clients, setClients] = useState<Client[]|null>([]);
  const [loading, setLoading] = useState(true);
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

   async function fetchData() {
    try {
      setLoading(true);
      const [rolesRes, clientsRes] = await Promise.all([
        supabase.from('roles').select('*'),
        supabase.from('clients').select('*')
      ]);

      if (rolesRes.data) setRoles(rolesRes.data);
      if (clientsRes.data) setClients(clientsRes.data);

      
    } catch (err) {
      console.error("Error en la carga inicial:", err);
      toast.error('Error al cargar los datos del formulario');
    } finally {
      setLoading(false);
    }
}
  
  useEffect(() => {
    fetchData();
  }, []);

 

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.contraseña) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (userCategory === 'employee' && !formData.rol) {
      toast.error('Por favor selecciona un rol para el empleado');
      return;
    }

    if (userCategory === 'external' && !formData.cliente) {
      toast.error('Por favor selecciona un cliente para el usuario externo');
      return;
    }

    if (formData.contraseña.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      toast.loading('Creando usuario...', { id: 'createUser' });

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
        throw error;
      }

      if (userCategory === 'external') {
        const { data: clientData, error: clientError } = await supabase.from('client_workers').insert({
          user_id: data.user?.id,
          client_id: formData.cliente,
        });

        if (clientError) {
          throw clientError;
        }
      }
      
      toast.success('Usuario creado exitosamente', { id: 'createUser' });
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        rol: '',
        cliente: '',
        contraseña: '',
      });
      
      // Redirigir después de un pequeño delay
      setTimeout(() => {
        router.push('/ternium/usuarios');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error al crear usuario:');
      
      if (error.message?.includes('User already registered')) {
        toast.error('El correo electrónico ya está registrado', { id: 'createUser' });
      } else if (error.message?.includes('Invalid email')) {
        toast.error('El correo electrónico no es válido', { id: 'createUser' });
      } else {
        toast.error('Error al crear usuario. Intenta nuevamente', { id: 'createUser' });
      }
    }
  }

  if (loading) {
    return <LoadingSpinner size="large" message="Cargando datos del formulario..." fullScreen />;
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
                name="contraseña"
                value={formData.contraseña}
                onChange={handleInputChange}
                placeholder="Contraseña" 
                className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
              />
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría de Usuario</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      
                      {roles?.map((role: any) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                      
                    </>
                  ) : (
                    <>
                      {clients?.map ((client: any) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </section>



          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-8 pt-6">
            <button 
              type="button"
              onClick={() => router.push('/ternium/usuarios')} 
              className="text-gray-400 font-bold hover:text-gray-600 transition-colors tracking-tight"
            >
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

