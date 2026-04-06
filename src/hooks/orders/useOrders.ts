'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  producto: string;
  cliente: string;
  fecha: string;
  status: 'Revision Operador' | 'Aceptado' | 'Rechazado' | 'Revision Cliente';
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  filteredOrders: Order[];
  filters: {
    estado: string;
    cliente: string;
    searchId: string;
  };
  setFilters: (filters: Partial<UseOrdersReturn['filters']>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFiltersState] = useState({
    estado: 'Todos los Estados',
    cliente: 'Todos los Clientes',
    searchId: ''
  });

  const supabase = useMemo(() => createClient(), []);

  async function fetchOrders() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:product_id (*),
          client:client_id (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedOrders: Order[] = data?.map(order => ({
        id: order.id,
        producto: order.product?.pt ,
        cliente: order.client.name ,
        fecha: order.created_at,
        status: order.status
      })) || [];

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  }

  

  function setFilters(newFilters: Partial<UseOrdersReturn['filters']>) {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }

  function applyFilters() {
    let filtered = [...orders];

    if (filters.estado !== 'Todos los Estados') {
      filtered = filtered.filter(order => order.status === filters.estado);
    }

    if (filters.cliente !== 'Todos los Clientes') {
      filtered = filtered.filter(order => 
        order.cliente.toLowerCase().includes(filters.cliente.toLowerCase())
      );
    }

    if (filters.searchId.trim()) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(filters.searchId.trim())
      );
    }

    return filtered;
  }

  function resetFilters() {
    setFiltersState({
      estado: 'Todos los Estados',
      cliente: 'Todos los Clientes',
      searchId: ''
    });
  }

  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setSessionReady(!!session);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (sessionReady === true) fetchOrders();
    else if (sessionReady === false) setLoading(false);
  }, [sessionReady]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredOrders = useMemo(() => applyFilters(), [orders, filters]);

  return {
    orders,
    loading,
    filteredOrders,
    filters,
    setFilters,
    applyFilters,
    resetFilters
  };
}
