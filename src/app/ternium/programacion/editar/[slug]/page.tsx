'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useOrderById } from '@/hooks/orders/useOrderById';
import { useWorkers } from '@/hooks/useWorkers';
import { createClient } from '@/lib/supabase/client';
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function EditarProgramacionPage() {
  useRoleGuard('/ternium/programacion');
  const router = useRouter();
  const params = useParams();
  const orderId = params.slug as string;
  
  const { order, loading: orderLoading, error } = useOrderById(orderId);
  const { workers, loading: workersLoading, error: workersError } = useWorkers();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    responsible: '',
    deadline: '',
    comment: ''
  });

  useEffect(() => {
    if (!order) return;

    setFormData({
      responsible: order.programing_instructions?.responsible ?? '',
      deadline: order.programing_instructions?.assigned_date ?? '',
      comment: order.programing_instructions?.note ?? '',
    });
  }, [order]);

  const minAssignableDate = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const createdAt = order?.created_at ? new Date(order.created_at).toISOString().split('T')[0] : today;
    return createdAt > today ? createdAt : today;
  }, [order?.created_at]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    const selectedWorker = workers.find((worker) => worker.id === formData.responsible);
    if (!selectedWorker) {
      toast.error('Selecciona un responsable válido.');
      return;
    }

    if (!formData.deadline) {
      toast.error('Selecciona una fecha de asignación.');
      return;
    }

    if (formData.deadline < minAssignableDate) {
      toast.error('La fecha de asignación no puede ser anterior a hoy ni a la creación de la orden.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const instructionPayload = {
        responsible: selectedWorker.id,
        assigned_date: formData.deadline,
        note: formData.comment.trim() || 'No hay nota proporcionada',
        status: order.programing_instructions?.status === 'Reasignado' ? 'Reasignado' : 'Asignado',
      };

      let programingInstructionsId = order.programing_instructions?.id ?? null;

      if (programingInstructionsId) {
        const { error: updateError } = await supabase
          .from('programing_instructions')
          .update(instructionPayload)
          .eq('id', programingInstructionsId);

        if (updateError) throw updateError;
      } else {
        const { data: newInstruction, error: createError } = await supabase
          .from('programing_instructions')
          .insert(instructionPayload)
          .select('id')
          .single();

        if (createError) throw createError;
        programingInstructionsId = newInstruction.id;

        const { error: linkError } = await supabase
          .from('orders')
          .update({ programing_instructions_id: programingInstructionsId })
          .eq('id', order.id);

        if (linkError) throw linkError;
      }

      toast.success('Asignación guardada correctamente');
      router.push('/ternium/programacion');
    } catch (submitError) {
      console.error('Error saving assignment:', submitError);
      toast.error('Error al guardar la asignación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/ternium/programacion');
  };

  if (orderLoading || workersLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-700">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner size="large" message={orderLoading || workersLoading ? "Cargando datos..." : "Guardando asignación..."} fullScreen />
        </div>
      </div>
    );
  }

  if (error || workersError || !order) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-700">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error || workersError || 'No se encontró la orden especificada'}</p>
            <button
              onClick={() => router.push('/ternium/programacion')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Volver a Programación
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-700">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/ternium/programacion')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Volver a Programación
          </button>
          
          <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">
            {order?.programing_instructions?.responsible ? 'Editar Asignación' : 'Nueva Asignación'}
          </h1>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">ID</p>
              <p className="font-semibold text-slate-800">#{order?.id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">PT</p>
              <p className="font-semibold text-slate-800">{order?.product?.pt || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Master</p>
              <p className="font-semibold text-slate-800">{order?.product?.master || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cliente</p>
              <p className="font-semibold text-slate-800">{order?.client?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estado</p>
              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                {order?.programing_instructions?.status || 'Sin asignar'}
              </span>
            </div>
          </div>
          
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="space-y-6">
            {/* Responsible */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Responsable de Ejecución
              </label>
              <select
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all outline-none appearance-none cursor-pointer"
                required
              >
                <option value="">Seleccionar persona responsable</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} {worker.second_name ?? ''} {worker.role_name ? `• ${worker.role_name}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha Límite
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={minAssignableDate}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                required
              />
              <p className="mt-2 text-xs text-slate-400">
                Fecha mínima permitida: {new Date(minAssignableDate).toLocaleDateString('es-MX')}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Comentario de Programación
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Escriba aquí cualquier instrucción especial o comentario relevante para la asignación..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all outline-none resize-none"
              />
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#ff4301] hover:bg-[#e63d01] text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : (order?.programing_instructions?.responsible ? 'Actualizar Asignación' : 'Crear Asignación')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
