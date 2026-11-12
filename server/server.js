// Kingdom of Dragons online server: serves the game page and relays messages between players.
// The host's browser runs the game; this server only forwards messages inside a room.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const ROOT = path.join(__dirname, '..');
const FILES = { '/': 'index.html', '/index.html': 'index.html', '/game.js': 'game.js', '/three.module.js': 'three.module.js' };
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/healthz') { res.writeHead(200, { 'content-type': 'text/plain' }); return res.end('ok'); }
  const file = FILES[url];
  if (!file) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found'); }
  fs.readFile(path.join(ROOT, file), (err, data) => {
    if (err) { res.writeHead(500); return res.end('Error'); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)], 'cache-control': 'no-cache' });
    res.end(data);
  });
});

// ---- rooms
const WORDS = ['WOLF', 'STAG', 'SNAKE', 'SUN', 'ASH', 'EMBER', 'FANG', 'CROWN', 'RUNE', 'WYRM', 'RAVEN', 'KEEP'];
const rooms = new Map();   // code -> { host, seed, guests: Map(cid -> ws), open }
let nextCid = 1;
function newCode() {
  for (;;) {
    const code = `${WORDS[Math.floor(Math.random() * WORDS.length)]}-${10 + Math.floor(Math.random() * 90)}`;
    if (!rooms.has(code)) return code;
  }
}
const send = (ws, msg) => { if (ws && ws.readyState === 1) ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg)); };

const wss = new WebSocketServer({ server, maxPayload: 256 * 1024 });
wss.on('connection', ws => {
  ws.cid = nextCid++;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    const room = ws.room && rooms.get(ws.room);
    switch (m.t) {
      case 'create': {                                  // a host opens a room for its world seed
        const code = newCode();
        rooms.set(code, { host: ws, seed: m.seed, guests: new Map(), open: true });
        ws.room = code; ws.isHost = true;
        send(ws, { t: 'created', code });
        break;
      }
      case 'peek': {                                    // a guest asks which world a room uses
        const r = rooms.get(String(m.code || '').toUpperCase());
        send(ws, r ? { t: 'peeked', code: m.code.toUpperCase(), seed: r.seed, open: r.open } : { t: 'error', error: 'No game with that code' });
        break;
      }
      case 'join': {
        const code = String(m.code || '').toUpperCase(), r = rooms.get(code);
        if (!r) return send(ws, { t: 'error', error: 'No game with that code' });
        if (!r.open) return send(ws, { t: 'error', error: 'That game has already started' });
        if (r.guests.size >= 3) return send(ws, { t: 'error', error: 'That game is full' });
        ws.room = code; r.guests.set(ws.cid, ws);
        send(r.host, { t: 'join', cid: ws.cid, name: String(m.name || 'Guest').slice(0, 16) });
        break;
      }
      case 'close':                                     // host started the game: no more joiners
        if (room && ws.isHost) room.open = false;
        break;
      case 'to':                                        // host -> one guest
        if (room && ws.isHost) send(room.guests.get(m.cid), m.msg);
        break;
      case 'bcast':                                     // host -> every guest
        if (room && ws.isHost) { const s = JSON.stringify(m.msg); room.guests.forEach(g => send(g, s)); }
        break;
      case 'up':                                        // guest -> host
        if (room && !ws.isHost) send(room.host, { t: 'up', cid: ws.cid, msg: m.msg });
        break;
    }
  });
  ws.on('close', () => {
    const room = ws.room && rooms.get(ws.room);
    if (!room) return;
    if (ws.isHost) { room.guests.forEach(g => send(g, { t: 'hostgone' })); rooms.delete(ws.room); }
    else { room.guests.delete(ws.cid); send(room.host, { t: 'left', cid: ws.cid }); }
  });
});
// drop dead connections (and keep Render's proxy from idling the socket)
setInterval(() => wss.clients.forEach(ws => { if (!ws.isAlive) return ws.terminate(); ws.isAlive = false; ws.ping(); }), 25000);

server.listen(PORT, () => console.log(`Kingdom of Dragons server on :${PORT}`));
