'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OrderWithProgramming, ProgrammingFilters, PaginationInfo } from '@/types/programacion';

interface ResponsibleOption {
  id: string;
  label: string;
}

function getResponsibleLabel(order: OrderWithProgramming): string {
  const user = order.programing_instruction?.responsible_user;
  if (!user) return '—';
  return `${user.name} ${user.second_name ?? ''}`.trim();
}

export function useProgrammingData() {
  const [allOrders, setAllOrders] = useState<OrderWithProgramming[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProgrammingFilters>({
    search: '',
    assignmentStatus: 'Todos',
    client: 'Todos los clientes',
    responsible: 'Cualquiera',
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
          product_id,
          client_id,
          specs_id,
          status,
          reviewed,
          reviewed_by,
          worker_id,
          programing_instructions_id,
          created_at,
          contra_offer,
          dispatch_validation_id,
          execution_details_id,
          shipping_info_id,
          product:product_id (id, master, pt, client_id),
          client:client_id (id, name),
          programing_instruction:programing_instructions_id (
            id,
            responsible,
            assigned_date,
            status,
            note,
            updated_at,
            responsible_user:users!programing_instructions_responsible_fkey (
              id,
              name,
              second_name,
              email,
              active,
              offboarded_at
            )
          ),
          worker:users!orders_worker_id_fkey (
            id,
            name,
            second_name,
            email,
            role_id,
            active,
            created_at
          )
        `)
        .eq('status', 'Aceptado')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAllOrders((data as unknown as OrderWithProgramming[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar programación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const clientOptions = useMemo(
    () => ['Todos los clientes', ...new Set(allOrders.map((order) => order.client?.name).filter(Boolean) as string[])],
    [allOrders]
  );

  const responsibleOptions = useMemo<ResponsibleOption[]>(() => {
    const seen = new Map<string, ResponsibleOption>();

    allOrders.forEach((order) => {
      const user = order.programing_instruction?.responsible_user;
      if (!user) return;
      if (seen.has(user.id)) return;

      seen.set(user.id, {
        id: user.id,
        label: getResponsibleLabel(order),
      });
    });

    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [allOrders]);

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const assignmentStatus = order.programing_instruction?.status ?? 'Sin asignar';
      const clientName = order.client?.name ?? '';
      const responsibleId = order.programing_instruction?.responsible_user?.id ?? 'Cualquiera';
      const searchable = [
        String(order.id),
        order.product?.pt ?? '',
        order.product?.master ?? '',
        clientName,
        getResponsibleLabel(order),
      ]
        .join(' ')
        .toLowerCase();

      if (filters.assignmentStatus !== 'Todos' && assignmentStatus !== filters.assignmentStatus) {
        return false;
      }

      if (filters.client !== 'Todos los clientes' && clientName !== filters.client) {
        return false;
      }

      if (filters.responsible !== 'Cualquiera' && responsibleId !== filters.responsible) {
        return false;
      }

      if (filters.search.trim() && !searchable.includes(filters.search.trim().toLowerCase())) {
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

  const updateFilters = (newFilters: Partial<ProgrammingFilters>) => {
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
    responsibleOptions,
    updateFilters,
    updatePage,
    refetch: fetchOrders,
  };
}
