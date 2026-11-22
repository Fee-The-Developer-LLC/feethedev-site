-- Shop Bundle was renamed Team Bundle (King Fee, 2026-11-22). Slugs only; prices unchanged.
update public.service_catalog set slug = 'team-bundle' where slug = 'shop-bundle';
update public.service_catalog set slug = 'team-bundle-extra-member' where slug = 'shop-bundle-extra-chair';
