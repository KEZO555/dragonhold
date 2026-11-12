# Dragonhold

A first-person, competitive fantasy **settle-and-trade** game in the browser.
Rival noble houses land on the volcanic Isles of Embervale, claim the corners where
resource regions meet, trade, send Reavers against each other, and raise dragons.
The first house to reach **12 Renown** is crowned.

Comic-style low-poly art (cel shading, ink outlines), a full day/night cycle,
fog of war, and up to 3 AI rival houses.

## Play

**Single player (vs AI):** no build step. Serve the folder with any static web server:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000 and press **PLAY VS AI**.

**Online with friends:** run the Dragonhold server, which serves the game and relays messages between players:

```bash
npm install
npm start
```

Then visit http://localhost:8080. One player presses **CREATE GAME** and shares the invite code or link;
friends type their name and press **JOIN**. The host picks how many AI houses fill the empty seats and starts the game.

### Deploy to Render (free)

The repository includes a `render.yaml` blueprint. In Render: **New → Blueprint**, pick this repository,
and confirm. Render runs `npm install` and `npm start` and gives you a public `https://….onrender.com` link to share.
Free services sleep after 15 minutes without visitors; the first visit after that takes about a minute to wake up.

## Controls

Everything works with the mouse (and touch):

| Action | How |
|---|---|
| Look around | Drag |
| Walk somewhere | WASD / arrow keys, the on-screen D-pad, or click the map |
| Build | Click a **gold** sign (white = you need more resources) |
| Menus | Bottom buttons: Build · Trade · Scrolls · Dragon · Map · Home |
| Fly a dragon | Dragon → Ride, click where to fly, 🔥 Fire, Land |
| Help / beginner guide | ❓ Help and 🎓 Guide buttons under the map |

Keyboard shortcuts still work: WASD move, 1–5 blueprints, T trade, L scrolls, M map, R home, E egg, F ride, G fire.

## Files

- `index.html` – page, HUD and styles
- `game.js` – the whole game (world, rules, AI houses, dragons)
- `three.module.js` – [three.js](https://threejs.org) r170 (MIT License), vendored
- `server/server.js` – online server (serves the game, relays messages inside a room)
- `render.yaml` – one-click deploy to Render
- `RULES.md` – one-page rules cheat sheet
- `GAME_DESIGN.md` – the game design document

## Status

Milestones 1–4 are playable: world, AI rivals, Lore Scrolls, dragons, and online play for up to 4 players
(empty seats filled by AI houses).

### How online play works

The host's browser runs the whole game (rules, dice, AI houses, dragons) and sends every friend a snapshot
10 times a second; friends send their actions (build, trade, ride…) back and the host checks every rule again.
The server only relays messages inside a room. If a friend leaves, an AI steward takes over their house;
if the host leaves, the game ends.
