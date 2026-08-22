## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Design system

Tokens live in [src/styles/global.css](src/styles/global.css) under `@theme` (Tailwind v4):

- Colors: `navy` `#0A2342`, `teal` `#0FB8AD`, `coral` `#FF7A59`, `ivory` `#FAF9F6`, `slate` `#25313B`. Used as `bg-navy`, `text-teal`, `border-coral/10`, etc.
- Fonts: `font-serif` → DM Serif Display (all headings), `font-sans` → Inter (body, default).
- Page wrapper: `bg-ivory` on the outer `<div class="min-h-screen ...">`.

**Known issue — don't copy this pattern:** many pages use a `sky` color (`bg-sky/5`, `from-sky/10`, `text-sky`, etc.) that was never added to `@theme`. Those utilities currently generate no CSS at all. Until `--color-sky` is added to global.css (or these are swapped to `teal`/`ivory`), don't introduce new `sky` usages.

## Adding a new page

Copy the closest matching existing page as your starting point rather than writing from scratch — it's the most reliable way to inherit spacing, component structure, and color usage. Two established shapes:

1. **Hub/overview page** (e.g. `melanoma/index.astro`, `basal-cell-carcinoma/index.astro`, `actinic-keratosis.astro`): hero (gradient `from-navy to-slate`) → intro card → CTA box ("Need More Information?") → "Key Topics" card → Warning Signs → Risk Factors / Prevention (2-col grid) → Treatment Options → closing CTA.
2. **Deep-dive article** (e.g. `melanoma/melanoma-stage-meaning.astro`, `basal-cell-carcinoma/types.astro`): hero with a "← Back to [Hub]" link → Introduction → topic/step sections → "What to Ask Your Doctor" → Conclusion → disclaimer box → closing CTA. These also define an explicit `canonical` and `Article`/`BreadcrumbList`/`FAQPage` JSON-LD — see below.

### SEO checklist for every new page

- Exactly one `<h1>`; nest `<h2>`/`<h3>` logically (don't skip levels).
- `title`: unique across the site, ~50–60 characters, format `"Page Name | Beating Skin Cancer"`.
- `description`: unique across the site, 120–158 characters, describes *this* page's content — never reuse another page's description or a placeholder like an effective date.
- `canonical`: omit the prop for ordinary pages — `Layout.astro` auto-generates it from `Astro.site` + the live path. Only pass an explicit `canonical` const for cornerstone articles that also ship JSON-LD (pattern 2 above), and reuse that same string in the canonical tag, `mainEntityOfPage`, and the breadcrumb's last item.
- Any `<img>` needs a real `alt`. Decorative `astro-icon` icons don't need alt text but should get `aria-hidden="true"` if they're purely decorative next to visible text.
- Check `/questions-to-ask`'s table of contents if the new page should be cross-linked from the question library.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
