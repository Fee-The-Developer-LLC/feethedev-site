# Brand asset originals

Full-quality originals of the Fee The Developer digital asset library, kept for
editing and upgrades. Nothing in this folder is deployed.

- `ftd-library-originals/<category>/<id>.<ext>` matches the `id` and
  `category` of each entry in `lib/asset-library.json`.
- The site serves web copies from `public/library/` (images as WebP at
  quality 85, original size; `hero-globe-web.mp4` is a muted, re-encoded copy
  of `globe-rotating-with-streaming-co-cb0452b8.mp4`).
- People in `people/` are AI-generated personas. Never present them as real
  clients, staff, or testimonials.

To upgrade an asset: replace the original here, regenerate its web copy in
`public/library/` with the same id, and keep the manifest entry in step.
