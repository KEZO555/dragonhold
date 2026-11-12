# Dragonhold — design spec for implementation

Hand-off document for the coding agent building the game. It defines the look, the world, the board economy and the HUD. Two reference images accompany it: `dragonhold-style-frame.svg` (target look of the main view) and `dragonhold-terrain-palette.svg` (tiles and colours).

## 1. What the game is

- A first-person, Catan-like settlement and trading game.
- The player stands on the wall of their own settlement and looks out over a land made of hexagonal tiles. Dice rolls make tiles produce resources; resources build roads, outposts and holds; first to 10 holds wins.
- Medieval gothic fantasy: cathedrals, graveyards, heraldry and iron, rendered as crisp ink-edged watercolor, like a hand-painted manuscript page. Melancholy, not horror.

## 2. Art direction in one line

**Medieval gothic shapes, sharp ink-edged watercolor.** Dark subject matter (cathedrals, bones, candlelight) painted in flat washes with crisp dark edges on visible paper. Mist and blur are used sparingly, only at the horizon.

## 3. Colour tokens

Use only these. Never use pure black or pure white.

| Token | Hex | Use |
|---|---|---|
| `ink-plum` | `#1E1A26` | Deepest dark: foreground silhouettes, text, player structures |
| `bruised-violet` | `#3A3350` | Shadows, stone, the Hold, iron crags |
| `barrow-stone` | `#6E6880` | Mid-tone stone, barrow hills, the Hold's hill |
| `ash-lavender` | `#8E8AA3` | Mist, distance, sky washes, moor tiles |
| `bone-white` | `#EDE6DA` | Paper, light, UI plates, number tokens |
| `ashen` | `#CFC6BC` | Waste tile |
| `moss-grey` | `#5F6B5E` | Deadwood tiles, foliage |
| `tarnished-straw` | `#A89A86` | Blackwheat tiles |
| `dried-rose` | `#8C3B4A` | Opponent banners and roads, the 6 and 8 tokens |
| `ember-gold` | `#E0A24A` | Fire and magic ONLY: lanterns, lit windows, dragonfire, the primary action button |

Rule: `ember-gold` is the only saturated colour on screen. It marks what matters. Do not use it for decoration.

## 4. Rendering rules

1. **Crisp ink edge.** Shapes are flat washes with a thin, dark rim (about 1.5 px at 900 px frame height) where pigment pools. The rim is the shape's own colour darkened by half, not a black outline.
2. **Slight wobble.** Silhouettes are displaced by low-frequency noise, but only a little; edges stay sharp and readable.
3. **Light granulation.** Fill opacity varies with mid-frequency noise between about 85% and 100%. Colours read as solid.
4. **Visible paper.** A fine, faint paper grain is multiplied over the whole frame, UI excluded. Light areas are bare paper, not white paint.
5. **Gaps between tiles.** Hex tiles are drawn at about 93% size so a thin line of unpainted paper separates them. This is the grid; do not draw grid lines.
6. **Restrained atmospheric fade.** With distance, colours blend toward pale lavender (`#B9B4C6`, up to about 40%) and opacity drops to about 70%. Only the far horizon dissolves into mist.
7. **Three depth layers.** Foreground is solid `ink-plum` silhouette (wall with iron spikes, lantern, raven, the gothic arch framing the view). Midground carries the detail (tiles, roads, structures). Background is the Hold, mountains and a dark storm sky.
8. **Light is rare.** A soft radial glow in `ember-gold` around each light source; nothing else glows.
9. **No blur on objects.** Blur is allowed only on mist bands and light glows.

### Reference filter values (from the SVG mockup)

These are the SVG filter settings that produced the reference look at 1600×900. Translate them into shaders or post-processing for the target engine.

- Edge wobble: fractal noise, base frequency 0.011, 3 octaves, displacement 7 px (3 px for foreground and structures).
- Ink edge: erode the shape's alpha by 1.6 px, subtract from the original to get a rim, darken the rim's colour to 50%, composite it over the body.
- Granulation: fractal noise, base frequency 0.04, 4 octaves, mapped to alpha `0.8 * n + 0.6`, clamped.
- No blur pass on shapes.
- Sky washes: displacement 40 px at frequency 0.006, then blur 6 px.
- Mist: plain blur 9 px on `bone-white` ellipses at 40–50% opacity.
- Paper grain: fractal noise at frequency 0.85, 2 octaves, tinted `#332B38`, alpha `0.7 * n - 0.25`, blend mode multiply.

### Implementation notes for a real-time 3D engine

- Render terrain and structures unlit with flat colours from the tokens; skip PBR and realistic shadows.
- Do the watercolor look as a full-screen post-process: noise-based UV displacement, edge darkening from a depth/colour edge detect or a blurred-alpha difference, granulation noise in screen or world space, then the paper multiply.
- Anchor the paper grain in screen space. Anchor granulation noise in world space so it does not swim when the camera turns.
- Use light depth fog toward `#B9B4C6` for the atmospheric fade, capped at 40%.
- Draw the HUD after the post-process so text stays crisp.

## 5. Camera and composition

- First-person, standing on a wall. Eye height is about 1.9 hex radii above the ground; the horizon sits just above the vertical middle of the frame (49% from the top).
- Reference projection in the mockup: focal length 900 px at 1600×900, hex radius 220 world units, camera height 420 units, nearest visible tile row 1150 units ahead, rows every 330 units.
- The crenellated wall crosses the bottom 12–18% of the frame as a dark silhouette. The HUD's bottom bar sits on it.
- The Hold is always visible on the horizon, off-centre, partly veiled by mist.

## 6. The world

- **The Hold:** a gothic cathedral-fortress built inside the skeleton of a colossal dragon. Ribs arc over the towers like flying buttresses, the skull rests on the hill beside it, the tail trails along the ridge. One ember-lit rose window.
- **Architecture:** medieval gothic, tall and thin. Pointed arches, spires topped with crosses, pinnacles, flying buttresses, lancet windows, wrought iron spikes, graveyards with stone crosses.
- **Framing:** the player looks out through a pointed stone arch. Its dark spandrels fill the top corners of the view, each set with a small `dried-rose` quatrefoil window.
- **Heraldry:** every house has a sigil, shown on banners, shields and seals.
- **Nature:** dead trees, thorned roses, moths, ravens, fog, a pale moon left as bare paper.
- **Dragons:** rare. Shown as silhouettes in mist, bones, or stained glass.

## 7. Board economy

Standard Catan structure with renamed terrain and resources. Names are placeholders the designer may change; keep them in one constants file.

| Terrain | Resource | Catan equivalent | Tile colour | Tile decoration |
|---|---|---|---|---|
| Deadwood | Ashwood | Lumber | `moss-grey` | Bare ink trees with two or three branches |
| Barrow hills | Gravestone | Brick | `barrow-stone` | Low violet mounds, each with a standing stone |
| Blackwheat fields | Blackwheat | Grain | `tarnished-straw` | Short vertical ink strokes |
| Moth moor | Moth-silk | Wool | `ash-lavender` | Small bone-white cocoons |
| Iron crags | Iron | Ore | `bruised-violet` | Sharp ink peaks |
| Ashen waste | none | Desert | `ashen` | Bone-white ribs breaking the surface |

- **The Wyrm** replaces the robber. It starts asleep on the Ashen waste and moves on a roll of 7.
- **Number tokens:** bone-white discs with ink numerals standing on each tile; 6 and 8 in `dried-rose`.
- **Structures:** narrow towers with pointed roofs in `ink-plum`. Outpost = settlement, hold = city. Each flies a banner in its owner's colour. The local player's structures show an ember-lit window.
- **Roads:** thick soft strokes along hex edges in the owner's colour.
- **Player colours:** local player `ink-plum` with `bone-white` banner; opponents `dried-rose`, `moss-grey`, `ash-lavender`.

## 8. HUD

Minimal, and never painted over by the watercolor effect.

- **Typefaces:** titles and house names in Grenze Gotisch 700 (Google Fonts), a readable blackletter, set in title case, never all capitals. Everything else in Cormorant Garamond, weights 500, 600, 700, plus 500 italic. Minimum size 17 px at 900 px frame height.
- **Shapes:** plates and buttons are square-cornered plaques with a double ink rule, like manuscript frames. Only icon buttons are round, like wax seals. Panels carry a `dried-rose` diamond at the top and bottom centre.
- **Top left:** house name in Grenze Gotisch, and an italic status line ("Turn 7 — your move"), on a `bone-white` plate at 86% opacity.
- **Top right:** score plate ("4 of 10 holds").
- **Bottom bar, on the wall:** five resource chips on the left (colour dot, name, count; 44 px tall pills, 1 px `bone-white` border at 35% opacity, `bone-white` text). Actions on the right: "Roll the bones" as the one filled `ember-gold` button with `ink-plum` text; "Build" and "Trade" as outlined `bone-white` pills.
- Minimum hit target 44 px. Text contrast at least 4.5:1.

## 9. Open design questions

1. Board readability: first-person hides most of the board. Decide between a fixed wall view with a top-down map on a button, or free walking between turns.
2. Trading: how opponents are represented in first-person (envoys at the gate, ravens carrying offers, or a plain panel).
3. Target engine and platform, which decide how the watercolor post-process is built.

## 10. Do not

- Use black outlines, pure black, pure white, glossy or metallic materials, or realistic lighting.
- Blur or soften objects; keep edges crisp.
- Use rounded pill shapes or modern sans-serif type in the UI.
- Add saturated colours beyond `ember-gold` and `dried-rose`.
- Draw hex grid lines.
- Apply the paper and wobble effects to HUD text.
