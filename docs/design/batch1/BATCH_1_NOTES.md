# Dragonhold assets — batch 1

Answers `ASSET_BRIEF` sections 1, 3 (tokens and dice), 4 (banners), 7, 8, 10 (badges) and 13. Everything follows `DRAGONHOLD_DESIGN.md`.

## What is in this folder

| Folder | Contents | Size |
|---|---|---|
| `icons/` | 58 UI icons, one SVG each, named by the internal key | `viewBox="0 0 24 24"` |
| `tokens/` | Number tokens 2–12 (no 7): `token-02.svg` … `token-12.svg` | `viewBox="0 0 64 88"`, 128 × 176 px |
| `dice/` | Rune Stone faces: `rune-stone-1.svg` … `rune-stone-6.svg` | `viewBox="0 0 48 48"`, 96 × 96 px |
| `banners/` | One banner per house: `banner-varn.svg`, `-calder`, `-morrow`, `-ashby` | `viewBox="0 0 96 64"`, 192 × 128 px |
| `contact-sheet.svg` | Preview of everything, with the game's ink outline emulated | 1400 × 1630 px |

## How the icons are built

- Filled shapes only, no strokes. The game's 1.4 px ink outline is not baked in.
- Fills are the spec's colour tokens as literal hex values.
- Details that must survive the bone-white silhouette on the bottom bar are real holes (`fill-rule="evenodd"`), not a second colour. Examples: the pips on `dice`, the "!" in `warning`, the eyes of `wolf`, the bars of `gate`.
- Ember gold appears only on `fire`, the dragon's eye (`dragon`, `wyrmling`, `wyrm`) and the crack in `egg`.

## Icon keys

| Group | Keys |
|---|---|
| Resources | `timber`, `stone`, `wheat`, `cattle`, `ember`, `waste` (map symbol for the Ashen Waste) |
| Buildings and actions | `wall`, `hamlet`, `keep`, `roost`, `dragon`, `tower`, `hammer`, `trade`, `scroll`, `fire`, `map`, `eye`, `help`, `guide`, `dpad`, `goal`, `compass`, `fast`, `gate`, `up` |
| Status and score | `star`, `crown`, `horn`, `dice`, `hourglass`, `warning`, `check`, `cross`, `person`, `gear`, `anchor`, `egg`, `wyrmling`, `wyrm` |
| Time of day | `dawn`, `sun`, `afternoon`, `dusk`, `moon`, `night` |
| Duels and trade | `swords`, `shield`, `feint`, `yield`, `raven`, `deal` |
| House sigils | `wolf`, `stag`, `serpent`, `eclipse` |
| Badges | `great_wall`, `mightiest_host` |

Changes from the brief:

- `roost` and `dragon` are two icons. `roost` is an egg in a bone cradle, for the build bar. `dragon` is the dragon head, for the dragon button and Wyrm messages.
- `wyrm` replaces `reavers`.
- `eclipse` replaces the sun as House Ashby's sigil, so it cannot be confused with the `sun` time-of-day icon.
- `guide` is an open book rather than a graduation cap.
- The resource icons double as the terrain map symbols on the war table.

## Number tokens

- A bone disc hanging from an iron hook, with an ink numeral and probability pips. 6 and 8 are dried rose.
- The space above the numeral (around x 32, y 36, 14 px) is left empty for the game to place the resource icon.
- The numeral is live SVG text in Cormorant Garamond 700, so the font must be loaded before the token is rasterised.

## Rune Stones

Chipped bone blocks with carved ink diamonds as pips. No glow, no orange.

## Banners

- A hanging gonfalon with three tails, on an iron rod.
- Cloth is `#EDE6DA` and the sigil is `#1E1A26`. To recolour for a rival, replace those two hex values: cloth becomes the rival's colour, and the sigil becomes `#EDE6DA`.

## The four houses (rewritten)

| Key | Name | Sigil | Description | Suggested building detail |
|---|---|---|---|---|
| `varn` | House Varn | Wolf | Wolves of the barrow-north. Black timber halls behind bone palisades, grave-fires lit at dusk. | Steep gabled roofs with crossed beam ends |
| `calder` | House Calder | Stag | Stags of the grey highlands. Slate chapels and antler-crowned spires above the mist. | Antler finials on every spire |
| `morrow` | House Morrow | Serpent | Serpents of the drowned fens. Leaning stilt-towers and lantern-lit causeways over black water. | Twisted spires, buildings raised on stilts |
| `ashby` | House Ashby | Eclipsed sun | House of the eclipsed sun. Pale domes and bell towers, their gold long tarnished. | A small dome under each spire |

## Flavour lines

Resources:

- **Ashwood:** timber from the dead forests, light, grey and slow to burn.
- **Gravestone:** slabs cut from the barrows; the old names are sanded off first.
- **Blackwheat:** dark grain that ripens under fog and bakes into bitter bread.
- **Moth-silk:** thread unwound from moor cocoons, pale and stronger than rope.
- **Iron:** ore from the crags, cold to the touch even in the forge.

Terrain:

- **Deadwood:** a forest that stopped growing and never fell.
- **Barrow hills:** every mound is a grave, and every grave is a quarry.
- **Blackwheat fields:** the only crop that asks for no sun.
- **Moth moor:** the bushes hang heavy with cocoons, and the air is never still.
- **Iron crags:** sharp rock, deep shafts, and veins that ring when struck.
- **The Ashen Waste:** nothing grows here. The Wyrm sleeps under the ash.

## Naming decisions (section 13)

These are recommendations; the spec should be updated to match whichever are accepted.

| Question | Recommendation | Why |
|---|---|---|
| Hamlet / Keep or Outpost / Hold | Keep **Hamlet / Keep** | "The Hold" stays unique to the cathedral on the horizon |
| Win condition | **12 Renown** | It is what the game already plays to; drop "10 holds" from the spec |
| Dice name | **Rune Stones**, and the button reads **"Cast the stones"** | One name everywhere; replaces "Roll the bones" in the spec |
| Victory points | **Renown**, shown with the `star` icon | Already used throughout the game |

## Not in this batch

- Screen and panel mock-ups (section 9), Lore Scroll cards and card back (section 10), the wordmark.
- Reference drawings for the 3D buildings, characters and set pieces (sections 2, 4, 5, 6).
- Colour scripts for the day and night cycle, and the effects (section 11).
- Sound (section 12), which has to be recorded or sourced separately.
