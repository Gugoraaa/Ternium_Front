'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OrderWithDespacho } from '@/types/despacho';
import toast from 'react-hot-toast';

export function useDespachoDetail(orderId: string) {
  const [order, setOrder] = useState<OrderWithDespacho | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, status, created_at, dispatch_validation_id, shipping_info_id,
          product:product_id (id, pt, master),
          client:client_id (id, name),
          specs:specs_id (id, inner_diameter, outer_diameter, width, minimum_shipping_weight, maximum_shipping_weight, pieces_per_package, maximum_pallet_width, shipping_packaging),
          execution_details:execution_details_id (id, weight, shipping_packaging, note, status),
          dispatch_validation:dispatch_validation_id (id, status, approved_at),
          shipping_info:shipping_info_id (*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      setOrder(data as unknown as OrderWithDespacho);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la orden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const generarOrden = async () => {
    if (!order?.shipping_info?.id) return false;
    if (order.shipping_info.status !== 'Pendiente') {
      toast.error('Esta orden ya fue despachada');
      return false;
    }
    try {
      setSaving(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('shipping_info')
        .update({ status: 'En ruta' })
        .eq('id', order.shipping_info.id);

      if (error) throw error;

      toast.success('Orden de despacho generada');
      await fetchOrder();
      return true;
    } catch (err) {
      toast.error('Error al generar la orden de despacho');
      console.error(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const marcarEntregada = async () => {
    if (!order?.shipping_info?.id) return false;
    if (order.shipping_info.status !== 'En ruta') {
      toast.error('Esta orden no está en ruta');
      return false;
    }
    try {
      setSaving(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('shipping_info')
        .update({ status: 'Entregado', shipped_at: new Date().toISOString() })
        .eq('id', order.shipping_info.id);

      if (error) throw error;

      toast.success('Orden marcada como entregada');
      await fetchOrder();
      return true;
    } catch (err) {
      toast.error('Error al marcar la orden como entregada');
      console.error(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    order,
    loading,
    saving,
    error,
    generarOrden,
    marcarEntregada,
    refetch: fetchOrder,
  };
}
