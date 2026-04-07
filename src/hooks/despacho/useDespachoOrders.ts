'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OrderWithDespacho, DespachoFilters, PaginationInfo } from '@/types/despacho';

export function useDespachoOrders() {
  const [orders, setOrders] = useState<OrderWithDespacho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DespachoFilters>({
    shippingStatus: 'Activos',
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Step 1: get shipping_info IDs matching the status filter
      let siQuery = supabase.from('shipping_info').select('id');

      if (filters.shippingStatus === 'Activos') {
        siQuery = siQuery.in('status', ['Pendiente', 'En ruta']);
      } else if (filters.shippingStatus !== 'Todos') {
        siQuery = siQuery.eq('status', filters.shippingStatus);
      }

      const { data: siData, error: siError } = await siQuery;
      if (siError) throw siError;

      const siIds = (siData || []).map((si) => si.id);

      if (siIds.length === 0) {
        setOrders([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1 }));
        return;
      }

      // Step 2: query orders filtered by shipping_info IDs
      const from = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const to = from + pagination.itemsPerPage - 1;

      const { data, error, count } = await supabase
        .from('orders')
        .select(
          `
          id, status, created_at, dispatch_validation_id, shipping_info_id,
          product:product_id (id, pt, master),
          client:client_id (id, name),
          dispatch_validation:dispatch_validation_id (id, status, approved_at),
          shipping_info:shipping_info_id (*)
        `,
          { count: 'exact' }
        )
        .in('shipping_info_id', siIds)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setOrders((data as unknown as OrderWithDespacho[]) || []);
      setPagination((prev) => ({
        ...prev,
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / prev.itemsPerPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters, pagination.currentPage]);

  const updateFilters = (newFilters: Partial<DespachoFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const updatePage = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  return {
    orders,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    updatePage,
    refetch: fetchOrders,
  };
}
