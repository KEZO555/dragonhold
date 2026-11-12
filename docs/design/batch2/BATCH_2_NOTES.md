# Dragonhold assets — batch 2

Covers `ASSET_BRIEF` sections 2, 4, 5 and 6 (as model specs), 9, 10, 11, the day and night cycle, and the wordmark. Follows `DRAGONHOLD_DESIGN.md` and the naming recommended in batch 1 (Hamlet / Keep, 12 Renown, Rune Stones).

| Folder | Contents |
|---|---|
| `ui/ui.css` | The UI kit: colour tokens as CSS variables and every component class (plate, panel, bar, pill, round button, chip, tag, popup, announcement, table, cards). All classes are scoped under `.dh`. |
| `ui/ui-kit.html` | Ten screens built with that CSS, each in a `div` with an id: `hud`, `start`, `war-table`, `trade`, `scrolls`, `duel`, `lobby`, `win`, `help`, `overlays`. Open it in a browser; copy the markup. |
| `cards/` | Five Lore Scroll cards and `card-back.svg` at 300 × 420, plus `badge-great-wall.svg` and `badge-mightiest-host.svg` at 96 × 96. |
| `logo/wordmark.svg` | The DRAGONHOLD wordmark, 1200 × 200. |
| `models/MODELS.md` | Dimensions and build-from-shapes descriptions for every building, creature, terrain prop and marker. |
| `models/elevations.svg` | Front views of the buildings to scale, with a 10 m bar. |
| `sprites/` | Raven (2 frames), moth (2 frames), smoke puff, destination marker, build marker, and `mist.png` (256 × 64). |
| `look/time-of-day.json` | Six colour keyframes for the day and night cycle. |
| `look/EFFECTS_AND_TIME.md` | The colour script explained, night-readability rules, and the look and timing of each effect. |

Things to know:

- Titles, the wordmark and card titles use Grenze Gotisch 700; body text and number tokens use Cormorant Garamond. Both are Google Fonts and are live text in the SVGs, so load them before rasterising or they fall back to a generic serif.
- The UI is square-cornered with double ink rules (medieval plaques), not rounded pills.
- `overlays` in the UI kit holds the small pieces: announcement banner, raven offer, raid / toll / challenge prompts, name plaques, build plaque, pop-ups, touch D-pad with Climb and Dive, and the minimap.
- Placeholders to fill in: `[COST]` for the Dragon Roost, Scorpion Tower and studying a scroll, and `[YOUR CONTROLS]` in the help sheet. The Wall, Hamlet and Keep costs shown are standard Catan costs and should be checked against the game.
- The duel text does not say which move beats which, because the brief does not either.
- The invite code, player names and scores in the mock-ups are sample values.
- Model views are front elevations only; depth is given in the tables in `MODELS.md`.
- Sound (section 12) is not included.
