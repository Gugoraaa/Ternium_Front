import { type Database } from "./database";

export type ProgramingInstruction = Database['public']['Tables']['programing_instructions']['Row'];
export type ProgramingStatus = Database['public']['Enums']['programing-status-enum'];
export type OrderStatus = Database['public']['Enums']['order-status-enum'];

export type OrderWithProgramming = {
  id: number;
  product_id: number;
  client_id: string;
  specs_id: number;
  status: OrderStatus;
  reviewed: boolean;
  reviewed_by: string | null;
  worker_id: string;
  programing_instructions_id: number | null;
  created_at: string;
  contra_offer: boolean;
  dispatch_validation_id: number | null;
  execution_details_id: number | null;
  shipping_info_id: number | null;
  
  // Joined data
  product?: {
    id: number;
    master: string;
    pt: string;
    client_id: string;
  };
  client?: {
    id: string;
    name: string;
  };
  programing_instruction?: ProgramingInstruction;
  worker?: {
    id: string;
    name: string;
    second_name: string;
    email: string;
    role_id: number;
    active: boolean;
    created_at: string;
  };
};

export type ProgrammingFilters = {
  search: string;
  assignmentStatus: ProgramingStatus | 'Todos';
  client: string;
  responsible: string;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};
