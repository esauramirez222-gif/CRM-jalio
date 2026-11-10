// Tipos de la BD. Escritos a mano a partir de supabase/migrations;
// regenerar con: npx supabase gen types typescript --linked > lib/tipos.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      estados: {
        Row: { id: string; nombre: string; orden: number; color: string; created_at: string }
        Insert: { id?: string; nombre: string; orden: number; color?: string; created_at?: string }
        Update: { id?: string; nombre?: string; orden?: number; color?: string; created_at?: string }
        Relationships: []
      }
      clientes: {
        Row: {
          id: string
          nombre: string
          empresa: string | null
          celular: string | null
          correo: string | null
          giro: string | null
          estado_id: string
          medio_contacto: string | null
          contactado_por: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          empresa?: string | null
          celular?: string | null
          correo?: string | null
          giro?: string | null
          estado_id: string
          medio_contacto?: string | null
          contactado_por?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          empresa?: string | null
          celular?: string | null
          correo?: string | null
          giro?: string | null
          estado_id?: string
          medio_contacto?: string | null
          contactado_por?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'clientes_estado_id_fkey'
            columns: ['estado_id']
            isOneToOne: false
            referencedRelation: 'estados'
            referencedColumns: ['id']
          },
        ]
      }
      perfiles: {
        Row: { id: string; nombre: string }
        Insert: { id: string; nombre: string }
        Update: { id?: string; nombre?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      ping: { Args: Record<PropertyKey, never>; Returns: number }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
