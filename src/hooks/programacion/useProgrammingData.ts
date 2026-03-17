import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OrderWithProgramming, ProgrammingFilters, PaginationInfo } from '@/types/programacion';

export function useProgrammingData() {
  const [orders, setOrders] = useState<OrderWithProgramming[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProgrammingFilters>({
    search: '',
    assignmentStatus: 'Todos',
    client: 'Todos los clientes',
    responsible: 'Cualquiera'
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from('orders')
        .select(`
          *,
          product:product(id, master, pt, client_id),
          client:clients(id, name),
          programing_instruction:programing_instructions(id, responsible, assigned_date, status, note),
          worker:users!orders_worker_id_fkey(id, name, second_name, email, role_id, active, created_at)
        `)
        .eq('status', 'Aceptado');  
        

      // Apply search filter
      if (filters.search) {
        query = query.ilike('id::text', `%${filters.search}%`);
      }

      // Apply assignment status filter
      if (filters.assignmentStatus !== 'Todos') {
        query = query.eq('programing_instruction.status', filters.assignmentStatus);
      }

      // Apply client filter
      if (filters.client !== 'Todos los clientes') {
        query = query.eq('client.name', filters.client);
      }

      // Apply responsible filter
      if (filters.responsible !== 'Cualquiera') {
        query = query.ilike('worker.name', `%${filters.responsible}%`);
      }

      // Get total count
      const { count } = await query;

      // Apply pagination
      const from = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const to = from + pagination.itemsPerPage - 1;

      const { data, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      setPagination(prev => ({
        ...prev,
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.itemsPerPage)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters, pagination.currentPage]);

  const updateFilters = (newFilters: Partial<ProgrammingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const updatePage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const assignOrder = async (orderId: number, responsible: string) => {
    try {
      const supabase = createClient();
      
      // First, create or update programming instruction
      const { data: programmingData, error: programmingError } = await supabase
        .from('programing_instructions')
        .upsert({
          responsible,
          assigned_date: new Date().toISOString().split('T')[0],
          status: 'Aceptado'
        })
        .select()
        .single();

      if (programmingError) throw programmingError;

      // Then update the order with the programming instruction id
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          programing_instructions_id: programmingData.id
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      await fetchOrders(); // Refresh data
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error assigning order');
      return false;
    }
  };

  return {
    orders,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    updatePage,
    assignOrder,
    refetch: fetchOrders
  };
}
