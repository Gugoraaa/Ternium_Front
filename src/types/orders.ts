import { type Database } from "./database";


export type OrderStatus = Database['public']['Enums']['order-status-enum'];
export type OrderSpecs = Partial<Database['public']['Tables']['specs']['Row']>;
export type OrderOffer = Partial<Database['public']['Tables']['order_offers']['Row']>;
export type Order = Partial<Database['public']['Tables']['orders']['Row']>
export type Product = Partial<Database['public']['Tables']['product']['Row']>
export type Client = Partial<Database['public']['Tables']['clients']['Row']>


export type OrderOfferWithSpecs = OrderOffer & {
  specs?: OrderSpecs;
  reviewed_at?: string | null;
};

export type OrderDetails = Order & {
  specs?: OrderSpecs;
  product?: Product;
  client?: Client;
};
