# Dragonhold

A first-person, competitive fantasy **settle-and-trade** game in the browser.
Rival noble houses land on the volcanic Isles of Embervale, claim the corners where
resource regions meet, trade, send Reavers against each other, and raise dragons.
The first house to reach **12 Renown** is crowned.

Comic-style low-poly art (cel shading, ink outlines), a full day/night cycle,
fog of war, and up to 3 AI rival houses.

## Play

No build step. Serve the folder with any static web server and open `index.html`:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Controls

| Key | Action |
|---|---|
| WASD / mouse | Move / look |
| Shift · Space | Sprint · jump |
| 1 / 2 / 3 / 4 / 5 | Blueprint: Road / Hamlet / Keep / Dragon Roost / Scorpion Tower |
| Click | Build (aim at a gold sign) |
| T | Trade (Merchant Guild 4:1, ravens 1:1 with houses) |
| L | Lore Scrolls |
| M | War map |
| R | Recall to one of your Hamlets |
| E | Pick up a dragon egg (in the volcano) |
| F · G · C | Ride / land dragon · Dragonfire · dive |
| Y / N | Accept / decline a raven trade offer |

## Files

- `index.html` – page, HUD and styles
- `game.js` – the whole game (world, rules, AI houses, dragons)
- `three.module.js` – [three.js](https://threejs.org) r170 (MIT License), vendored
- `GAME_DESIGN.md` – the game design document

## Status

Milestones 1–3 (world, AI rivals, Lore Scrolls, dragons) are playable.
Milestone 4 (online play with friends) is next.
