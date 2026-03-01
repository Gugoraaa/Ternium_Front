'use client'
import { useState } from 'react';
// Importando desde react-icons
import { FiSearch, FiFilter, FiEye } from 'react-icons/fi'; 
import { HiOutlineExclamationCircle } from 'react-icons/hi';

interface Orden {
  id: string;
  producto: string;
  detalles: string;
  fechaEnvio: string;
  planta: string;
  estado: 'Pendiente' | 'En revisión';
}

const SeguimientoOrdenes = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const ordenes: Orden[] = [
    { id: 'ORD-8823', producto: 'Acero Galvanizado', detalles: 'Espesor: 0.5mm • Grado: G60', fechaEnvio: '24/05/2024', planta: 'Pesquería', estado: 'Pendiente' },
    { id: 'ORD-8824', producto: 'Bobina Laminada', detalles: 'Ancho: 1200mm • Calidad: CQ', fechaEnvio: '23/05/2024', planta: 'Monterrey', estado: 'En revisión' },
    { id: 'ORD-8819', producto: 'Placa de Acero', detalles: 'A-36 • Dimensiones: 4\' x 8\'', fechaEnvio: '22/05/2024', planta: 'Pesquería', estado: 'Pendiente' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans text-slate-800">
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Seguimiento Ordenes Cliente
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestione y valide sus órdenes entrantes de manera eficiente para la planta Monterrey.
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <StatCard title="PENDIENTES" value="12" badge="+2" />
          <StatCard title="EN REVISIÓN" value="05" />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200">
        
        {/* TOOLBAR */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[#f34d1c] font-bold">
            <HiOutlineExclamationCircle className="text-xl" />
            <span className="text-sm">Órdenes Pendientes de Validación</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar orden..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
              <FiFilter />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-50 tracking-widest">
                <th className="px-6 py-4 text-center">Orden ID</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Fecha de Envío</th>
                <th className="px-6 py-4">Planta Origen</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ordenes.map((orden) => (
                <tr key={orden.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-6 py-5 text-sm font-bold text-slate-700">{orden.id}</td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-slate-900 leading-tight">{orden.producto}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{orden.detalles}</div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">{orden.fechaEnvio}</td>
                  <td className="px-6 py-5 text-sm text-slate-500">{orden.planta}</td>
                  <td className="px-6 py-5">
                    <StatusLabel status={orden.estado} />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="inline-flex items-center gap-2 bg-[#ff4d17] hover:bg-[#e64010] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all transform active:scale-95">
                      Ver Orden <FiEye className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-slate-50 flex justify-between items-center">
          <span className="text-[11px] text-slate-400 font-medium">Mostrando 3 de 12 órdenes</span>
          <div className="flex items-center gap-1">
            <PagBtn label="<" disabled />
            <PagBtn label="1" active />
            <PagBtn label="2" />
            <PagBtn label=">" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- MINI COMPONENTES --- */

const StatCard = ({ title, value, badge }: { title: string, value: string, badge?: string }) => (
  <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm min-w-[150px]">
    <span className="text-[10px] font-bold text-slate-400 block mb-1">{title}</span>
    <div className="flex items-center gap-3">
      <span className="text-3xl font-bold text-slate-800 tracking-tight">{value}</span>
      {badge && (
        <span className="bg-green-100 text-green-600 text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
          {badge}
        </span>
      )}
    </div>
  </div>
);

const StatusLabel = ({ status }: { status: 'Pendiente' | 'En revisión' }) => {
  const isPendiente = status === 'Pendiente';
  return (
    <div className={`mx-auto w-fit flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold border ${
      isPendiente ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isPendiente ? 'bg-orange-500' : 'bg-blue-500'}`} />
      {isPendiente ? 'Pendiente validación' : 'En revisión cliente'}
    </div>
  );
};

const PagBtn = ({ label, active, disabled }: { label: string, active?: boolean, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all border ${
      active 
        ? 'bg-[#ff4d17] border-[#ff4d17] text-white shadow-md' 
        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
  >
    {label}
  </button>
);

export default SeguimientoOrdenes;