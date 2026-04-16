'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OrderWithManagement, ManagementFilters, PaginationInfo } from '@/types/management';

export function useManagementOrders() {
  const [orders, setOrders] = useState<OrderWithManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ManagementFilters>({
    dispatchStatus: 'Todos',
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

      // Step 1: get dispatch_validation IDs matching the status filter
      let dvQuery = supabase.from('dispatch_validation').select('id');

      if (filters.dispatchStatus !== 'Todos') {
        dvQuery = dvQuery.eq('status', filters.dispatchStatus);
      }

      const { data: dvData, error: dvError } = await dvQuery;
      if (dvError) throw dvError;

      const dvIds = (dvData || []).map((dv) => dv.id);

      if (dvIds.length === 0) {
        setOrders([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1 }));
        return;
      }

      // Step 2: query orders filtered by those dispatch_validation IDs
      const from = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const to = from + pagination.itemsPerPage - 1;

      const { data, error, count } = await supabase
        .from('orders')
        .select(
          `
          id, status, created_at, dispatch_validation_id, shipping_info_id,
          product:product_id (id, pt, master),
          client:client_id (id, name),
          specs:specs_id (id, minimum_shipping_weight, maximum_shipping_weight, pieces_per_package, shipping_packaging),
          dispatch_validation:dispatch_validation_id (*),
          execution_details:execution_details_id (id, weight, shipping_packaging, note, status)
        `,
          { count: 'exact' }
        )
        .in('dispatch_validation_id', dvIds)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setOrders((data as unknown as OrderWithManagement[]) || []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.currentPage]);

  const updateFilters = (newFilters: Partial<ManagementFilters>) => {
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
