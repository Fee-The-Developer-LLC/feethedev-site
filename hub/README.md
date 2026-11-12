# realplayscorp.com hub router

King Fee's marketing hub. Every bio link, DM, group post and story points
here; the router tags the click, counts it, and sends it to the company that
sells that offer. Plan: "King Fee Marketing Hub: Plan" (Claude Docs).

It is its own Cloudflare Worker (`realplayscorp-hub`), separate from the
feethedeveloper.com Worker. It sets no cookies, loads nothing from outside,
and stores no personal data: one Analytics Engine data point per click (door,
company, tags, country).

## Doors

Edit `src/routes.mjs` (`DOORS`). Adding a door is one entry.

| Path                                                                  | Goes to                                                        |
| --------------------------------------------------------------------- | -------------------------------------------------------------- |
| `/` and `/start`                                                      | The start page: one button per door                            |
| `/websites`                                                           | feethedeveloper.com/services/own-your-bookings                 |
| `/switch`                                                             | feethedeveloper.com/switch (Own Your .com, switch from Vagaro) |
| `/booking`                                                            | honeybeeonlinesolutions.com/booking/ (Hive Booking)            |
| `/build`                                                              | feethedeveloper.com/services/business-site-essentials          |
| `/ai`                                                                 | feethedeveloper.com/pricing#ai                                 |
| `/hutchrok`                                                           | hutchrok.com                                                   |
| `/music`                                                              | feetheproducer.com                                             |
| `/shop`                                                               | runnergangls.com                                               |
| `/sites/beauty`, `realestate`, `transport`, `apparel`, `music`, `pro` | Each sector's flagship (beauty: FTD showroom until sign-off)   |

Anything else redirects to `/start`.

## Link tags

Short params, all optional (lowercase letters, numbers, `-`, `_`; anything
else is dropped):

| Param | Becomes        | Example                                    |
| ----- | -------------- | ------------------------------------------ |
| `src` | `utm_source`   | instagram, facebook (else from referrer)   |
| `m`   | `utm_medium`   | bio, story, reel, dm, group, partner, paid |
| `c`   | `utm_campaign` | defaults to the door's campaign            |
| `s`   | `utm_content`  | group slug, film cut or sender handle      |

Example DM link: `realplayscorp.com/websites?m=dm&c=beauty-film&s=fee_got_plays`

## Commands

From the repo root:

```bash
npm run hub:test     # node --test, no dependencies
npm run hub:deploy   # wrangler deploy from hub/
```

Deploy needs a Cloudflare token with Workers and DNS edit access for the
realplayscorp.com zone (`CLOUDFLARE_API_TOKEN` in the shell, never committed).

## Reading the counts

Cloudflare dashboard → Workers → realplayscorp-hub → Analytics Engine
dataset `realplayscorp_hub_clicks`, or SQL:

```sql
SELECT blob1 AS door, blob3 AS source, blob4 AS medium, blob6 AS content,
       SUM(_sample_interval) AS clicks
FROM realplayscorp_hub_clicks
WHERE timestamp > NOW() - INTERVAL '7' DAY
GROUP BY door, source, medium, content
ORDER BY clicks DESC
```
