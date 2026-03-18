'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OrderDetails } from '@/types/orders';

interface UseOrderByIdReturn {
  order: OrderDetails | null;
  loading: boolean;
  error: string | null;
}

export function   useOrderById(orderId: string): UseOrderByIdReturn {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderById() {
      if (!orderId) {
        setError('No se proporcionó un ID de orden');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            product:product_id (*),
            client:client_id (*),
            programing_instructions:programing_instructions_id (*)
          `)
          .eq('id', orderId)
          .single();

        if (error) {
          throw error;
        }

        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Error al cargar la orden');
      } finally {
        setLoading(false);
      }
    }

    fetchOrderById();
  }, [orderId]);

  return { order, loading, error };
}
