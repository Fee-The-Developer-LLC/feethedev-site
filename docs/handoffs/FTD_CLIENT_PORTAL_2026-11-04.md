# Client portal upgrade (2026-11-04)

`/dashboard` is now a working client portal instead of a placeholder.

## How a client gets access

1. The studio attaches the client by email in `/dashboard/admin` → **Attach a client** (plan: Premium or Standard).
2. The client signs up at `/sign-up` with that same email. Clerk verifies it.
3. On their next visit to `/dashboard`, the verified email matches `portal_clients.email`. Their workspace loads automatically. Only verified Clerk emails count.

## What the client sees

- The project stage track (Discovery → Design → Build → Review → Live → Ongoing care), the next milestone and target date, and a link to their live site.
- Studio updates as a timeline.
- **Request a change**: title, details, page link, priority, and up to 5 attachments. Only Premium clients can choose Urgent. A double submit stores one request (`submission_id`).
- **Upload files**: up to 25 MB per upload into a private bucket. Downloads use signed URLs that expire after 30 minutes.
- Change-request history, with status and studio notes.
- Premium support panel: booking, email, and phone.

## What the studio does (`/dashboard/admin`)

Access needs a verified Clerk email in `PORTAL_ADMIN_EMAILS` (comma-separated). It defaults to `ceo@feethedeveloper.com`. Anyone else gets a 404.

From this page the studio can:

- Attach clients.
- Open projects.
- Set the stage, site link, and next milestone.
- Post updates.
- Share files.
- Move change requests through their statuses and leave notes for the client.

## Data

`supabase/migrations/20261104120000_create_client_portal.sql` creates:

- `portal_clients`, `portal_projects`, `portal_updates`, `portal_change_requests`, `portal_files`
- the private `client-uploads` storage bucket

RLS is on and anon/authenticated access is revoked. All reads and writes go through server code using `SUPABASE_SECRET_KEY`, after the Clerk session is checked.

## Activation

1. Apply the migration to Supabase project `gbsqtusozqvfxaojfflt`.
2. Confirm `SUPABASE_SECRET_KEY` and `CLERK_SECRET_KEY` are set as Worker secrets.
3. Deploy (`npm run deploy`).
4. Attach the client in `/dashboard/admin` and open their project.

## Not included yet

- No email notifications on new requests or updates.
- No client-side delete for files.
