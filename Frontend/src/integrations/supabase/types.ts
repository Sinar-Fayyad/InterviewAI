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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      certifications: {
        Row: {
          certification_name: string
          created_at: string
          date_obtained: string | null
          id: string
          organization_name: string | null
          user_id: string
        }
        Insert: {
          certification_name: string
          created_at?: string
          date_obtained?: string | null
          id?: string
          organization_name?: string | null
          user_id: string
        }
        Update: {
          certification_name?: string
          created_at?: string
          date_obtained?: string | null
          id?: string
          organization_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      educations: {
        Row: {
          created_at: string
          degree: string | null
          description: string | null
          end_date: string | null
          field_of_study: string | null
          id: string
          institution_name: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          degree?: string | null
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          institution_name: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          degree?: string | null
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          institution_name?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          company_name: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          position: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          position: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          position?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      interview_archives: {
        Row: {
          company: string | null
          created_at: string
          duration_seconds: number | null
          emotion_analysis: Json | null
          feedback: Json | null
          id: string
          job_title: string | null
          questions: Json | null
          recording_url: string | null
          score: number | null
          title: string
          transcript: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          duration_seconds?: number | null
          emotion_analysis?: Json | null
          feedback?: Json | null
          id?: string
          job_title?: string | null
          questions?: Json | null
          recording_url?: string | null
          score?: number | null
          title: string
          transcript?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          duration_seconds?: number | null
          emotion_analysis?: Json | null
          feedback?: Json | null
          id?: string
          job_title?: string | null
          questions?: Json | null
          recording_url?: string | null
          score?: number | null
          title?: string
          transcript?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applied_at: string | null
          company: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          description: string | null
          id: string
          job_title: string
          job_url: string | null
          location: string | null
          notes: string | null
          salary_range: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          company: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          job_title: string
          job_url?: string | null
          location?: string | null
          notes?: string | null
          salary_range?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          company?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          job_title?: string
          job_url?: string | null
          location?: string | null
          notes?: string | null
          salary_range?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          created_at: string
          id: string
          media: string | null
          scheduled_at: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          media?: string | null
          scheduled_at?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          media?: string | null
          scheduled_at?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          certifications: Json | null
          created_at: string
          education: Json | null
          email: string | null
          experience: Json | null
          first_name: string | null
          full_name: string | null
          google_connected: boolean | null
          id: string
          languages: string[] | null
          last_name: string | null
          linkedin_connected: boolean | null
          location: string | null
          onboarding_completed: boolean | null
          phone: string | null
          skills: string[] | null
          summary: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certifications?: Json | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          first_name?: string | null
          full_name?: string | null
          google_connected?: boolean | null
          id?: string
          languages?: string[] | null
          last_name?: string | null
          linkedin_connected?: boolean | null
          location?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          skills?: string[] | null
          summary?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certifications?: Json | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          first_name?: string | null
          full_name?: string | null
          google_connected?: boolean | null
          id?: string
          languages?: string[] | null
          last_name?: string | null
          linkedin_connected?: boolean | null
          location?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          skills?: string[] | null
          summary?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_history: {
        Row: {
          company: string | null
          created_at: string
          id: string
          job_description: string | null
          job_title: string | null
          questions: Json
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          job_description?: string | null
          job_title?: string | null
          questions?: Json
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          job_description?: string | null
          job_title?: string | null
          questions?: Json
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          question: string
          questions_list_id: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          question: string
          questions_list_id: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          question?: string
          questions_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_questions_list_id_fkey"
            columns: ["questions_list_id"]
            isOneToOne: false
            referencedRelation: "questions_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      questions_lists: {
        Row: {
          company_name: string | null
          created_at: string
          id: string
          job_title: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          id?: string
          job_title?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          id?: string
          job_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          category: Database["public"]["Enums"]["skill_category"] | null
          created_at: string
          id: string
          name: string
          proficiency_level: number | null
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["skill_category"] | null
          created_at?: string
          id?: string
          name: string
          proficiency_level?: number | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["skill_category"] | null
          created_at?: string
          id?: string
          name?: string
          proficiency_level?: number | null
          user_id?: string
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
      application_status:
        | "saved"
        | "applied"
        | "interviewing"
        | "offer"
        | "rejected"
        | "withdrawn"
      skill_category:
        | "technical"
        | "soft_skills"
        | "tools"
        | "languages"
        | "other"
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
      application_status: [
        "saved",
        "applied",
        "interviewing",
        "offer",
        "rejected",
        "withdrawn",
      ],
      skill_category: [
        "technical",
        "soft_skills",
        "tools",
        "languages",
        "other",
      ],
    },
  },
} as const
