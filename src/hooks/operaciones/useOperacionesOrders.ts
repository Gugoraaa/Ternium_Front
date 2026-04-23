'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/context/AuthContext';
import { OrderWithOperacion, OperacionesFilters, PaginationInfo } from '@/types/operaciones';

export function useOperacionesOrders() {
  const { user } = useUser();
  const [allOrders, setAllOrders] = useState<OrderWithOperacion[]>([]);
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
      setError(null);
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          execution_details_id,
          dispatch_validation_id,
          shipping_info_id,
          worker_id,
          product:product_id (id, pt, master),
          client:client_id (id, name),
          specs:specs_id (id, inner_diameter, outer_diameter, width, minimum_shipping_weight, maximum_shipping_weight, pieces_per_package, maximum_pallet_width, shipping_packaging),
          programing_instructions:programing_instructions_id (
            id,
            assigned_date,
            note,
            responsible,
            status,
            responsible_user:users!programing_instructions_responsible_fkey (
              id,
              name,
              second_name
            )
          ),
          execution_details:execution_details_id (*),
          dispatch_validation:dispatch_validation_id (*),
          shipping_info:shipping_info_id (*)
        `)
        .not('programing_instructions_id', 'is', null)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Only show orders where the current user is the assigned responsible
      const userId = user?.id;
      setAllOrders(
        ((data as unknown as OrderWithOperacion[]) || []).filter(
          (order) =>
            !!order.programing_instructions?.responsible &&
            order.programing_instructions.responsible === userId
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar operaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const clientOptions = useMemo(
    () => ['Todos los clientes', ...new Set(allOrders.map((order) => order.client?.name).filter(Boolean) as string[])],
    [allOrders]
  );

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const assignmentStatus = order.programing_instructions?.status ?? 'Sin asignar';
      const clientName = order.client?.name ?? '';

      if (filters.assignmentStatus !== 'Todos' && assignmentStatus !== filters.assignmentStatus) {
        return false;
      }

      if (filters.client !== 'Todos los clientes' && clientName !== filters.client) {
        return false;
      }

      return true;
    });
  }, [allOrders, filters]);

  useEffect(() => {
    setPagination((prev) => {
      const totalItems = filteredOrders.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / prev.itemsPerPage));
      const currentPage = Math.min(prev.currentPage, totalPages);

      return {
        ...prev,
        currentPage,
        totalItems,
        totalPages,
      };
    });
  }, [filteredOrders]);

  const paginatedOrders = useMemo(() => {
    const from = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const to = from + pagination.itemsPerPage;
    return filteredOrders.slice(from, to);
  }, [filteredOrders, pagination.currentPage, pagination.itemsPerPage]);

  const updateFilters = (newFilters: Partial<OperacionesFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const updatePage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: Math.min(Math.max(page, 1), prev.totalPages),
    }));
  };

  return {
    orders: paginatedOrders,
    loading,
    error,
    filters,
    pagination,
    clientOptions,
    updateFilters,
    updatePage,
    refetch: fetchOrders,
  };
}
