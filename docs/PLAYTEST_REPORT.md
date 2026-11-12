# Kingdom of Dragons: Playtest Report

*Playtester / game-UX review, 2026-11-12. Desktop 1366×768 and iPhone 13 (Playwright, software WebGL).*

All screenshots and scripts are in
`/tmp/claude-0/-home-user-dragonhold/facfd847-f271-5ad6-be82-e539a50909d9/scratchpad/playtest/`
(below shortened to `PT/`). Screenshots are in `PT/shots/` and `PT/tour/`.

**What I played**

- Two long desktop sessions with real clicks:
  - `play.js`: about 15 min real time, unassisted.
  - `play2.js`: 16 harvests. I used hooks only to skip harvest countdowns and walks longer than 25 s.
- A phone session with real taps (`phone.js`).
- Targeted probes (`probe.js`, `states.js`): scrolls, a 7 with 11 cards, a night raid, a duel, walls and tolls, camera views.
- A natural-time pacing simulation (`pace.js`).

In these sessions I placed the landing by clicking the war map, built Walls and a Keep, traded at the Guild and by raven, bought and played scrolls, moved the Wyrm, raided, and duelled. One limit: the software renderer ran at about 1.5 fps. Because `dt` is capped at 0.05, the game ran at about 0.08× real time, so I judged timing from game time, not wall-clock time.

---

## Verdict

The game looks distinctive and is unified. The core loop really is Catan, and the pieces a Catan player needs are present: a coach line, a pip read-out on the war table, clear trade and duel panels, and a good one-page rule sheet.

**The first five minutes break down in specific, fixable places:**

- On phones you cannot place your starting Hamlets: the war map is 92 px wide.
- On desktop, the instruction for that step is hidden *behind* the map.
- After the first harvest, the "Cast the stones" button disappears for good, and so does the warning about holding more than 7 cards.
- "Click a gold sign" does not work on the sign itself.
- The coach repeatedly suggests trades the AI always refuses.

The economy also feels starved. After 16 harvests (32 casts) I had built only walls, and the Wyrm spent most of that time on my best region. Fix the top five items below and the game becomes easy to learn for its target audience. Most of them are small fixes.

---

## Top 10 recommendations (ranked by impact on a new player)

### 1. Make the war map usable on phones (landing, Wyrm pick, Map button)

**Problem.**
- In the phone layout (`index.html` ~l.729), `#minimap { width:92px !important; height:92px !important; }` also overrides `#minimap.big`.
- So on an iPhone the landing War Table, the Horn/Sellsword "pick a region" map and the **Map** button all show a 92×92 px map.
- Neighbouring corners are **9.2 CSS px apart**. Apple's minimum touch target is 44 px.
- Taps a few pixels off (as a finger would land) failed 4 of 4 times. Only pixel-exact taps placed anything.
- Pressing **Map** leaves it at 92 px.

**Evidence.** `PT/shots/M_002_landing_hamlet.png`, `M_013_sellsword_pick.png`, `M_007_map_button.png`, `PT/tour/ph_02_wartable.png`, `ph_13_map.png`; log in `PT/phone.log`.

**Why it matters.** Phones are a stated target. A phone player cannot start a game reliably, and every 7 they roll as Horn-Bearer becomes a pixel hunt.

**Fix.**
- Add a phone rule after the 92 px one: `#minimap.big { top:50% !important; left:50% !important; right:auto !important; width:min(96vw,70vh) !important; height:min(96vw,70vh) !important; transform:translate(-50%,-50%) !important; }`.
- In `mapTargetAt`, scale the snap radius (11 world units) to at least about 22 px on screen.
- Hide the D-pad, build bar and landing banner while the map is big.
- Optionally add pinch-zoom, or a "tap a hex, then tap a corner" two-step for touch.

**Effort:** S (CSS), M (two-step touch picking).

### 2. Never hide the instruction behind the war map (desktop)

**Problem.** In the landing phase and in the Horn pick after a 7, the only instruction is in `#objective`:
- "🎯 Your turn · Click a gold dot on the map…"
- "Click a region on the map: the Wyrm blocks it…"

`#objective` sits at the bottom centre, and the big map (`z-index:5`) covers it. `elementFromPoint` at the coach's centre returns `minimap`. The player sees "Landing: found your first two Hamlets" at the top, and in the Horn pick a map just pops up with **no text at all**.

**Evidence.** `PT/shots/D_002_wartable.png`, `D_003_landing_hamlet1.png`, `D_026_horn.png`; `PT/play_d.log` line 1.

**Why it matters.** This is the very first decision in the game, and the Horn pick is a key Catan moment. The text exists but cannot be seen.

**Fix.**
- While `#minimap.big` is open, raise `#objective` above it (`z-index:6`) and dock it under the top plate, or render the prompt inside the map frame.
- For the Horn pick, add a big title on the map: "You hold the Horn: click a region to send the Wyrm".

**Effort:** S.

### 3. Fix the `state.rolling` bug: "Cast the stones" vanishes and the 7-card warning never fires

**Problem.**
- `simStep` counts `state.rolling` down with `rolling -= dt` and resolves when it is `<= 0`. It is never reset to 0, so after the first cast it stays a small negative number such as `-0.04`, which is truthy.
- `idle = … && !state.rolling …` (game.js ~l.4373) is therefore false forever. The **Cast the stones** button is shown only before the first harvest.
- `dangerGoal()` (l.2763) requires `!state.rolling`, so "⚠ You hold N cards… if the stones show 7 you lose half" **never** appears after the first cast.
- Meanwhile the coach keeps saying "Nothing to do? Press **Cast the stones**". That button no longer exists.

**Evidence.**
- The button is present in `PT/tour/d_03_landed.png` and absent in every later screenshot, e.g. `PT/shots/L_008…`, `L_018_end.png`, `S_006_warning_9cards.png`.
- With 11 cards and 9 s to the harvest, the coach said "Build a Wall…" (`PT/states.log`).
- `play2.log` END state shows `"rolling":-0.04`.

**Why it matters.**
- The skip button is the main cure for dead time in the early game.
- The 7-card warning is the single most useful hint for Catan newcomers to this format. Without it, a 7 in the background feels like an ambush.

**Fix.** In `simStep` and `guestStep`, set `state.rolling = 0;` when resolving. Alternatively, test `state.rolling > 0` in both places.

**Effort:** S (one line).

### 4. Starved, punishing early game, and a coach that recommends dead-end trades

**Problem.**
- After 16 harvests (32 casts) in `play2.js` my house had built only 3 Walls. It never had the Moth-silk for a Hamlet.
- 3 of the 4 Wyrm placements in that session landed on my regions while every house was tied at 2 Renown. It robbed me twice and sat on my best region (6) from harvest 11 to the end.
- The coach told me 4 times in a row to "Offer a spare … give 1, get 1 → Offer to houses". Each time it was **"✖ No takers. has too few · needs its · needs its"**.
- In `play.js` the coach showed the same "Only 1 🌲 1 🪨 short… give 1 get 1" advice for 15 minutes. One 1-for-1 offer cannot cover a 2-card shortfall.
- Caveat: I skipped harvest countdowns, which also shortened the AIs' walking time. The resource starvation is real anyway; it depends on the dice, not the clock.

**Evidence.** `PT/play2.log` (harvests 1–16), `PT/play_d.log`, `PT/shots/L_009_raven_sent.png`.

**Why it matters.** Catan players accept bad luck, but they also expect trading to rescue them. Advice that always fails teaches players to ignore the coach.

**Fix.**
- **Coach:** in `tradeGoal`, only suggest a raven offer if `players.some(p => p.ai && !aiAccepts(p, give, get))`. Otherwise suggest the Guild, a Scroll, or "build toward a 🦋 region".
- **Coach:** suggest giving 2 for 2 when 2 cards are missing.
- **AI:** let AI accept a 1:1 when the card they *get* is one they lack, even if they "need" what they give (`needs its` is too strict early).
- **Beginner mode:** the starting Hamlet pays 1 of each adjacent resource (as in Catan), plus a 3:1 Guild for the first day.
- **AI Wyrm targeting:** break ties away from the human, or never target someone at or below the average Renown.

**Effort:** M.

### 5. Clicking the floating gold sign does nothing; only the ground ring works

**Problem.**
- `tapAt` raycasts to the **ground** (`groundAt`) and then searches 8 m around that point (`targetNear`).
- The floating sign is 5.5 m (Hamlet) or 12 m (Keep) above its corner, so a click on the sign hits ground far behind it, or the sky. Nothing happens and no message appears.
- The README, coach and rules all say "click a gold sign", and the floating sign is the most visible thing on screen.
- In the probe, hovering at 50–140 px above the corner showed no tooltip. Clicking the sign did nothing; clicking the ring on the ground built the Keep.

**Evidence.** `PT/probe.log` (B), `PT/shots/X_002_keep_sign_view.png`, `X_003_hover_on_keep_sign.png`.

**Why it matters.** "I clicked the gold thing and nothing happened" is the classic first-minute rage-quit.

**Fix.** Before `groundAt`, raycast `cornerSigns[i].label` and `edgeSigns[i].label` (and their stakes/rings). On a hit, use that corner or edge as the target. Also hit-test the hover tooltip the same way.

**Effort:** S–M.

### 6. Camera, spawn point and building scale fight the player

**Problem.**
- You spawn right against your own buildings. In `play.js` a windmill blade and a dark wall filled half the screen for the entire session (`D_007_landed.png` … `D_030_end.png`).
- Walls are castle-sized, and placement ghosts are huge green or red castles that fill the view (`L_002_aim_road.png`, `L_018_end.png`).
- The camera clips into walls and buildings. Near a rival wall the screen became a solid green slab (`X_009_rival_wall_after.png`). The "High" view put the camera inside a Keep and the screen was solid purple (`X_007_view_View_High.png`). At night beside a rival Hamlet the view was mostly black (`S_009_night_near_rival.png`).
- A new wall is hard to spot after building it (`L_003_built_road.png`).
- On phone, a floating "Wall" sign can fill the whole 3D view (`M_013_sellsword_pick.png`).

**Why it matters.** Spatial confusion is the main cost of turning a board game into first person. Every lost second spent turning around is felt.

**Fix.**
- Spawn 18–25 m inland of your Hamlet, facing it and the island centre.
- Pull the third-person camera in front of occluders (raycast against buildings and walls).
- Shrink the ghosts, or draw them as outlines.
- Add a **"Board view"** button: a high top-down camera where you click corners and edges directly (see Bigger ideas).

**Effort:** M.

### 7. The coach's "Go" button misses clicks

**Problem.**
- `updateObjective()` rewrites `#objective.innerHTML`, including a new `#goBtn`, every 700 ms.
- If the button is replaced between mousedown and mouseup, the click is lost.
- With normal 120 ms clicks, only **12 of 16** clicks started the walk (`PT/probe.log`, A).
- Playwright's own clicks also failed with "element is not attached" (`PT/play2.log`).

**Why it matters.** Go is the beginner's main navigation aid. A button that ignores one click in four feels broken.

**Fix.** Only touch the DOM when the text changes (`if (html !== o._last)`). Keep one persistent Go button and update its handler or target instead of recreating it.

**Effort:** S.

### 8. The phone HUD leaves almost no world to look at, and controls overlap

**Problem (iPhone 13).**
- HUD plates cover about 60% of the screen. The 3D view is a strip in the middle.
- The build bar shows icons only, **no costs** (`#buildMenu .slot > div { display:none }`).
- The "Placing: Wall ✕" chip (`bottom:196px`) sits on top of the coach (`bottom:150px`) and hides its text. Measured overlap: chip y 431–468 inside coach y 416–514 (`M_008_build_wall_mode.png`, `PT/tour/ph_05_mode_wall.png`).
- The D-pad is drawn over the "War Table" and "Houses Have Landed" banners. The banner covers the top buttons (`ph_02`, `ph_04`).
- The D-pad is shown during landing, when walking is impossible.
- Help's only Close button is at y≈1339 in a 664 px viewport: about two screens of scrolling, with no ✕ at the top and no tap-outside-to-close (`M_017_help.png`). My scripted tap on it missed and Help stayed open (`M_018`).

**Fix.**
- Collapse resource plates and actions into one bottom row, and put the build costs into a tap-to-expand drawer.
- Move `#modeChip` into the coach panel.
- Hide the D-pad during landing and while overlays are open.
- Add a sticky ✕ to every overlay, and close on backdrop tap.

**Effort:** M.

### 9. Coach accuracy and wording

The coach is the best idea in the UI. It needs to be right every time:

- **Pips.** Landing says "More **dots under the numbers** = more harvests", but the war-map numbers have no dots. Only 6/8 are red, and pips appear only on the desktop hover read-out (`X_001_landing_hover.png`), which phones never see. Fix: draw pip dots under the map numbers.
- **Bad number advice.** "The stones showed 3: none of your lands. You harvest on 4, 6, 8, 9. Plots on **5** harvest far more often". 5 is not better than the 6 and 8 you already own (`PT/play2.log`). Only suggest numbers with more pips than your worst one.
- **Wrong target.** Right after the first Wall it said "Saving for a **Keep**: you need 2🌾 3🔩", when the cheaper and correct next goal is a Hamlet.
- **Status shown as a goal.** "🎯 Next goal" is also used for status lines, e.g. "Next goal: The Wyrm now sits on your Moth moor (8)…" (`PT/tour/d_15_wyrm_moved.png`). Use a different tag (⚠/ℹ) for reactions.
- **Placement mode stays on.** After a build, the blueprint stays selected while you can still afford it. The coach then stays stuck on "Placing a Wall… 9 spots glow gold" and suppresses all other advice (`L_018_end.png`). Clear the mode after each build, or say "Place another, or press ✕".

**Effort:** S each.

### 10. Mouse-only and touch gaps, plus pausing

- **Help does not pause.** Trade and Scrolls set `state.paused`; Help doesn't. Reading the rules mid-game lets harvests, 7s and AI raids happen behind the sheet. Fix: pause on Help in single-player.
- **Keyboard-only instructions.**
  - The Roost announcement says "press **E** at an egg". There is no E on touch.
  - The Lore close button reads "Close (L)".
  - Phone players need on-screen equivalents everywhere: the Dragon button does fetch eggs, but the text doesn't say so.
- **Hover-only landing info.** Corner hover info (pips) on the war table is the only way to compare spots. Add a tap-to-preview on touch: first tap shows info, second tap confirms.
- **Speed tied to frame rate.** Game speed depends on frame rate (`dt = Math.min(0.05, …)`). Below 20 fps, every timer, walk and harvest runs slower. Low-end phones will feel sluggish. Accumulate real time for the rules clock and cap only the physics step.

**Effort:** S–M.

---

## Bugs (with reproduction steps)

| # | Bug | Steps to reproduce | Evidence |
|---|---|---|---|
| B1 | **War map stays 92 px on phones** (landing, Horn/Sellsword pick, Map button) | iPhone-sized viewport (≤600 px) → Play vs AI → the landing map is 92×92 px. During play, tap **Map**: no change. | `M_002`, `M_007`, `M_013`; `phone.log` |
| B2 | **Coach text hidden behind the big war map** (desktop) | Play vs AI → landing: "Your turn · click a gold dot" is under the map. Also when you hold the Horn on a 7. | `D_002`, `D_026`; `play_d.log` |
| B3 | **`state.rolling` stays negative after a cast**, so **Cast the stones** never appears again and the >7-card warning never shows | Play past the first harvest. The button is gone. Hold 8+ cards with <12 s to go: no warning. | `L_018`, `S_006`; `states.log` |
| B4 | **Floating build signs are not clickable** (only the ground ring is) | Afford a Keep, look at your Hamlet, click the floating "Keep" sign: nothing. Click the ground ring: it builds. | `probe.log` B, `X_003` |
| B5 | **Go button loses about 25% of clicks** (the DOM is rebuilt every 700 ms) | Select a blueprint and click 🧭 Go repeatedly at normal speed. Some clicks do nothing. | `probe.log` A |
| B6 | **"Placing: X ✕" chip covers the coach on phones** | Phone → tap the Wall icon in the build bar. | `M_008`, `ph_05` |
| B7 | **Help can't be closed without scrolling about two screens on phones; Help doesn't pause the game** | Phone → tap ❓ → the Close button is at y≈1339 of 664. Leave Help open on desktop: harvests continue. | `M_017`, `M_018` |
| B8 | **Event log overflows upward behind the build bar** (desktop): the top entry is cut off | Play a few harvests with multi-line log entries. | `PT/tour/d_03_landed.png` ("11" fragment), `L_005_after_harvest_4.png` |
| B9 | **Camera clips into walls and buildings** (Behind/High views, near walls, at night near Hamlets) | Walk into a rival wall, or switch View to High next to a Keep. | `X_007`, `X_009`, `S_009` |
| B10 | **Coach recommends raven 1-for-1 trades the AI always refuses** | Start short of 2 Hamlet cards, follow the coach's "Offer to houses" advice. You get "No takers… needs its…" every time. | `play2.log` 169–245 s, `L_009` |
| B11 | **Coach suggests numbers worse than the ones you own** ("Plots on 5 harvest far more often" while holding 6 and 8) | Own 4/6/8/9, see a roll of 3 or 10. | `play2.log` |
| B12 | **Pip dots promised but not drawn on the war map** | Landing text says "More dots under the numbers"; the map shows none. | `D_003`, `X_001` |
| B13 | **"press E" in the Roost announcement**, though the game targets mouse and touch | Build a Roost. | game.js `tryBuild` |
| B14 | **Game speed tied to frame rate** (`dt` capped at 0.05) | At 1.5 fps the game ran at 0.08× speed. Any device under 20 fps slows the harvest clock. | `play2.log` line 2 |
| B15 | **D-pad and landing banner overlap the top buttons on phones; D-pad shown during landing** | Phone → Play vs AI. | `ph_02`, `ph_04`, `M_002` |
| B16 | **HUD resource counts don't refresh when resources change outside the build/trade paths** (minor: affects anything that edits `state.res` without calling `updateHUD`, e.g. debug hooks and possibly network snapshots) | Mutate `state.res` and wait: the plates keep the old numbers until the next event. | `S_006` (shows 1/0/0/0/0 while holding 11) |

*(B16 was seen only through a debug hook, so it may not affect normal play.)*

---

## Quick wins (under an hour each)

1. `state.rolling = 0` on resolve (B3): restores the skip button and the 7-card warning.
2. Phone CSS for `#minimap.big` (B1).
3. `#objective { z-index:6 }` while the map is big, docked at the top of the map frame (B2).
4. Diff the coach HTML before rewriting it; keep one persistent Go button (B5).
5. Move `#modeChip` inside the coach panel on phones (B6).
6. Pause on Help, add a sticky ✕ to all overlays, and close on backdrop tap (B7).
7. Draw pip dots under the war-map numbers and the 3D banners; make 6/8 bold (B12).
8. Coach: drop dead-end raven suggestions (check `aiAccepts` first); only suggest richer numbers; tag status lines ℹ/⚠ instead of "🎯 Next goal".
9. Replace "press E" and "Close (L)" with touch-neutral wording (B13).
10. Spawn the player 20 m inland of their Hamlet, facing the island centre.
11. Hide the D-pad during landing and while overlays are open (B15).
12. Clear the blueprint after each build (or show "place another?") so the coach doesn't get stuck in "Placing a Wall".

## Bigger ideas

- **Board view toggle.** A one-button top-down tactical camera where corners and edges are clicked directly. The first-person walk becomes optional flavour, not a tax on every build. This also solves most camera clipping and phone visibility problems.
- **Guided first game.** A scripted 3-minute opening on a fixed, balanced map:
  - it gives the starting resources for a Hamlet and a Wall;
  - it forces one harvest with a payout;
  - it shows one safe 7 with a clear "you lost nothing because you held ≤7" lesson;
  - then it hands over to the coach.
- **Harvest summary card.** After each cast, show a compact card: "🎲 6 + 2 = 8 → you +1 🌾 (Hamlet on 8) · Morrow +2 🔩". Highlight the producing hexes on the minimap. Today the result is a 2.8 s banner plus a log line, and the rune stones in the sky are usually off-camera.
- **Smarter AI trading.** Let houses counter-offer ("Calder wants 2 🌾 for 1 🌲, accept?") instead of a flat "No takers". This turns the most frustrating moment into a negotiation, which is the social core Catan players expect.
- **Pace options.** "Relaxed / Standard / Quick" harvest timers and a beginner economy setting (3:1 Guild, starting resources from the first Hamlet too). Once the rolling bug is fixed, consider keeping the skip button available during play.

---

## Pacing measurement

`PT/pace.js`: natural game time (the frame-rate cap was accounted for by summing the game's own `dt`), 3 AI houses, and a human seat that does nothing. Log in `PT/pace.log`.

| Game time | Harvests | Renown (you / AI / AI / AI) |
|---|---|---|
| 0–6 min | 0–10 | 2 / 2 / 2 / 2 |
| 7.4 min | 11 | 2 / 3 / 3 / 3 |
| 11.5 min | 17 | 2 / 5 / 4 / 3 |
| 14.6 min | 20 | 2 / 5 / 5 / 4 |

**Pace.** For the first **~6 minutes and 10 harvests nobody builds anything**. The leaders then gain about +1 Renown every 2–3 minutes, which projects to roughly **35–45 minutes** for a 12-Renown game. That length is fine for Catan players. The dead opening is the problem: it is exactly when a newcomer decides whether the game is fun.

**Pressure on an idle player.** In those 15 minutes the passive human was robbed **8 times**:
- 4 night raids on their Hamlet;
- 2 Sellsword thefts;
- plus the Wyrm parked on their regions.

A new player who is still reading tooltips gets hit hard and often. Suggestions:
- Shorten the opening: the first Hamlet also pays starting resources, and the early harvest ramp is faster.
- Protect players at or below 3 Renown from night raids during the first day.
- Bring back the skip button (B3).

## What works well (keep it)

- Coherent art direction, and readable resource colours. Each resource has a distinct colour shared by its tile, plate and trade row.
- The landing order banner and the desktop hover read-out (`🌾5 🦋11 🔩9 · 10 pips`) are exactly what Catan players want.
- The Trade panel (Give/Get steppers, live summary, the Guild and Raven buttons side by side) is clear, and it pauses the game.
- The duel panel explains rock-paper-scissors and might on one screen.
- The Wyrm announcement ("The Wyrm coils in Iron crags (6). You steal 1 🌾 from House Morrow!") is concise and good.
- Walls blocking rivals and offering a 1-card toll works and is explained in place (`X_009`: "Pay 1 to pass Ashby's gate").
- No JavaScript errors in any session.
