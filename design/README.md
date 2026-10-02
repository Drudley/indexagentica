# Design sources

- `logo.svg`: the mark (rounded square). Same file as `static/favicon.svg`.
- `logo-square.svg`: full-bleed variant for `apple-touch-icon.png` (iOS rounds the corners itself).
- `og.svg`: social card (1200×630) for `static/og.png`.

The PNG/ICO files in `static/` are rendered from these with [`@resvg/resvg-js`](https://github.com/thx/resvg-js)
(a build-time tool only; the site build stays zero-dependency):

```bash
cd /tmp && npm i @resvg/resvg-js && cp /path/to/repo/design/* .
node render.mjs logo.svg logo-512.png 512
node render.mjs logo.svg logo-400.png 400
node render.mjs logo-square.svg apple-touch-icon.png 180
node render.mjs og.svg og.png 1200
# favicon.ico (16/32/48): render logo.svg at those widths, then combine, e.g. with Pillow:
# Image.open('m48.png').save('favicon.ico', sizes=[(16,16),(32,32),(48,48)], append_images=[...])
```

`og.svg` uses the Pretendard font (static weights); `render.mjs` lists the font files it loads.
