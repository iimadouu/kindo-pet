---
name: Kindo store architecture
description: How admin data flows to the public frontend via localStorage and React context
---

## The pattern

`src/lib/store.ts` — pure read/write helpers (localStorage, no React).
`src/lib/StoreContext.tsx` — React context wrapping the store with useState + callbacks.
`App.tsx` — `<StoreProvider>` wraps the entire router tree, so `/admin` and all public routes share the same context.

## Data flow

Admin panel (`/admin`) writes via `setProducts`, `setArticles`, `setSettings` → context callbacks → `localStorage`.
All public pages (`Home`, `Catalog`, `ProductDetail`, `Gallery`, `ArticleDetail`, `Footer`, `Layout`) read via `useStore()` hook.
On first load: localStorage → falls back to static files in `catalog.ts` / `gallery.ts`.

## Product interface (exact, from data/catalog.ts)

```ts
{ id, nameFR, nameAR, descriptionFR, descriptionAR,
  category: 'dogs'|'cats'|'birds'|'fish',
  type: 'food'|'accessory',
  price: number, images: string[],
  specs: Record<string,string>,  // key: "FR / AR", val: "FR / AR"
  featured: boolean }
```

## Article interface (exact, from data/gallery.ts)

```ts
{ id, titleFR, titleAR, excerptFR, excerptAR,
  bodyFR, bodyAR, image, date }
```

## Specs format convention

Key: `"Poids / الوزن"` (FR / AR, or just FR if no AR).
Value: `"15 kg"` or `"15 kg / 15 كجم"`.
Admin uses SpecRow[] internally and converts with `specsToRows` / `rowsToSpecs`.

## Settings

`KindoSettings`: whatsappNumber, facebookUrl, instagramUrl, promoTextFR, promoTextAR, addressFR, addressAR, phone, email.
WhatsApp number format: international without + (e.g. `213555000000`).
Used in: Layout (promo banner), ProductCard, ProductDetail, Contact, Footer.

**Why:** Static Cloudflare Pages site has no server-side rendering; localStorage lets the admin configure the live site without a backend deployment.
**How to apply:** Any new page/component needing dynamic data should `useStore()` not import directly from data files.
