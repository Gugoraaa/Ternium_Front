'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  producto: string;
  cliente: string;
  fecha: string;
  estado: 'Revisión Operador' | 'Aceptado' | 'Rechazado' | 'Revision cliente';
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

  const supabase = createClient();

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
        estado: mapOrderStatus(order.status)
      })) || [];

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  }

  function mapOrderStatus(status: string): Order['estado'] {
    const statusMap: Record<string, Order['estado']> = {
      'pending': 'Revisión Operador',
      'approved': 'Aceptado',
      'rejected': 'Rechazado',
      'client_review': 'Revision cliente',
      'review': 'Revisión Operador'
    };
    return statusMap[status] || 'Revisión Operador';
  }

  function setFilters(newFilters: Partial<UseOrdersReturn['filters']>) {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }

  function applyFilters() {
    let filtered = [...orders];

    if (filters.estado !== 'Todos los Estados') {
      filtered = filtered.filter(order => order.estado === filters.estado);
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

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    filteredOrders: applyFilters(),
    filters,
    setFilters,
    applyFilters,
    resetFilters
  };
}
