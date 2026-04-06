'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OrderWithOperacion } from '@/types/operaciones';
import toast from 'react-hot-toast';

export function useOperacionDetail(orderId: string) {
  const [order, setOrder] = useState<OrderWithOperacion | null>(null);
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
          id, status, created_at, execution_details_id, dispatch_validation_id, shipping_info_id, worker_id,
          product:product_id (id, pt, master),
          client:client_id (id, name),
          specs:specs_id (id, inner_diameter, outer_diameter, width, minimum_shipping_weight, maximum_shipping_weight, pieces_per_package, maximum_pallet_width, shipping_packaging),
          programing_instructions:programing_instructions_id (
            id, assigned_date, note, responsible, status,
            responsible_user:users!programing_instructions_responsible_fkey (name, second_name)
          ),
          execution_details:execution_details_id (*),
          dispatch_validation:dispatch_validation_id (*),
          shipping_info:shipping_info_id (*),
          worker:users!orders_worker_id_fkey (name, second_name)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      const fetchedOrder = data as unknown as OrderWithOperacion;

      // Auto-create execution_details if it doesn't exist
      if (fetchedOrder && !fetchedOrder.execution_details?.id) {
        const { data: edData, error: edError } = await supabase
          .from('execution_details')
          .insert({ status: 'Pendiente' })
          .select()
          .single();

        if (edError) throw edError;

        const { error: updateError } = await supabase
          .from('orders')
          .update({ execution_details_id: edData.id })
          .eq('id', orderId);

        if (updateError) throw updateError;

        fetchedOrder.execution_details_id = edData.id;
        fetchedOrder.execution_details = edData;
      }

      setOrder(fetchedOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la orden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const saveExecutionDetails = async (formData: {
    weight: number | null;
    shipping_packaging: string;
    note: string;
  }) => {
    const edId = order?.execution_details?.id;
    if (!edId) return false;
    try {
      setSaving(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('execution_details')
        .update({
          weight: formData.weight,
          shipping_packaging: formData.shipping_packaging || null,
          note: formData.note || null,
        })
        .eq('id', edId);

      if (error) throw error;

      toast.success('Datos de ejecución guardados');
      await fetchOrder();
      return true;
    } catch (err) {
      toast.error('Error al guardar los datos');
      console.error(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const validateEspecificacion = async (formData: {
    weight: number | null;
    shipping_packaging: string;
    note: string;
  }) => {
    if (!order) return false;
    if (order.execution_details?.status === 'Aceptado') {
      toast.error('Esta orden ya fue validada');
      return false;
    }
    try {
      setSaving(true);
      const supabase = createClient();

      // Step 1: Save execution details
      const edId = order.execution_details?.id;
      if (edId) {
        const { error: edError } = await supabase
          .from('execution_details')
          .update({
            weight: formData.weight,
            shipping_packaging: formData.shipping_packaging || null,
            note: formData.note || null,
            status: 'Aceptado',
          })
          .eq('id', edId);

        if (edError) throw edError;
      }

      // Step 2: Create dispatch_validation with Pendiente status for Management to act on
      const { data: dvData, error: dvError } = await supabase
        .from('dispatch_validation')
        .insert({ status: 'Pendiente' })
        .select()
        .single();

      if (dvError) throw dvError;

      // Step 3: Link dispatch_validation to order
      const { error: orderError } = await supabase
        .from('orders')
        .update({ dispatch_validation_id: dvData.id })
        .eq('id', order.id);

      if (orderError) throw orderError;

      toast.success('Especificación validada correctamente');
      await fetchOrder();
      return true;
    } catch (err) {
      toast.error('Error al validar la especificación');
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
    saveExecutionDetails,
    validateEspecificacion,
    refetch: fetchOrder,
  };
}
