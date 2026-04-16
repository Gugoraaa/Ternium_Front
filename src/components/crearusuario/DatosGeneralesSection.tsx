import { IoChevronDown } from 'react-icons/io5';
import { FaRegAddressCard, FaRegBuilding, FaGlobeAmericas } from 'react-icons/fa';
import type { Client, CreateUserFormData, Role, UserCategory } from '@/types/crearUsuario';
import { getRoleLabel, getUserCategoryForRole } from '@/lib/permissions';

interface DatosGeneralesSectionProps {
  formData: CreateUserFormData;
  userCategory: UserCategory;
  roles: Role[] | null;
  clients: Client[] | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCategoryChange: (category: UserCategory) => void;
}

/**
 * Este componente encapsula solo una sección de formulario.
 * Toda la lógica de negocio permanece en hooks; aquí solo hay rendering + eventos.
 */
export default function DatosGeneralesSection({
  formData,
  userCategory,
  roles,
  clients,
  onInputChange,
  onCategoryChange,
}: DatosGeneralesSectionProps) {
  const employeeRoles = (roles ?? []).filter((role) => getUserCategoryForRole(role.name) !== 'external');

  return (
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
            name="new-user-first-name"
            data-field="nombre"
            value={formData.nombre}
            onChange={onInputChange}
            autoComplete="off"
            placeholder="Ej: Juan"
            className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Apellido
          </label>
          <input
            type="text"
            name="new-user-last-name"
            data-field="apellido"
            value={formData.apellido}
            onChange={onInputChange}
            autoComplete="off"
            placeholder="Ej: Pérez Maldonado"
            className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Correo Electrónico Corporativo
        </label>
        <input
          type="email"
          name="new-user-email"
          data-field="email"
          value={formData.email}
          onChange={onInputChange}
          autoComplete="off"
          autoCapitalize="none"
          placeholder="usuario@ternium.com"
          className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
        />
      </div>

      <div className="space-y-3 mb-8">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Contraseña
        </label>
        <input
          type="password"
          name="new-user-password"
          data-field="contraseña"
          value={formData.contraseña}
          onChange={onInputChange}
          autoComplete="new-password"
          placeholder="Contraseña"
          className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
        />
      </div>

      <div className="space-y-3 mb-8">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Categoría de Usuario
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`relative p-5 border-2 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${
              userCategory === 'employee'
                ? 'border-[#ff3d00] bg-orange-50/20'
                : 'border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-gray-200'
            }`}
            onClick={() => onCategoryChange('employee')}
          >
            <div
              className={`p-3 rounded-xl shadow-sm border ${
                userCategory === 'employee' ? 'bg-white border-orange-100' : 'bg-white border-gray-50'
              }`}
            >
              <FaRegBuilding
                className={userCategory === 'employee' ? 'text-slate-700' : 'text-gray-300'}
                size={24}
              />
            </div>
            <div>
              <p
                className={`font-bold text-base ${
                  userCategory === 'employee' ? 'text-slate-900' : 'text-gray-400'
                }`}
              >
                Empleado Ternium
              </p>
              <p
                className={`text-xs ${
                  userCategory === 'employee' ? 'text-gray-400' : 'text-gray-300'
                }`}
              >
                Acceso a red interna y ERP
              </p>
            </div>
          </div>

          <div
            className={`relative p-5 border-2 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${
              userCategory === 'external'
                ? 'border-[#ff3d00] bg-orange-50/20'
                : 'border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-gray-200'
            }`}
            onClick={() => onCategoryChange('external')}
          >
            <div
              className={`p-3 rounded-xl shadow-sm border ${
                userCategory === 'external' ? 'bg-white border-orange-100' : 'bg-white border-gray-50'
              }`}
            >
              <FaGlobeAmericas
                className={userCategory === 'external' ? 'text-slate-700' : 'text-gray-300'}
                size={24}
              />
            </div>
            <div>
              <p
                className={`font-bold text-base ${
                  userCategory === 'external' ? 'text-slate-900' : 'text-gray-400'
                }`}
              >
                Cliente Externo
              </p>
              <p
                className={`text-xs ${
                  userCategory === 'external' ? 'text-gray-400' : 'text-gray-300'
                }`}
              >
                Acceso a portal comercial
              </p>
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
            data-field={userCategory === 'employee' ? 'rol' : 'cliente'}
            value={userCategory === 'employee' ? formData.rol : formData.cliente}
            onChange={onInputChange}
            className="w-full appearance-none p-3 px-4 border border-gray-200 rounded-lg bg-white text-slate-500 focus:ring-2 focus:ring-orange-500/20 outline-none font-medium"
          >
            {userCategory === 'employee'
              ? [
                  <option key="empty-role" value="">Selecciona un rol</option>,
                  ...employeeRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {getRoleLabel(role.name)}
                  </option>
                  )),
                ]
              : [
                  <option key="empty-client" value="">Selecciona un cliente</option>,
                  ...(clients?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                  )) ?? []),
                ]}
          </select>
          <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
