import { type Database } from './database';

export type ExecutionDetails = Database['public']['Tables']['execution_details']['Row'];
export type ExecutionDetailsStatus = Database['public']['Enums']['execution_details_enum'];
export type DispatchValidation = Database['public']['Tables']['dispatch_validation']['Row'];
export type ShippingInfo = Database['public']['Tables']['shipping_info']['Row'];
export type ProgramingStatus = Database['public']['Enums']['programing-status-enum'];

export interface ResponsibleUser {
  name: string;
  second_name: string;
}

export interface ProgramingInstructionWithUser {
  id: number;
  assigned_date: string | null;
  note: string | null;
  responsible: string | null;
  status: ProgramingStatus | null;
  responsible_user: ResponsibleUser | null;
}

export interface OrderWithOperacion {
  id: number;
  status: Database['public']['Enums']['order-status-enum'];
  created_at: string;
  execution_details_id: number | null;
  dispatch_validation_id: number | null;
  shipping_info_id: number | null;
  worker_id: string;
  product: {
    id: number;
    pt: string;
    master: string;
  } | null;
  client: {
    id: string;
    name: string;
  } | null;
  specs: {
    id: number;
    inner_diameter: number | null;
    outer_diameter: number | null;
    width: number | null;
    minimum_shipping_weight: number | null;
    maximum_shipping_weight: number | null;
    pieces_per_package: number | null;
    maximum_pallet_width: number | null;
    shipping_packaging: string | null;
  } | null;
  programing_instructions: ProgramingInstructionWithUser | null;
  execution_details: ExecutionDetails | null;
  dispatch_validation: DispatchValidation | null;
  shipping_info: ShippingInfo | null;
  worker: ResponsibleUser | null;
}

export interface OperacionesFilters {
  assignmentStatus: 'Todos' | ProgramingStatus;
  client: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
