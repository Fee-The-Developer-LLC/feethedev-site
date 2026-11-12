# Product buy cuts and concierge

Seven product pages carry an 8-second buy cut and every product page carries
the concierge. Storyboards, prompts and Flow slot names live in
`lib/product-stories.ts`; concierge answers are built in `lib/concierge.ts`
from `lib/pricing-catalog.json`.

## Products with a buy cut

| Slot | Product slug            | Flow stills (0 credits)                   | Clip (24 credits) |
| ---- | ----------------------- | ----------------------------------------- | ----------------- |
| 01   | own-your-bookings       | FTD-K01 OYB start, E01 OYB end, L01 layer | FTD-Q01 OYB cut   |
| 02   | own-your-bookings-plus  | K02, E02, L02                             | FTD-Q02           |
| 03   | shop-bundle             | K03, E03 (layer: library map pin)         | FTD-Q03           |
| 04   | website-launch          | K04, E04 (layer: library browser window)  | FTD-Q04           |
| 05   | digital-presence-bundle | K05, E05 (layer: library map pin)         | FTD-Q05           |
| 06   | full-business-system    | K06, E06 (layer: library neural gears)    | FTD-Q06           |
| 07   | ai-plugin-all-platforms | K07, E07, L07                             | FTD-Q07           |

All approved takes sit in the Flow collection **FTD Buy Cuts** in the
"Fee The Developer" project.

## Dropping in the media

1. Download the slot's takes from Flow (`FTD-Q0n` as MP4, `FTD-E0n` and
   `FTD-L0n` as images).
2. Convert and save them in `public/media/products/<slug>/`:
   - `cut.mp4` — H.264, 720×1280, no audio track needed (the page plays muted),
     aim for under 3 MB: `ffmpeg -i in.mp4 -an -c:v libx264 -preset veryfast -crf 26 -movflags +faststart cut.mp4`
   - `end.webp` — the end frame, used as the poster and the reduced-motion still
   - `start.webp` — the start frame (ads and thumbnails)
   - `layer.webp` — the 1:1 3D layer; for slots without an L still, copy the
     library image named in the table
3. Set `media: true` on that story in `lib/product-stories.ts`.
4. `npm run build`, then check `/services/<slug>` on desktop and phone width.

Until step 3, the page shows the library 3D image in the phone frame, never an
empty player.

## Concierge rules

- Answers come only from the catalog: description, inclusions, price, deposit,
  required hosting, scope note, Starter Sites rules and the veteran discount.
- A typed question that matches no topic gets a handoff to `/start?service=<slug>`.
- No model, no network call, no stored conversation.

## Ads

The same clip is the ad. Burn in the hook (0–2 s), the proof line (2–6 s) and
the end card (6–8 s: product name, the button words from
`npm run campaign:brief -- <slug>`, the one URL, "AI-generated"). Every post,
DM batch and ad budget needs King Fee's approval.
