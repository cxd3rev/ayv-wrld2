# AYV WRLD DISCOVERY REPORT

This is a discovery-only report based on the repository contents inspected on 2026-09-25. No Project Page implementation or redesign was performed.

Evidence note: the initial working tree already contained unrelated modified, deleted, and untracked files, including `app/projects/[slug]/page.tsx`, `config/brands.ts`, `config/public-site.ts`, configured `mark-transparent-v3.webp` assets, and `.tmp-screens/`. Findings below describe the actual files present at discovery time; they do not claim those pre-existing changes are committed. Temporary screenshots/scripts under `.tmp-screens/` were not treated as product assets.

## 1. Current Architecture

### Framework

- Next.js App Router, Next.js `16.3.5`, React `19.2.8`, and React DOM `19.2.8` are declared in `package.json` lines 17-21 and repeated in `package-lock.json` lines 16-19.
- Routing is filesystem-based under `app/`. The bundled Next.js 16 documentation confirms that folders form URL segments, `page.tsx` exposes a route, `[slug]` is a dynamic segment, and pages/layouts are Server Components by default: `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`, `03-layouts-and-pages.md`, and `05-server-and-client-components.md`.
- The root layout is `app/layout.tsx`. It installs fonts, global metadata, `NextIntlClientProvider`, `ToastProvider`, and Vercel Analytics.
- `proxy.ts` is the Next.js 16 request proxy. It calls `updateSession()` for every route except Next static/image output, the favicon, and common image extensions. The bundled Next.js 16 proxy guide confirms that Middleware is named Proxy in this version.
- `next.config.ts` applies the next-intl plugin and permanently redirects legacy `/products/:slug` URLs to `/automation/:slug`.

### Language

- TypeScript is used throughout application code. `tsconfig.json` enables `strict`, `noEmit`, `isolatedModules`, `moduleResolution: "bundler"`, the Next TypeScript plugin, DOM/ESNext libraries, and the `@/*` root alias.
- The configured compilation target is ES2017 (`tsconfig.json` line 3).
- React Server Components are the default. Project pages contain no `"use client"` directive. Client boundaries are introduced by imported client components such as `MarketingHeader`, `MarketingFooter`, and `LanguageSwitcher`.

### Styling

- Tailwind CSS 4 is declared in `package.json`; `postcss.config.mjs` loads `@tailwindcss/postcss`.
- `app/globals.css` imports Tailwind and defines the shared token system. The root tokens are a light dashboard theme; `.atmosphere` overrides them to the dark public-site theme (`app/globals.css` lines 1-88).
- Repeated public styles include `.display`, `.kicker`, `.technical-grid`, `.button-primary`, `.button-secondary`, `.skip-link`, `.noise-overlay`, `.hero-frame`, and responsive/reduced-motion rules.
- Utility-class merging uses `clsx` and `tailwind-merge` through `cn()` in `lib/utils.ts`.
- Fonts are loaded with `next/font/google`: Instrument Sans, Instrument Serif, and JetBrains Mono in `app/layout.tsx`.

### Routing

- Public marketing hierarchy:
  - `/` → `app/page.tsx`
  - `/projects` → `app/projects/page.tsx`
  - `/projects/[slug]` → `app/projects/[slug]/page.tsx`
  - `/one-man-army` → `app/one-man-army/page.tsx`
  - `/automation` → `app/automation/page.tsx`
  - `/automation/stack` → `app/automation/stack/page.tsx`
  - `/automation/[slug]` → `app/automation/[slug]/page.tsx`
  - `/about` → `app/about/page.tsx`
- Authenticated application routes live under `/dashboard` and are wrapped by `app/dashboard/layout.tsx`, which is explicitly `force-dynamic`, requires a workspace, reads the active-product cookie, and renders `DashboardShell`.
- `app/sitemap.ts` enumerates the public root, projects, ecosystem paths, all automation product marketing routes, and `/about` from centralized configs.

### Animation

- No Framer Motion, GSAP, React Spring, D3, React Flow/XYFlow, Cytoscape, Three.js, or dedicated graph/diagram package is declared or imported.
- Existing motion is CSS-only:
  - card/button hover transforms and icon translations in `components/marketing/public-site.tsx` and `app/globals.css`;
  - `rise-in`, `marquee`, and `burst-spin` keyframes in `app/globals.css`;
  - transition utilities in navigation and cards.
- `@media (prefers-reduced-motion: reduce)` disables the named animations and reduces all transition/animation durations (`app/globals.css` lines 403-419).

### Relevant dependencies

- `next-intl` `^4.14.5`: locale-aware server/client copy.
- `lucide-react` `^1.46.0`: icons.
- `@vercel/analytics` `^2.0.1`: root analytics.
- `clsx` `^2.1.1` and `tailwind-merge` `^3.7.0`: class composition.
- Supabase, Stripe, Resend, and Zod are present for the authenticated platform, billing, email, and validation; Project pages do not import them directly.
- No dependency currently supplies a node graph, edge routing, canvas map, collision engine, or advanced animation timeline.

### Component architecture

- `components/marketing/public-site.tsx` is the main public composition layer: `PublicShell`, `Breadcrumbs`, `SectionHeading`, `AutomationProductCard`, `ProjectCard`, `CTASection`, and `PageHero`.
- `components/marketing/header.tsx` supplies the responsive client-side public header/footer.
- `components/atmosphere.tsx` scopes the public dark theme and horizontal clipping.
- `components/product-icon.tsx` centralizes parent/product image rendering.
- `components/ui/` contains general-purpose dashboard-oriented primitives.
- `config/products.ts` is the six-product catalog and source for status, routes, prices, categories, accents, descriptions, and assets.
- `config/public-site.ts` is the source for independent projects, ecosystem classifications, translated public copy, metadata copy, and project descriptions.
- `config/brands.ts` maps configured parent, ecosystem, project, and generated product asset paths.

## 2. Current Project Page

“Project Page” currently consists of an index route and config-driven detail routes. They are separate from automation product detail pages.

### Projects index: `/projects`

- File: `app/projects/page.tsx`.
- Component/rendering mode: async Server Component. It reads the locale from next-intl on the server and renders request-locale copy. No route-level dynamic/static export is declared.
- Data: the `projects` array and `getProjectDescription()` in `config/public-site.ts`.
- Imported/rendered components:
  - `PublicShell`
  - `PageHero`
  - `ProjectCard`
  - `CTASection`
- Metadata: `generateMetadata()` supplies localized title/description, canonical `/projects`, and matching Open Graph title/description/URL.
- Structure:
  1. shared public shell, skip link, sticky marketing header;
  2. hero with `c.projects.eyebrow`, title, and body;
  3. responsive project-card grid;
  4. closing CTA linking to One Man Army Stack and AYV Automation;
  5. shared footer.
- Cards: each project card displays “AYV WRLD / Project,” localized “In development,” a configured logo, name, localized description, and a link to `project.route`.
- Interaction: link navigation, card hover lift/border transition, shared desktop automation `<details>` menu, mobile menu state/Escape handling, and locale selector. There is no project filtering, search, modal, selectable node, drag, pan, zoom, tooltip, or information side panel.
- Responsive behavior:
  - shell widths cap at `1400px`;
  - section padding changes at `lg`;
  - cards are one column by default and `lg:grid-cols-2`;
  - card image `sizes` uses viewport-aware sizing;
  - header changes from desktop links/dropdown to a full-height mobile navigation at `lg`.
- Animation: project cards use `transition duration-300`, `hover:-translate-y-1`, and hover border changes. The index has no entrance-animation class.

### Project details: `/projects/[slug]`

- File: `app/projects/[slug]/page.tsx`.
- Confirmed generated slugs: `kleuro` and `rated`, from `projects.map()` in `generateStaticParams()` (lines 9-11).
- Component/rendering mode: async Server Component with config-generated finite params. It reads request locale through next-intl; no `dynamic` or `revalidate` export is set.
- Unknown slug behavior: `getProject()` returns no match and `notFound()` is called.
- Metadata: per-project title, localized description, canonical route, Open Graph route, and configured 512×512 image metadata.
- Structured data: inline JSON-LD `CreativeWork` with project name, localized description, AYV WRLD as creator, absolute route, and absolute logo URL.
- Structure:
  1. `PublicShell`;
  2. JSON-LD script;
  3. bordered technical-grid hero;
  4. breadcrumbs: AYV WRLD → Projects → current project;
  5. “Independent project” kicker, oversized project name, logo panel, and “In development” status;
  6. two-column description/detail section;
  7. CTA back to `/projects`;
  8. shared footer.
- Interaction: breadcrumb links and CTA link only, plus shared shell navigation/language interactions. No detail-page client state.
- Responsive behavior:
  - hero changes from a vertical flow to `lg:flex-row` with bottom alignment;
  - project logo panel grows from `h-36 w-64` to `sm:h-44 sm:w-80`;
  - description section changes to two columns at `lg`;
  - title uses `clamp(4rem,12vw,9rem)`.
- Visual behavior: `.technical-grid` is a CSS-generated masked grid; logos use `next/image`, `object-contain`, eager loading, and explicit responsive `sizes`.

### Project data model

`config/public-site.ts` defines exactly two entries:

- Kleuro: slug `kleuro`, `productType: "project"`, category `Visualization`, status `In development`, route `/projects/kleuro`, and `kleuroBrand.logo`.
- Rated: slug `rated`, `productType: "project"`, category `Music`, status `In development`, route `/projects/rated`, and `ratedBrand.logo`.

Descriptions are localized for `en`, `fr`, `de`, and `nl` in `projectDescriptions`. Shared Project Page labels/copy are also localized in the same file.

### Concrete elements worth preserving

- Clear independent-project classification and explicit separation from both commercial paths.
- Centralized, typed `projects` config and localized description lookup.
- Stable project routes and generated metadata/JSON-LD.
- Breadcrumb hierarchy and return-to-projects CTA.
- Existing project marks and dark logo panels.
- Public shell, skip link, sticky navigation, locale selection, and footer.
- `1400px` content rhythm, technical grid, typography, border system, dark atmosphere, responsive breakpoints, reduced-motion support, and `next/image` behavior.

## 3. AYV WRLD Ecosystem

The table uses only entities found in repository config/source/copy. “Other” retains the repository’s exact non-enum business classification rather than guessing a different product type.

| Entity | Existing Type | Logo | Route | Source |
|---|---|---|---|---|
| AYV WRLD | Other — parent company / parent brand | `public/brands/ayv/mark-transparent-v3.webp`; special automation parent mark `public/brands/ayv/parent-mark-dark-v1.webp` | `/` | `config/site.ts`; `config/brands.ts`; `config/public-site.ts` lines 66-77; `components/product-icon.tsx` |
| One Man Army Stack | Product — `standalone_commercial_product` | `public/brands/one-man-army/mark-transparent-v3.webp` | `/one-man-army` | `config/public-site.ts` lines 32-41; `app/one-man-army/page.tsx`; public copy calls it a standalone commercial product |
| AYV Automation | Other — `product_ecosystem` | UNKNOWN — needs confirmation | `/automation` | `config/public-site.ts` lines 42-49; `app/automation/page.tsx`; public copy calls it a product ecosystem for businesses |
| AYV Automation Stack | Product — `commercial_bundle` | UNKNOWN — needs confirmation | `/automation/stack` | `config/public-site.ts` lines 50-58; `app/automation/stack/page.tsx` JSON-LD uses `@type: "Product"`; copy calls it a six-product bundle |
| Avyro | Product — automation | `public/brands/avyro/mark-transparent-v3.webp` | Public `/automation/avyro`; app `/dashboard/avyro` | `config/products.ts` lines 64-98; `app/automation/[slug]/page.tsx`; `app/dashboard/avyro/page.tsx` |
| Velto | Product — automation | `public/brands/velto/mark-transparent-v3.webp` | Public `/automation/velto`; app `/dashboard/velto` | `config/products.ts` lines 99-131; `app/dashboard/velto/page.tsx` |
| Rovyn | Product — automation | `public/brands/rovyn/mark-transparent-v3.webp` | Public `/automation/rovyn`; app `/dashboard/rovyn` | `config/products.ts` lines 132-164; `app/dashboard/rovyn/page.tsx` |
| Orvyn | Product — automation | `public/brands/orvyn/mark-transparent-v3.webp` | Public `/automation/orvyn`; app `/dashboard/orvyn` | `config/products.ts` lines 165-193; `app/dashboard/orvyn/page.tsx` |
| Nexro | Product — automation | `public/brands/nexro/mark-transparent-v3.webp` | Public `/automation/nexro`; configured generic app target `/dashboard/product` | `config/products.ts` lines 194-224; status is `coming_soon` and no `app/dashboard/nexro/page.tsx` exists |
| Ravelo | Product — automation | `public/brands/ravelo/mark-transparent-v3.webp` | Public `/automation/ravelo`; configured generic app target `/dashboard/product` | `config/products.ts` lines 225-254; status is `coming_soon` and no `app/dashboard/ravelo/page.tsx` exists |
| Kleuro | Project | `public/projects/kleuro/mark-transparent-v3.webp` | `/projects/kleuro` | `config/public-site.ts` lines 4-16; `config/brands.ts`; `app/projects/[slug]/page.tsx` |
| Rated | Project | `public/projects/rated/mark-transparent-v3.webp` | `/projects/rated` | `config/public-site.ts` lines 17-28; `config/brands.ts`; `app/projects/[slug]/page.tsx` |

Classification resolutions:

- AYV WRLD is explicitly the parent company/brand, not one of the six automation products.
- One Man Army Stack is a standalone commercial product for software builders and is separate from AYV Automation (`config/public-site.ts` lines 71-73 and 89-91).
- AYV Automation is the business-facing product ecosystem.
- AYV Automation Stack is a sibling commercial bundle inside AYV Automation, not the parent of the six products (`config/public-site.ts` lines 81-87 and 98-99).
- Kleuro and Rated are independent projects directly under AYV WRLD and outside both commercial product paths (`config/public-site.ts` lines 76 and 94-95).
- The repository marks Avyro, Velto, Rovyn, and Orvyn `active`; Nexro and Ravelo are `coming_soon`. “Active” is runtime availability, not a different entity type.
- A repository-wide search found no `Zevra`/`zevra` occurrence. Zevra is therefore omitted from the ecosystem table, is not classified as a product, and is not included in the Automation Stack.

## 4. AYV Automation Stack

Exactly six products are defined by the `ProductId` union and `products` catalog in `config/products.ts`. `config/public-site.ts` lines 75 and 98 and `components/marketing/bundle-pricing-card.tsx` confirm that the bundle contains these six sibling products.

| Product | Logo | Route | Data Source | Stack Relationship |
|---|---|---|---|---|
| Avyro | `public/brands/avyro/mark-transparent-v3.webp` | Public: `/automation/avyro`; app: `/dashboard/avyro` | `config/products.ts` key/id `avyro` (lines 64-98); localized catalog copy `messages/{en,fr,de,nl}.json` under `catalog.avyro` | One of six sibling automation products; Acquire stage; included by `products.map()` in the stack card/page |
| Velto | `public/brands/velto/mark-transparent-v3.webp` | Public: `/automation/velto`; app: `/dashboard/velto` | `config/products.ts` key/id `velto` (lines 99-131); `messages/{en,fr,de,nl}.json` → `catalog.velto` | One of six sibling automation products; Schedule stage; included by `products.map()` |
| Rovyn | `public/brands/rovyn/mark-transparent-v3.webp` | Public: `/automation/rovyn`; app: `/dashboard/rovyn` | `config/products.ts` key/id `rovyn` (lines 132-164); `messages/{en,fr,de,nl}.json` → `catalog.rovyn` | One of six sibling automation products; Convert stage; included by `products.map()` |
| Orvyn | `public/brands/orvyn/mark-transparent-v3.webp` | Public: `/automation/orvyn`; app: `/dashboard/orvyn` | `config/products.ts` key/id `orvyn` (lines 165-193); `messages/{en,fr,de,nl}.json` → `catalog.orvyn` | One of six sibling automation products; Collect stage; included by `products.map()` |
| Nexro | `public/brands/nexro/mark-transparent-v3.webp` | Public: `/automation/nexro`; configured app target: `/dashboard/product` (generic redirect route; no Nexro workspace page) | `config/products.ts` key/id `nexro` (lines 194-224); `messages/{en,fr,de,nl}.json` → `catalog.nexro` | One of six sibling automation products; Retain stage; included by `products.map()`; currently `coming_soon` |
| Ravelo | `public/brands/ravelo/mark-transparent-v3.webp` | Public: `/automation/ravelo`; configured app target: `/dashboard/product` (generic redirect route; no Ravelo workspace page) | `config/products.ts` key/id `ravelo` (lines 225-254); `messages/{en,fr,de,nl}.json` → `catalog.ravelo` | One of six sibling automation products; Reputation stage; included by `products.map()`; currently `coming_soon` |

Additional verified stack behavior:

- Catalog prices are 40, 40, 70, 70, 90, and 90 EUR/month. `BUNDLE_DISCOUNT` is `0.5`; `bundlePricing` derives full price, discounted price, and savings (`config/products.ts` lines 259-267).
- The displayed bundle is €400 catalog total, planned €200/month, saving €200/month. Copy explicitly says there is no separate stack checkout today.
- `BundlePricingCard` renders all six by mapping the full catalog, not active products only.
- The stack page closing CTA filters to active products, currently Avyro, Velto, Rovyn, and Orvyn.
- `/dashboard/product` reads the active-product cookie and redirects to an active product route or `/dashboard`; it is not a distinct Nexro or Ravelo workspace.

## 5. Assets

### AYV WRLD assets

- `public/brands/ayv/mark-transparent-v3.webp`
  - Configured as AYV WRLD `icon`, `logo`, and `nameMark` in `config/brands.ts`.
  - Used by `Logo`, the home hero, root Open Graph/Twitter metadata, and organization JSON-LD.
- `public/brands/ayv/parent-mark-dark-v1.webp`
  - Configured as `ayvBrand.automationParentMark`.
  - Used by `AyvAutomationParentBadge` and automation product JSON-LD as the parent brand logo.
  - This is the verified special product-page parent mark.
- `app/icon.png` and `app/apple-icon.png`
  - Root metadata also names `/icon.png` and `/apple-icon.png`; these App Router icon files were already modified before discovery.

### Ecosystem and project assets

- `public/brands/one-man-army/mark-transparent-v3.webp`
  - Configured by `oneManArmyBrand.logo`; used on the home page and `/one-man-army`.
- `public/projects/kleuro/mark-transparent-v3.webp`
  - Configured by `kleuroBrand.logo`; used by project index/detail cards and metadata.
- `public/projects/rated/mark-transparent-v3.webp`
  - Configured by `ratedBrand.logo`; used by project index/detail cards and metadata.

### Automation product assets

- `public/brands/avyro/mark-transparent-v3.webp`
- `public/brands/velto/mark-transparent-v3.webp`
- `public/brands/rovyn/mark-transparent-v3.webp`
- `public/brands/orvyn/mark-transparent-v3.webp`
- `public/brands/nexro/mark-transparent-v3.webp`
- `public/brands/ravelo/mark-transparent-v3.webp`

`productBrand(id)` in `config/brands.ts` constructs each path and assigns the same mark as icon, logo, and name asset, with `hasWordmark: false`. They are rendered through `ProductIcon`/`ProductLogo` and automation cards/pages.

### Automation Stack asset

- A dedicated AYV Automation or AYV Automation Stack logo/mark was not found in `public/`, `config/brands.ts`, or source references: UNKNOWN — needs confirmation.
- Current stack UI is typographic and uses the six product names/logos through catalog mapping.

### Project/ecosystem visual assets and generated visuals

- Project pages use no photographic/background image asset. `technical-grid` is generated by CSS gradients in `app/globals.css`.
- `noise-overlay` uses an inline SVG data URI in `app/globals.css`, not a repository image.
- Icons are React components from `lucide-react`, not files in `public/`.
- `public/hero/cube.png`, `public/window.svg`, `public/file.svg`, and `public/vercel.svg` exist but no current source/config reference was found; they should not be assumed to belong to a future ecosystem map.
- The configured `mark-transparent-v3.webp` files were untracked in the initial Git status, while old `mark-v2.webp` files were pre-existing deletions. They are nevertheless intentionally referenced by current config/source and are therefore documented. `.tmp-screens/` files were excluded as temporary/user-generated evidence rather than repository product assets.

## 6. Reusable Components

- `components/marketing/public-site.tsx`
  - `PublicShell`: dark public wrapper, skip link, header, content, footer; preserve for visual and navigation consistency.
  - `Breadcrumbs`: semantic breadcrumb nav with `aria-current`; reusable in an information panel or detail path.
  - `SectionHeading`: existing kicker/title/body hierarchy.
  - `AutomationProductCard`: product mark, state, category, copy, price, and public-route CTA with hover motion.
  - `ProjectCard`: project classification, status, logo, description, detail link, and hover motion.
  - `CTASection`: shared bordered end-cap with responsive CTA links.
  - `PageHero`: responsive public hero with technical-grid background.
- `components/marketing/header.tsx`
  - `MarketingHeader`: sticky `z-50` header, desktop automation dropdown, mobile menu, Escape close, locale selector, and route links.
  - `MarketingFooter`: product/path/company navigation sourced from the same catalog.
- `components/marketing/bundle-pricing-card.tsx`
  - `BundlePricingCard`: exact six-product inclusion list and derived stack pricing; reusable where the Automation Stack needs a compact evidence panel.
- `components/product-icon.tsx`
  - `ProductIcon`, `ProductLogo`, `ProductWordmark`, and `AyvAutomationParentBadge`: centralized image semantics and sizing. `ProductWordmark` falls back to text because current product assets have no wordmarks.
- `components/logo.tsx`
  - `Logo`: AYV mark plus text, with a mark-only option.
- `components/atmosphere.tsx`
  - `Atmosphere`: dark theme scope and noise layer; note that it also applies `overflow-x-clip`.
- `components/ui/card.tsx`
  - `Card`, `CardHeader`, `CardTitle`, and `CardDescription`: generic card primitives, currently styled for rounded dashboard surfaces.
- `components/ui/modal.tsx`
  - `Modal`: overlay, outside click, Escape close, dialog semantics, optional description. Potential information-panel reuse requires accessibility hardening because focus trapping/restoration is not implemented.
- `components/ui/confirmation-dialog.tsx`
  - `ConfirmationDialog`: action-specific modal; not a direct fit for passive ecosystem details.
- `components/ui/tabs.tsx`
  - `Tabs`: small client-state tab switcher; potential use for grouped information but currently has no ARIA tab roles/keyboard model.
- `components/ui/dropdown.tsx`
  - `Dropdown`/`DropdownItem`: outside-click client dropdown used by product switcher and account menus. It is not a tooltip.
- `components/page-header.tsx`
  - `PageHeader`: dashboard heading/action layout; potentially useful only if matching dashboard surfaces.
- `components/layout/dashboard-shell.tsx`
  - `DashboardShell`: authenticated layout, not suitable for the public Projects route because it requires organization/profile/product state.
- `components/marketing/sections.tsx`
  - `BetterTogether` demonstrates a responsive product sequence using active products.
  - `Features` demonstrates numbered rows and group-hover details.
  - `HowItWorks` demonstrates a technical grid and responsive two-column explanatory flow.
- `components/marketing/product-card.tsx`
  - `ProductCard`: alternate rounded product card linked to legacy `/products/[slug]`, which now redirects permanently to `/automation/[slug]`; prefer `AutomationProductCard` for new public work.

No dedicated tooltip, connector/edge, graph node, pan/zoom, or ecosystem map component exists. No existing connecting-lines implementation was found.

## 7. Technical Stack

- Next.js `16.3.5` App Router with async `params` and generated metadata.
- React/React DOM `19.2.8`.
- TypeScript `^5`, strict mode, ES2017 target.
- Tailwind CSS `^4` through `@tailwindcss/postcss`.
- next-intl `^4.14.5`.
  - Supported locales: `en`, `fr`, `de`, `nl`.
  - Default locale: `en`.
  - Locale is stored in `ayv_locale` cookie by the `setLocaleAction` Server Action.
  - `i18n/request.ts` reads `cookies()` and loads `messages/{locale}.json`.
  - Public Project copy is separately held in `config/public-site.ts`, including project descriptions and page metadata.
- `next/image` for all configured marks. String public paths use explicit width/height; the bundled Next.js image guide confirms public files are referenced from `/` and `Image` supplies optimization/layout stability.
- `next/font/google` for Instrument Sans, Instrument Serif, and JetBrains Mono.
- `lucide-react` `^1.46.0` for UI icons.
- CSS visuals: gradients, masks, `color-mix()`, `content-visibility`, transforms, keyframes, and media-query reduced motion.
- Vercel Analytics `^2.0.1`.
- Supabase SSR/JS, Stripe, Resend, and Zod serve the authenticated product platform but are not required by the current Project pages.
- Pricing is centralized in `config/products.ts` and `lib/pricing.ts`.
- Routes and public copy are config-driven; there is no CMS or graph data store.
- There is no graph/layout library. A future ecosystem view must use CSS/SVG/HTML geometry or add a dependency only after a separate approved decision.

## 8. Risks / Conflicts

1. **Pre-existing working-tree changes.** Relevant Project Page/config/asset files were already modified or untracked. Any later implementation must re-read and preserve those changes rather than assuming Git HEAD matches this report.
2. **Route hierarchy collision.** `/projects` means independent AYV WRLD projects today. Replacing it with an ecosystem view without preserving access to Kleuro/ Rated would erase an established information architecture and conflict with metadata/copy.
3. **Dynamic-segment ambiguity.** `/projects/[slug]` currently accepts only config entries generated by `projects`. New ecosystem node identifiers must not silently collide with project detail slugs.
4. **Legacy product routes.** `next.config.ts` permanently redirects `/products/:slug` to `/automation/:slug`. New links should use `product.marketingRoute`, not the legacy path.
5. **Server/client boundary.** Current Project pages are Server Components. Interactive selection, keyboard navigation, viewport measurement, drag, pan, or resize logic must live in a narrow `"use client"` child. Moving the whole page client-side would unnecessarily increase hydration.
6. **Cookie-driven locale.** Project rendering and metadata call next-intl server APIs backed by `cookies()`. A client ecosystem component must receive translated serializable labels/data or use next-intl client hooks; it must not import server-only locale access.
7. **Two copy stores.** General app messages live in `messages/*.json`, while public Project copy and project descriptions live in `config/public-site.ts`. Adding copy to only one system risks locale gaps or inconsistent naming.
8. **Classification integrity.** One Man Army Stack, AYV Automation, AYV Automation Stack, individual automation products, and independent projects are deliberately distinct. The map must not depict the bundle as the parent of its six sibling products or put projects inside either commercial path.
9. **Zevra constraint.** Zevra is absent from inspected repository evidence. It must not be invented, classified as a product, or placed in the Automation Stack.
10. **No stack logo.** A dedicated Automation Stack mark was not found. Substituting the AYV parent mark or inventing an asset would misrepresent current config.
11. **Asset Git state.** Current source points to untracked v3 marks while old v2 marks are deleted. A later branch/checkout that lacks the v3 files would break images.
12. **Horizontal clipping.** `Atmosphere` uses `overflow-x-clip`; connector lines, transformed nodes, popovers, and off-canvas panels can be clipped.
13. **Stacking contexts.** Sticky header `z-50`, mobile nav `z-40`, modal `z-50`, noise pseudo-element `z-20`, transformed hover cards, and positioned technical-grid layers can place connectors/popovers behind or above the wrong surface.
14. **Content visibility.** `main > section:not(:first-child)` uses `content-visibility: auto` and an intrinsic size. Geometry measured before a lower section is rendered may be stale or zero.
15. **Responsive geometry.** Existing layouts switch at `sm`/`lg` and use clamped headings. Hard-coded line coordinates would fail across widths, translations, and font loading.
16. **Motion.** Existing reduced-motion handling is global and must be respected. Any JS animation needs an equivalent reduced-motion path.
17. **Performance.** Many absolutely positioned nodes, SVG paths, observers, or repeated layout measurements can cause paint/layout cost. The current pages are mostly server-rendered and low-JavaScript.
18. **Image behavior.** Marks use `next/image` with explicit dimensions and `object-contain`. Replacing them with raw backgrounds would lose optimization and accessible alt text.
19. **Accessibility.** An interactive map needs keyboard-reachable nodes, visible focus, semantic labels, non-color state, and a linear fallback/read order. Existing `Modal` lacks focus trap/restoration, and `Tabs` lacks full tab semantics.
20. **Browser features.** Current visuals depend on `mask-image`, `color-mix()`, `content-visibility`, `dvh`, CSS transforms, and backdrop blur. The supported browser matrix is UNKNOWN — needs confirmation.
21. **Proxy/session work.** `proxy.ts` runs Supabase session update logic on public Project routes. Interactive work must not assume the route bypasses auth/session infrastructure.
22. **Dashboard routes are not uniformly real workspaces.** Avyro, Velto, Rovyn, and Orvyn have dedicated pages; Nexro and Ravelo do not. A map must distinguish public product pages from authenticated app availability.
23. **No graph engine.** Connector routing, overlap prevention, pan/zoom, and touch gestures would be custom work with the current dependencies.
24. **Modal routing is absent.** There are no parallel/intercepted routes for project details. Introducing route-backed overlays would be an architectural change, not reuse of current routing.

## 9. Proposed Implementation Plan

This plan is discovery-based only and was not implemented.

1. **Preserve the current information architecture.**
   - Keep `/projects/kleuro` and `/projects/rated` and their config-driven detail behavior.
   - Decide whether `/projects` becomes the ecosystem view with an explicit “Independent projects” region, or whether a new ecosystem route is preferable. This product decision is UNKNOWN — needs confirmation.
2. **Use current sources of truth.**
   - Derive automation nodes from `products` in `config/products.ts`.
   - Derive independent project nodes from `projects` in `config/public-site.ts`.
   - Derive One Man Army/Automation/Stack relationships from `ecosystems` and exact public copy, not from duplicated literals.
   - Keep Zevra absent unless future verified non-product data is added.
3. **Likely files to modify later.**
   - `app/projects/page.tsx` for page composition and metadata only if `/projects` is the approved target.
   - `config/public-site.ts` for localized ecosystem-specific copy or a typed relationship model.
   - `app/globals.css` only for shared map styles/reduced-motion rules that cannot be expressed cleanly with utilities.
   - `components/marketing/public-site.tsx` only for genuinely shared primitives; avoid coupling generic components to one map.
   - Existing `app/projects/[slug]/page.tsx` should remain functionally unchanged unless a separately approved breadcrumb/return-link adjustment is required.
4. **Likely components to create later.**
   - `components/marketing/ayv-ecosystem-map.tsx`: narrow client boundary for node selection and responsive presentation.
   - `components/marketing/ecosystem-node.tsx`: semantic button/link node with logo, type, state, and focus treatment.
   - `components/marketing/ecosystem-connections.tsx`: decorative/semantic SVG connectors with `aria-hidden` where relationships are repeated in text.
   - `components/marketing/ecosystem-info-panel.tsx`: non-modal desktop details and inline/mobile details; use route links as primary actions.
   - Names/locations are proposals, not existing files.
5. **Ecosystem map model.**
   - Root: AYV WRLD parent company.
   - Independent commercial product: One Man Army Stack.
   - Business product ecosystem: AYV Automation.
   - Inside AYV Automation: six sibling products plus AYV Automation Stack as the bundle that contains them; do not make the bundle their parent.
   - Direct independent projects under AYV WRLD: Kleuro and Rated.
6. **Automation Stack treatment.**
   - Reuse the six product marks and exact Acquire → Schedule → Convert → Collect → Retain → Reputation order.
   - Reuse `BundlePricingCard` only if price/commercial detail belongs in the approved scope; otherwise use a compact bundle node and link to `/automation/stack`.
   - Do not invent a stack logo.
7. **Information panel behavior.**
   - Use selection state in a client child.
   - Include existing type, verified description, status, logo, public route, and app route only where valid.
   - Keep all information available in DOM order for keyboard/screen-reader users; do not make connector geometry the only explanation.
   - Prefer an inline panel on small screens over the current `Modal` unless focus management is upgraded.
8. **Responsive implementation.**
   - Desktop: map plus adjacent information panel within the existing `max-w-[1400px]` shell.
   - Tablet/mobile: ordered cards/accordion-like disclosure preserving parent/sibling relationships; avoid unreadable scaled-down graph coordinates.
   - Recompute SVG connector geometry with `ResizeObserver` only if CSS grid lines cannot express it, and avoid measurement before `content-visibility` activation.
9. **Motion and interaction.**
   - Reuse current hover/focus transition language.
   - Keep animation optional and subtle; disable it under `prefers-reduced-motion`.
   - Do not add drag/pan/zoom unless usability testing proves it necessary.
10. **Routing and isolation.**
    - Use `next/link` and existing canonical routes.
    - Keep authenticated app links labeled separately and omit/disable unavailable workspaces.
    - Keep implementation inside the Projects/public-marketing surface so dashboard shells, auth, billing, and product workspaces are unaffected.
11. **Verification for a later implementation.**
    - Validate all four locales, keyboard operation, focus visibility, reduced motion, mobile menu coexistence, 320px through large desktop layouts, image loading, metadata, sitemap implications, and both project detail routes.
    - Run lint/type/build checks and browser-test the public paths without changing external services.

## 10. Discovery Timestamp

Verified local system time: **2026-09-25 17:19:35 +02:00**.

Discovery verification:

1. Repository structure, manifests, configs, imports, source, public assets, and relevant bundled Next.js 16 docs were inspected.
2. `/projects` and `/projects/[slug]` were both inspected completely and distinguished.
3. The evidenced AYV WRLD ecosystem was mapped.
4. Exactly six AYV Automation Stack products were investigated.
5. Zevra was not classified as a product and was not placed in the Automation Stack.
6. AYV, project, One Man Army, product, and special parent-mark assets were located; absence of a stack mark was recorded.
7. Reusable components and missing graph/tooltip/connector primitives were documented.
8. Server/client, locale, routing, CSS, motion, responsive, accessibility, performance, image, and browser constraints were documented.
9. The implementation plan was documented but not executed.
