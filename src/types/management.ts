import { type Database } from './database';

export type DispatchValidationStatus = Database['public']['Enums']['dispatch_enum_status'];
export type ShippingInfoStatus = Database['public']['Enums']['shipping_info_status'];
export type DispatchValidation = Database['public']['Tables']['dispatch_validation']['Row'];
export type ShippingInfo = Database['public']['Tables']['shipping_info']['Row'];

export interface OrderWithManagement {
  id: number;
  status: Database['public']['Enums']['order-status-enum'];
  created_at: string;
  dispatch_validation_id: number | null;
  shipping_info_id: number | null;
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
  execution_details: {
    id: number;
    weight: number | null;
    shipping_packaging: string | null;
    note: string | null;
    status: Database['public']['Enums']['execution_details_enum'];
  } | null;
  dispatch_validation: DispatchValidation | null;
  shipping_info: ShippingInfo | null;
}

export interface ManagementFilters {
  dispatchStatus: DispatchValidationStatus | 'Todos';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
