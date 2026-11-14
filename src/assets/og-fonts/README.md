Static font instances that `src/app/opengraph-image.tsx` bundles for `ImageResponse`.
Satori needs plain TTF files, not woff2 or variable fonts.

- `Fraunces-Regular.ttf`: Fraunces 400. The site's display serif (`--f-display`).
- `Geist-Regular.ttf`: Geist 400. The site's UI grotesk (`--f-ui`).

Both are the Google Fonts static TTF instances (fonts.gstatic.com), the same families `next/font/google` loads in `layout.tsx`.
Both fonts are licensed under the SIL Open Font License 1.1.
