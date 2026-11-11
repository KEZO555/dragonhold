# DRAGONHOLD: Game Design v0.1

> A first-person, competitive, fantasy settle-and-build game. Rival noble houses race to settle the volcanic isles of **Embervale**, trade, scheme, and raise dragons.
> **Design goal #1:** anyone who knows classic hex-trading board games should understand it in 5 minutes.

---

## 1. The Pitch (one paragraph)
You are the heir of a noble house, landing on the ring of islands around **The Cradle**, a sleeping volcano. You walk the land in first person, claim spots where resource fields meet, and build Hamlets, Roads and Keeps. Every harvest the **Rune Stones** are rolled in the sky, and fields with that number produce. Trade with rivals face to face, send Reavers to raid them, and hatch your house's dragon. The first house to reach **12 Renown** is crowned.

---

## 2. "If you know the board game, you already know this"

| Board-game concept | In Dragonhold |
|---|---|
| Hex tiles that produce resources | Same: **hex regions**, ~60 m across, each a biome you can walk through |
| Number tokens 2–12 | **War banners** with a number planted in the middle of each region |
| Rolling 2 dice on your turn | The **Harvest Horn** sounds at a random interval of **30–60 s** (so you can never time it exactly), and the Rune Stones are cast **twice** per harvest, and two giant **Rune Stones** are rolled in the sky. Everyone sees it |
| Turn order | The **Horn-Bearer** rotates each harvest. They get the decisions a roller would (e.g. moving the Reavers) |
| Roll a 7 → robber | Roll a 7 → **Reaver Raid** (see §5) |
| Settlement / City | **Hamlet** (1 Renown) / **Keep** (2 Renown) |
| Road | **Road**, built by walking along a hex edge |
| Development cards | **Lore Scrolls** |
| Longest road / largest army | **The Great Highway** / **The Mightiest Host** (2 Renown each) |
| 10 points to win | **12 Renown** (the extra 2 accounts for dragons) |
| Ports 3:1 and 2:1 | **Harbors** on the coast |
| Bank 4:1 | **The Merchant Guild** 4:1, at any Hamlet |

**Building snaps to the grid.** Hamlets and Keeps can only go on **corners** where regions meet, and roads only on **edges**. When you hold a blueprint, you see glowing ghost spots on valid corners and edges. This one rule makes a 3D world play exactly like a board.

---

## 3. The World: Embervale

- A **ring of islands** around **The Cradle** volcano in the center, which acts as the "desert" tile: no production, but it's where dragons are born.
- The default map has **19 land regions**, the familiar size, plus coastline with **9 harbors**. Larger maps for 5–6 players come later.
- The map is **randomized every match** (layout + numbers), with an option for a "balanced" preset for beginners.
- Day/night cycle is cosmetic only.

### Fog of War (the mist)
- **Landing = the only full view.** Before landing, every house studies the whole isle on the **war table** (top-down map) and picks its 2 starting Hamlets and Roads there. Hovering a corner shows its regions and total pips.
- **After landing the mist rolls in.** You drop into first person and see only about one region ahead.
- **Live view:** regions next to your Hamlets, Keeps and Roads, plus regions near where you're standing. These show live information: the Reavers' camp and (later) rival construction.
- **Explored:** regions you've seen once stay on your map, dimmed, showing terrain and number but **no live info**.
- **Unexplored:** shown as mist and "?" on the map; number banners are hidden in 3D.
- **Reaver Raids in the mist:** you only learn where the Reavers camped if you can see that region.
- **Dragons lift the mist:** a **Wyrmling** sees far while flying (scouting), and a **Grown Dragon** grants the **Dragon's Eye**, a live view of the entire map.

### Regions & Resources

| Region | Resource | Used for | Look & feel |
|---|---|---|---|
| 🌲 Pinewild | **Timber** | Roads, Hamlets | Dark misty pine forest |
| 🪨 Greyquarry | **Stone** | Roads, Hamlets | Cliffs, quarry pits, cranes |
| 🌾 Goldfield | **Sunwheat** | Hamlets, Keeps, Scrolls | Golden fields, windmills |
| 🐄 Highmoor | **Cattle** | Hamlets, Scrolls, **dragon food** | Rolling moors, shaggy highland cattle |
| 🔥 Ashvent | **Emberstone** | Keeps, Scrolls, **dragon eggs** | Black rock, glowing lava vents |
| 🌋 The Cradle | none | Dragon eggs | Volcano, nests, ancient ruins |

(Mapping for veterans: Timber=wood, Stone=brick, Sunwheat=wheat, Cattle=sheep, Emberstone=ore.)

---

## 4. Building Costs

| Build | Cost | Renown | Notes |
|---|---|---|---|
| **Road** | 1 Timber, 1 Stone | 0 | On edges; connects your holdings |
| **Hamlet** | 1 Timber, 1 Stone, 1 Sunwheat, 1 Cattle | 1 | Corners only; 2-edge distance rule |
| **Keep** (upgrade Hamlet) | 2 Sunwheat, 3 Emberstone | 2 | Produces double |
| **Lore Scroll** | 1 Sunwheat, 1 Cattle, 1 Emberstone | varies | Draw a random scroll |
| **Dragon Roost** (on a Keep) | 2 Stone, 2 Emberstone, 1 Timber | 0 | Required to claim an egg |

Same costs players already know, so there's nothing new to memorize.

### Lore Scrolls (development cards)
- **Sellsword** ×14: move the Reavers, steal 1 resource; counts toward Mightiest Host
- **Renown Scroll** ×5: +1 hidden Renown
- **Road Builders** ×2: 2 free roads
- **Bountiful Harvest** ×2: take any 2 resources
- **Royal Decree** ×2: name a resource; all players give you theirs

---

## 5. Reaver Raids (the "7")
When the Rune Stones show **7**:
1. **No production.** War horns sound and Reaver longships appear.
2. Anyone with **more than 7 resources** in their Hold loses half (they choose which).
3. The **Horn-Bearer** chooses a region to raid. A Reaver warcamp appears there, it **stops producing**, and the Horn-Bearer steals 1 random resource from one player touching it.
4. The warcamp stays until moved by the next 7 or a Sellsword. (Later version: players can fight the camp in first person to clear it.)

---

## 6. Dragons 🐉 (every house gets one)

The new layer on top of the familiar rules. It's optional to pursue, but strong.

| Stage | How to advance | Upkeep | Power | Renown |
|---|---|---|---|---|
| **1. Claim an Egg** | Build a Dragon Roost, then walk to The Cradle and carry an egg home (other players can see you!) | none | none | 0 |
| **2. Incubate** | Feed **1 Emberstone** to the egg on 3 harvests | — | none | 0 |
| **3. Wyrmling** | Feed **2 Cattle** on 3 harvests | 1 Cattle every 3rd harvest | **Ride & fly**: fast travel; sees far through the mist while flying | +1 |
| **4. Grown Dragon** | Done | 1 Cattle + 1 Emberstone every 3rd harvest | **Dragonfire** (below) + **Dragon's Eye** (whole map visible, live) | +2 total |

**Dragonfire** (once every 3 harvests): fly over an enemy region and scorch it. That region produces **nothing for the owner(s) for 1 harvest**. You can't scorch a region with a **Scorpion Tower** next to it (a ballista; costs 2 Stone, 1 Timber, 1 Emberstone).

**Hungry dragons:** miss an upkeep and your dragon goes *Restless*: no powers until fed. It never dies (no feel-bad moments for new players).

**Why it's balanced:** a dragon is worth 2 Renown, the same as a Keep, but costs much more. Players pay for **power and speed**, not raw points. You can win without one.

---

## 7. How a Match Flows (~30–45 min)

1. **Landing (setup):** On the top-down **war table**, the only time anyone sees the whole map, each house picks 2 starting corners in snake order (1-2-3-4-4-3-2-1), placing a Hamlet + Road each. You get the resources from your 2nd Hamlet, as usual. Then the mist rolls in.
2. **Settling (early):** Drop into first person. Harvests every 30–60 s, two casts each. Walk, build roads, claim corners before rivals do.
3. **Scheming (mid):** Trades, Reavers, Keeps, Lore Scrolls. Dragon Roosts appear.
4. **Dragonfall (late):** Dragons in the sky, scorching, races for the Great Highway.
5. **Crowning:** The first to 12 Renown wins. A short cinematic: your banner flies over The Cradle.

### Movement & Distance
- You walk (fast, Minecraft-like speed) and can **sprint on your own roads**.
- **Build anywhere adjacent to your network, but you must be within ~2 regions of the spot.** That makes position and movement matter without punishing slow players.
- **Recall Horn:** teleport back to any of your Hamlets (30 s cooldown).
- Resources go **straight into your Hold** (shared storehouse). No hauling in v1, to keep it easy. *An optional "Hard Roads" mode could add carts and hauling.*

### Trading
- **Face to face:** walk up to a rival and press **T** to open a trade window (proximity voice chat online).
- **Raven trade:** send an offer to anyone from anywhere, but it takes 15 s to arrive.
- **Merchant Guild 4:1** at any of your Hamlets; **Harbors** 3:1 / 2:1 if you own one.

---

### Duels (face to face)
- When two lords meet (within ~7 m) either may **Challenge**; AI lords block your path, more often when you lead, carry 5+ resources, or walk on their land
- **Best of 3:** Strike beats Feint, Feint beats Block, Block beats Strike; a tied round goes to the mightier lord
- **Might** = 1 + Sellswords played + fighting on your own land + a grown dragon
- **Winner** takes 2 random resources (3 if 2+ mightier); the **loser** is knocked back and dazed for 2 s; the same pair can't fight again for 45 s; **Yield** pays 1 resource
- Online: person vs AI is played on the person's screen; person vs person is settled by might + luck on the host

## 8. Houses (cosmetic + architecture in v1, for easy learning)
Players choose a house for color, banner, and dragon look:
- **House Varn** 🟥: red & black, wolf sigil, crimson dragon
- **House Calder** 🟦: blue & silver, stag sigil, frost-blue dragon
- **House Morrow** 🟩: green & bronze, serpent sigil, jade dragon
- **House Ashby** 🟨: gold & white, sun sigil, golden dragon

*Later: an "Advanced Houses" mode where each house has one small perk (e.g. Calder trades 3:1 in Stone).*

---

---

## 8b. Art Direction: "Comic Saga" (comics / animation)
Low-poly shapes drawn like an animated fantasy comic:
- **Cel shading:** 3 flat tones per surface instead of smooth lighting.
- **Ink outlines:** bold black lines on every silhouette and sharp edge; lines fade out in the mist.
- **Halftone dots** in deep shadows (most visible at dusk and night).
- **Punchy colors:** bright, readable lands; saturated sunsets.
- **Comic HUD:** cream "paper" panels with thick ink borders and offset shadows; big lettered announcements ("REAVER RAID!") that pop in at an angle; caption-box signs for building.
- Touchstones: *Borderlands* (ink lines), *Hi-Fi Rush* / *Sable* (cel color), animated fantasy series.

### Day / Night Cycle
- A full day lasts **~8 minutes** (about 4–6 days per match). Days are longer than nights for readability.
- Dawn → morning → midday → afternoon → **painted sunset** → twilight → **starry night with a moon** → before dawn.
- At night: windows and torches glow, the volcano's lava burns brighter, and the mist gets thicker (shorter sight).
- *Gameplay ideas for later (not decided):* Reavers strike harder at night; dragons see in the dark; some Lore Scrolls only work at night.

### Architecture per House
| House | Sigil | Style | Hamlet | Keep |
|---|---|---|---|---|
| **Varn** | 🐺 red | Nordic | Turf-roofed longhouse + thatched hut | Great hall behind a palisade, wooden watchtower |
| **Calder** | 🦌 blue | Highland stone | Stone cottages with slate roofs and chimneys | Square stone keep with 4 round corner towers |
| **Morrow** | 🐍 green | Fenland | Round thatched huts on stilts | Mossy round tower with a balcony, huts at its foot |
| **Ashby** | ☀️ gold | Southern sunstone | Sandstone houses with small domes and awnings | Citadel with a great golden dome and slender white towers |

House color is always on roofs, banners, and road stripes so ownership reads instantly from a distance.

### Dragons: big and scary
Dragons are **heavy, armored, and frightening**, not sleek. Thick horned skulls, jagged spines, tattered leathery wings, scales like cooled lava rock with **glowing ember cracks** in the house's color. They fly low and slow, cast huge shadows, and shake the ground when they land. Dragonfire leaves scorched black ground and drifting embers. Each house's dragon matches its house color: crimson (Varn), frost-blue (Calder), jade (Morrow), gold (Ashby).

---

## 9. Single-player AI Rivals
AI houses follow the same rules. Planned difficulty levels:
- **Squire (easy):** builds greedily and trades fairly.
- **Lord (normal):** plans Keeps and roads and uses the Reavers on the leader.
- **Warlord (hard):** pursues dragons, scorches the leader, and refuses trades with the leading player.

AI lords move around the world physically, so you **see** them walking to claim a corner.

---

## 10. Online Multiplayer
- 2–4 players (5–6 later), friends via invite code.
- Empty seats are filled by AI.
- The host runs the authoritative game state; clients send actions ("build Hamlet at corner 34").

---

## 11. Prototype Plan (browser, Three.js)

**Milestone 1: "Walk the Isles"** (first playable)
- Generated 19-region hex island with 5 biome looks, number banners, The Cradle
- First-person walking (WASD + mouse), sprint, jump
- Harvest Horn timer + Rune Stone roll + production into your Hold (HUD)
- Build Road / Hamlet / Keep with snapping ghost previews and cost checks
- Renown counter, win at 12 (was 10 until dragons arrived)

**Milestone 2: "Rivals"** ✅ (prototype)
- 1–3 AI houses (chosen on the start screen), each in its own architecture
- Landing in snake order on the war table (AI picks by pips + resource variety)
- AI lords walk the isles in person to build (hidden by the mist unless you can see them)
- Horn-Bearer rotates each harvest; on a 7 the Horn-Bearer sends the Reavers and robs a rival (you pick on the war map when it's you)
- Trading: Merchant Guild 4:1, **Raven offers** 1:1 to the houses (they accept only if it helps them and you are not 3+ Renown ahead), and AI houses send you offers (Y/N)
- Great Highway can be taken by a longer road; rival settlements cut roads
- Ravens report rival Hamlets/Keeps you can't see; the scoreboard is public
- **Lore Scrolls** ✅: buy for 🌾🐄🔥 from a shared library of 25 (press **L**). Playable from the next harvest, one per harvest per house. Sellsword ×14 (move Reavers + rob; 3+ and the most = **Mightiest Host +2★**), Renown Scroll ×5 (secret +1★), Road Builders ×2, Bountiful Harvest ×2, Royal Decree ×2. AI houses buy and play them too.

**Milestone 3: "Dragonfall"** ✅ (prototype)
- **Dragon Roost** (key 4, 🪨🪨🔥🔥🌲) beside one of your Keeps, one per house
- **Eggs:** one per house waits in the Cradle. Walk up and press **E**, then carry it home (70% speed; rivals can see you). AI lords make the same trip
- **Growth (automatic each harvest):** egg eats 🔥 ×3 → **Wyrmling** (+1★, rideable) eats 🐄🐄 ×3 → **Grown Dragon** (+2★)
- **Upkeep:** a grown dragon eats 🐄🔥 every 3rd harvest; if it can't, it turns **Restless** (sulks on its roost: no riding, fire or Dragon's Eye until fed)
- **Riding (F):** fly with W/Space/C/Shift; the higher you fly, the further you see through the mist
- **Dragonfire (G / click while riding, grown only):** scorch a region with rival holdings: it yields nothing next harvest; recovers after 3 harvests
- **Dragon's Eye:** a grown, fed dragon lifts the mist for good
- **Scorpion Tower** (key 5, 🪨🪨🌲🔥, up to 3): regions touching it cannot be scorched by rival dragons
- **AI:** builds Roosts (at 4+ Renown), fetches eggs, raises dragons, scorches the leader's best regions, builds towers when rival dragons appear

**Milestone 4: "Online"** ✅ (prototype)
- One Render web service (`render.yaml`) serves the game and relays messages over WebSockets
- **CREATE GAME** gives an invite code (e.g. `WOLF-42`) and a link; friends **JOIN** with their name; up to 4 players
- The **host's browser is authoritative**: it runs rules, dice, AI and dragons and sends each friend a snapshot 10×/s; friends send actions that the host validates again
- Friends load the same island from the host's world seed; other houses' Lore Scrolls stay hidden in snapshots
- Empty seats → AI houses; a friend who leaves is replaced by an AI steward
- Online games never pause (panels and Reaver choices don't stop the world); a remote Horn-Bearer has 25 s to choose
- *Not yet:* proximity voice, player-to-player raven trades, rejoining after a disconnect, the host leaving ends the game
---

## 11b. Pacing (measured in AI-only simulations)
- Harvest every 30–60 s, Rune Stones cast twice, goal **12 Renown**
- 3 AI houses reached 12 after **29–35 harvests ≈ 23–28 min**; with a human player (trading, pauses, competition) expect ~30–40 min

## 12. Open Questions
- [x] Name: **Dragonhold** (for now)
- [x] Combat: no first-person PvP; conflict through Reavers and Dragonfire
- [x] Harvest speed: random 30–60 s per harvest, Rune Stones cast twice per harvest (first harvest after landing at 15 s)
- [x] Art style: low-poly stylized
