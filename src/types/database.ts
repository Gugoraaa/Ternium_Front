export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      client_workers: {
        Row: {
          client_id: string
          user_id: string
        }
        Insert: {
          client_id?: string
          user_id?: string
        }
        Update: {
          client_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_workers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_workers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      dispatch_validation: {
        Row: {
          approved_at: string | null
          id: number
          status: Database["public"]["Enums"]["dispatch_enum_status"] | null
        }
        Insert: {
          approved_at?: string | null
          id?: number
          status?: Database["public"]["Enums"]["dispatch_enum_status"] | null
        }
        Update: {
          approved_at?: string | null
          id?: number
          status?: Database["public"]["Enums"]["dispatch_enum_status"] | null
        }
        Relationships: []
      }
      execution_details: {
        Row: {
          id: number
          note: string | null
          shipping_packaging: string | null
          status: Database["public"]["Enums"]["execution_details_enum"]
          weight: number | null
        }
        Insert: {
          id?: number
          note?: string | null
          shipping_packaging?: string | null
          status?: Database["public"]["Enums"]["execution_details_enum"]
          weight?: number | null
        }
        Update: {
          id?: number
          note?: string | null
          shipping_packaging?: string | null
          status?: Database["public"]["Enums"]["execution_details_enum"]
          weight?: number | null
        }
        Relationships: []
      }
      order_offers: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          new_specs_id: number | null
          note: string | null
          order_id: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          new_specs_id?: number | null
          note?: string | null
          order_id?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          new_specs_id?: number | null
          note?: string | null
          order_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_offers_new_specs_id_fkey"
            columns: ["new_specs_id"]
            isOneToOne: false
            referencedRelation: "order_offers_specs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_offers_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_offers_specs: {
        Row: {
          id: number
          inner_diameter: string | null
          maximum_pallet_width: number | null
          maximum_shipping_weight: number | null
          minimum_shipping_weight: number | null
          outer_diameter: string | null
          pieces_per_package: number | null
          product_id: number | null
          shipping_packaging: string | null
          width: number | null
        }
        Insert: {
          id?: number
          inner_diameter?: string | null
          maximum_pallet_width?: number | null
          maximum_shipping_weight?: number | null
          minimum_shipping_weight?: number | null
          outer_diameter?: string | null
          pieces_per_package?: number | null
          product_id?: number | null
          shipping_packaging?: string | null
          width?: number | null
        }
        Update: {
          id?: number
          inner_diameter?: string | null
          maximum_pallet_width?: number | null
          maximum_shipping_weight?: number | null
          minimum_shipping_weight?: number | null
          outer_diameter?: string | null
          pieces_per_package?: number | null
          product_id?: number | null
          shipping_packaging?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_offers_specs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_id: string
          contra_offer: boolean
          created_at: string
          dispatch_validation_id: number | null
          execution_details_id: number | null
          id: number
          product_id: number
          programing_instructions_id: number | null
          reviewed: boolean
          reviewed_by: string | null
          shipping_info_id: number | null
          specs_id: number
          status: Database["public"]["Enums"]["order-status-enum"]
          worker_id: string
        }
        Insert: {
          client_id?: string
          contra_offer?: boolean
          created_at?: string
          dispatch_validation_id?: number | null
          execution_details_id?: number | null
          id?: number
          product_id: number
          programing_instructions_id?: number | null
          reviewed?: boolean
          reviewed_by?: string | null
          shipping_info_id?: number | null
          specs_id: number
          status?: Database["public"]["Enums"]["order-status-enum"]
          worker_id?: string
        }
        Update: {
          client_id?: string
          contra_offer?: boolean
          created_at?: string
          dispatch_validation_id?: number | null
          execution_details_id?: number | null
          id?: number
          product_id?: number
          programing_instructions_id?: number | null
          reviewed?: boolean
          reviewed_by?: string | null
          shipping_info_id?: number | null
          specs_id?: number
          status?: Database["public"]["Enums"]["order-status-enum"]
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_dispatch_validation_id_fkey"
            columns: ["dispatch_validation_id"]
            isOneToOne: false
            referencedRelation: "dispatch_validation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_execution_details_id_fkey"
            columns: ["execution_details_id"]
            isOneToOne: false
            referencedRelation: "execution_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_programing_instructions_id_fkey"
            columns: ["programing_instructions_id"]
            isOneToOne: false
            referencedRelation: "programing_instructions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_info_id_fkey"
            columns: ["shipping_info_id"]
            isOneToOne: false
            referencedRelation: "shipping_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_specs_id_fkey"
            columns: ["specs_id"]
            isOneToOne: false
            referencedRelation: "specs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          client_id: string
          id: number
          master: string
          pt: string
        }
        Insert: {
          client_id: string
          id?: number
          master: string
          pt: string
        }
        Update: {
          client_id?: string
          id?: number
          master?: string
          pt?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      programing_instructions: {
        Row: {
          assigned_date: string | null
          id: number
          note: string | null
          responsible: string | null
          status: Database["public"]["Enums"]["programing-status-enum"] | null
        }
        Insert: {
          assigned_date?: string | null
          id?: number
          note?: string | null
          responsible?: string | null
          status?: Database["public"]["Enums"]["programing-status-enum"] | null
        }
        Update: {
          assigned_date?: string | null
          id?: number
          note?: string | null
          responsible?: string | null
          status?: Database["public"]["Enums"]["programing-status-enum"] | null
        }
        Relationships: [
          {
            foreignKeyName: "programing_instructions_responsible_fkey"
            columns: ["responsible"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      shipping_info: {
        Row: {
          approved_at: string | null
          id: number
          plates: string | null
          scheduled_departure_date: string | null
          shipped_at: string | null
          status: Database["public"]["Enums"]["shipping_info_status"] | null
          tar: string | null
        }
        Insert: {
          approved_at?: string | null
          id?: number
          plates?: string | null
          scheduled_departure_date?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["shipping_info_status"] | null
          tar?: string | null
        }
        Update: {
          approved_at?: string | null
          id?: number
          plates?: string | null
          scheduled_departure_date?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["shipping_info_status"] | null
          tar?: string | null
        }
        Relationships: []
      }
      specs: {
        Row: {
          id: number
          inner_diameter: number | null
          maximum_pallet_width: number | null
          maximum_shipping_weight: number | null
          minimum_shipping_weight: number | null
          outer_diameter: number | null
          pieces_per_package: number | null
          product_id: number | null
          shipping_packaging: string | null
          width: number | null
        }
        Insert: {
          id?: number
          inner_diameter?: number | null
          maximum_pallet_width?: number | null
          maximum_shipping_weight?: number | null
          minimum_shipping_weight?: number | null
          outer_diameter?: number | null
          pieces_per_package?: number | null
          product_id?: number | null
          shipping_packaging?: string | null
          width?: number | null
        }
        Update: {
          id?: number
          inner_diameter?: number | null
          maximum_pallet_width?: number | null
          maximum_shipping_weight?: number | null
          minimum_shipping_weight?: number | null
          outer_diameter?: number | null
          pieces_per_package?: number | null
          product_id?: number | null
          shipping_packaging?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "specs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          role_id: number
          second_name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          role_id: number
          second_name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          role_id?: number
          second_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      dispatch_enum_status: "Aceptado" | "Pendiente" | "Rechazado"
      execution_details_enum: "Aceptado" | "Rechazado" | "Pendiente"
      "order-status-enum":
        | "Aceptado"
        | "Rechazado"
        | "Revision Cliente"
        | "Revision Operador"
      "programing-status-enum": "Asignado" | "Sin asignar" | "Reasignado"
      shipping_info_status: "Aceptado" | "Pendiente" | "Rechazado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      dispatch_enum_status: ["Aceptado", "Pendiente", "Rechazado"],
      execution_details_enum: ["Aceptado", "Rechazado", "Pendiente"],
      "order-status-enum": [
        "Aceptado",
        "Rechazado",
        "Revision Cliente",
        "Revision Operador",
      ],
      "programing-status-enum": ["Asignado", "Sin asignar", "Reasignado"],
      shipping_info_status: ["Aceptado", "Pendiente", "Rechazado"],
    },
  },
} as const
