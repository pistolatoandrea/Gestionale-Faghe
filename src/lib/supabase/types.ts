// Tipi allineati manualmente a supabase/migrations/0001_init.sql.
// Quando il progetto Supabase è collegato, possono essere rigenerati con:
//   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts

export type ClienteTipo = "privato" | "azienda";
export type TicketStato = "nuovo" | "programmato_intervento" | "chiuso" | "perso";
export type TicketCanale = "telefono" | "email" | "altro";
export type InterventoStato = "da_fare" | "chiuso" | "da_tornare";
export type TaskStato = "aperto" | "in_pausa" | "chiuso";
export type TaskEntityType = "ticket" | "cliente" | "intervento";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          ruolo: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          ruolo?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          ruolo?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      clienti: {
        Row: {
          id: string;
          tipo: ClienteTipo;
          nome: string;
          telefono: string | null;
          email: string | null;
          indirizzo: string | null;
          citta: string | null;
          cap: string | null;
          piva_cf: string | null;
          note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tipo?: ClienteTipo;
          nome: string;
          telefono?: string | null;
          email?: string | null;
          indirizzo?: string | null;
          citta?: string | null;
          cap?: string | null;
          piva_cf?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clienti"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "clienti_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ticket: {
        Row: {
          id: string;
          numero: number;
          titolo: string;
          descrizione: string | null;
          cliente_id: string;
          stato: TicketStato;
          priorita: string | null;
          canale: TicketCanale;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero?: number;
          titolo: string;
          descrizione?: string | null;
          cliente_id: string;
          stato?: TicketStato;
          priorita?: string | null;
          canale?: TicketCanale;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ticket"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "ticket_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clienti";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ticket_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interventi: {
        Row: {
          id: string;
          ticket_id: string;
          nome: string;
          data_ora: string;
          luogo: string | null;
          stato: InterventoStato;
          assegnato_a: string | null;
          descrizione: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          nome: string;
          data_ora: string;
          luogo?: string | null;
          stato?: InterventoStato;
          assegnato_a?: string | null;
          descrizione?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["interventi"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "interventi_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "ticket";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interventi_assegnato_a_fkey";
            columns: ["assegnato_a"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interventi_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      eventi: {
        Row: {
          id: string;
          nome: string;
          data_ora: string;
          luogo: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          data_ora: string;
          luogo?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["eventi"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "eventi_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      task: {
        Row: {
          id: string;
          titolo: string;
          descrizione: string | null;
          stato: TaskStato;
          scadenza: string | null;
          assegnato_a: string | null;
          entity_type: TaskEntityType | null;
          entity_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titolo: string;
          descrizione?: string | null;
          stato?: TaskStato;
          scadenza?: string | null;
          assegnato_a?: string | null;
          entity_type?: TaskEntityType | null;
          entity_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["task"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "task_assegnato_a_fkey";
            columns: ["assegnato_a"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      cliente_tipo: ClienteTipo;
      ticket_stato: TicketStato;
      ticket_canale: TicketCanale;
      intervento_stato: InterventoStato;
      task_stato: TaskStato;
      task_entity_type: TaskEntityType;
    };
    CompositeTypes: Record<string, never>;
  };
}
