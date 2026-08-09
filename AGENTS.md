## Package manager

Use pnpm exclusively for dependency management and package scripts. Do not use
`npm`, `npx`, or create npm lockfiles. The canonical lockfile is
`pnpm-lock.yaml`.

- Install dependencies with `pnpm install`.
- Run scripts with `pnpm <script>` (for example, `pnpm build`).
- Run package binaries with `pnpm exec <binary>` or an existing package script.

## Development

When starting the dev server, use background mode:

```
pnpm astro dev --background
```

Manage the background server with `pnpm astro dev stop`, `pnpm astro dev status`, and
`pnpm astro dev logs`.

## Comments in the dataset

`src/data/labs.ts` uses inline comments to defend values that would otherwise look
wrong to the next reader. Keep them tightly scoped.

- **Valuations — comment freely.** An `undisclosed` figure is an inferred nominal,
  not a reported one, so the reasoning behind it *is* the datum. See
  `prompts/valuation-methodology.md`.
- **Company-level facts — a sentence where it earns one.** A renamed entity, a
  contested HQ, an ambiguous founding year, an exit whose close date is unclear.
  Enough to stop someone "correcting" a researched value back.
- **Everything else — leave it out.** Not every field needs justifying.

**Never write comments about individual people.**

Company-level notes that happen to mention a person in passing are fine — a founder
quoted in a press release, an investor named as a round's lead. The line is whether
the comment is *about the company* or *about the human*.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
