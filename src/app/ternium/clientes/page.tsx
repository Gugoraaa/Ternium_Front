'use client'
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiFilter, FiEye, FiPlus, FiX } from 'react-icons/fi';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { createClient } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusPill from '@/components/StatusPill';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/AuthContext';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { normalizeRoleName } from '@/lib/permissions';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  worker_id: string;
  client_id: string;
  product_id: number;
  specs_id: number;
  reviewed_by: string | null;
  created_at: string;
  status: string;
  contra_offer: boolean;
  product?: {
    id: number;
    pt: string;
    master: string;
    name?: string;
  };
  client?: {
    id: string;
    name: string;
  };
}

const SeguimientoOrdenes = () => {
  useRoleGuard('/ternium/clientes');
  const { user: authUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const role = normalizeRoleName(authUser?.role_name);
  const canManageClients = role === 'admin' || role === 'user_admin';

  useEffect(() => {
    if (authUser === null) return;
    fetchClientOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  async function fetchClientOrders() {
    try {
      setLoading(true);
      setError(null);

      if (role === 'admin') {
        // Admin: fetch all orders across all clients
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            product:product_id (*),
            client:client_id (*)
          `)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
        return;
      }

      // client_manager path: look up the user's assigned client
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      const { data: clientWorkers, error: workerError } = await supabase
        .from('client_workers')
        .select('client_id')
        .eq('user_id', user.id);

      if (workerError) throw workerError;
      if (!clientWorkers || clientWorkers.length === 0) {
        setOrders([]);
        return;
      }

      const clientIds = [...new Set(clientWorkers.map((worker) => worker.client_id).filter(Boolean))];

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          product:product_id (*),
          client:client_id (*)
        `)
        .in('client_id', clientIds)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching client orders:', error);
      setError('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  }

  
  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchTerm.toLowerCase()) ||
    order.product?.pt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = orders.filter(order => order.status === 'Revision Cliente').length;
  const reviewCount = orders.filter(order => order.status === 'Revision Operador').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans text-slate-800">
        <LoadingSpinner size="large" message="Cargando órdenes..." fullScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans text-slate-800">
        <div className="max-w-7xl mx-auto text-center py-20">
          <HiOutlineExclamationCircle className="text-6xl text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Error</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={fetchClientOrders}
            className="bg-[#ff4d17] hover:bg-[#e64010] text-white px-6 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans text-slate-800">
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Seguimiento Ordenes Cliente
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestione y valide sus órdenes entrantes de manera eficiente.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-start w-full md:w-auto">
          <StatCard title="PENDIENTES" value={pendingCount.toString()} badge={pendingCount > 0 ? `+${pendingCount}` : undefined} />
          <StatCard title="EN REVISIÓN" value={reviewCount.toString().padStart(2, '0')} />
          {canManageClients && (
            <button
              onClick={() => setShowNewClientModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ff4301] to-[#e63d01] hover:from-[#e63d01] hover:to-[#cc3500] text-white font-bold py-3 px-5 rounded-xl shadow-[0_4px_16px_rgba(255,67,1,0.35)] hover:shadow-[0_6px_24px_rgba(255,67,1,0.45)] transition-all hover:-translate-y-0.5 active:scale-95 text-sm whitespace-nowrap"
            >
              <FiPlus size={16} />
              Nuevo Cliente
            </button>
          )}
        </div>
      </div>

      {showNewClientModal && (
        <NuevoClienteModal
          onClose={() => setShowNewClientModal(false)}
          onCreated={() => {
            setShowNewClientModal(false);
            toast.success('Cliente creado correctamente');
          }}
        />
      )}

      {/* TABLE CONTAINER */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200">
        
        {/* TOOLBAR */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[#f34d1c] font-bold">
            <HiOutlineExclamationCircle className="text-xl" />
            <span className="text-sm">
              {pendingCount > 0 ? `Órdenes Pendientes de Validación (${pendingCount})` : 'No hay órdenes pendientes'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar orden..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
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
                <th className="px-6 py-4">Fecha Creación</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {searchTerm ? 'No se encontraron órdenes que coincidan con la búsqueda' : 'No hay órdenes disponibles'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-5 text-sm font-bold text-slate-700">#{order.id}</td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-slate-900 leading-tight">{order.product?.pt || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Master: {order.product?.master || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('es-ES') : 'N/A'}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">{order.client?.name || 'N/A'}</td>
                    <td className="px-6 py-5">
                      <StatusPill status={order.status || ''} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => router.push(`/ternium/clientes/orden/${order.id}`)}
                        className="inline-flex items-center gap-2 bg-[#ff4d17] hover:bg-[#e64010] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all transform active:scale-95"
                      >
                        Ver Orden <FiEye className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-slate-50 flex justify-between items-center">
          <span className="text-[11px] text-slate-400 font-medium">
            Mostrando {filteredOrders.length} de {orders.length} órdenes
          </span>
          <div className="flex items-center gap-1">
            <PagBtn label="<" disabled />
            <PagBtn label="1" active />
            <PagBtn label=">" disabled={filteredOrders.length <= 10} />
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

function NuevoClienteModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed) {
      toast.error('Ingresa el nombre del cliente');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.from('clients').insert({ name: trimmed });
      if (error) {
        if (error.message.includes('unique') || error.message.includes('duplicate')) {
          toast.error('Ya existe un cliente con ese nombre');
        } else {
          toast.error('Error al crear el cliente: ' + error.message);
        }
        return;
      }
      onCreated();
    } catch {
      toast.error('Error inesperado al crear el cliente');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-base">Nuevo Cliente</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nombre de la empresa
            </label>
            <input
              ref={inputRef}
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Yamaha, Toyota, Honda..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#ff4301]/20 focus:border-[#ff4301]/40 outline-none transition-all"
              autoComplete="off"
              maxLength={120}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !nombre.trim()}
              className="flex-1 py-2.5 rounded-xl bg-[#ff4301] hover:bg-[#e63d01] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
            >
              {saving ? 'Guardando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SeguimientoOrdenes;
