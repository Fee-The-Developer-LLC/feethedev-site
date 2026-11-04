/**
 * Hand-maintained database types.
 *
 * Mirrors `supabase/migrations/20261001190207_create_fee_developer_service_catalog_20261001.sql`
 * and `supabase/migrations/20261104120000_create_client_portal.sql`.
 * Regenerate with `supabase gen types typescript` once the CLI is linked.
 */

export type ServiceCatalogRow = {
  id: string;
  slug: string;
  name: string;
  category: 'package' | 'service';
  amount_cents: number;
  currency: 'usd';
  billing_interval: 'one_time' | 'month';
  price_qualifier: string;
  scope_note: string;
  sort_order: number;
  source_ref: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

// Client portal — mirrors supabase/migrations/20261104120000_create_client_portal.sql.

export type PortalTier = 'standard' | 'premium';
export type PortalProjectStatus =
  | 'discovery'
  | 'design'
  | 'build'
  | 'review'
  | 'live'
  | 'care';
export type PortalUpdateKind = 'update' | 'milestone' | 'launch' | 'note';
export type PortalPriority = 'low' | 'normal' | 'high' | 'urgent';
export type PortalRequestStatus =
  | 'submitted'
  | 'in_review'
  | 'scheduled'
  | 'in_progress'
  | 'done'
  | 'declined';

export type PortalClientRow = {
  id: string;
  tenant_id: 'fee-the-developer';
  email: string;
  display_name: string;
  company: string | null;
  tier: PortalTier;
  clerk_user_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type PortalProjectRow = {
  id: string;
  client_id: string;
  name: string;
  site_url: string | null;
  status: PortalProjectStatus;
  summary: string | null;
  next_milestone: string | null;
  next_milestone_due: string | null;
  created_at: string;
  updated_at: string;
};

export type PortalUpdateRow = {
  id: string;
  project_id: string;
  kind: PortalUpdateKind;
  title: string;
  body: string;
  created_at: string;
};

export type PortalChangeRequestRow = {
  id: string;
  submission_id: string;
  project_id: string;
  client_id: string;
  title: string;
  details: string;
  page_url: string | null;
  priority: PortalPriority;
  status: PortalRequestStatus;
  studio_note: string | null;
  created_by_clerk_user_id: string;
  created_at: string;
  updated_at: string;
};

export type PortalFileRow = {
  id: string;
  project_id: string;
  client_id: string;
  change_request_id: string | null;
  storage_path: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  note: string | null;
  uploaded_by: 'client' | 'studio';
  created_at: string;
};

type ServerManaged = 'id' | 'created_at' | 'updated_at';
type PortalTable<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Pick<Row, Required> & Partial<Omit<Row, Required>>;
  Update: Partial<Omit<Row, 'id'>>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      portal_clients: PortalTable<
        PortalClientRow,
        Exclude<
          keyof PortalClientRow,
          | ServerManaged
          | 'tenant_id'
          | 'tier'
          | 'active'
          | 'clerk_user_id'
          | 'company'
        >
      >;
      portal_projects: PortalTable<PortalProjectRow, 'client_id' | 'name'>;
      portal_updates: PortalTable<
        PortalUpdateRow,
        'project_id' | 'title' | 'body'
      >;
      portal_change_requests: PortalTable<
        PortalChangeRequestRow,
        | 'submission_id'
        | 'project_id'
        | 'client_id'
        | 'title'
        | 'details'
        | 'created_by_clerk_user_id'
      >;
      portal_files: PortalTable<
        PortalFileRow,
        | 'project_id'
        | 'client_id'
        | 'storage_path'
        | 'file_name'
        | 'content_type'
        | 'size_bytes'
        | 'uploaded_by'
      >;
      service_catalog: {
        Row: ServiceCatalogRow;
        Insert: Omit<
          ServiceCatalogRow,
          'id' | 'created_at' | 'updated_at' | 'currency' | 'price_qualifier'
        > &
          Partial<
            Pick<
              ServiceCatalogRow,
              'id' | 'currency' | 'price_qualifier' | 'active'
            >
          >;
        Update: Partial<ServiceCatalogRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
