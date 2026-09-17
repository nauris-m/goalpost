/**
 * Hand-written to match supabase/migrations/20260911152710_goalpost_schema.sql.
 * Regenerate with `npm run supabase:types` once a local/remote project is
 * reachable, to replace this with the real generated file.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProfileRole = 'manager' | 'member';
export type GoalTrackingType = 'numeric' | 'percent' | 'boolean' | 'milestone';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string | null;
          email: string;
          role: ProfileRole;
          name: string;
          title: string;
          contact_info: string;
          team_id: string | null;
          added_by: string | null;
          notifications_read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          email: string;
          role: ProfileRole;
          name: string;
          title?: string;
          contact_info?: string;
          team_id?: string | null;
          added_by?: string | null;
          notifications_read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string;
          manager_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          manager_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['teams']['Insert']>;
        Relationships: [];
      };
      periods: {
        Row: {
          id: string;
          team_id: string;
          name: string;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          name: string;
          start_date: string;
          end_date: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['periods']['Insert']>;
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          period_id: string;
          owner_id: string | null;
          title: string;
          description: string;
          tracking_type: GoalTrackingType;
          target_value: number;
          current_value: number;
          unit: string;
          weight: number;
          milestones: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          period_id: string;
          owner_id?: string | null;
          title: string;
          description?: string;
          tracking_type: GoalTrackingType;
          target_value?: number;
          current_value?: number;
          unit?: string;
          weight?: number;
          milestones?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['goals']['Insert']>;
        Relationships: [];
      };
      objectives: {
        Row: {
          id: string;
          period_id: string;
          owner_id: string | null;
          title: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          period_id: string;
          owner_id?: string | null;
          title: string;
          description?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['objectives']['Insert']>;
        Relationships: [];
      };
      key_results: {
        Row: {
          id: string;
          objective_id: string;
          title: string;
          tracking_type: GoalTrackingType;
          target_value: number;
          current_value: number;
          unit: string;
          weight: number;
          milestones: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          objective_id: string;
          title: string;
          tracking_type: GoalTrackingType;
          target_value?: number;
          current_value?: number;
          unit?: string;
          weight?: number;
          milestones?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['key_results']['Insert']>;
        Relationships: [];
      };
      activity_events: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_name: string;
          verb: string;
          summary: string;
          target_team_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_name: string;
          verb: string;
          summary: string;
          target_team_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['activity_events']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_profile_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      current_profile: {
        Args: Record<string, never>;
        Returns: Database['public']['Tables']['profiles']['Row'];
      };
      managed_team_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
      visible_activity_team_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
      claim_or_create_profile: {
        Args: { p_name: string; p_title: string };
        Returns: Database['public']['Tables']['profiles']['Row'];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
