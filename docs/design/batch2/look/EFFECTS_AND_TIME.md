# Dragonhold — time of day and effects

## Time of day

Values are in `time-of-day.json`. Blend between neighbouring keyframes over 20–30 s; never cut.

| Key | Sky top | Sky horizon | Fog | Scene tint (multiply) | Ember glow | Mist | Stars |
|---|---|---|---|---|---|---|---|
| `dawn` | `#8E8AA3` | `#E6CFC8` | `#D9CFD2` | `#F3E6E0` | 0.5 | 0.9 | 0 |
| `day` | `#A9A5BA` | `#EDE6DA` | `#B9B4C6` | `#FFFFFF` | 0.25 | 0.6 | 0 |
| `afternoon` | `#9C97AE` | `#E9DFCF` | `#BDB6C2` | `#F6EEE2` | 0.3 | 0.5 | 0 |
| `dusk` | `#5A5070` | `#C79AA0` | `#8E8AA3` | `#D9C3CC` | 0.8 | 0.7 | 0.15 |
| `night` | `#1E1A26` | `#3A3350` | `#4A4460` | `#8F8BB0` | 1.0 | 0.8 | 0.6 |
| `deep_night` | `#17141E` | `#2C2740` | `#3A3350` | `#7873A0` | 1.0 | 0.9 | 1.0 |

- The sky is a vertical blend from sky top to sky horizon, with soft cloud washes one step darker than sky top.
- The sun and moon are bare-paper discs (`#EDE6DA`), never yellow. Stars are small bone-white dots, no twinkle faster than 2 s.
- Dawn and dusk tint the horizon toward rose; that is the only time rose appears in the sky.

Keeping night readable (raids happen then):

- Scene tint never goes darker than the `deep_night` value; tiles must stay distinguishable by lightness.
- Number tokens, name plaques and banners ignore the scene tint and stay at full bone-white.
- Add a thin `ash-lavender` rim light to riders, dragons and the Wyrm at night.
- Lit windows and lanterns are the brightest things on screen; a raid target gets a slow `dried-rose` pulse on its outline.

## Effects

| Effect | Look | Timing |
|---|---|---|
| **"+1 Ashwood" pop-up** | `.popup` style: ink text, 4 px bone outline, resource icon before the text. Losses in `dried-rose`. | Rises 2 m over 1.2 s, fades in the last 0.4 s |
| **Rune Stone cast** | Two bone dice (3D boxes with the `dice/` faces, or sprites) arc up from the horn, tumble, and land face-up in the top-centre plate. On landing, a small ink splash ring. | 0.9 s flight, 0.3 s settle, result held 2 s |
| **Harvest starts** | Horn icon scales 1 → 1.25 → 1; a bone-white ring expands from the horn plate; tiles with the rolled number flash to `bone-white` at 40% for 0.3 s. | 0.6 s |
| **Dragonfire on a tile** | Flames as `ember-gold` teardrop sprites with bone-white cores, 3–6 m tall, flickering. Afterwards the tile is scorched: colour multiplied by `#3A3350` at 60% with an `ink-plum` soot blot and thin ember cracks that fade. | Flames 3 s; scorch lasts as long as the rule says |
| **The Wyrm moving** | See MODELS.md. Mist is pushed outward where it lands. Announcement banner "THE WYRM WAKES". | 2.5 s flight, 1 s coil |
| **Lit windows** | `ember-gold` quads plus a soft radial glow sprite, 3× the window size, at the time-of-day ember value. Gentle flicker ±10%. | Continuous |
| **Building placed** | An ink splash blot on the ground (dark, irregular, 1.5× the footprint) that shrinks away as the model rises from 0 to full height, then three small ashen dust puffs. | 0.5 s rise, 0.4 s dust |
| **Resource gained or lost** | The pill's border and count flash: bone-white fill at 100% for a gain, `dried-rose` fill for a loss, then ease back. | 0.15 s in, 0.5 s out |
| **Destination marker** | `sprites/marker-destination.svg` flat on the ground. | Rotates once per 8 s, fades out on arrival over 0.3 s |
| **Smoke** | `sprites/smoke-puff.svg` as billboards, rising and growing 1 → 2.5×, fading out. Chimneys: one puff per 1.5 s. Volcano: three per second, larger, tinted toward `bruised-violet`. | 4–6 s life |
| **Mist banks** | `sprites/mist.png` (256 × 64), stretched 40–120 m wide, drifting at 0.5–1 m/s, at the time-of-day mist opacity. | Continuous |
