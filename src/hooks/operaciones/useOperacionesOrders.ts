'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OrderWithOperacion, OperacionesFilters, PaginationInfo } from '@/types/operaciones';

export function useOperacionesOrders() {
  const [orders, setOrders] = useState<OrderWithOperacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OperacionesFilters>({
    assignmentStatus: 'Todos',
    client: 'Todos los clientes',
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

      // Step 1: get programing_instructions IDs matching the status filter
      let piQuery = supabase
        .from('programing_instructions')
        .select('id')
        .not('responsible', 'is', null);

      if (filters.assignmentStatus !== 'Todos') {
        piQuery = piQuery.eq('status', filters.assignmentStatus);
      } else {
        piQuery = piQuery.eq('status', 'Asignado');
      }

      const { data: piData, error: piError } = await piQuery;
      if (piError) throw piError;

      const piIds = (piData || []).map((pi) => pi.id);

      if (piIds.length === 0) {
        setOrders([]);
        setPagination(prev => ({ ...prev, totalItems: 0, totalPages: 1 }));
        setLoading(false);
        return;
      }

      // Step 2: query orders filtered by those IDs
      let query = supabase
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
          shipping_info:shipping_info_id (*)
        `, { count: 'exact' })
        .in('programing_instructions_id', piIds)
        .order('created_at', { ascending: false });

      const { count } = await query;

      const from = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const to = from + pagination.itemsPerPage - 1;

      const { data, error } = await query.range(from, to);

      if (error) throw error;

      setOrders((data as unknown as OrderWithOperacion[]) || []);
      setPagination(prev => ({
        ...prev,
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / prev.itemsPerPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar operaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters, pagination.currentPage]);

  const updateFilters = (newFilters: Partial<OperacionesFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const updatePage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
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
