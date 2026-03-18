'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditarProgramacionPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    responsible: '',
    deadline: '',
    comment: ''
  });

  // Mock data - replace with actual data fetching
  const orderData = {
    id: 'ORD-9281',
    product: 'Rollo Caliente',
    client: 'Automotriz MX',
    status: 'Pendiente de confirmación',
    currentAssignment: null,
    lastModified: '22/05/2024',
    modifiedBy: 'adm_prog01'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement actual update logic
      console.log('Updating assignment:', { orderId, ...formData });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/ternium/programacion');
    } catch (error) {
      console.error('Error updating assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/ternium/programacion');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-700">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner size="large" message="Guardando asignación..." fullScreen />
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
            {orderData.currentAssignment ? 'Editar Asignación' : 'Nueva Asignación'}
          </h1>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">ID</p>
              <p className="font-semibold text-slate-800">#{orderData.id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Producto</p>
              <p className="font-semibold text-slate-800">{orderData.product}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cliente</p>
              <p className="font-semibold text-slate-800">{orderData.client}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estado</p>
              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                {orderData.status}
              </span>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600">
              {orderData.currentAssignment ? (
                <span><span className="font-medium">Asignación actual:</span> {orderData.currentAssignment}</span>
              ) : (
                <span className="font-medium">Esta orden no tiene asignación actual</span>
              )}
            </p>
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
                <option value="G. Sánchez">G. Sánchez</option>
                <option value="M. Luna">M. Luna</option>
                <option value="J. Rodriguez">J. Rodriguez</option>
                <option value="A. Martinez">A. Martinez</option>
                <option value="L. Garcia">L. Garcia</option>
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                required
              />
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
              {loading ? 'Guardando...' : (orderData.currentAssignment ? 'Actualizar Asignación' : 'Crear Asignación')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}