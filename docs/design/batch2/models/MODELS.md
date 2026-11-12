# Dragonhold — 3D model specs

For rebuilding in code from simple shapes (option (a) in the asset brief). All sizes in metres, 1 unit = 1 m. `elevations.svg` shows the buildings' front views to scale. Colours are the spec's tokens; `owner` means the owning player's colour.

General rules:

- Flat, unlit colours. No textures. Stone is `bruised-violet` or `barrow-stone`, roofs and ironwork are `ink-plum`.
- Every roof is a steep spire or gable: height at least 1.2 × its base width. Nothing is flat-topped except battlements.
- Lit windows are small `ember-gold` emissive quads or discs, on the local player's buildings only, brighter at night.
- Everything tall and thin: when in doubt, make it narrower and taller.

## Buildings

| Model | Footprint (W × D) | Height | Build from |
|---|---|---|---|
| **Hamlet** | 14 × 7 | 16, banner to 19 | Tower: box 4 × 4 × 10, pyramid spire 5.2 base × 6. Chapel beside it: box 5 × 7 × 4, gable roof prism to 7, bell-cote box 0.6 × 0.6 × 1.2 on the ridge. Three headstones 0.7 × 0.2 × 1.1 in a row beside the chapel. Pointed-arch door 1.4 × 2.4 on the tower. One ember window at 7 m. Banner pole 3 m on the spire tip, pennant 2.4 × 1.4 in `owner`. |
| **Keep** | 21 × 18 | 32, banner to 34.5 | Nave: box 12 × 18 × 9, gable roof to 13. Central tower: box 5 × 5 × 20, pyramid spire 6 base × 12. Two side towers at the front corners: box 3 × 3 × 14, spires 3.8 base × 8. Four flying buttresses per long side: wedge 1.4 wide at the ground, meeting the wall at 8 m. Rose window: disc Ø 3 at 12.5 m on the central tower, `ember-gold`. Door arch 2.4 × 4. |
| **Wall section** | 26 × 1.6 | 2.6 walkway, 3.4 merlons, 4.1 spike tips | Box 26 × 1.6 × 2.6 in `barrow-stone`. Merlons 1 × 0.5 × 0.8 every 2 m on the outer edge. Iron spikes: cones 0.4 base × 0.7 on every merlon. Buttresses at 6.5 m and 19.5 m: wedges 1.6 wide at the ground. Walkway strip 0.8 wide on top in `owner`. End towers: box 3 × 3 × 5, merlons, pyramid cap to 7.4. |
| **Gate** | 5.6 × 1.8 | 7 | Two pillars 1.6 × 1.8 × 5, 2.4 m apart. Pointed lintel: triangular prism rising from 5 m to 7 m. Portcullis: iron grid 2.4 × 3.6, bars 0.12 thick, 5 vertical and 4 horizontal, with a strip of `owner` colour across the lintel. **Closed:** grid bottom at ground. **Open:** grid raised 3.2 m into the lintel; animate over 0.6 s. |
| **Corner tower** | Ø 4 | 9.6 | Cylinder Ø 4 × 6 (8 sides is enough). Corbel ring Ø 4.6 × 0.5. Merlons 0.7 wide around the ring. Cone cap Ø 3.2 × 3.1. |
| **Dragon Roost** | Ø 8 plinth | 12 | Plinth: tapered cylinder Ø 8 to Ø 6, 3 m tall, `barrow-stone`. Four bone ribs in `bone-white`, evenly spaced, each a curved tube 0.5 thick rising from the plinth edge outward then curling in to 12 m; inside each, a shorter rib to 9.5 m. Iron ring Ø 7.2 at 6 m tying the ribs. Nest in the centre for the egg (see creatures). |
| **Scorpion Tower** | 4 × 4 base, 5 × 5 platform | 19.5 | Shaft: box tapering from 4 × 4 to 3 × 3 over 12 m, `ink-plum`. Platform 5 × 5 × 1 with merlons. Scorpion: bow arc 5.6 wide and 2 deep, stock 3.2 long, on a swivel so it can turn toward targets. Four posts 4 m tall carrying a pyramid roof 5.2 base × 2.5. |

Per-house variants (optional, roof detail only so silhouettes stay comparable):

- **Varn:** crossed beam ends projecting 1 m past each gable peak.
- **Calder:** antler finials, 1.5 m, on every spire tip.
- **Morrow:** spires twisted 45° over their height; Hamlet chapel raised 1.5 m on four stilts.
- **Ashby:** a small dome (hemisphere Ø 3) under each spire, spire shortened by 2 m.

## Markers and previews

- **Build sign:** `sprites/marker-build.svg` laid flat on the ground, 6 m across. Can build now: `ember-gold` at 100%, slow pulse. Allowed but can't afford: `bone-white` at 70%. Future spot: `bone-white` at 25%. Plaque above it uses the `.tag` style from `ui/ui.css`.
- **Placement ghost:** the model in flat `bone-white` at 45% opacity with a 100% `ink-plum` outline. Invalid spot: same, tinted `dried-rose`. No green.
- **Destination marker:** `sprites/marker-destination.svg` flat on the ground, 5 m across, rotating once every 8 s.

## Characters and creatures

| Model | Size | Description |
|---|---|---|
| **Lord on horseback** | 5 tall to the helm, 6 long | Horse: long box body, four thin legs, arched neck, narrow head, caparison (cloth skirt) to the knees in `owner`. Rider: slim torso, great helm with a pointed top, kite shield on the left arm bearing the house sigil, lance 6 m with a pennant in `owner`, cloak to the horse's rump. Armour `bruised-violet`, horse `ink-plum`. Per house, change only the helm crest: wolf ears (Varn), antlers (Calder), a coiled serpent (Morrow), a sun disc (Ashby). |
| **Rider name plaque** | — | `.tag` style: bone pill, ink border, sigil icon then name. |
| **The Wyrm, asleep** | Coil Ø 22, 6 high | Body as a tapering tube coiled 1.5 turns, head resting on the outer coil, wings folded flat as two ridged plates, spine spikes every 1.5 m. `ink-plum` body, `bruised-violet` wing membranes, one `ember-gold` eye, closed to a slit. Breathes: scale the body 2% every 4 s. |
| **The Wyrm, awake** | 30 long, wingspan 34 | Same parts uncoiled: neck raised to 12 m, wings half open, eye fully open and glowing. Moving between tiles: rises 20 m, flies in an arc over 2.5 s, lands and coils over 1 s. |
| **Dragon egg** | 1.6 × 2.2 | Elongated egg (stretched sphere, 10 sides), `barrow-stone` with a band of `bruised-violet` scale shapes and a thin `ember-gold` crack that pulses. Carried: egg at the rider's saddle bow inside a bone-white sling, glow visible from afar. |
| **Wyrmling** | 6 long, wingspan 7 | Grown dragon proportions with a larger head (1.4×), stubby wings and short tail. Sits upright on the Roost. |
| **Grown dragon** | 16 long, wingspan 20 | Slim body, long neck and tail, two legs plus wings (wyvern build), horns swept back. Flight pose: neck and tail in one line, wings beating once per 1.2 s. Saddle and rider visible on the shoulders. |
| **Raven** | wingspan 1.2 (draw at 3 for readability) | `sprites/raven-1.svg` and `raven-2.svg`, alternate every 0.25 s. The messenger raven carries a small bone-white scroll in its feet. |
| **Moth** | 0.4 (draw at 1) | `sprites/moth-1.svg` and `moth-2.svg`, alternate every 0.12 s, drift on a slow sine path. |

## Terrain props

| Terrain | Props |
|---|---|
| **Deadwood** | Three tree variants, 9–14 m: twisted (trunk in three offset segments), split (trunk forks at 5 m), leaning (15° tilt). Three or four bare branches each, no leaves. Stumps Ø 1.2 × 1. One perched raven per two tiles. |
| **Barrow hills** | Mounds: flattened half-spheres Ø 10–14 × 4. Each has a doorway of three stone slabs (two uprights 0.6 × 0.6 × 2.4, one lintel 3 long). Standing stones 0.8 × 0.5 × 3, leaning up to 12°. One stone circle (seven stones, Ø 9) per three tiles. |
| **Blackwheat fields** | Stalks 1.6 tall with a heavier ear (a small elongated diamond) at the top, in rows. Scarecrow: cross of two poles 3.5 tall, ragged cloth, pointed hat. Mill: tapered tower Ø 5 × 11, cone cap, four sail arms 7 long as bare lattice frames, turning once per 10 s. |
| **Moth moor** | Dry bushes: three to five bare stems, 2 tall. Cocoons 0.5 × 1 hanging from the stems, one to three per bush. Moth swarms: 12–20 moth sprites circling within 6 m. |
| **Iron crags** | Crags: clusters of three to five tilted, faceted spikes 8–20 tall. Mine entrance: timber frame 3 × 3 set into a crag, dark interior, a cart (box 1.5 × 1 × 0.8 on four discs) on two rails. Veins: thin `barrow-stone` streaks on the crag faces. |
| **The Ashen Waste** | Volcano: jagged cone Ø 34 × 26, built from eight to ten leaning spikes around a crater Ø 9 so the rim reads as a broken crown. Ember glow disc in the crater, smoke puffs rising. Bone ribcages half-buried: five to seven ribs 4–7 tall along a spine. Three to four dragon eggs in the crater. |
| **Shore and sea** | Shore: `ashen` ring 6 m wide. Sea: flat `ash-lavender` plane, no waves, with mist sprites drifting at 1–3 m. Rocks: dark spikes 2–5 tall near the shore. One or two wrecks: a tilted hull rib frame and a broken mast. |

## The Hold

Seen only on the horizon; build it as a flat or very low-detail silhouette about 400 m wide and 330 m tall, always partly behind mist. Parts: hill, central spire with two flanking towers and a nave, five ribs arcing over each side, skull resting on the hill to one side, tail trailing along the ridge on the other, one ember rose window. Reference: `dragonhold-style-frame.svg` from the first hand-off.
