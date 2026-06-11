export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppointmentStatus = "Pending" | "Confirmed" | "Done" | "Reschedule" | "No Show" | "Cancelled";

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          public_token: string;
          client_name: string;
          phone_number: string;
          area: string;
          appointment_date: string;
          appointment_time: string;
          setter_id: string;
          setter_name: string;
          status: AppointmentStatus;
          remarks: string | null;
          checked_by: string | null;
          checked_at: string | null;
          telegram_chat_id: string | null;
          telegram_message_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          public_token?: string;
          client_name: string;
          phone_number: string;
          area: string;
          appointment_date: string;
          appointment_time: string;
          setter_id: string;
          setter_name: string;
          status?: AppointmentStatus;
          remarks?: string | null;
          checked_by?: string | null;
          checked_at?: string | null;
          telegram_chat_id?: string | null;
          telegram_message_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          appointment_id: string;
          checked_by: string;
          old_status: AppointmentStatus;
          new_status: AppointmentStatus;
          remark: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          checked_by: string;
          old_status: AppointmentStatus;
          new_status: AppointmentStatus;
          remark?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_logs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "activity_logs_appointment_id_fkey";
            columns: ["appointment_id"];
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          }
        ];
      };
      checkers: {
        Row: {
          id: string;
          name: string;
          active: boolean;
          telegram_user_id: number | null;
          telegram_username: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          active?: boolean;
          telegram_user_id?: number | null;
          telegram_username?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["checkers"]["Insert"]>;
        Relationships: [];
      };
      app_settings: {
        Row: {
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["app_settings"]["Insert"]>;
        Relationships: [];
      };
      areas: {
        Row: {
          id: string;
          name: string;
          active: boolean;
          display_order: number;
          header_label: string | null;
          default_appointment_time: string | null;
          time_slot_label: string | null;
          schedule_note: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          active?: boolean;
          display_order?: number;
          header_label?: string | null;
          default_appointment_time?: string | null;
          time_slot_label?: string | null;
          schedule_note?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["areas"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_checker_name_by_telegram_user_id: {
        Args: { user_id: number };
        Returns: string | null;
      };
      get_app_setting: {
        Args: { setting_key: string };
        Returns: string | null;
      };
      set_app_setting: {
        Args: { setting_key: string; setting_value: string };
        Returns: undefined;
      };
      list_checker_appointments: {
        Args: Record<PropertyKey, never>;
        Returns: Array<{
          id: string;
          client_name: string;
          phone_number: string;
          area: string;
          appointment_date: string;
          appointment_time: string;
          status: AppointmentStatus;
          remarks: string | null;
          checked_by: string | null;
          checked_at: string | null;
        }>;
      };
      get_checker_appointment: {
        Args: { token: string };
        Returns: Array<{
          id: string;
          public_token: string;
          client_name: string;
          phone_number: string;
          area: string;
          appointment_date: string;
          appointment_time: string;
          status: AppointmentStatus;
          remarks: string | null;
          checked_by: string | null;
          checked_at: string | null;
        }>;
      };
      update_checker_appointment: {
        Args: {
          token: string;
          checker_name: string;
          new_status: AppointmentStatus;
          new_remark: string;
        };
        Returns: Array<{
          id: string;
          client_name: string;
          phone_number: string;
          area: string;
          appointment_date: string;
          appointment_time: string;
          old_status: AppointmentStatus;
          status: AppointmentStatus;
          remarks: string | null;
          checked_by: string;
          checked_at: string;
          updated_at: string;
        }>;
      };
      update_checker_appointment_by_id: {
        Args: {
          appointment_uuid: string;
          checker_name: string;
          new_status: AppointmentStatus;
          new_remark: string;
        };
        Returns: Array<{
          id: string;
          client_name: string;
          phone_number: string;
          area: string;
          appointment_date: string;
          appointment_time: string;
          old_status: AppointmentStatus;
          status: AppointmentStatus;
          remarks: string | null;
          checked_by: string;
          checked_at: string;
          updated_at: string;
        }>;
      };
    };
    Enums: {
      appointment_status: AppointmentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
export type Checker = Database["public"]["Tables"]["checkers"]["Row"];
export type Area = Database["public"]["Tables"]["areas"]["Row"];
