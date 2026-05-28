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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      raw_content: {
        Row: {
          core_hooks: Json | null
          created_at: string
          date_extracted: string
          duration: string | null
          id: string
          new_thumbnail_outline: string | null
          original_summary: string | null
          original_title: string | null
          proposed_title: string | null
          published_date: string | null
          source_id: string | null
          status: string
          summary_points: string[] | null
          target_audience: string | null
          thumbnail_url: string | null
          updated_at: string
          video_outline: Json | null
          video_url: string
          views: number | null
        }
        Insert: {
          core_hooks?: Json | null
          created_at?: string
          date_extracted?: string
          duration?: string | null
          id?: string
          new_thumbnail_outline?: string | null
          original_summary?: string | null
          original_title?: string | null
          proposed_title?: string | null
          published_date?: string | null
          source_id?: string | null
          status?: string
          summary_points?: string[] | null
          target_audience?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          video_outline?: Json | null
          video_url: string
          views?: number | null
        }
        Update: {
          core_hooks?: Json | null
          created_at?: string
          date_extracted?: string
          duration?: string | null
          id?: string
          new_thumbnail_outline?: string | null
          original_summary?: string | null
          original_title?: string | null
          proposed_title?: string | null
          published_date?: string | null
          source_id?: string | null
          status?: string
          summary_points?: string[] | null
          target_audience?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          video_outline?: Json | null
          video_url?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_content_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources_master"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          content: string
          created_at: string
          id: string
          idea_id: string | null
          model: string | null
          title: string
          updated_at: string
          video_type: string | null
          word_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          idea_id?: string | null
          model?: string | null
          title: string
          updated_at?: string
          video_type?: string | null
          word_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          idea_id?: string | null
          model?: string | null
          title?: string
          updated_at?: string
          video_type?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "raw_content"
            referencedColumns: ["id"]
          },
        ]
      }
      sources_master: {
        Row: {
          channel_name: string
          created_at: string
          id: string
          source_url: string
          type: string
          updated_at: string
        }
        Insert: {
          channel_name: string
          created_at?: string
          id?: string
          source_url: string
          type?: string
          updated_at?: string
        }
        Update: {
          channel_name?: string
          created_at?: string
          id?: string
          source_url?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
