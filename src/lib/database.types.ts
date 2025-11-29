export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agent_configurations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          model: Database["public"]["Enums"]["llm_model"]
          name: string
          rubric: string
        }
        Insert: {
          created_at?: string
          id: string
          is_active: boolean
          model: Database["public"]["Enums"]["llm_model"]
          name: string
          rubric: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          model?: Database["public"]["Enums"]["llm_model"]
          name?: string
          rubric?: string
        }
        Relationships: []
      }
      answers: {
        Row: {
          answer_data: Json
          created_at: string | null
          surrogate_question_id: string | null
          surrogate_submission_id: string | null
        }
        Insert: {
          answer_data: Json
          created_at?: string | null
          surrogate_question_id?: string | null
          surrogate_submission_id?: string | null
        }
        Update: {
          answer_data?: Json
          created_at?: string | null
          surrogate_question_id?: string | null
          surrogate_submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_surrogate_question_id_fkey"
            columns: ["surrogate_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["surrogate_question_id"]
          },
          {
            foreignKeyName: "answers_surrogate_submission_id_fkey"
            columns: ["surrogate_submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["surrogate_submission_id"]
          },
        ]
      }
      question_judges: {
        Row: {
          created_at: string
          judge_id: string | null
          status: Database["public"]["Enums"]["judging_status"] | null
          surrogate_question_id: string
        }
        Insert: {
          created_at?: string
          judge_id?: string | null
          status?: Database["public"]["Enums"]["judging_status"] | null
          surrogate_question_id: string
        }
        Update: {
          created_at?: string
          judge_id?: string | null
          status?: Database["public"]["Enums"]["judging_status"] | null
          surrogate_question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_judges_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "agent_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_judges_surrogate_question_id_fkey"
            columns: ["surrogate_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["surrogate_question_id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          question_data: Json
          surrogate_question_id: string
        }
        Insert: {
          created_at?: string
          question_data: Json
          surrogate_question_id: string
        }
        Update: {
          created_at?: string
          question_data?: Json
          surrogate_question_id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string
          id: string
          queue_id: string
          surrogate_submission_id: string | null
        }
        Insert: {
          created_at?: string
          id: string
          queue_id: string
          surrogate_submission_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          queue_id?: string
          surrogate_submission_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_question_judges_by_queue: {
        Args: { queue_id_input: string }
        Returns: {
          created_at: string
          id: number
          judge_id: string
          name: string
          question_id: string
          status: Database["public"]["Enums"]["judging_status"]
          submission_id: string
        }[]
      }
      get_questions_with_judges_by_queue: {
        Args: { queue_id_input: string }
        Returns: {
          judges: Json
          question_data: Json
          question_id: string
          submission_id: string
        }[]
      }
    }
    Enums: {
      judge_evaluation: "PASS" | "FAIL" | "INCONCLUSIVE"
      judging_status: "RUNNING" | "QUEUED" | "FAILED" | "CANCELED" | "COMPLETE"
      llm_model: "gpt-4o-mini" | "gpt-4o" | "gpt-4.1" | "gpt-4.1-mini"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      judge_evaluation: ["PASS", "FAIL", "INCONCLUSIVE"],
      judging_status: ["RUNNING", "QUEUED", "FAILED", "CANCELED", "COMPLETE"],
      llm_model: ["gpt-4o-mini", "gpt-4o", "gpt-4.1", "gpt-4.1-mini"],
    },
  },
} as const

