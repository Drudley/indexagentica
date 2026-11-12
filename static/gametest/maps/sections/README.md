# Hand-authored section overrides (listed in `world.json` `authoredSections`)

Tiled-compatible JSON, 200×200 tiles, layers `material` / `path` / `collision` only
(`docs/WORLD.md`). Tile art size is 128 px. Coordinates are section-local
`(lx, ly)` with world origin `originTx = sx*200`, `originTy = sy*200`.

The first 3×3 around the human start (sx 8..10, sy 9..11):

| Section | File | Place |
|---------|------|-------|
| (9, 10) | `s_9_10.json` | Hearthcrown (HT), human start and town. Bit-stable; do not change. |
| (8, 9), (9, 9), (10, 9), (8, 10), (10, 10), (8, 11), (9, 11), (10, 11) | `s_{sx}_{sy}.json` | Open countryside: irregular fields, country roads and 1-wide tracks. No hamlet pads or lot grids. |

Edge crossings for each section (including the 3×3 outer boundary) are in
`s_{sx}_{sy}.edges.json`. Roads match on every internal seam. The hinterland
generator must keep every contracted crossing, including HT's extra north-edge
tile at local `(1, 0)` and the corner diagonal approaches.

Bushes, single trees, and solo huts are planned in
`client/tools/author-ht-section.py` (and listed in `docs/map/OBJECTS-PLAN.md`).
They are not written as `objects.json` until Game Coder's type catalogue lands.
Do not put gathering-node data in this folder (`nodes.json` lives under
`world/sections/<sx>_<sy>/`).

Regenerate all nine sections with:

```bash
python3 client/tools/author-ht-section.py
```

Previews: `docs/map/ht-3x3-preview-ground.png` (ground only) and
`docs/map/ht-3x3-preview.png` (ground plus planned hut / tree / bush markers).
