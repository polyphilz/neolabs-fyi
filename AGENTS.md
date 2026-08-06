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

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
