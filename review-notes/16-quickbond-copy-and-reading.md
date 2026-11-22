# Quickbond copy and reading time

Requested by Damian on 22 November 2026:

- Use "extreem hoge aanvangskleefkracht" in the homepage scene, product guide and article.
- Remove the article sentence referring to drying times of other products called Quickbond.
- Explain the owner-supplied stone-strip benefit under its own heading: no mortar preparation or processing, less mess, faster and cleaner application.
- Allow time to read the third 3D story step before the pinned scene leaves.

The desktop scene now has 1.2 viewport heights of scrolling travel (120svh).
The actual scene height remains in normal flow.
Story progress follows its real sticky interval instead of the entire section.
The final step occupies the last third of that interval. Mobile retains ordinary
document flow, and reduced motion does not receive the extra scrolling space.

Validation:

- Build: 17 pages and 103 reviewed original image URLs.
- All 80 existing Node tests passed.
- All 311 browser checks passed, including mobile and tablet routes, the active
  3D canvas, contact behavior, and the new final-step check at 1440px.
- At 1440x900 the third step remained pinned for another 378px of tested scrolling
  before the scene released (1080px total sticky travel).
- Product text inspected at desktop width and at 390px; no horizontal overflow.
- Evidence: `evidence/quickbond-reading-2026-11-22.json`.

This change does not modify the mail adapter, credentials, product photographs,
legal terms, or site publication policy. The product claims come from the
owner's supplied correction, as recorded in `seo/content-sources.md`.
