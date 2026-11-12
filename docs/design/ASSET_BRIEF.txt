# Dragonhold: asset redesign brief

A list of everything in the game that needs to be (re)designed, for the design AI. It continues `DRAGONHOLD_DESIGN.md`, which defines the art direction ("gothic shapes, watercolour edges"), and the colour tokens. Every item below must follow that spec.

Items are grouped by type. Each one says what it is, where it appears, what it looks like today, and what is needed.

**Priority:** P1 = seen constantly, P2 = seen often, P3 = rare or nice to have.

---

## 0. Technical delivery rules

| Asset type | Format the code can use directly |
|---|---|
| UI icons | **SVG, `viewBox="0 0 24 24"`**, filled shapes, readable at 18 px and at 48 px. The game adds a 1.4 px ink-plum (`#1E1A26`) outline to every shape, so the design should not rely on hairline details. Use only the colour tokens. Ember gold `#E0A24A` is for fire and light only. |
| Icon variants | Each icon must work on **bone-white plates** and as a **solid bone-white silhouette on the ink-plum bottom bar**. The game turns it into a silhouette there, so the shape must read without colour. |
| Flat art (number tokens, banners, plaques, cards) | SVG, or PNG at 2× size. Sizes are listed per item. |
| 3D models | Today every 3D object is built in code from simple shapes (boxes, cones, cylinders). Either (a) a **description plus reference drawing** (front, side and top views, with proportions in metres) that we rebuild in code, or (b) **glTF/GLB** low-poly models: under 3,000 triangles each, flat colours from the tokens, no textures, no PBR, and 1 unit = 1 metre. |
| Sound | OGG or MP3, short and dry, at −14 LUFS. |

**Scale reference:** a hex tile is 52 m across (30 m from centre to corner). A rider on horseback is about 5 m tall.

---

## 1. Resources (P1)

The five resources, plus the one tile that yields nothing. Each needs **an icon**, used everywhere: the bottom bar, costs, trade, the war-table map, tile banners and the "+1" pop-ups. Each also needs **a short flavour line**.

| Internal key | Name | Comes from (terrain) | Catan equivalent | Current icon | Needed |
|---|---|---|---|---|---|
| `timber` | **Ashwood** | Deadwood | Lumber | a green pine tree | A pale, dead-wood log or a bundle of bare branches. Moss grey and ink. It must not look like a living green tree. |
| `stone` | **Gravestone** | Barrow hills | Brick | a grey rock | A small rounded headstone, or a stack of cut grave slabs. Barrow stone and violet. |
| `wheat` | **Blackwheat** | Blackwheat fields | Grain | a golden wheat sheaf | A sheaf of dark, thin, ink-coloured wheat ears tied with a tarnished-straw band. |
| `cattle` | **Moth-silk** | Moth moor | Wool | a bone cocoon (placeholder) | A moth cocoon, or a spool or skein of pale silk with a small moth. Bone white and ash lavender. |
| `ember` | **Iron** | Iron crags | Ore | a violet ingot (placeholder) | A rough iron ingot, or a lump of ore with a dark sheen. Bruised violet and ink. |
| (none) | **the Ashen Waste** | the Ashen Waste | Desert | n/a | The tile has no resource. Needs a map symbol, currently a little volcano: bone ribs or a sleeping-Wyrm mark. |

Also needed for each resource: a **one-line flavour text** for the help sheet (for example "Ashwood: timber from the dead forests, light and grey").

---

## 2. Terrain tiles (P1)

There are six tile types. Each needs **a flat colour** (already set in the spec), **ground decoration** (3D props scattered on the tile), and **a small map symbol** for the war-table map.

| Terrain | Colour token | Decoration now | Needed |
|---|---|---|---|
| **Deadwood** | moss grey | Bare ink trees, built from a trunk and 3 or 4 branches; they sway | 2 or 3 tree variants (twisted, split, leaning), stumps, and maybe a crow perched. |
| **Barrow hills** | barrow stone | Violet half-dome mounds, each with one standing stone | Barrow mounds with stone doorways, leaning standing stones and a stone circle. |
| **Blackwheat fields** | tarnished straw | Hundreds of thin ink strokes (stalks) | Wheat stalks with heavier ears, a scarecrow, and a small mill (a windmill exists today and needs restyling). |
| **Moth moor** | ash lavender | Bone-white cocoons on the ground | Cocoons hanging from dry bushes, plus moth swarms (animated). |
| **Iron crags** | bruised violet | Sharp ink cones (peaks) | Jagged crag rocks, a mine entrance with a cart, and iron veins. |
| **the Ashen Waste** (centre) | ashen | A **tall volcano** with a crater, ember glow and smoke, plus bone ribcages half-buried in the ash | The volcano silhouette (gothic and jagged), the crater rim, the ribs, and the 3 to 4 dragon eggs sitting in the crater. |
| **Beach and sea** | ashen and ash lavender | A flat sand ring and a flat sea | Sea and shore treatment: still water with mist, and maybe some rocks or wrecks. |

---

## 3. Number tokens and dice (P1)

| Item | Where | Now | Needed |
|---|---|---|---|
| **Number token** (2–12, no 7) | On a pole over each tile; also on the war-table map | A bone disc with an ink numeral, probability pips, and the resource icon above the number. 6 and 8 are dried rose. | The final token design, at 128 × 176 px at 2×. Consider making the pole a gothic iron post or a lantern hook. |
| **Rune Stones** (the two dice) | Thrown in the sky at each harvest | Grey squares with orange glowing numbers, which break the spec | Two carved bone or stone dice, showing faces 1 to 6 (6 images each, or a 3D die). |
| **Harvest Horn** | The harvest timer panel, the "Harvest now" button and the log | 🎺 / 📯 horn icon | A horn icon (bone or antler horn), plus an animation or flash when the harvest starts. |

---

## 4. Buildings and structures (P1)

There is one set for all houses today, coloured per player. The local player is ink plum; rivals are dried rose, moss grey and ash lavender.

| Item | Game role | Now | Needed |
|---|---|---|---|
| **Hamlet** (settlement) | 1 Renown; harvests 1 | A narrow ink tower with a pointed roof, a small chapel, 3 graves and a banner on top | The final model. Should each house get its own gothic variant (see section 7)? |
| **Keep** (city, an upgraded Hamlet) | 2 Renown; harvests 2 | A central spire, two side spires, buttresses, a nave and a rose window | The final model. It must be clearly bigger than a Hamlet from far away. |
| **Wall** (road) | Built on tile edges; blocks rival riders | A grey stone wall with battlements, a walkway in the owner's colour and a small tower at each end | A wall section in gothic style (iron spikes, buttresses). It is about 26 m long and 2.6 m high. |
| **Gate** | In the middle of every wall; opens for its owner; rivals pay a 1-resource toll | Two pillars, a lintel and two door leaves in the owner's colour | Gate design: a portcullis or wrought-iron doors. The open and closed states both matter. |
| **Corner tower** | Fills the corner where 2 or more walls meet with no building there | A round stone tower with battlements | The final design. |
| **Dragon Roost** | Built beside a Keep; holds your dragon egg and dragon | A nest platform made from boxes | A gothic roost: a bone-and-iron cradle or a high perch. |
| **Scorpion Tower** | Blocks Dragonfire and night raids nearby | A wooden tower with a crossbow | A gothic watchtower with a giant crossbow (a scorpion). |
| **Banners and crests** | On every building, on the knight's shield and lance, and on the start screen | A rectangle in the house colour with the house sigil in a circle | A banner shape (swallow-tail or pennant), at 192 × 128 px, one per house (see section 7). |
| **Build signs** (where you can build) | Floating markers at valid spots | Ember-gold ring = can build now; pale ring = allowed but can't afford; faint = future spot. A plaque shows name and cost. | Marker shapes (ground sigils or lanterns) plus the plaque style. |
| **Placement ghost** | A preview of the building under the cursor | A transparent green copy of the model | Ghost style that fits the palette (no green). |

---

## 5. Characters and creatures (P1–P2)

| Item | Now | Needed |
|---|---|---|
| **Lord on horseback** (each player's avatar) | Detailed low-poly: a barded horse and an armoured knight with great helm, kite shield, lance and cloak, in house colours | Final rider and horse design. Should each house have a distinct horse colour, armour shape and helm crest? |
| **Rider name plaque** | A bone pill above the rider, with the name in Cormorant Garamond | The final plaque design. |
| **The Wyrm** (replaces the robber; a 7 moves it) | A coiled sleeping ink dragon with spikes, folded wings and one ember eye, plus a "The Wyrm · no harvest here" plaque | The final Wyrm: a sleeping pose plus an "awake / moving" pose or animation. |
| **Dragon egg** | A glowing orange icosahedron, in the crater and in your Roost | An egg design, plus an "egg being carried" state. |
| **Wyrmling** (young dragon; you can ride it) | Small dragon model | Model and pose. |
| **Grown dragon** (rideable; Dragonfire and Dragon's Eye) | Bigger dragon model | Model, flight pose and fire-breath effect. |
| **Ravens** | Flat ink "V" shapes circling the Hold | A raven silhouette with wing animation. Also needed as the **raven messenger** for trade offers (see section 9). |
| **Moths** | Small pale fluttering dots | Moth sprite (2 frames). |

---

## 6. World set pieces (P2)

| Item | Now | Needed |
|---|---|---|
| **The Hold** | On the horizon: a cathedral-fortress inside a dragon skeleton, with ribs, a spine, a skull, a tail and an ember rose window | The final silhouette and a detailed concept drawing. It is seen from far away only. |
| **Sky** | A lavender gradient, cloud washes, a pale paper sun and moon, and stars at night | Day, dusk and night colour scripts. |
| **Mist banks** | Soft bone-white sprites drifting low | Mist texture (256 × 64, soft edges). |
| **Smoke** (volcano and buildings) | Grey low-poly puffs | Smoke style (painted puffs or a ribbon). |
| **Day and night cycle** | Dawn, day, dusk and night, with ember windows lit at night | Colour script for the 4 times of day. Night is when raids happen, so it must stay readable. |

---

## 7. The four houses (P1)

Each house needs a **name**, a **sigil** (SVG icon), a **one-line description**, and a **banner/crest**. Optionally it also gets a **building variant** and a **rider variant**. The current descriptions still describe the old art style and must be rewritten.

| Key | Name now | Sigil now | Description now (outdated) |
|---|---|---|---|
| `varn` | House Varn | wolf head 🐺 | "Wolves of the north. Turf-roofed longhouses, timber halls behind palisades." |
| `calder` | House Calder | stag head 🦌 | "Stags of the highlands. Grey stone cottages and towered keeps." |
| `morrow` | House Morrow | serpent 🐍 | "Serpents of the fens. Thatched stilt huts and round watchtowers." |
| `ashby` | House Ashby | sun ☀️ | "The sun-house of the south. Sunstone domes and white towers." |

**Colour rule (from the spec):** each player sees themselves as ink plum with a bone-white banner. Rivals are dried rose, moss grey and ash lavender. So a sigil must read in **all four colourings**.

---

## 8. UI icons (P1)

All are 24 × 24 SVG. The emoji named below is only what the code uses internally to place each icon.

### 8a. Buildings and actions

| Icon | Meaning / where |
|---|---|
| `wall` 🧱 | The Wall: build bar and costs |
| `hamlet` 🏠 | The Hamlet: build bar, and the "Home" button |
| `keep` 🏰 | The Keep (upgrade): build bar |
| `roost` / `dragon` 🐉 | The Dragon Roost: build bar; the dragon button; Wyrm messages |
| `tower` 🏹 | The Scorpion Tower: build bar |
| `hammer` 🔨 | Build |
| `trade` ⚖️ | Trade: button and panel |
| `scroll` 📜 | Lore Scrolls: button and panel |
| `fire` 🔥 | Dragonfire button (ember gold allowed) |
| `map` 🗺️ | War map |
| `eye` 👁️ | Camera view toggle; Dragon's Eye |
| `help` ❓ | Help |
| `guide` 🎓 | Guide on/off |
| `dpad` 🎮 | Touch D-pad toggle |
| `goal` 🎯 | "Next goal" card |
| `compass` 🧭 | "Go" button (travel to the goal) |
| `fast` ⏩ | "Harvest now" |
| `gate` 🚪 | Pay the toll / gates |
| `up` ⬆️ | Upgrade |

### 8b. Status and score

| Icon | Meaning / where |
|---|---|
| `star` ★ | **Renown** (victory points): everywhere |
| `crown` 👑 | Renown Scroll; the winner |
| `horn` 🎺📯 | Harvest Horn; Royal Decree |
| `dice` 🎲 | Rune Stones roll (log) |
| `hourglass` ⏳ | Cooldowns |
| `warning` ⚠️ | Errors / "can't do that" |
| `check` ✔️ / `cross` ✖️ | Confirm / cancel |
| `person` 👤 | Human seat (lobby) |
| `gear` 🤖 | AI seat (lobby) |
| `anchor` ⚓ | Arrival / landing |
| `egg` 🥚 | Dragon egg |
| `wyrmling` 🐲 | Wyrmling stage |
| `reavers` 🏴 | Old robber icon; to be replaced by a **Wyrm** icon |

### 8c. Time of day

| Icon | Meaning / where |
|---|---|
| `dawn` 🌅 | Dawn (bountiful harvest) |
| `sun` ☀️ | Day |
| `afternoon` 🌤️ | Afternoon |
| `dusk` 🌇 | Dusk (dusk market) |
| `moon` 🌙 | Night (raids) |
| `night` 🌌 | Deep night |

### 8d. Duels and conflict

| Icon | Meaning / where |
|---|---|
| `swords` ⚔️ | Duel / challenge; Sellsword |
| `shield` 🛡️ | Block (duel move) |
| `feint` 🌀 | Feint (duel move) |
| `yield` 🏳️ | Yield (pay 1 to end a duel) |

### 8e. Trade

| Icon | Meaning / where |
|---|---|
| `raven` 🐦 | Raven offer to other houses |
| `deal` 🤝 | Accepted trade |

### 8f. House sigils

`wolf` 🐺, `stag` 🦌, `serpent` 🐍 and the sun ☀️ (see section 7).

---

## 9. Screens and panels (P1)

Each needs a layout/mock-up in the spec's style: bone plates at 86% opacity, ink text, outlined pills and one ember button.

| Screen | Contents |
|---|---|
| **Start screen** | Logo "DRAGONHOLD" (a wordmark or logo is needed), the tagline, house picker (4 cards), AI-rivals selector (1 to 3), "Play vs AI" (ember), and an online section (name, create game, join by code), plus "How to play". The 3D island slowly orbits behind it. |
| **War table** (landing phase) | A top-down hex map of the whole isle. You click corners to found your first 2 Hamlets and walls, and the landing order is shown. |
| **In-game HUD** | Top left: house name, Renown "x / 12", the score list of all houses. Top centre: harvest timer and "Harvest now". Top right: round minimap with Help, Guide, D-pad and View buttons below. Left: build bar (Wall, Hamlet, Keep, Roost, Tower with costs). Bottom: 5 resource pills and the action buttons (Trade, Scrolls, Dragon, Fire, Map, Home). Centre: the "Next goal" card. Bottom left: message log. |
| **Announcement banner** | Big centred title with a subtitle ("THE WYRM WAKES!", "NIGHT FALLS", and so on). |
| **Trade panel** | A table of the 5 resources with columns Have / You give / You get and +/− steppers. Buttons: Guild trade (4:1, 3:1 at dusk), Offer to houses (raven), Clear and Close. |
| **Raven offer** (incoming trade) | A small card: "House X offers … for …" with Accept and No. Needs a raven illustration. |
| **Lore Scrolls panel** | Your hand of scroll cards plus "Study a scroll" (buy). There are **5 card types** (see section 10). |
| **Duel screen** | Opponent vs you, best of 3. Three move buttons (Strike, Block, Feint), a score shown as pips, a result line, and Yield. |
| **Night raid / toll / challenge prompts** | Floating action buttons: "Raid", "Pay 1 to pass X's gate", and "Challenge X". |
| **Help / rules cheat sheet** | 8 sections in a grid: Renown, Harvests, Costs, Trade, Scrolls, Dragons, Duels, Time of day and Controls. |
| **Lobby** ("War Council") | Invite code, copy-link button, seat list (human or AI), AI-fill selector, and Start. |
| **Win screen** | The winning house, final Renown and "Play again". |
| **Touch D-pad** | 4 direction buttons, plus Climb/Dive while flying a dragon. |
| **Minimap** | A round map with hexes, your position, buildings and walls. The full-screen "war map" mode is the same map, bigger. |

---

## 10. Lore Scroll cards (P2)

These work like development cards. Each needs **card art**: a portrait card about 300 × 420 px, with a title, an icon and a one-line rule.

| Card | Copies | Rule | Icon now |
|---|---|---|---|
| **Sellsword** | 14 | Move the Wyrm and rob a rival there. It counts toward the Mightiest Host (+2 Renown for 3 or more). | ⚔️ |
| **Renown Scroll** | 5 | +1 Renown, kept secret. | 👑 |
| **Wall Builders** | 2 | Build your next 2 walls for free. | 🧱 |
| **Bountiful Harvest** | 2 | Take any 2 resources. | 🌾 |
| **Royal Decree** | 2 | Name a resource; every other house gives you all of theirs. | 📯 |

Also needed: a **card back** design, and **two badge icons**: **Great Wall** (+2 Renown for 5 or more connected walls) and **Mightiest Host** (+2 Renown for 3 or more Sellswords).

---

## 11. Effects and feedback (P2)

| Effect | Now | Needed |
|---|---|---|
| "+1 Ashwood" pop-up over buildings at harvest | Ink text with a bone outline that rises and fades | Pop-up style. |
| Harvest-roll moment | Dice sprites in the sky | Dice throw and landing animation. |
| Dragonfire on a tile | Orange flame cones on the scorched tile | Scorched-tile look plus flames (ember gold). |
| The Wyrm moving | Instant jump | Flight or slither animation between tiles. |
| Lit windows at night | Ember-gold windows on your own buildings | Window glow style. |
| Building placed | The model pops up | A "constructed" effect (dust, ink splash). |
| Resource gained or lost | Its pill flashes (bone for gain, dried rose for loss) | Flash style. |
| Destination marker | A white ring on the ground | Ring style. |

---

## 12. Sound (P3)

All sounds today are simple synth beeps. Needed:

| Sound | When it plays |
|---|---|
| **Horn** | Harvest begins; a scroll is played |
| **Build** | Anything is built; a trade is made |
| **Bad** | An action is refused |
| **Raid** | A 7 / the Wyrm wakes; you lose something |
| **Win** | You win a duel or the game |

Also wanted:
- Dice rolling
- Gate opening and closing
- Hooves walking and galloping
- Dragon wings and roar
- Ravens
- Ambience for day, night and the volcano
- Music: a menu theme and a calm in-game loop

---

## 13. Names and text still to decide

- Game logo / wordmark for **DRAGONHOLD**.
- New descriptions for the four houses (see section 7).
- Whether **Hamlet / Keep** should be renamed to **Outpost / Hold**, as in the spec. Note that "the Hold" is also the cathedral on the horizon, so this needs care.
- Win condition: **12 Renown** now, versus "10 holds" in the spec.
- Name of the dice: "Rune Stones" now, versus "the bones" in the spec ("Roll the bones").
- Flavour lines for the 5 resources and 6 terrains.
