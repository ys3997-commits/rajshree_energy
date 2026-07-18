export type CustomerCategory = "supplier" | "industry" | "trader";
export type OrderType = "regular" | "open";
export type OrderStatus =
  | "open"
  | "pending"
  | "partially_dispatched"
  | "completed";
export type ReceiptStatus = "pending" | "received";

export type Database = {
  public: {
    Tables: {
      staff: {
        Row: {
          id: string;
          name: string;
          role: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transporters: {
        Row: {
          id: string;
          name: string;
          owner_name: string | null;
          owner_contact_number_1: string | null;
          owner_contact_number_2: string | null;
          email: string | null;
          city: string | null;
          state: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_name?: string | null;
          owner_contact_number_1?: string | null;
          owner_contact_number_2?: string | null;
          email?: string | null;
          city?: string | null;
          state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_name?: string | null;
          owner_contact_number_1?: string | null;
          owner_contact_number_2?: string | null;
          email?: string | null;
          city?: string | null;
          state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          name: string;
          category: CustomerCategory;
          owner_name: string | null;
          owner_contact: string | null;
          purchaser_name: string | null;
          purchaser_contact: string | null;
          purchaser_role: string | null;
          payment_in_charge_name: string | null;
          payment_in_charge_contact: string | null;
          payment_in_charge_role: string | null;
          accountant_name: string | null;
          accountant_contact: string | null;
          email: string | null;
          city: string | null;
          state: string | null;
          credit_days: number | null;
          sector: string | null;
          deal_by: string | null;
          approach_for_funds: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: CustomerCategory;
          owner_name?: string | null;
          owner_contact?: string | null;
          purchaser_name?: string | null;
          purchaser_contact?: string | null;
          purchaser_role?: string | null;
          payment_in_charge_name?: string | null;
          payment_in_charge_contact?: string | null;
          payment_in_charge_role?: string | null;
          accountant_name?: string | null;
          accountant_contact?: string | null;
          email?: string | null;
          city?: string | null;
          state?: string | null;
          credit_days?: number | null;
          sector?: string | null;
          deal_by?: string | null;
          approach_for_funds?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: CustomerCategory;
          owner_name?: string | null;
          owner_contact?: string | null;
          purchaser_name?: string | null;
          purchaser_contact?: string | null;
          purchaser_role?: string | null;
          payment_in_charge_name?: string | null;
          payment_in_charge_contact?: string | null;
          payment_in_charge_role?: string | null;
          accountant_name?: string | null;
          accountant_contact?: string | null;
          email?: string | null;
          city?: string | null;
          state?: string | null;
          credit_days?: number | null;
          sector?: string | null;
          deal_by?: string | null;
          approach_for_funds?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_deal_by_fkey";
            columns: ["deal_by"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customers_approach_for_funds_fkey";
            columns: ["approach_for_funds"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
        ];
      };
      vessels: {
        Row: {
          id: string;
          vessel_name: string;
          importer_id: string;
          quality: string | null;
          quantity: number;
          dispatched_quantity: number;
          balance_quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vessel_name: string;
          importer_id: string;
          quality?: string | null;
          quantity: number;
          dispatched_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vessel_name?: string;
          importer_id?: string;
          quality?: string | null;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vessels_importer_id_fkey";
            columns: ["importer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          po_number: string;
          order_type: OrderType;
          customer_id: string;
          order_date: string | null;
          port_id: string | null;
          credit_days: number | null;
          quality: string | null;
          rate: number | null;
          final_rate: number | null;
          quantity: number;
          gst: number | null;
          order_by: string | null;
          dispatched_order: number;
          balance_order: number;
          order_status: OrderStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          po_number: string;
          order_type?: OrderType;
          customer_id: string;
          order_date?: string | null;
          port_id?: string | null;
          credit_days?: number | null;
          quality?: string | null;
          rate?: number | null;
          final_rate?: number | null;
          quantity: number;
          order_by?: string | null;
          dispatched_order?: number;
          order_status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          po_number?: string;
          order_type?: OrderType;
          customer_id?: string;
          order_date?: string | null;
          port_id?: string | null;
          credit_days?: number | null;
          quality?: string | null;
          rate?: number | null;
          final_rate?: number | null;
          quantity?: number;
          order_by?: string | null;
          order_status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_order_by_fkey";
            columns: ["order_by"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
        ];
      };
      dispatches: {
        Row: {
          id: string;
          po_number: string;
          vessel_id: string;
          dispatch_date: string;
          dispatched_quantity: number;
          lorry_number: string | null;
          transporter_id: string | null;
          importer_id: string | null;
          receiving_quantity: number | null;
          receipt_date: string | null;
          receipt_status: ReceiptStatus;
          diff_in_quantity: number | null;
          soft_copy_status: boolean;
          entry_in_tally: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          po_number: string;
          vessel_id: string;
          dispatch_date: string;
          dispatched_quantity: number;
          lorry_number?: string | null;
          transporter_id?: string | null;
          importer_id?: string | null;
          receiving_quantity?: number | null;
          receipt_date?: string | null;
          receipt_status?: ReceiptStatus;
          soft_copy_status?: boolean;
          entry_in_tally?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          po_number?: string;
          vessel_id?: string;
          dispatch_date?: string;
          dispatched_quantity?: number;
          lorry_number?: string | null;
          transporter_id?: string | null;
          importer_id?: string | null;
          receiving_quantity?: number | null;
          receipt_date?: string | null;
          receipt_status?: ReceiptStatus;
          soft_copy_status?: boolean;
          entry_in_tally?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dispatches_po_number_fkey";
            columns: ["po_number"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["po_number"];
          },
          {
            foreignKeyName: "dispatches_vessel_id_fkey";
            columns: ["vessel_id"];
            isOneToOne: false;
            referencedRelation: "vessels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dispatches_transporter_id_fkey";
            columns: ["transporter_id"];
            isOneToOne: false;
            referencedRelation: "transporters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dispatches_importer_id_fkey";
            columns: ["importer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      next_open_po_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      customer_category: CustomerCategory;
      order_type: OrderType;
      order_status: OrderStatus;
      receipt_status: ReceiptStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
