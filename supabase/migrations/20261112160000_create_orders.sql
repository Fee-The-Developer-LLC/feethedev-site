-- Orders of record for feethedeveloper.com purchases.
--
-- Written only by the Stripe webhook (/api/webhooks/stripe) with the Supabase
-- secret key, so a purchase is recorded even if the buyer closes the tab before
-- the confirmation page loads. Additive only; touches no existing table.
--
-- orders          one row per paid Checkout Session (on-site or Payment Link)
-- order_events    every Stripe event processed, for idempotency and audit
-- order_messages  every onboarding message the system sent, held or failed

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'fee-the-developer'
    check (tenant_id = 'fee-the-developer'),
  order_number text not null unique,
  checkout_session_id text not null unique,
  catalog_slug text not null,
  plan text not null check (plan in ('full', 'deposit')),
  mode text not null check (mode in ('payment', 'subscription')),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  customer_email text,
  customer_name text,
  customer_phone text,
  stripe_customer_id text,
  stripe_payment_intent_id text,
  stripe_subscription_id text,
  clerk_user_id text,
  source text not null,
  status text not null default 'paid'
    check (status in ('paid', 'in_progress', 'delivered', 'refunded', 'partially_refunded', 'canceled')),
  livemode boolean not null,
  paid_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_email_idx on public.orders (lower(customer_email));
create index if not exists orders_payment_intent_idx on public.orders (stripe_payment_intent_id);

create table if not exists public.order_events (
  stripe_event_id text primary key,
  type text not null,
  order_id uuid references public.orders (id) on delete set null,
  livemode boolean not null,
  received_at timestamptz not null default now()
);

create table if not exists public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  channel text not null check (channel in ('email', 'sms')),
  template text not null,
  recipient text,
  status text not null check (status in ('sent', 'held', 'failed', 'not_configured')),
  provider text,
  provider_message_id text,
  error text check (error is null or char_length(error) <= 500),
  created_at timestamptz not null default now(),
  -- One message per order, channel and template: webhook retries never double-send.
  unique (order_id, channel, template)
);

alter table public.orders enable row level security;
alter table public.order_events enable row level security;
alter table public.order_messages enable row level security;
revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_events from anon, authenticated;
revoke all on table public.order_messages from anon, authenticated;
