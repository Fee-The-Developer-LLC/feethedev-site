/**
 * Hand-maintained database types.
 *
 * Mirrors `supabase/migrations/20261001190207_create_fee_developer_service_catalog_20261001.sql`.
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

/** Mirrors `supabase/migrations/20261103120000_create_client_portal.sql`. */
export type ClientRequestRow = {
  id: string;
  tenant_id: 'fee-the-developer';
  clerk_user_id: string;
  client_email: string | null;
  client_name: string | null;
  site_slug: string | null;
  kind: 'change' | 'suggestion' | 'website' | 'assets';
  priority: 'normal' | 'urgent';
  title: string;
  details: string | null;
  website_url: string | null;
  status: 'new' | 'in_review' | 'in_progress' | 'done' | 'declined';
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientFileRow = {
  id: string;
  request_id: string;
  clerk_user_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  status: 'pending' | 'uploaded';
  created_at: string;
  uploaded_at: string | null;
};

export type ClientSpaceRow = {
  clerk_user_id: string;
  tenant_id: 'fee-the-developer';
  client_email: string | null;
  share_folder_url: string | null;
  share_provider: 'dropbox' | 'google_drive' | 'onedrive' | 'other' | null;
  share_label: string | null;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      client_spaces: {
        Row: ClientSpaceRow;
        Insert: Pick<ClientSpaceRow, 'clerk_user_id'> & Partial<ClientSpaceRow>;
        Update: Partial<ClientSpaceRow>;
        Relationships: [];
      };
      client_requests: {
        Row: ClientRequestRow;
        Insert: Pick<ClientRequestRow, 'clerk_user_id' | 'kind' | 'title'> &
          Partial<Omit<ClientRequestRow, 'clerk_user_id' | 'kind' | 'title'>>;
        Update: Partial<ClientRequestRow>;
        Relationships: [];
      };
      client_files: {
        Row: ClientFileRow;
        Insert: Pick<
          ClientFileRow,
          | 'request_id'
          | 'clerk_user_id'
          | 'storage_path'
          | 'file_name'
          | 'mime_type'
          | 'size_bytes'
        > &
          Partial<ClientFileRow>;
        Update: Partial<ClientFileRow>;
        Relationships: [];
      };
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
