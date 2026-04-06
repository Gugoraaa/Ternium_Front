'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OrderWithManagement } from '@/types/management';
import toast from 'react-hot-toast';

export function useManagementDetail(orderId: string) {
  const [order, setOrder] = useState<OrderWithManagement | null>(null);
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
          dispatch_validation:dispatch_validation_id (*),
          execution_details:execution_details_id (id, weight, shipping_packaging, note, status),
          shipping_info:shipping_info_id (*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      setOrder(data as unknown as OrderWithManagement);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la orden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const approveOrder = async () => {
    if (!order) return false;
    if (order.dispatch_validation?.status !== 'Pendiente') {
      toast.error('Esta orden ya fue procesada');
      return false;
    }
    try {
      setSaving(true);
      const supabase = createClient();

      // Step 1: update dispatch_validation to Aceptado
      const { error: dvError } = await supabase
        .from('dispatch_validation')
        .update({ status: 'Aceptado', approved_at: new Date().toISOString() })
        .eq('id', order.dispatch_validation.id);

      if (dvError) throw dvError;

      // Step 2: create shipping_info only if it doesn't exist yet
      if (!order.shipping_info?.id) {
        const { data: siData, error: siError } = await supabase
          .from('shipping_info')
          .insert({ status: 'Pendiente', approved_at: new Date().toISOString() })
          .select()
          .single();

        if (siError) throw siError;

        // Step 3: link shipping_info to order
        const { error: orderError } = await supabase
          .from('orders')
          .update({ shipping_info_id: siData.id })
          .eq('id', order.id);

        if (orderError) throw orderError;
      }

      toast.success('Orden aprobada para despacho');
      await fetchOrder();
      return true;
    } catch (err) {
      toast.error('Error al aprobar la orden');
      console.error(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const rejectOrder = async () => {
    if (!order) return false;
    if (order.dispatch_validation?.status !== 'Pendiente') {
      toast.error('Esta orden ya fue procesada');
      return false;
    }
    try {
      setSaving(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('dispatch_validation')
        .update({ status: 'Rechazado' })
        .eq('id', order.dispatch_validation!.id);

      if (error) throw error;

      toast.success('Orden rechazada');
      await fetchOrder();
      return true;
    } catch (err) {
      toast.error('Error al rechazar la orden');
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
    approveOrder,
    rejectOrder,
    refetch: fetchOrder,
  };
}
