// DRAGONHOLD: Milestone 1 "Walk the Isles"
// First-person, low-poly hex settling prototype (Three.js).
import * as THREE from './three.module.js';

// ---------------------------------------------------------------- ICONS (dark medieval, illuminated-manuscript style)
// Every emoji in the game's text is drawn with these icons instead: in the page (via a MutationObserver)
// and on canvases (fillText/strokeText/measureText are taught to place icons).
const INK = '#1E1A26';
// ---- batch 1 icon set (docs/design/batch1): filled token-colour shapes; the outline is drawn on each shape
const ICONS = {
  timber: "<path fill=\"#5E7A4E\" d=\"M5 9h11a3.5 3.5 0 0 1 0 7H5z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#5E7A4E\" d=\"M10 9.2l2.2-6 1.6.6-1.3 3.4 2.8-1.8.9 1.4-3.6 2.4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><ellipse fill=\"#EDE6DA\" cx=\"5\" cy=\"12.5\" rx=\"2.5\" ry=\"3.5\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#5E7A4E\" cx=\"5\" cy=\"12.5\" r=\"1\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  stone: "<path fill=\"#8C857A\" d=\"M7 20V10a5 5 0 0 1 10 0v10z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#3A3350\" d=\"M4 19h16v3H4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#3A3350\" d=\"M11.2 8h1.6v2.2h2v1.6h-2V16h-1.6v-4.2h-2v-1.6h2z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  wheat: "<path fill=\"#8A6A2E\" d=\"M9.5 22l1.5-9h2l1.5 9z\" stroke=\"#8A6A2E\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><ellipse fill=\"#8A6A2E\" cx=\"12\" cy=\"7\" rx=\"2\" ry=\"5.2\" stroke=\"#8A6A2E\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><ellipse fill=\"#8A6A2E\" cx=\"7.3\" cy=\"9\" rx=\"1.8\" ry=\"4.6\" transform=\"rotate(-32 7.3 9)\" stroke=\"#8A6A2E\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><ellipse fill=\"#8A6A2E\" cx=\"16.7\" cy=\"9\" rx=\"1.8\" ry=\"4.6\" transform=\"rotate(32 16.7 9)\" stroke=\"#8A6A2E\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"9.4\" y=\"15\" width=\"5.2\" height=\"2.3\" stroke=\"#8A6A2E\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  cattle: "<rect fill=\"#A99BCB\" x=\"11.3\" y=\"1\" width=\"1.4\" height=\"4.5\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><ellipse fill=\"#EDE6DA\" cx=\"12\" cy=\"13.5\" rx=\"5.6\" ry=\"8.5\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#A99BCB\" d=\"M6.8 10.3q5.2 2.6 10.4 0v1.9q-5.2 2.6-10.4 0z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#A99BCB\" d=\"M6.5 14.3q5.5 2.6 11 0v1.9q-5.5 2.6-11 0z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#A99BCB\" d=\"M7.6 18.2q4.4 2.2 8.8 0v1.6q-4.4 2.2-8.8 0z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  ember: "<path fill=\"#7B93A8\" d=\"M7 7.5h10l2.2 4.5H4.8z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#46617C\" d=\"M4.8 12h14.4l1.8 6.5H3z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M3 18.5h18v1.6H3z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  waste: "<path fill=\"#CFC6BC\" d=\"M2 19h20v2.4H2z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M4.6 19c0-5 1.5-9 5-11-2 3-2.6 6.5-2.6 11z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M10 19c0-6 1.5-10.5 5-13-2 3.5-2.6 7.5-2.6 13z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M15.4 19c0-5 1.5-8.5 4.6-10.5-1.9 2.8-2.2 6-2.2 10.5z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  wall: "<path fill=\"#6E6880\" d=\"M2 21V10h3v2h3v-2h3v2h2v-2h3v2h3v-2h3v11z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"2\" y=\"15.4\" width=\"20\" height=\"1.3\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  hamlet: "<path fill=\"#6E6880\" d=\"M14 22v-6l3-3 3 3v6z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#3A3350\" d=\"M8 22V11h6v11z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M6.3 11L11 2.5l4.7 8.5z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M10 22v-4a1 1 0 0 1 2 0v4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  keep: "<path fill=\"#6E6880\" d=\"M4 21v-8l2.3-5.5L8.6 13v8z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#6E6880\" d=\"M15.4 21v-8l2.3-5.5L20 13v8z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#3A3350\" d=\"M9.3 21V9L12 1.5 14.7 9v12z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#EDE6DA\" cx=\"12\" cy=\"12\" r=\"1.6\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M2.5 20h19v2.4h-19z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  roost: "<path fill=\"#EDE6DA\" d=\"M3 8c0 7.5 3 12 9 13v-2.4c-4.3-1-6.4-4.6-6.6-10.6z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M21 8c0 7.5-3 12-9 13v-2.4c4.3-1 6.4-4.6 6.6-10.6z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#6E6880\" d=\"M12 5.5c2.2 0 3.8 3.4 3.8 6.2a3.8 3.8 0 0 1-7.6 0c0-2.8 1.6-6.2 3.8-6.2z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M8 20.6h8V23H8z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  dragon: "<path fill=\"#1E1A26\" d=\"M5 22C5 16 6 12 8 9L6 3l5 4h4l6 4 1 2.5-6 1 4 2.5-7 .5-1 4.5z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#E0A24A\" cx=\"14.6\" cy=\"10.2\" r=\"1\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  tower: "<path fill=\"#3A3350\" d=\"M8 22l1-10.5h6L16 22z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M6.5 9h11v2.6h-11z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M3.6 6.2c4.6-4.4 12.2-4.4 16.8 0l-1.2 1.4c-3.9-3.6-10.5-3.6-14.4 0z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"11.2\" y=\"0.8\" width=\"1.6\" height=\"8.4\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  hammer: "<path fill=\"#3A3350\" d=\"M4 4h11l5 3-5 3H4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#A89A86\" d=\"M9 10h3v12H9z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  trade: "<rect fill=\"#1E1A26\" x=\"11.2\" y=\"2.5\" width=\"1.6\" height=\"18\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"4\" y=\"5.6\" width=\"16\" height=\"1.7\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M7 20h10v2.2H7z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M5.5 7.3L2.5 13h1.4l1.6-3.2L7.1 13h1.4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M18.5 7.3l-3 5.7h1.4l1.6-3.2 1.6 3.2h1.4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#6E6880\" d=\"M1.8 13h7.4a3.7 3.7 0 0 1-7.4 0z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#6E6880\" d=\"M14.8 13h7.4a3.7 3.7 0 0 1-7.4 0z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  scroll: "<path fill=\"#EDE6DA\" d=\"M6 3h13a2 2 0 0 1 0 4h-1v12a2.5 2.5 0 0 1-2.5 2.5H5a2 2 0 0 1 0-4h1z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"8.5\" y=\"8.2\" width=\"7\" height=\"1.4\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"8.5\" y=\"11.2\" width=\"7\" height=\"1.4\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"8.5\" y=\"14.2\" width=\"4.5\" height=\"1.4\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  fire: "<path fill=\"#E0A24A\" d=\"M12 1.5c1 4 6.5 6.5 6.5 12.5a6.5 6.5 0 0 1-13 0c0-3 1.5-4.8 3.2-6.4 0 2 .9 3.2 2 3.2.2-3-.4-6 1.3-9.3z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M12 13c1.5 2 2.6 3 2.6 5a2.6 2.6 0 0 1-5.2 0c0-2 1.1-3 2.6-5z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  map: "<path fill=\"#EDE6DA\" d=\"M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#8E8AA3\" d=\"M8.5 4.2h1v13.9h-1z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#8E8AA3\" d=\"M14.5 5.9h1v13.9h-1z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#8C3B4A\" cx=\"12\" cy=\"11.5\" r=\"1.7\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  eye: "<path fill=\"#EDE6DA\" d=\"M1.5 12C4 7 8 5 12 5s8 2 10.5 7C20 17 16 19 12 19s-8-2-10.5-7zM7.60 12.00a4.4 4.4 0 1 0 8.80 0a4.4 4.4 0 1 0 -8.80 0z\" fill-rule=\"evenodd\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M12 8.2c1.9 1.8 1.9 5.8 0 7.6-1.9-1.8-1.9-5.8 0-7.6z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  help: "<path fill=\"#1E1A26\" d=\"M7.5 8.5a4.5 4.5 0 1 1 6.8 3.9c-1 .6-1.3 1.2-1.3 2.6h-2.6c0-2.3.7-3.5 2.4-4.5a1.9 1.9 0 1 0-2.7-2z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#1E1A26\" cx=\"11.7\" cy=\"18.7\" r=\"1.7\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  guide: "<path fill=\"#EDE6DA\" d=\"M2 5c3-1 7-1 10 1 3-2 7-2 10-1v14c-3-1-7-1-10 1-3-2-7-2-10-1z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"11.3\" y=\"6\" width=\"1.4\" height=\"14\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  dpad: "<path fill=\"#6E6880\" d=\"M9 2h6v7h7v6h-7v7H9v-7H2V9h7z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#1E1A26\" cx=\"12\" cy=\"12\" r=\"2\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  goal: "<path fill=\"#3A3350\" d=\"M2.00 12.00a10 10 0 1 0 20.00 0a10 10 0 1 0 -20.00 0zM5.20 12.00a6.8 6.8 0 1 0 13.60 0a6.8 6.8 0 1 0 -13.60 0z\" fill-rule=\"evenodd\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#8C3B4A\" cx=\"12\" cy=\"12\" r=\"3.2\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  compass: "<path fill=\"#6E6880\" d=\"M2.00 12.00a10 10 0 1 0 20.00 0a10 10 0 1 0 -20.00 0zM5.20 12.00a6.8 6.8 0 1 0 13.60 0a6.8 6.8 0 1 0 -13.60 0z\" fill-rule=\"evenodd\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M12 3.5l3.2 8.5-3.2 8.5L8.8 12z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#8C3B4A\" d=\"M12 3.5l3.2 8.5H8.8z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  fast: "<path fill=\"#1E1A26\" d=\"M2.5 5l9 7-9 7z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M12.5 5l9 7-9 7z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  gate: "<path fill=\"#3A3350\" d=\"M4 22V10a8 8 0 0 1 16 0v12zM7.5 22V10.5a4.5 4.5 0 0 1 9 0V22z\" fill-rule=\"evenodd\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"9.2\" y=\"7\" width=\"1.3\" height=\"15\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"11.35\" y=\"6\" width=\"1.3\" height=\"16\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"13.5\" y=\"7\" width=\"1.3\" height=\"15\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"7.5\" y=\"13\" width=\"9\" height=\"1.3\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  up: "<path fill=\"#1E1A26\" d=\"M12 2l8.5 9.5H15V22H9V11.5H3.5z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  star: "<path fill=\"#EDE6DA\" d=\"M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#3A3350\" d=\"M12 8l1.5 4-1.5 4-1.5-4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  crown: "<path fill=\"#EDE6DA\" d=\"M3.5 18L2 6.5l5.5 5L12 3.5l4.5 8 5.5-5L20.5 18z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#3A3350\" d=\"M3.5 17.5h17V21h-17z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  horn: "<path fill=\"#EDE6DA\" d=\"M3 5.5l3.5-1C8 10 11.5 12.5 18 12l3 4-3 4C9 20.5 4 15 3 5.5z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#3A3350\" d=\"M2.3 4l4.2-1.3.7 2.2L3 6.2z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#3A3350\" d=\"M18 11.6l3.4 4.4-3.4 4.4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  dice: "<path fill=\"#EDE6DA\" d=\"M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM6.30 8.00a1.7 1.7 0 1 0 3.40 0a1.7 1.7 0 1 0 -3.40 0zM14.30 8.00a1.7 1.7 0 1 0 3.40 0a1.7 1.7 0 1 0 -3.40 0zM10.30 12.00a1.7 1.7 0 1 0 3.40 0a1.7 1.7 0 1 0 -3.40 0zM6.30 16.00a1.7 1.7 0 1 0 3.40 0a1.7 1.7 0 1 0 -3.40 0zM14.30 16.00a1.7 1.7 0 1 0 3.40 0a1.7 1.7 0 1 0 -3.40 0z\" fill-rule=\"evenodd\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  hourglass: "<path fill=\"#EDE6DA\" d=\"M5.5 3h13v2c0 3.5-3 5.2-4.8 7 1.8 1.8 4.8 3.5 4.8 7v2h-13v-2c0-3.5 3-5.2 4.8-7-1.8-1.8-4.8-3.5-4.8-7z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#A89A86\" d=\"M8.6 19.6c0-2 1.9-3.4 3.4-4.8 1.5 1.4 3.4 2.8 3.4 4.8z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"4\" y=\"1.8\" width=\"16\" height=\"2.2\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"4\" y=\"20\" width=\"16\" height=\"2.2\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  warning: "<path fill=\"#8C3B4A\" d=\"M12 2l11 19.5H1zM10.9 9h2.2v6h-2.2zM10.9 16.4h2.2v2.2h-2.2z\" fill-rule=\"evenodd\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  check: "<path fill=\"#1E1A26\" d=\"M3 12.5l3-3 4 4 8-8.5 3 3-11 11.5z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  cross: "<path fill=\"#8C3B4A\" d=\"M5 3l7 7 7-7 2 2-7 7 7 7-2 2-7-7-7 7-2-2 7-7-7-7z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  person: "<path fill=\"#3A3350\" d=\"M4 22c0-6 3.5-9.5 8-9.5s8 3.5 8 9.5z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#EDE6DA\" cx=\"12\" cy=\"7\" r=\"4.2\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  gear: "<path fill=\"#6E6880\" d=\"M9.91 4.69L10.34 1.53L13.66 1.53L14.09 4.69L15.68 5.35L18.23 3.42L20.58 5.77L18.65 8.32L19.31 9.91L22.47 10.34L22.47 13.66L19.31 14.09L18.65 15.68L20.58 18.23L18.23 20.58L15.68 18.65L14.09 19.31L13.66 22.47L10.34 22.47L9.91 19.31L8.32 18.65L5.77 20.58L3.42 18.23L5.35 15.68L4.69 14.09L1.53 13.66L1.53 10.34L4.69 9.91L5.35 8.32L3.42 5.77L5.77 3.42L8.32 5.35zM8.80 12.00a3.2 3.2 0 1 0 6.40 0a3.2 3.2 0 1 0 -6.40 0z\" fill-rule=\"evenodd\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  anchor: "<path fill=\"#1E1A26\" d=\"M9.20 4.60a2.8 2.8 0 1 0 5.60 0a2.8 2.8 0 1 0 -5.60 0zM10.90 4.60a1.1 1.1 0 1 0 2.20 0a1.1 1.1 0 1 0 -2.20 0z\" fill-rule=\"evenodd\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"11\" y=\"7\" width=\"2\" height=\"13.5\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"7.5\" y=\"9.5\" width=\"9\" height=\"2\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M2.8 13l3.2.6c.5 3 2.8 4.9 6 4.9s5.5-1.9 6-4.9l3.2-.6c-.5 5.2-4.1 8.6-9.2 8.6S3.3 18.2 2.8 13z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  egg: "<path fill=\"#6E6880\" d=\"M12 2c4 0 7 6.5 7 11.5a7 7 0 0 1-14 0C5 8.5 8 2 12 2z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#3A3350\" d=\"M8.4 9.6l1.8 1.8L12 9.6l1.8 1.8 1.8-1.8v2.2l-1.8 1.8L12 11.8l-1.8 1.8-1.8-1.8z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#E0A24A\" d=\"M9.4 16l2.6 1.8 2.6-1.8v1.8L12 19.6l-2.6-1.8z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  wyrmling: "<path fill=\"#1E1A26\" d=\"M5 22C5 16 6 12 8 9L6 3l5 4h4l6 4 1 2.5-6 1 4 2.5-7 .5-1 4.5z\" transform=\"translate(4.6 .2) scale(.62)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#E0A24A\" cx=\"14.6\" cy=\"10.2\" r=\"1.1\" transform=\"translate(4.6 .2) scale(.62)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#6E6880\" d=\"M4.5 13.5l2.6 2.2 2.4-2.2 2.5 2.2 2.5-2.2 2.4 2.2 2.6-2.2c0 5.5-3.2 9-7.5 9s-7.5-3.5-7.5-9z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  wyrm: "<path fill=\"#1E1A26\" d=\"M12 3.2a8.8 8.8 0 1 0 8.8 8.8h-3.2a5.6 5.6 0 1 1-5.6-5.6z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M11 1.6l7.5 1.6 2.2 2.6-9.7 1.6z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M17.6 12h3.2l-1.6 5.5z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M13.14 20.12L12.00 23.60L10.86 20.12zM8.93 19.60L6.20 22.05L6.95 18.46zM5.54 17.05L1.95 17.80L4.40 15.07zM3.88 13.14L0.40 12.00L3.88 10.86zM4.40 8.93L1.95 6.20L5.54 6.95z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#E0A24A\" cx=\"15.8\" cy=\"4.5\" r=\"0.9\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  dawn: "<path fill=\"#EDE6DA\" d=\"M5.5 18a6.5 6.5 0 0 1 13 0z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M10.99 9.76L12.00 5.50L13.01 9.76zM15.24 10.36L18.25 7.17L17.00 11.37zM18.63 13.00L22.83 11.75L19.64 14.76zM4.36 14.76L1.17 11.75L5.37 13.00zM7.00 11.37L5.75 7.17L8.76 10.36z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"2\" y=\"18\" width=\"20\" height=\"2\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  sun: "<circle fill=\"#EDE6DA\" cx=\"12\" cy=\"12\" r=\"5\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M10.74 5.52L12.00 0.70L13.26 5.52zM15.69 6.53L19.99 4.01L17.47 8.31zM18.48 10.74L23.30 12.00L18.48 13.26zM17.47 15.69L19.99 19.99L15.69 17.47zM13.26 18.48L12.00 23.30L10.74 18.48zM8.31 17.47L4.01 19.99L6.53 15.69zM5.52 13.26L0.70 12.00L5.52 10.74zM6.53 8.31L4.01 4.01L8.31 6.53z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  afternoon: "<circle fill=\"#EDE6DA\" cx=\"15.5\" cy=\"8.5\" r=\"4.3\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M14.43 3.00L15.50 0.10L16.57 3.00zM18.63 3.86L21.44 2.56L20.14 5.37zM21.00 7.43L23.90 8.50L21.00 9.57zM10.00 9.57L7.10 8.50L10.00 7.43zM10.86 5.37L9.56 2.56L12.37 3.86z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#8E8AA3\" d=\"M5 20a3.6 3.6 0 0 1 .4-7.2 5 5 0 0 1 9.6-1.2 4.2 4.2 0 0 1 1.6 8.4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  dusk: "<path fill=\"#EDE6DA\" d=\"M5.5 16a6.5 6.5 0 0 1 13 0z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"2\" y=\"16\" width=\"20\" height=\"2\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"5\" y=\"19.4\" width=\"14\" height=\"1.5\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#1E1A26\" x=\"8\" y=\"22\" width=\"8\" height=\"1.3\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  moon: "<path fill=\"#EDE6DA\" d=\"M15 2a10 10 0 1 0 7 15.5A9 9 0 0 1 15 2z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  night: "<path fill=\"#EDE6DA\" d=\"M10 6a8.5 8.5 0 1 0 8 13A7.6 7.6 0 0 1 10 6z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M17.5 2l1 2.9 2.9 1-2.9 1-1 2.9-1-2.9-2.9-1 2.9-1z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M21 11.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  swords: "<path fill=\"#EDE6DA\" d=\"M10.8 3l1.2-2 1.2 2v12h-2.4z\" transform=\"rotate(40 12 13)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"8\" y=\"15\" width=\"8\" height=\"1.9\" transform=\"rotate(40 12 13)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"11\" y=\"16.9\" width=\"2\" height=\"4\" transform=\"rotate(40 12 13)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#3A3350\" cx=\"12\" cy=\"21.8\" r=\"1.4\" transform=\"rotate(40 12 13)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M10.8 3l1.2-2 1.2 2v12h-2.4z\" transform=\"rotate(-40 12 13)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"8\" y=\"15\" width=\"8\" height=\"1.9\" transform=\"rotate(-40 12 13)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"11\" y=\"16.9\" width=\"2\" height=\"4\" transform=\"rotate(-40 12 13)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#3A3350\" cx=\"12\" cy=\"21.8\" r=\"1.4\" transform=\"rotate(-40 12 13)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  shield: "<path fill=\"#6E6880\" d=\"M3 3h18v7c0 6-4 10-9 12-5-2-9-6-9-12z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M11 3h2v18.4l-1 .6-1-.6z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M3 8h18v2H3z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  feint: "<path fill=\"#1E1A26\" d=\"M2.5 17.5c5 0 5.5-11.5 10-11.5 3.4 0 3 5.2 5.4 5.6l-1.3-2.9 5.9 3.8-5.9 3.8 1.2-2.4c-4.4-.2-3.6-5.4-5.3-5.4-2.6 0-3 11.5-10 11.5z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  yield: "<rect fill=\"#1E1A26\" x=\"5\" y=\"2\" width=\"2\" height=\"20\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M7 3c4-1.5 6.5 1.5 12.5 0v9c-6 1.5-8.5-1.5-12.5 0z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  raven: "<path fill=\"#1E1A26\" d=\"M2.5 19.5l5.5-3.5c0-5 3-9 7.5-9.5 1-2 3-2.5 4.5-1.5l2.5 1.5-3 1c.5 5-2 9.5-7.5 11L11 22.5H9.4l.6-3.4c-2 .4-4.8.6-7.5.4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#EDE6DA\" cx=\"18\" cy=\"7\" r=\"0.8\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  deal: "<path fill=\"#8C3B4A\" d=\"M8.6 16l-2.4 7 3.3-1.6 1.7 2.6 1.4-6z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#8C3B4A\" d=\"M15.4 16l2.4 7-3.3-1.6-1.7 2.6-1.4-6z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#8C3B4A\" d=\"M12.00 2.60L14.07 4.27L16.70 3.86L17.66 6.34L20.14 7.30L19.73 9.93L21.40 12.00L19.73 14.07L20.14 16.70L17.66 17.66L16.70 20.14L14.07 19.73L12.00 21.40L9.93 19.73L7.30 20.14L6.34 17.66L3.86 16.70L4.27 14.07L2.60 12.00L4.27 9.93L3.86 7.30L6.34 6.34L7.30 3.86L9.93 4.27zM7.6 12l1.7-1.7 2 2 3.8-4 1.7 1.7-5.5 5.7z\" fill-rule=\"evenodd\" transform=\"translate(0 -2.2)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  wolf: "<path fill=\"#1E1A26\" d=\"M3 2l5 5h8l5-5v9l-4 6-2.5 5h-5L7 17l-4-6zM7.5 10.5l3 1.6-3 .9zM16.5 10.5l-3 1.6 3 .9z\" fill-rule=\"evenodd\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  stag: "<path fill=\"#1E1A26\" d=\"M9.3 12h5.4l-1.1 7-1.6 3-1.6-3z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M9.6 12.3L5.6 11l3.6 3.4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M14.4 12.3l4-1.3-3.6 3.4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M10.4 12.2c-.6-2.2-4.2-2.6-5.2-5.6V2h1.6v4c.5 1 1.3 1.6 2.2 2V4h1.6v5.2c.9.6 1.4 1.7 1.4 3z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M10.4 12.2c-.6-2.2-4.2-2.6-5.2-5.6V2h1.6v4c.5 1 1.3 1.6 2.2 2V4h1.6v5.2c.9.6 1.4 1.7 1.4 3z\" transform=\"matrix(-1 0 0 1 24 0)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  serpent: "<path fill=\"#1E1A26\" d=\"M17 3c-5-1.5-10 0-10 4 0 3 3 4 6 5 2 .7 3.5 1.2 3.5 2.7 0 2-3.5 2.6-8 1.3L7 19c6 2 12.5.8 12.5-4 0-3.2-3-4.4-6-5.3-2-.6-3.5-1.1-3.5-2.4 0-1.6 3-2 6.5-1z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M15.5 1.8l5.5 1 1.8 2.2-1.8 2-5.5.8z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#1E1A26\" d=\"M9 15.6l-6.5 1.6L8 19.4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  eclipse: "<path fill=\"#1E1A26\" d=\"M12.00 1.00L13.71 5.62L17.50 2.47L16.67 7.33L21.53 6.50L18.38 10.29L23.00 12.00L18.38 13.71L21.53 17.50L16.67 16.67L17.50 21.53L13.71 18.38L12.00 23.00L10.29 18.38L6.50 21.53L7.33 16.67L2.47 17.50L5.62 13.71L1.00 12.00L5.62 10.29L2.47 6.50L7.33 7.33L6.50 2.47L10.29 5.62zM8.80 12.00a3.2 3.2 0 1 0 6.40 0a3.2 3.2 0 1 0 -6.40 0z\" fill-rule=\"evenodd\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  great_wall: "<path fill=\"#6E6880\" d=\"M1 22V13h2.5v2H6v-2h2.5v2H11v-2h2v2h2.5v-2H18v2h2.5v-2H23v9z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M12 1l1.4 4.1 4.1 1.4-4.1 1.4L12 12l-1.4-4.1-4.1-1.4 4.1-1.4z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
  mightiest_host: "<path fill=\"#EDE6DA\" d=\"M10.8 3l1.2-2 1.2 2v12h-2.4z\" transform=\"rotate(40 12 12)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"8\" y=\"15\" width=\"8\" height=\"1.9\" transform=\"rotate(40 12 12)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"11\" y=\"16.9\" width=\"2\" height=\"4\" transform=\"rotate(40 12 12)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#3A3350\" cx=\"12\" cy=\"21.8\" r=\"1.4\" transform=\"rotate(40 12 12)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M10.8 3l1.2-2 1.2 2v12h-2.4z\" transform=\"rotate(-40 12 12)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"8\" y=\"15\" width=\"8\" height=\"1.9\" transform=\"rotate(-40 12 12)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"11\" y=\"16.9\" width=\"2\" height=\"4\" transform=\"rotate(-40 12 12)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#3A3350\" cx=\"12\" cy=\"21.8\" r=\"1.4\" transform=\"rotate(-40 12 12)\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#8C3B4A\" d=\"M7 8.5h10V13c0 4-2.5 6.6-5 8-2.5-1.4-5-4-5-8z\" stroke=\"#1E1A26\" stroke-width=\"1.4\" stroke-linejoin=\"round\" paint-order=\"stroke\"/>",
};
// which emoji each icon replaces (variation selectors are ignored)
const EMOJI_TO = {
  '🌲': 'timber', '🪨': 'stone', '🌾': 'wheat', '🐄': 'cattle', '🔥': 'fire', '🦋': 'cattle', '🔩': 'ember', '🪺': 'roost', '🌑': 'eclipse', '🏯': 'great_wall', '🎖': 'mightiest_host', '🌋': 'waste', '🏠': 'hamlet', '🏘': 'hamlet', '🏰': 'keep',
  '🧱': 'wall', '🏹': 'tower', '🐉': 'dragon', '🐲': 'wyrmling', '🥚': 'egg', '⚖': 'trade', '📜': 'scroll', '🗺': 'map', '❓': 'help', '🎓': 'guide',
  '🎮': 'dpad', '👁': 'eye', '👀': 'eye', '🎯': 'goal', '🧭': 'compass', '⏩': 'fast', '★': 'star', '🎺': 'horn', '📯': 'horn', '🎲': 'dice',
  '🏴': 'wyrm', '⚔': 'swords', '🛡': 'shield', '🌀': 'feint', '🏳': 'yield', '🐦': 'raven', '🤝': 'deal', '🌅': 'dawn', '☀': 'sun', '🌤': 'afternoon',
  '🌇': 'dusk', '🌙': 'moon', '🌌': 'night', '⚓': 'anchor', '👑': 'crown', '⚠': 'warning', '✔': 'check', '✖': 'cross', '✕': 'cross', '🚪': 'gate',
  '⏳': 'hourglass', '👤': 'person', '👋': 'person', '🤖': 'gear', '🔨': 'hammer', '⬆': 'up', '🐺': 'wolf', '🦌': 'stag', '🐍': 'serpent',
};
const EMOJI_SRC = Object.keys(EMOJI_TO).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const EMOJI_RE = new RegExp(`(?:${EMOJI_SRC})\\uFE0F?`, 'gu'), EMOJI_TEST = new RegExp(`(?:${EMOJI_SRC})`, 'u');
const iconSVG = (name, px) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"${px ? ` width="${px}" height="${px}"` : ' class="ic"'}><g stroke="${INK}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">${ICONS[name]}</g></svg>`;
// images for drawing on canvases (loaded before any texture is made)
const ICON_IMG = {};
try { await Promise.race([Promise.all([document.fonts.load("700 28px 'Cormorant Garamond'"), document.fonts.load('700 25px Cinzel'), document.fonts.load("italic 500 20px 'Cormorant Garamond'")]), new Promise(r => setTimeout(r, 2500))]); } catch (_) {}
await Promise.all(Object.keys(ICONS).map(n => new Promise(res => {
  const img = new Image(); img.onload = img.onerror = () => res(); ICON_IMG[n] = img;
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconSVG(n, 128));
})));
function splitIcons(str) {
  const out = []; let last = 0;
  str.replace(EMOJI_RE, (m, off) => { if (off > last) out.push(str.slice(last, off)); out.push({ icon: EMOJI_TO[m.replace(/️/g, '')] }); last = off + m.length; return m; });
  if (last < str.length) out.push(str.slice(last));
  return out;
}
// canvases: draw icons in place of emoji
{
  const CP = CanvasRenderingContext2D.prototype, _fill = CP.fillText, _stroke = CP.strokeText, _measure = CP.measureText;
  const layout = (ctx, str) => {
    const parts = splitIcons(str), fs = parseFloat((/(\d+(?:\.\d+)?)px/.exec(ctx.font) || [0, 16])[1]), isz = fs * 1.12;
    const ws = parts.map(p => typeof p === 'string' ? _measure.call(ctx, p).width : isz + fs * 0.08);
    return { parts, ws, w: ws.reduce((a, b) => a + b, 0), isz };
  };
  const draw = (ctx, str, x, y, stroke) => {
    const L = layout(ctx, str), al = ctx.textAlign, bl = ctx.textBaseline;
    let sx = al === 'center' ? x - L.w / 2 : (al === 'right' || al === 'end') ? x - L.w : x;
    const iy = bl === 'middle' ? y - L.isz / 2 : bl === 'top' ? y : bl === 'bottom' ? y - L.isz : y - L.isz * 0.82;
    ctx.textAlign = 'left';
    L.parts.forEach((p, i) => {
      if (typeof p === 'string') (stroke ? _stroke : _fill).call(ctx, p, sx, y);
      else if (!stroke) { const img = ICON_IMG[p.icon]; if (img && img.complete && img.naturalWidth) ctx.drawImage(img, sx, iy, L.isz, L.isz); }
      sx += L.ws[i];
    });
    ctx.textAlign = al;
  };
  CP.fillText = function (t, x, y, mw) { return typeof t === 'string' && EMOJI_TEST.test(t) ? draw(this, t, x, y, false) : _fill.call(this, t, x, y, mw); };
  CP.strokeText = function (t, x, y, mw) { return typeof t === 'string' && EMOJI_TEST.test(t) ? draw(this, t, x, y, true) : _stroke.call(this, t, x, y, mw); };
  CP.measureText = function (t) { return typeof t === 'string' && EMOJI_TEST.test(t) ? { width: layout(this, t).w, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 } : _measure.call(this, t); };
}
// the page: replace emoji in text nodes with inline icons, now and whenever text changes
{
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'svg', 'g', 'path']);
  const fix = node => {
    const p = node.parentNode;
    if (!p || SKIP.has(p.nodeName) || !EMOJI_TEST.test(node.nodeValue)) return;
    const frag = document.createDocumentFragment();
    for (const part of splitIcons(node.nodeValue)) {
      if (typeof part === 'string') frag.appendChild(document.createTextNode(part));
      else if (ICONS[part.icon]) { const s = document.createElement('span'); s.className = 'icw'; s.innerHTML = iconSVG(part.icon); frag.appendChild(s); }
    }
    p.replaceChild(frag, node);
  };
  const walk = root => {
    if (root.nodeType === 3) return fix(root);
    if (root.nodeType !== 1 || SKIP.has(root.nodeName)) return;
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = [];
    while (tw.nextNode()) list.push(tw.currentNode);
    list.forEach(fix);
  };
  walk(document.body);
  new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') fix(m.target); else m.addedNodes.forEach(walk); } })
    .observe(document.body, { childList: true, subtree: true, characterData: true });
}

// ---------------------------------------------------------------- constants
const HEX_R = 30;                 // hex corner radius (world units ≈ metres)
const SQ3 = Math.sqrt(3);
const HARVEST_MIN = 30, HARVEST_MAX = 60;    // each harvest arrives at a random time in this range
const ROLLS_PER_HARVEST = 2;                  // the Rune Stones are cast twice every harvest
// Early on there is little to do, so harvests come quickly (12–20 s) and slow down to 30–60 s over the first ~8 harvests.
function nextHarvestDelay() {
  const ramp = Math.min(1, Math.max(0, ((typeof state === 'object' ? state.harvests : 8) - 1) / 7));
  const lo = 12 + (HARVEST_MIN - 12) * ramp, hi = 20 + (HARVEST_MAX - 20) * ramp;
  return lo + Math.random() * (hi - lo);
}
const GOAL = 12;
const EYE = 1.7;
let P = 0;                        // local player's seat (0 = host / single player)
const LIMITS = { road: 15, hamlet: 5, keep: 4, roost: 1, tower: 3 };
const COST = {
  road:   { timber: 1, stone: 1 },
  hamlet: { timber: 1, stone: 1, wheat: 1, cattle: 1 },
  keep:   { wheat: 2, ember: 3 },
  scroll: { wheat: 1, cattle: 1, ember: 1 },
  roost:  { stone: 2, ember: 2, timber: 1 },
  tower:  { stone: 2, timber: 1, ember: 1 },
};
// design tokens (DRAGONHOLD_DESIGN.md): use only these; ember gold is for fire and light only
const PAL = { ink: 0x1e1a26, violet: 0x3a3350, barrow: 0x6e6880, lavender: 0x8e8aa3, bone: 0xede6da, ashen: 0xcfc6bc,
  moss: 0x5f6b5e, straw: 0xa89a86, rose: 0x8c3b4a, ember: 0xe0a24a, mist: 0xb9b4c6 };
const RES = {
  timber: { name: 'Ashwood',    color: '#5E7A4E', icon: '🌲', lore: 'Timber from the dead forests, light, grey and slow to burn.' },
  stone:  { name: 'Gravestone', color: '#8C857A', icon: '🪨', lore: 'Slabs cut from the barrows; the old names are sanded off first.' },
  wheat:  { name: 'Blackwheat', color: '#B8955A', icon: '🌾', lore: 'Dark grain that ripens under fog and bakes into bitter bread.' },
  cattle: { name: 'Moth-silk',  color: '#A99BCB', icon: '🦋', lore: 'Thread unwound from moor cocoons, pale and stronger than rope.' },
  ember:  { name: 'Iron',       color: '#46617C', icon: '🔩', lore: 'Ore from the crags, cold to the touch even in the forge.' },
};
const RES_KEYS = Object.keys(RES);
const BIOME = {
  timber: { name: 'Deadwood',          color: 0x5e7a4e, mini: '#5E7A4E' , lore: 'A forest that stopped growing and never fell.' },
  stone:  { name: 'Barrow hills',      color: 0x8c857a, mini: '#8C857A' , lore: 'Every mound is a grave, and every grave is a quarry.' },
  wheat:  { name: 'Blackwheat fields', color: 0xb8955a, mini: '#B8955A' , lore: 'The only crop that asks for no sun.' },
  cattle: { name: 'Moth moor',         color: 0xa99bcb, mini: '#A99BCB' , lore: 'The bushes hang heavy with cocoons, and the air is never still.' },
  ember:  { name: 'Iron crags',        color: 0x46617c, mini: '#46617C' , lore: 'Sharp rock, deep shafts, and veins that ring when struck.' },
  cradle: { name: 'the Ashen Waste',   color: 0xcfc6bc, mini: '#CFC6BC' , lore: 'Nothing grows here. The Wyrm sleeps under the ash.' },
};
const HOUSES = {
  varn:   { key: 'varn',   name: 'House Varn',   sigil: '🐺', color: 0x8c3b4a, css: '#8C3B4A', style: 'nordic', desc: 'Wolves of the barrow-north. Black timber halls behind bone palisades, grave-fires lit at dusk.' },
  calder: { key: 'calder', name: 'House Calder', sigil: '🦌', color: 0x8e8aa3, css: '#8E8AA3', style: 'stone',  desc: 'Stags of the grey highlands. Slate chapels and antler-crowned spires above the mist.' },
  morrow: { key: 'morrow', name: 'House Morrow', sigil: '🐍', color: 0x5f6b5e, css: '#5F6B5E', style: 'fen',    desc: 'Serpents of the drowned fens. Leaning stilt-towers and lantern-lit causeways over black water.' },
  ashby:  { key: 'ashby',  name: 'House Ashby',  sigil: '🌑', color: 0xa89a86, css: '#A89A86', style: 'sun',    desc: 'House of the eclipsed sun. Pale domes and bell towers, their gold long tarnished.' },
};
let HOUSE = HOUSES.varn;
const DAY_LENGTH = 480;            // seconds for a full day + night

// ---------------------------------------------------------------- rng & noise
const URLQ = new URLSearchParams(location.search);
let seed = URLQ.get('seed') ? (+URLQ.get('seed') | 0) : ((Math.random() * 2 ** 31) | 0);   // guests load the host's world
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = mulberry32(seed);
const rr = (a, b) => a + rand() * (b - a);
const pick = arr => arr[Math.floor(rand() * arr.length)];
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function hash2(x, y) { let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ seed; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// ---------------------------------------------------------------- hex math
const hexToWorld = (q, r) => ({ x: HEX_R * SQ3 * (q + r / 2), z: HEX_R * 1.5 * r });
const worldToFrac = (x, z) => ({ q: (SQ3 / 3 * x - z / 3) / HEX_R, r: (2 / 3 * z) / HEX_R });
function cubeRound(q, r) {
  const s = -q - r; let rq = Math.round(q), rr_ = Math.round(r); const rs = Math.round(s);
  const dq = Math.abs(rq - q), dr = Math.abs(rr_ - r), ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr_ - rs; else if (dr > ds) rr_ = -rq - rs;
  return { q: rq, r: rr_ };
}
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];

// ---------------------------------------------------------------- board generation
const tiles = [], tileMap = new Map(), corners = [], edges = [];
function genBoard() {
  for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) {
    if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) > 2) continue;
    const w = hexToWorld(q, r);
    const t = { id: tiles.length, q, r, x: w.x, z: w.z, type: null, num: null, corners: [] };
    tiles.push(t); tileMap.set(q + ',' + r, t);
  }
  const pool = shuffle(['timber', 'timber', 'timber', 'timber', 'stone', 'stone', 'stone', 'wheat', 'wheat', 'wheat', 'wheat',
    'cattle', 'cattle', 'cattle', 'cattle', 'ember', 'ember', 'ember']);
  let i = 0;
  for (const t of tiles) t.type = (t.q === 0 && t.r === 0) ? 'cradle' : pool[i++];
  // numbers: no two red numbers (6/8) adjacent
  const nums = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
  for (let tries = 0; tries < 500; tries++) {
    shuffle(nums); let k = 0;
    for (const t of tiles) t.num = t.type === 'cradle' ? null : nums[k++];
    const bad = tiles.some(t => (t.num === 6 || t.num === 8) && DIRS.some(([dq, dr]) => {
      const n = tileMap.get((t.q + dq) + ',' + (t.r + dr)); return n && (n.num === 6 || n.num === 8);
    }));
    if (!bad) break;
  }
  // corners & edges
  const cKey = new Map(), eKey = new Map();
  for (const t of tiles) {
    const ids = [];
    for (let k = 0; k < 6; k++) {
      const a = Math.PI / 180 * (60 * k - 30);
      const x = t.x + HEX_R * Math.cos(a), z = t.z + HEX_R * Math.sin(a);
      const key = Math.round(x * 2) + ',' + Math.round(z * 2);
      let c = cKey.get(key);
      if (!c) { c = { id: corners.length, x, z, y: 0, tiles: [], edges: [], adj: [], building: null }; corners.push(c); cKey.set(key, c); }
      c.tiles.push(t.id); ids.push(c.id);
    }
    t.corners = ids;
    for (let k = 0; k < 6; k++) {
      const a = ids[k], b = ids[(k + 1) % 6], key = Math.min(a, b) + '-' + Math.max(a, b);
      if (!eKey.has(key)) {
        const e = { id: edges.length, a, b, road: null, mx: (corners[a].x + corners[b].x) / 2, mz: (corners[a].z + corners[b].z) / 2 };
        edges.push(e); eKey.set(key, e);
        corners[a].edges.push(e.id); corners[b].edges.push(e.id);
        corners[a].adj.push(b); corners[b].adj.push(a);
      }
    }
  }
}
genBoard();

// ---------------------------------------------------------------- terrain height
function heightAt(x, z) {
  const f = worldToFrac(x, z);
  const d = Math.max(Math.abs(f.q), Math.abs(f.r), Math.abs(f.q + f.r));
  let h = 1.8 + vnoise(x * 0.035, z * 0.035) * 1.1 + vnoise(x * 0.12, z * 0.12) * 0.3;
  const c = cubeRound(f.q, f.r), t = tileMap.get(c.q + ',' + c.r);
  if (t) {
    const dd = Math.hypot(x - t.x, z - t.z) / (HEX_R * 0.8);
    const k = 1 - smooth(0, 1, dd);
    if (t.type === 'stone') h += k * (7 + 3 * vnoise(x * 0.09, z * 0.09));
    else if (t.type === 'ember') h += k * (3.5 + 2 * vnoise(x * 0.2, z * 0.2));
    else if (t.type === 'cattle') h += k * 2.2;
    else if (t.type === 'timber') h += k * 1.2;
    else if (t.type === 'wheat') h = h * (1 - k * 0.7) + 1.9 * k * 0.7;
    else if (t.type === 'cradle') {
      const dc = Math.hypot(x, z), kk = Math.max(0, 1 - dc / (HEX_R * 0.9));
      h += 34 * Math.pow(kk, 1.6);
      if (dc < 6) h -= (6 - dc) * 2.6;
    }
  }
  const s = smooth(2.72, 3.25, d);
  return h * (1 - s) - 5 * s;
}
for (const c of corners) c.y = heightAt(c.x, c.z);
const tileAtWorld = (x, z) => { const f = worldToFrac(x, z), c = cubeRound(f.q, f.r); return tileMap.get(c.q + ',' + c.r) || null; };

// ---------------------------------------------------------------- renderer & scene
const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = false;   // flat washes: no realistic shadows
renderer.shadowMap.type = THREE.PCFShadowMap;   // crisp, cel-style shadows
const scene = new THREE.Scene();
const FOG = PAL.mist;
scene.fog = new THREE.Fog(FOG, 1e5, 2e5);   // atmospheric fade is done in the post-process (capped at 40%)
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.3, 2500);
camera.rotation.order = 'YXZ';
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); resizeInk(); });

const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x5a4632, 1.3); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2b8, 2.6);
sun.position.set(-160, 220, 90); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -190, right: 190, top: 190, bottom: -190, near: 10, far: 600 });
sun.shadow.bias = -0.0008; scene.add(sun);

// comic look: 3-tone cel shading
const toonRamp = (() => {
  const d = new Uint8Array([150, 150, 150, 255, 190, 190, 190, 255, 226, 226, 226, 255, 255, 255, 255, 255]);   // soft washes, not hard bands
  const t = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true; return t;
})();
// ---------------------------------------------------------------- ink pass (outlines + halftone)
const inkRT = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
inkRT.depthTexture = new THREE.DepthTexture(1, 1); inkRT.depthTexture.type = THREE.UnsignedIntType;
const inkU = {
  tColor: { value: inkRT.texture }, tDepth: { value: inkRT.depthTexture }, res: { value: new THREE.Vector2(1, 1) },
  near: { value: 0.3 }, far: { value: 2500 }, fadeNear: { value: 200 }, fadeFar: { value: 600 }, px: { value: 1 }, dpr: { value: 1 },
  invProj: { value: new THREE.Matrix4() }, camWorld: { value: new THREE.Matrix4() }, paper: { value: new THREE.Color(PAL.bone) }, fogCol: { value: new THREE.Color(PAL.mist) }, emberK: { value: 0.3 },
};
const inkScene = new THREE.Scene(), inkCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
inkScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
  uniforms: inkU, depthTest: false, depthWrite: false,
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `#include <packing>
    uniform sampler2D tColor, tDepth; uniform vec2 res; uniform float near, far, fadeNear, fadeFar, px, dpr; uniform mat4 invProj, camWorld; uniform vec3 paper, fogCol; uniform float emberK; varying vec2 vUv;
    float D(vec2 uv){ return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, near, far); }
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
    float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * vnoise(p); p = p * 2.03 + 7.1; a *= 0.5; } return v; }
    vec3 worldAt(vec2 uv, float z){ vec4 v = invProj * vec4(uv * 2.0 - 1.0, z * 2.0 - 1.0, 1.0); v /= v.w; return (camWorld * v).xyz; }
    void main(){
      vec2 px1 = 1.0 / res, sc = vUv * res;
      // 1. wobbly edges: nothing is ruler-straight
      vec2 uv = vUv + (vec2(fbm(sc * 0.004), fbm(sc * 0.004 + 17.3)) - 0.5) * 1.2 * px1 * dpr;
      vec3 c0 = texture2D(tColor, uv).rgb;
      vec2 o = px1 * dpr;
      vec3 bl = (texture2D(tColor, uv + vec2(o.x, 0.)).rgb + texture2D(tColor, uv - vec2(o.x, 0.)).rgb
               + texture2D(tColor, uv + vec2(0., o.y)).rgb + texture2D(tColor, uv - vec2(0., o.y)).rgb) * 0.25;
      // crisp: anti-alias only along edges, and a touch of sharpening inside the washes
      float lc = abs(dot(c0 - bl, vec3(0.3, 0.59, 0.11)));
      vec3 col = mix(c0 + (c0 - bl) * 0.35, bl, smoothstep(0.02, 0.09, lc) * 0.55);
      // 2. no outlines: a darker rim where pigment pools at the edge of each wash
      col *= 1.0 - smoothstep(0.02, 0.15, length(c0 - bl)) * 0.18;
      vec2 q = px1 * max(dpr, 1.0);
      float d0 = D(uv), dl = D(uv - vec2(q.x, 0.)), dr = D(uv + vec2(q.x, 0.)), du = D(uv + vec2(0., q.y)), dd = D(uv - vec2(0., q.y));
      float jump = max(max(abs(d0 - dl), abs(d0 - dr)), max(abs(d0 - du), abs(d0 - dd))) / d0;
      float crease = (abs(dl + dr - 2.0 * d0) + abs(du + dd - 2.0 * d0)) / d0;
      // thin ink outlines: silhouettes and creases, fading into the distance
      float inkLine = max(smoothstep(0.03, 0.07, jump), smoothstep(0.012, 0.03, crease) * 0.6) * (1.0 - smoothstep(fadeNear * 0.8, fadeFar, d0));
      // 3. granulation, anchored in the world so it does not swim; paper shows through the wash
      float z = texture2D(tDepth, uv).x, g;
      if (z < 0.99999) {
        vec3 w = worldAt(uv, z); g = fbm(w.xz * 0.32 + w.y * 0.18);
        col = mix(col, fogCol, max(0.4 * smoothstep(60.0, 460.0, d0), smoothstep(700.0, 1350.0, d0)));   // fade capped at 40%; the far horizon dissolves
      } else g = fbm(sc * 0.003 + 5.0);
      float a = clamp(0.8 * g + 0.6, 0.85, 1.0);
      col = pow(mix(pow(paper, vec3(0.4545)), pow(max(col, 0.0), vec3(0.4545)), a), vec3(2.2));   // mixed like pigment on paper, not in linear light
      // 4. light is rare: only ember-gold things glow
      vec3 glow = vec3(0.0); vec2 gr = px1 * 4.0 * px;
      for (int i = 0; i < 8; i++) { float an = float(i) * 0.785398 + 0.3; vec2 dv = vec2(cos(an), sin(an)) * gr;
        for (int k = 1; k <= 2; k++) { vec3 sm = texture2D(tColor, uv + dv * float(k) * 2.0).rgb; glow += vec3(0.75, 0.37, 0.07) * max(sm.r - sm.b * 2.4 - 0.1, 0.0) / float(k); } }
      col += glow * 0.075 * (0.6 + emberK * 1.4);
      // 5. visible paper grain over the whole frame
      float n = vnoise(sc * 0.85) * 0.6 + vnoise(sc * 1.9) * 0.4;
      col *= mix(vec3(1.0), vec3(0.2, 0.17, 0.22), clamp(0.7 * n - 0.25, 0.0, 1.0) * 0.18);
      col = mix(col, col * 0.5, inkLine);
      // never pure black, never pure white
      col = clamp(col, vec3(0.0130, 0.0103, 0.0185), vec3(0.846, 0.791, 0.701));
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`,
})));
function resizeInk() {
  const pr = renderer.getPixelRatio(), w = Math.floor(innerWidth * pr), h = Math.floor(innerHeight * pr);
  inkRT.setSize(w, h); inkU.res.value.set(w, h); inkU.px.value = Math.max(1.6, pr * 1.5); inkU.dpr.value = pr;
}
resizeInk();

const mat = (color, o = {}) => new THREE.MeshToonMaterial({ color, gradientMap: toonRamp, ...o });

// sky dome: painted gradient, sun glow and moon (colours driven by the day/night cycle)
const skyU = {
  top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color(0x2a4a5a) },
  sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() }, moonDir: { value: new THREE.Vector3(0, -1, 0) }, night: { value: 0 }, uT: { value: 0 },
};
const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform vec3 top, horizon, bottom, sunCol, sunDir, moonDir; uniform float night, uT; varying vec3 vDir;
    float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n1(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h1(i), h1(i + vec2(1, 0)), f.x), mix(h1(i + vec2(0, 1)), h1(i + vec2(1, 1)), f.x), f.y); }
    float fb(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n1(p); p = p * 2.02 + 3.7; a *= 0.5; } return v; }
    void main(){
      vec3 d = normalize(vDir); float h = d.y;
      vec3 c = h > 0.0 ? mix(horizon, top, pow(h, 0.6)) : mix(horizon, bottom, min(1.0, -h * 5.0));
      // cloud washes: wet-in-wet bands of darker lavender
      vec2 cp = d.xz / (h + 0.18) * 1.4 + vec2(uT * 0.004, 0.0);
      float cl = smoothstep(0.42, 0.78, fb(cp)) * smoothstep(-0.02, 0.25, h);
      c = mix(c, c * vec3(0.66, 0.64, 0.74), cl * 0.75);
      // the sun by day and the moon by night are discs of bare paper, softly haloed
      float s = max(dot(d, sunDir), 0.0), m = max(dot(d, moonDir), 0.0);
      c = mix(c, sunCol * 0.95, smoothstep(0.9975, 0.9985, s) * 0.8 + pow(s, 60.0) * 0.12);
      c = mix(c, vec3(0.85, 0.80, 0.72), (smoothstep(0.9975, 0.9985, m) * 0.9 + pow(m, 50.0) * 0.1) * night);
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }`,
}));
scene.add(sky);
const stars = (() => {
  const p = [];
  for (let i = 0; i < 900; i++) { const a = Math.random() * Math.PI * 2, y = Math.random() * 0.95 + 0.05, r = Math.sqrt(1 - y * y); p.push(Math.cos(a) * r * 1500, y * 1500, Math.sin(a) * r * 1500); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  scene.add(m); return m;
})();

// ---------------------------------------------------------------- batch 2 art (docs/design/batch2): Lore Scroll cards, sprites, mist
const CARD_SVG = {"sellsword": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 420\" width=\"300\" height=\"420\"><rect x=\"1\" y=\"1\" width=\"298\" height=\"418\" rx=\"12\" fill=\"#EDE6DA\" stroke=\"#1E1A26\" stroke-width=\"2\"/><rect x=\"11\" y=\"11\" width=\"278\" height=\"398\" rx=\"6\" fill=\"none\" stroke=\"#8E8AA3\" stroke-width=\"1\"/><path d=\"M52 250V130Q52 44 150 26Q248 44 248 130V250Z\" fill=\"#D5D0DB\" stroke=\"#1E1A26\" stroke-width=\"2\"/><path d=\"M64 250V132Q64 58 150 40Q236 58 236 132V250\" fill=\"none\" stroke=\"#6E6880\" stroke-width=\"1\"/><g transform=\"translate(90 96) scale(5)\"><path fill=\"#EDE6DA\" d=\"M10.8 3l1.2-2 1.2 2v12h-2.4z\" transform=\"rotate(40 12 13)\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"8\" y=\"15\" width=\"8\" height=\"1.9\" transform=\"rotate(40 12 13)\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"11\" y=\"16.9\" width=\"2\" height=\"4\" transform=\"rotate(40 12 13)\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#3A3350\" cx=\"12\" cy=\"21.8\" r=\"1.4\" transform=\"rotate(40 12 13)\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#EDE6DA\" d=\"M10.8 3l1.2-2 1.2 2v12h-2.4z\" transform=\"rotate(-40 12 13)\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"8\" y=\"15\" width=\"8\" height=\"1.9\" transform=\"rotate(-40 12 13)\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"11\" y=\"16.9\" width=\"2\" height=\"4\" transform=\"rotate(-40 12 13)\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><circle fill=\"#3A3350\" cx=\"12\" cy=\"21.8\" r=\"1.4\" transform=\"rotate(-40 12 13)\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/></g><path d=\"M52 250h196v6H52z\" fill=\"#1E1A26\"/><text x=\"150\" y=\"300.0\" text-anchor=\"middle\" font-family=\"'Grenze Gotisch','Cormorant Garamond',Georgia,serif\" font-size=\"31\" font-weight=\"700\"  fill=\"#1E1A26\">Sellsword</text><path d=\"M110 312h80\" stroke=\"#6E6880\" stroke-width=\"1\"/><path d=\"M150 308l4 4-4 4-4-4z\" fill=\"#8C3B4A\"/><text x=\"150\" y=\"342.0\" text-anchor=\"middle\" font-family=\"'Cormorant Garamond',Georgia,serif\" font-size=\"18.5\" font-weight=\"500\"  fill=\"#3A3350\">Move the Wyrm and rob</text><text x=\"150\" y=\"365.1\" text-anchor=\"middle\" font-family=\"'Cormorant Garamond',Georgia,serif\" font-size=\"18.5\" font-weight=\"500\"  fill=\"#3A3350\">a rival there. Counts toward</text><text x=\"150\" y=\"388.2\" text-anchor=\"middle\" font-family=\"'Cormorant Garamond',Georgia,serif\" font-size=\"18.5\" font-weight=\"500\"  fill=\"#3A3350\">the Mightiest Host.</text></svg>", "renown": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 420\" width=\"300\" height=\"420\"><rect x=\"1\" y=\"1\" width=\"298\" height=\"418\" rx=\"12\" fill=\"#EDE6DA\" stroke=\"#1E1A26\" stroke-width=\"2\"/><rect x=\"11\" y=\"11\" width=\"278\" height=\"398\" rx=\"6\" fill=\"none\" stroke=\"#8E8AA3\" stroke-width=\"1\"/><path d=\"M52 250V130Q52 44 150 26Q248 44 248 130V250Z\" fill=\"#D5D0DB\" stroke=\"#1E1A26\" stroke-width=\"2\"/><path d=\"M64 250V132Q64 58 150 40Q236 58 236 132V250\" fill=\"none\" stroke=\"#6E6880\" stroke-width=\"1\"/><g transform=\"translate(90 96) scale(5)\"><path fill=\"#EDE6DA\" d=\"M3.5 18L2 6.5l5.5 5L12 3.5l4.5 8 5.5-5L20.5 18z\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#3A3350\" d=\"M3.5 17.5h17V21h-17z\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/></g><path d=\"M52 250h196v6H52z\" fill=\"#1E1A26\"/><text x=\"150\" y=\"300.0\" text-anchor=\"middle\" font-family=\"'Grenze Gotisch','Cormorant Garamond',Georgia,serif\" font-size=\"31\" font-weight=\"700\"  fill=\"#1E1A26\">Renown Scroll</text><path d=\"M110 312h80\" stroke=\"#6E6880\" stroke-width=\"1\"/><path d=\"M150 308l4 4-4 4-4-4z\" fill=\"#8C3B4A\"/><text x=\"150\" y=\"342.0\" text-anchor=\"middle\" font-family=\"'Cormorant Garamond',Georgia,serif\" font-size=\"18.5\" font-weight=\"500\"  fill=\"#3A3350\">+1 Renown.</text><text x=\"150\" y=\"365.1\" text-anchor=\"middle\" font-family=\"'Cormorant Garamond',Georgia,serif\" font-size=\"18.5\" font-weight=\"500\"  fill=\"#3A3350\">Keep it secret.</text></svg>", "roads": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 420\" width=\"300\" height=\"420\"><rect x=\"1\" y=\"1\" width=\"298\" height=\"418\" rx=\"12\" fill=\"#EDE6DA\" stroke=\"#1E1A26\" stroke-width=\"2\"/><rect x=\"11\" y=\"11\" width=\"278\" height=\"398\" rx=\"6\" fill=\"none\" stroke=\"#8E8AA3\" stroke-width=\"1\"/><path d=\"M52 250V130Q52 44 150 26Q248 44 248 130V250Z\" fill=\"#D5D0DB\" stroke=\"#1E1A26\" stroke-width=\"2\"/><path d=\"M64 250V132Q64 58 150 40Q236 58 236 132V250\" fill=\"none\" stroke=\"#6E6880\" stroke-width=\"1\"/><g transform=\"translate(90 96) scale(5)\"><path fill=\"#6E6880\" d=\"M2 21V10h3v2h3v-2h3v2h2v-2h3v2h3v-2h3v11z\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#3A3350\" x=\"2\" y=\"15.4\" width=\"20\" height=\"1.3\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/></g><path d=\"M52 250h196v6H52z\" fill=\"#1E1A26\"/><text x=\"150\" y=\"300.0\" text-anchor=\"middle\" font-family=\"'Grenze Gotisch','Cormorant Garamond',Georgia,serif\" font-size=\"31\" font-weight=\"700\"  fill=\"#1E1A26\">Wall Builders</text><path d=\"M110 312h80\" stroke=\"#6E6880\" stroke-width=\"1\"/><path d=\"M150 308l4 4-4 4-4-4z\" fill=\"#8C3B4A\"/><text x=\"150\" y=\"342.0\" text-anchor=\"middle\" font-family=\"'Cormorant Garamond',Georgia,serif\" font-size=\"18.5\" font-weight=\"500\"  fill=\"#3A3350\">Build your next</text><text x=\"150\" y=\"365.1\" text-anchor=\"middle\" font-family=\"'Cormorant Garamond',Georgia,serif\" font-size=\"18.5\" font-weight=\"500\"  fill=\"#3A3350\">two walls for free.</text></svg>", "harvest": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 420\" width=\"300\" height=\"420\"><rect x=\"1\" y=\"1\" width=\"298\" height=\"418\" rx=\"12\" fill=\"#EDE6DA\" stroke=\"#1E1A26\" stroke-width=\"2\"/><rect x=\"11\" y=\"11\" width=\"278\" height=\"398\" rx=\"6\" fill=\"none\" stroke=\"#8E8AA3\" stroke-width=\"1\"/><path d=\"M52 250V130Q52 44 150 26Q248 44 248 130V250Z\" fill=\"#D5D0DB\" stroke=\"#1E1A26\" stroke-width=\"2\"/><path d=\"M64 250V132Q64 58 150 40Q236 58 236 132V250\" fill=\"none\" stroke=\"#6E6880\" stroke-width=\"1\"/><g transform=\"translate(90 96) scale(5)\"><path fill=\"#1E1A26\" d=\"M9.5 22l1.5-9h2l1.5 9z\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><ellipse fill=\"#1E1A26\" cx=\"12\" cy=\"7\" rx=\"2\" ry=\"5.2\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><ellipse fill=\"#1E1A26\" cx=\"7.3\" cy=\"9\" rx=\"1.8\" ry=\"4.6\" transform=\"rotate(-32 7.3 9)\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><ellipse fill=\"#1E1A26\" cx=\"16.7\" cy=\"9\" rx=\"1.8\" ry=\"4.6\" transform=\"rotate(32 16.7 9)\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><rect fill=\"#A89A86\" x=\"9.4\" y=\"15\" width=\"5.2\" height=\"2.3\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/></g><path d=\"M52 250h196v6H52z\" fill=\"#1E1A26\"/><text x=\"150\" y=\"300.0\" text-anchor=\"middle\" font-family=\"'Grenze Gotisch','Cormorant Garamond',Georgia,serif\" font-size=\"31\" font-weight=\"700\"  fill=\"#1E1A26\">Bountiful Harvest</text><path d=\"M110 312h80\" stroke=\"#6E6880\" stroke-width=\"1\"/><path d=\"M150 308l4 4-4 4-4-4z\" fill=\"#8C3B4A\"/><text x=\"150\" y=\"342.0\" text-anchor=\"middle\" font-family=\"'Cormorant Garamond',Georgia,serif\" font-size=\"18.5\" font-weight=\"500\"  fill=\"#3A3350\">Take any two resources.</text></svg>", "decree": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 420\" width=\"300\" height=\"420\"><rect x=\"1\" y=\"1\" width=\"298\" height=\"418\" rx=\"12\" fill=\"#EDE6DA\" stroke=\"#1E1A26\" stroke-width=\"2\"/><rect x=\"11\" y=\"11\" width=\"278\" height=\"398\" rx=\"6\" fill=\"none\" stroke=\"#8E8AA3\" stroke-width=\"1\"/><path d=\"M52 250V130Q52 44 150 26Q248 44 248 130V250Z\" fill=\"#D5D0DB\" stroke=\"#1E1A26\" stroke-width=\"2\"/><path d=\"M64 250V132Q64 58 150 40Q236 58 236 132V250\" fill=\"none\" stroke=\"#6E6880\" stroke-width=\"1\"/><g transform=\"translate(90 96) scale(5)\"><path fill=\"#EDE6DA\" d=\"M3 5.5l3.5-1C8 10 11.5 12.5 18 12l3 4-3 4C9 20.5 4 15 3 5.5z\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#3A3350\" d=\"M2.3 4l4.2-1.3.7 2.2L3 6.2z\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/><path fill=\"#3A3350\" d=\"M18 11.6l3.4 4.4-3.4 4.4z\" stroke=\"#1E1A26\" stroke-width=\".5\" stroke-linejoin=\"round\" paint-order=\"stroke\"/></g><path d=\"M52 250h196v6H52z\" fill=\"#1E1A26\"/><text x=\"150\" y=\"300.0\" text-anchor=\"middle\" font-family=\"'Grenze Gotisch','Cormorant Garamond',Georgia,serif\" font-size=\"31\" font-weight=\"700\"  fill=\"#1E1A26\">Royal Decree</text><path d=\"M110 312h80\" stroke=\"#6E6880\" stroke-width=\"1\"/><path d=\"M150 308l4 4-4 4-4-4z\" fill=\"#8C3B4A\"/><text x=\"150\" y=\"342.0\" text-anchor=\"middle\" font-family=\"'Cormorant Garamond',Georgia,serif\" font-size=\"18.5\" font-weight=\"500\"  fill=\"#3A3350\">Name a resource. Every other</text><text x=\"150\" y=\"365.1\" text-anchor=\"middle\" font-family=\"'Cormorant Garamond',Georgia,serif\" font-size=\"18.5\" font-weight=\"500\"  fill=\"#3A3350\">house gives you all of theirs.</text></svg>", "back": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 420\" width=\"300\" height=\"420\"><rect x=\"1\" y=\"1\" width=\"298\" height=\"418\" rx=\"12\" fill=\"#1E1A26\" stroke=\"#1E1A26\" stroke-width=\"2\"/><rect x=\"11\" y=\"11\" width=\"278\" height=\"398\" rx=\"6\" fill=\"none\" stroke=\"#6E6880\" stroke-width=\"1\"/><path d=\"M116 392Q90 150 142 70\" fill=\"none\" stroke=\"#3A3350\" stroke-width=\"6.0\" stroke-linecap=\"round\"/><path d=\"M184 392Q210 150 158 70\" fill=\"none\" stroke=\"#3A3350\" stroke-width=\"6.0\" stroke-linecap=\"round\"/><path d=\"M98 392Q70 172 136 100\" fill=\"none\" stroke=\"#3A3350\" stroke-width=\"5.5\" stroke-linecap=\"round\"/><path d=\"M202 392Q230 172 164 100\" fill=\"none\" stroke=\"#3A3350\" stroke-width=\"5.5\" stroke-linecap=\"round\"/><path d=\"M80 392Q50 194 130 130\" fill=\"none\" stroke=\"#3A3350\" stroke-width=\"5.0\" stroke-linecap=\"round\"/><path d=\"M220 392Q250 194 170 130\" fill=\"none\" stroke=\"#3A3350\" stroke-width=\"5.0\" stroke-linecap=\"round\"/><path d=\"M62 392Q30 216 124 160\" fill=\"none\" stroke=\"#3A3350\" stroke-width=\"4.5\" stroke-linecap=\"round\"/><path d=\"M238 392Q270 216 176 160\" fill=\"none\" stroke=\"#3A3350\" stroke-width=\"4.5\" stroke-linecap=\"round\"/><path d=\"M44 392Q10 238 118 190\" fill=\"none\" stroke=\"#3A3350\" stroke-width=\"4.0\" stroke-linecap=\"round\"/><path d=\"M256 392Q290 238 182 190\" fill=\"none\" stroke=\"#3A3350\" stroke-width=\"4.0\" stroke-linecap=\"round\"/><path d=\"M26 392Q-10 260 112 220\" fill=\"none\" stroke=\"#3A3350\" stroke-width=\"3.5\" stroke-linecap=\"round\"/><path d=\"M274 392Q310 260 188 220\" fill=\"none\" stroke=\"#3A3350\" stroke-width=\"3.5\" stroke-linecap=\"round\"/><g transform=\"translate(96 156) scale(4.5)\"><path fill=\"#EDE6DA\" d=\"M12.00 1.00L13.71 5.62L17.50 2.47L16.67 7.33L21.53 6.50L18.38 10.29L23.00 12.00L18.38 13.71L21.53 17.50L16.67 16.67L17.50 21.53L13.71 18.38L12.00 23.00L10.29 18.38L6.50 21.53L7.33 16.67L2.47 17.50L5.62 13.71L1.00 12.00L5.62 10.29L2.47 6.50L7.33 7.33L6.50 2.47L10.29 5.62zM8.80 12.00a3.2 3.2 0 1 0 6.40 0a3.2 3.2 0 1 0 -6.40 0z\" fill-rule=\"evenodd\"/></g><circle cx=\"150\" cy=\"210\" r=\"9\" fill=\"#E0A24A\"/></svg>"};
const SPRITE_SVG = {"raven-1": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 48\" width=\"64\" height=\"48\"><path d=\"M31 20C22 12 12 12 2 18c9 0 16 3 22 9z\" fill=\"#1E1A26\"/><path d=\"M31 20C22 12 12 12 2 18c9 0 16 3 22 9z\" fill=\"#1E1A26\" transform=\"matrix(-1 0 0 1 64 0)\"/><path d=\"M32 14c3 0 4 4 4 8l-1 10 3 8h-12l3-8-1-10c0-4 1-8 4-8z\" fill=\"#1E1A26\"/><path d=\"M32 8l2.4 6h-4.8z\" fill=\"#1E1A26\"/></svg>", "raven-2": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 48\" width=\"64\" height=\"48\"><path d=\"M31 20C24 22 16 28 10 40c8-5 14-8 20-9z\" fill=\"#1E1A26\"/><path d=\"M31 20C24 22 16 28 10 40c8-5 14-8 20-9z\" fill=\"#1E1A26\" transform=\"matrix(-1 0 0 1 64 0)\"/><path d=\"M32 14c3 0 4 4 4 8l-1 10 3 8h-12l3-8-1-10c0-4 1-8 4-8z\" fill=\"#1E1A26\"/><path d=\"M32 8l2.4 6h-4.8z\" fill=\"#1E1A26\"/></svg>", "moth-1": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\"><g transform=\"translate(16 0) scale(1 1) translate(-16 0)\"><path d=\"M16 12C10 4 2 6 3 13c1 5 7 6 13 3z\" fill=\"#EDE6DA\"/><path d=\"M16 12c6-8 14-6 13 1-1 5-7 6-13 3z\" fill=\"#EDE6DA\"/><path d=\"M16 16c-5 0-8 4-6 8 2 3 5 0 6-4z\" fill=\"#8E8AA3\"/><path d=\"M16 16c5 0 8 4 6 8-2 3-5 0-6-4z\" fill=\"#8E8AA3\"/></g><ellipse cx=\"16\" cy=\"16\" rx=\"1.6\" ry=\"6\" fill=\"#3A3350\"/></svg>", "moth-2": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\"><g transform=\"translate(16 0) scale(0.55 1) translate(-16 0)\"><path d=\"M16 12C10 4 2 6 3 13c1 5 7 6 13 3z\" fill=\"#EDE6DA\"/><path d=\"M16 12c6-8 14-6 13 1-1 5-7 6-13 3z\" fill=\"#EDE6DA\"/><path d=\"M16 16c-5 0-8 4-6 8 2 3 5 0 6-4z\" fill=\"#8E8AA3\"/><path d=\"M16 16c5 0 8 4 6 8-2 3-5 0-6-4z\" fill=\"#8E8AA3\"/></g><ellipse cx=\"16\" cy=\"16\" rx=\"1.6\" ry=\"6\" fill=\"#3A3350\"/></svg>", "smoke-puff": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" width=\"64\" height=\"64\"><path d=\"M20 50c-10 0-14-10-8-16-4-8 4-16 12-13 3-9 17-9 20 0 9-2 15 8 10 15 5 7-1 15-10 14-5 6-17 6-24 0z\" fill=\"#8E8AA3\" opacity=\".7\"/><path d=\"M24 44c-6 0-8-6-4-10 0-6 7-8 11-5 4-5 12-2 12 4 5 1 5 8 0 10-5 4-13 4-19 1z\" fill=\"#EDE6DA\" opacity=\".6\"/></svg>", "marker-build": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 96 96\" width=\"96\" height=\"96\"><path fill=\"#E0A24A\" fill-rule=\"evenodd\" d=\"M4.00 48.00a44 44 0 1 0 88.00 0a44 44 0 1 0 -88.00 0zM10.00 48.00a38 38 0 1 0 76.00 0a38 38 0 1 0 -76.00 0z\"/><path fill=\"#E0A24A\" d=\"M48 20l6 22 22 6-22 6-6 22-6-22-22-6 22-6z\"/></svg>", "marker-destination": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 96 96\" width=\"96\" height=\"96\"><path fill=\"#EDE6DA\" fill-rule=\"evenodd\" d=\"M4.00 48.00a44 44 0 1 0 88.00 0a44 44 0 1 0 -88.00 0zM9.00 48.00a39 39 0 1 0 78.00 0a39 39 0 1 0 -78.00 0z\"/><path fill=\"#EDE6DA\" fill-rule=\"evenodd\" d=\"M14.00 48.00a34 34 0 1 0 68.00 0a34 34 0 1 0 -68.00 0zM16.00 48.00a32 32 0 1 0 64.00 0a32 32 0 1 0 -64.00 0z\"/><path d=\"M48 0l5 12h-10z\" fill=\"#EDE6DA\" transform=\"rotate(0 48 48)\"/><path d=\"M48 0l5 12h-10z\" fill=\"#EDE6DA\" transform=\"rotate(90 48 48)\"/><path d=\"M48 0l5 12h-10z\" fill=\"#EDE6DA\" transform=\"rotate(180 48 48)\"/><path d=\"M48 0l5 12h-10z\" fill=\"#EDE6DA\" transform=\"rotate(270 48 48)\"/></svg>"};
const MIST_PNG = 'data:image/png;base64,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';
const svgTex = (svg, px = 128) => { const t = new THREE.TextureLoader().load('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace(/width="\d+" height="\d+"/, `width="${px}" height="${px}"`))); t.colorSpace = THREE.SRGBColorSpace; return t; };
const TEX = {
  raven: [svgTex(SPRITE_SVG['raven-1'], 256), svgTex(SPRITE_SVG['raven-2'], 256)],
  moth: [svgTex(SPRITE_SVG['moth-1'], 64), svgTex(SPRITE_SVG['moth-2'], 64)],
  smoke: svgTex(SPRITE_SVG['smoke-puff'], 128),
  build: svgTex(SPRITE_SVG['marker-build'], 256), buildBone: svgTex(SPRITE_SVG['marker-build'].replaceAll('#E0A24A', '#EDE6DA'), 256),
  dest: svgTex(SPRITE_SVG['marker-destination'], 256),
};
// drifting glow motes: soft pastel specks by day, fireflies by night
const motes = (() => {
  const N = 260, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), ph = new Float32Array(N);
  const pal = [PAL.bone, PAL.ashen, PAL.mist].map(h => new THREE.Color(h));
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 175;
    pos.set([Math.cos(a) * r, 2 + Math.random() * 22, Math.sin(a) * r], i * 3);
    const c = pal[i % pal.length]; col.set([c.r, c.g, c.b], i * 3); ph[i] = Math.random() * 100;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('phase', new THREE.BufferAttribute(ph, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uNight: { value: 0 }, uScale: { value: 1 }, tMoth: { value: TEX.moth[0] } }, transparent: true, depthWrite: false, vertexColors: true,
    vertexShader: `attribute float phase; uniform float uTime, uNight, uScale; varying vec3 vC; varying float vA;
      void main(){ vec3 p = position; float t = uTime * 0.25 + phase;
        p += vec3(sin(t * 1.3) * 3.0 + sin(uTime * 9.0 + phase) * 0.25, sin(t * 0.9 + phase) * 1.6 + abs(sin(uTime * 7.0 + phase)) * 0.4, cos(t * 1.1) * 3.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        float tw = 0.55 + 0.45 * sin(uTime * 2.2 + phase * 3.0);
        vA = (0.5 + 0.3 * tw) * (1.0 - smoothstep(90.0, 200.0, -mv.z)); vC = color * mix(1.0, 0.5, uNight);
        gl_PointSize = 9.0 * uScale * 60.0 / max(-mv.z, 6.0); }`,
    fragmentShader: `varying vec3 vC; varying float vA;
      uniform sampler2D tMoth; void main(){ vec4 m = texture2D(tMoth, gl_PointCoord); if (m.a < 0.3) discard; gl_FragColor = vec4(m.rgb * (0.55 + 0.45 * vC), m.a * min(1.0, vA * 1.6)); }`,
  });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts); return pts;
})();
function updateMotes(time) { motes.material.uniforms.tMoth.value = TEX.moth[Math.floor(time / 0.12) % 2]; motes.material.uniforms.uTime.value = time; motes.material.uniforms.uNight.value = night; motes.material.uniforms.uScale.value = renderer.getPixelRatio(); }

// The Hold: a gothic cathedral-fortress inside the skeleton of a colossal dragon, always on the horizon, veiled by mist
const holdObj = (() => {
  const g = new THREE.Group();
  const veil = (hex, k) => new THREE.Color(hex).lerp(new THREE.Color(PAL.mist), k);
  const stone = new THREE.MeshToonMaterial({ color: veil(PAL.violet, 0.12), gradientMap: toonRamp, fog: false });
  const roofM = new THREE.MeshToonMaterial({ color: veil(PAL.ink, 0.12), gradientMap: toonRamp, fog: false });
  const hillM = new THREE.MeshToonMaterial({ color: veil(PAL.barrow, 0.45), gradientMap: toonRamp, fog: false });
  const boneM = new THREE.MeshToonMaterial({ color: veil(PAL.lavender, 0.1), gradientMap: toonRamp, fog: false });
  const lit = new THREE.MeshBasicMaterial({ color: PAL.ember, fog: false });
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; g.add(o); return o; };
  add(new THREE.SphereGeometry(120, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.4, 0.28, 0.9), hillM, 0, -4, 0);
  add(new THREE.BoxGeometry(46, 60, 40), stone, 0, 52, 0);
  add(new THREE.BoxGeometry(20, 110, 20), stone, 0, 55, 10);
  add(new THREE.ConeGeometry(15, 70, 4), roofM, 0, 145, 10, Math.PI / 4);
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(13, 80, 13), stone, sx * 26, 40, 14);
    add(new THREE.ConeGeometry(10, 50, 4), roofM, sx * 26, 105, 14, Math.PI / 4);
    for (const k of [0.6, 1.3]) add(new THREE.ConeGeometry(3.5, 22, 4), roofM, sx * 14 * k, 92, -10, Math.PI / 4);
  }
  add(new THREE.CircleGeometry(5.5, 14), lit, 0, 88, 20.2);
  // ribs arcing over the towers like flying buttresses; the skull on the hill, the tail along the ridge
  for (let i = 0; i < 7; i++) {
    const r = 92 - Math.abs(i - 2.5) * 9, rib = add(new THREE.TorusGeometry(r, 3.2, 6, 24, Math.PI), boneM, 0, 8, -70 + i * 24);
    rib.scale.set(1, 1.45, 1);
  }
  add(new THREE.CylinderGeometry(3.5, 3.5, 180, 8).rotateX(Math.PI / 2), boneM, 0, 8 + 92 * 1.45 * 0.98, -10);   // the spine
  const skull = add(new THREE.SphereGeometry(18, 12, 8).scale(1.3, 0.8, 1), boneM, 120, 14, 40);
  add(new THREE.ConeGeometry(11, 46, 6).rotateZ(-Math.PI / 2), boneM, 152, 10, 46);
  for (const sz of [-1, 1]) add(new THREE.ConeGeometry(3, 28, 5).rotateZ(-1.0), boneM, 108, 34, 40 + sz * 10);
  for (let i = 0; i < 12; i++) add(new THREE.SphereGeometry(6 - i * 0.35, 8, 6), boneM, -100 - i * 13, 10 - i * 0.4, -60 + Math.sin(i * 0.6) * 18);
  g.position.set(-140, 0, -600); g.rotation.y = 0.35; g.scale.setScalar(1.0);
  scene.add(g); return g;
})();
// mist banks drifting low over the isle and around the Hold
const mists = (() => {
  const tx = new THREE.TextureLoader().load(MIST_PNG), out = [];
  for (let i = 0; i < 16; i++) {
    const far = i < 5, a = far ? -1.9 + i * 0.25 : Math.random() * Math.PI * 2, r = far ? rr(480, 620) : rr(110, 220);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, opacity: far ? 0.6 : 0.22, fog: false }));
    s.scale.set(far ? 520 : rr(160, 260), far ? 70 : rr(18, 30), 1); s.position.set(Math.cos(a) * r, far ? 28 : rr(4, 12), Math.sin(a) * r);
    s.userData = { a, r, sp: rr(0.004, 0.01) * (Math.random() < 0.5 ? -1 : 1), far }; scene.add(s); out.push(s);
  }
  return out;
})();
// ravens circling the Hold's spires
const ravens = (() => {
  const out = [];
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.raven[0], transparent: true, depthWrite: false, fog: false })); b.scale.set(16, 12, 1);
    b.userData = { ph: Math.random() * 6, r: rr(60, 130), h: rr(150, 230), sp: rr(0.15, 0.3) }; scene.add(b); out.push(b);
  }
  return out;
})();
function updateAtmosphere(time) {
  for (const s of mists) { const u = s.userData; u.a += u.sp * 0.016; if (!u.far) s.position.set(Math.cos(u.a) * u.r, s.position.y, Math.sin(u.a) * u.r); s.material.opacity = (todNow ? todNow.mist : 0.6) * (u.far ? 0.9 : 0.35); }
  const hp = holdObj.position;
  for (const b of ravens) { const u = b.userData, a = time * u.sp + u.ph;
    b.position.set(hp.x + Math.cos(a) * u.r, u.h + Math.sin(time * 0.7 + u.ph) * 8, hp.z + Math.sin(a) * u.r);
    b.material.map = TEX.raven[Math.floor(time / 0.25 + u.ph) % 2]; }
  reavers.children[0].scale.setScalar(1 + Math.sin(time * 0.9) * 0.02);   // the Wyrm breathes in its sleep
}

// ground
{
  const SIZE = 400, SEG = 200;
  const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)));
  const ng = g.toNonIndexed(), np = ng.attributes.position, cols = new Float32Array(np.count * 3);
  const _vc = new THREE.Color(), c = new THREE.Color(), sand = new THREE.Color(PAL.ashen), wet = new THREE.Color(PAL.barrow), mask = new Float32Array(np.count);
  for (let i = 0; i < np.count; i += 3) {
    const cx = (np.getX(i) + np.getX(i + 1) + np.getX(i + 2)) / 3, cz = (np.getZ(i) + np.getZ(i + 1) + np.getZ(i + 2)) / 3;
    const cy = (np.getY(i) + np.getY(i + 1) + np.getY(i + 2)) / 3;
    const t = tileAtWorld(cx, cz), j = hash2(Math.round(cx * 3), Math.round(cz * 3));
    let m = 0;
    if (cy < 0.2) c.copy(wet);
    else if (cy < 1.0 || !t) c.copy(sand);
    else { c.setHex(BIOME[t.type].color); m = 1; if (t.type === 'cradle') c.lerp(_vc.setHex(PAL.barrow), Math.min(0.75, Math.max(0, (cy - 6) / 30))); }
    c.offsetHSL(0, 0, (j - 0.5) * 0.02);
    for (let k = 0; k < 3; k++) { cols[(i + k) * 3] = c.r; cols[(i + k) * 3 + 1] = c.g; cols[(i + k) * 3 + 2] = c.b; mask[i + k] = m; }
  }
  ng.setAttribute('color', new THREE.BufferAttribute(cols, 3)); ng.setAttribute('tileMask', new THREE.BufferAttribute(mask, 1));
  ng.computeVertexNormals();
  const gm = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toonRamp });
  gm.onBeforeCompile = sh => {
    sh.uniforms.uR = { value: HEX_R }; sh.uniforms.uPaper = { value: new THREE.Color(PAL.bone) };
    sh.vertexShader = 'attribute float tileMask; varying float vMask; varying vec3 vWP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vMask = tileMask; vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = `uniform float uR; uniform vec3 uPaper; varying float vMask; varying vec3 vWP;
      float gh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float gn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(gh(i), gh(i + vec2(1, 0)), f.x), mix(gh(i + vec2(0, 1)), gh(i + vec2(1, 1)), f.x), f.y); }
      ` + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      if (vMask > 0.5) {
        vec2 p = vWP.xz;
        float q = (0.57735 * p.x - p.y / 3.0) / uR, r = (2.0 / 3.0 * p.y) / uR, s3 = -q - r;
        float rq = floor(q + 0.5), rr = floor(r + 0.5), rs = floor(s3 + 0.5);
        float dq = abs(rq - q), dr = abs(rr - r), ds = abs(rs - s3);
        if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs;
        vec2 c = vec2(uR * 1.7320508 * (rq + rr / 2.0), uR * 1.5 * rr), l = p - c;
        float m = max(abs(l.x), max(abs(dot(l, vec2(0.5, 0.8660254))), abs(dot(l, vec2(-0.5, 0.8660254)))));
        float edge = uR * 0.8660254 - m + (gn(p * 0.18) - 0.5) * 1.6 + (gn(p * 0.9) - 0.5) * 0.35;   // wobbly hand-painted border
        float gap = 1.15;
        diffuseColor.rgb *= 1.0 - 0.16 * (1.0 - smoothstep(gap, gap + 1.1, edge));                    // pigment pools at the wet edge
        diffuseColor.rgb = mix(uPaper, diffuseColor.rgb, smoothstep(gap - 0.25, gap + 0.15, edge));  // bare paper between the tiles
      }`);
  };
  const ground = new THREE.Mesh(ng, gm);
  ground.receiveShadow = true; scene.add(ground);
}

// sea
const water = (() => {
  const g = new THREE.PlaneGeometry(2400, 2400, 80, 80); g.rotateX(-Math.PI / 2);
  const ng = g.toNonIndexed();
  const m = new THREE.Mesh(ng, new THREE.MeshToonMaterial({ color: PAL.lavender, gradientMap: toonRamp, transparent: true, opacity: 0.92 }));
  m.position.y = 0.3; m.receiveShadow = true; scene.add(m);
  m.userData.base = Float32Array.from(ng.attributes.position.array);
  return m;
})();

// distant islets
for (let i = 0; i < 14; i++) {
  const a = rr(0, Math.PI * 2), d = rr(380, 700), s = rr(20, 70);
  const m = new THREE.Mesh(new THREE.ConeGeometry(s, s * rr(0.5, 1.1), 6 + Math.floor(rr(0, 3))), mat(pick([0x5b7d48, 0x6b6a62, 0x4f6b3d])));
  m.position.set(Math.cos(a) * d, -2, Math.sin(a) * d); m.rotation.y = rr(0, 6); scene.add(m);
}

// clouds
const clouds = [], cloudMat = mat(0xffffff, { transparent: true, opacity: 0.92 });
for (let i = 0; i < 16; i++) {
  const g = new THREE.Group(), cm = cloudMat;
  for (let k = 0; k < 4 + Math.floor(rr(0, 3)); k++) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(6, 12), 0), cm);
    b.position.set(rr(-14, 14), rr(-2, 3), rr(-6, 6)); g.add(b);
  }
  g.position.set(rr(-500, 500), rr(90, 140), rr(-500, 500)); scene.add(g); clouds.push(g);
}

// ---------------------------------------------------------------- decorations
function placeIn(t, minR, maxR) {
  const a = rand() * Math.PI * 2, r = minR + Math.sqrt(rand()) * (maxR - minR);
  const x = t.x + Math.cos(a) * r, z = t.z + Math.sin(a) * r;
  return { x, z, y: heightAt(x, z) };
}
// trees and grass sway in a slow wind (vertex shader, per instance phase)
const windU = { value: 0 };
function swayMat(color, amount) {
  const m = mat(color);
  m.onBeforeCompile = sh => {
    sh.uniforms.uWind = windU;
    sh.vertexShader = 'uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec3 ip = instanceMatrix[3].xyz;
        float hh = max(position.y - 1.2, 0.0);
        float ph = uWind * 1.2 + ip.x * 0.11 + ip.z * 0.07;
        transformed.x += (sin(ph) * 0.7 + sin(ph * 2.3) * 0.3) * ${amount.toFixed(2)} * hh * 0.35;
        transformed.z += cos(ph * 0.8) * ${amount.toFixed(2)} * hh * 0.2;
      #endif`);
  };
  return m;
}
function instanced(geo, material, list, colorFn) {
  const m = new THREE.InstancedMesh(geo, material, list.length), o = new THREE.Object3D(), c = new THREE.Color();
  list.forEach((it, i) => {
    o.position.set(it.x, it.y, it.z); o.rotation.set(it.rx || 0, it.ry || 0, it.rz || 0); o.scale.set(it.s || 1, (it.s || 1) * (it.sy || 1), it.s || 1); o.updateMatrix();
    m.setMatrixAt(i, o.matrix);
    if (colorFn) { c.setHex(colorFn(it)); m.setColorAt(i, c); }
  });
  m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
}
const trees = [], rocks = [], tufts = [], vents = [], blackRocks = [];
const windmills = [], cows = [], smoke = [];
const mounds = [], standing = [], cocoons = [], peaks = [], ribs = [];
const stumps = [], doorUp = [], doorLintel = [], ears = [], bushes = [], shoreRocks = [], crownSpikes = [];
for (const t of tiles) {
  if (t.type === 'timber') {
    for (let i = 0; i < 22; i++) { const p = placeIn(t, 5, HEX_R * 0.72); trees.push({ ...p, s: rr(1.5, 2.3), ry: rr(0, 6), v: i % 3 }); }
    for (let i = 0; i < 5; i++) { const p = placeIn(t, 5, HEX_R * 0.7); stumps.push({ ...p, s: rr(0.8, 1.2), ry: rr(0, 6) }); }
  }
  if (t.type === 'stone') {
    for (let i = 0; i < 4; i++) {   // barrows with a stone doorway, each with a leaning standing stone
      const p = placeIn(t, 6, HEX_R * 0.62), s = rr(5, 7), ry = rr(0, 6); mounds.push({ ...p, s, sy: 0.62, ry });
      const fx = Math.sin(ry), fz = Math.cos(ry), dx = p.x + fx * s * 0.92, dz = p.z + fz * s * 0.92, dy = heightAt(dx, dz);
      for (const side of [-1, 1]) doorUp.push({ x: dx + fz * side * 1.2, z: dz - fx * side * 1.2, y: dy - 0.2, ry });
      doorLintel.push({ x: dx, z: dz, y: dy + 2.2, ry });
    }
    for (let i = 0; i < 5; i++) { const p = placeIn(t, 5, HEX_R * 0.7); standing.push({ ...p, y: p.y - 0.2, s: rr(0.9, 1.15), ry: rr(0, 6), rz: rr(-0.2, 0.2) }); }
    if (t.id % 3 === 0) for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, x = t.x + 9 + Math.cos(a) * 4.5, z = t.z - 6 + Math.sin(a) * 4.5; standing.push({ x, z, y: heightAt(x, z) - 0.2, s: 0.85, ry: -a }); }   // a stone circle
  }
  if (t.type === 'wheat') {
    for (let r = -5; r <= 5; r++) for (let i = -8; i <= 8; i++) {   // stalks in rows, each with a heavier ear
      const x = t.x + i * 1.9 + rr(-0.4, 0.4), z = t.z + r * 3 + rr(-0.5, 0.5);
      if (Math.hypot(x - t.x, z - t.z) > HEX_R * 0.74 || rand() < 0.25) continue;
      const y = heightAt(x, z), s = rr(0.85, 1.15), rz = rr(-0.12, 0.12); tufts.push({ x, y, z, s, ry: rr(0, 6), rz }); ears.push({ x, y, z, s, ry: rr(0, 6), rz });
    }
    const m = placeIn(t, 8, 12), g = new THREE.Group();   // the mill: a tapered tower, cone cap, four lattice sails
    g.add(cyl(1.7, 2.5, 11, 8, mat(PAL.violet), 0, 0, 0)); g.add(cone(2.3, 4, 8, mat(PAL.ink), 0, 11, 0));
    const blades = new THREE.Group(); blades.position.set(0, 9.6, 2.6);
    for (let k = 0; k < 4; k++) { const piv = new THREE.Group(); piv.rotation.z = k * Math.PI / 2; blades.add(piv);
      piv.add(B(0.2, 7, 0.2, mat(PAL.ink), 0, 0, 0)); for (const y of [2.5, 4, 5.5]) piv.add(B(1.6, 0.12, 0.12, mat(PAL.ink), 0.8, y, 0)); piv.add(B(0.1, 4.5, 0.1, mat(PAL.ink), 1.6, 2.4, 0)); }
    g.add(blades); g.position.set(m.x, m.y, m.z); g.rotation.y = rr(0, 6); scene.add(g); windmills.push(blades);
    const sc = placeIn(t, 6, 14), sg = new THREE.Group();   // a scarecrow
    sg.add(B(0.2, 3.5, 0.2, mat(PAL.ink), 0, 0, 0)); sg.add(B(2.2, 0.2, 0.2, mat(PAL.ink), 0, 2.6, 0)); sg.add(B(1.6, 1.4, 0.1, mat(PAL.violet), 0, 1.4, 0.1)); sg.add(cone(0.6, 1.1, 5, mat(PAL.ink), 0, 3.4, 0));
    sg.position.set(sc.x, sc.y, sc.z); sg.rotation.y = rr(0, 6); scene.add(sg);
  }
  if (t.type === 'cattle') for (let i = 0; i < 12; i++) {   // dry bushes hung with cocoons
    const p = placeIn(t, 5, HEX_R * 0.7); bushes.push({ ...p, s: rr(0.9, 1.3), ry: rr(0, 6) });
    for (let k = 0; k < 1 + (i % 3); k++) { const a = rr(0, 6); cocoons.push({ x: p.x + Math.cos(a) * 0.7, z: p.z + Math.sin(a) * 0.7, y: p.y + rr(0.6, 1.2), s: rr(0.55, 0.75), ry: a }); }
  }
  if (t.type === 'ember') for (let c = 0; c < 3; c++) {   // crags: clusters of tilted, faceted spikes 8-20 m tall
    const p = placeIn(t, 4, HEX_R * 0.55);
    for (let i = 0; i < 3 + (c % 3); i++) { const a = rr(0, 6), r = i ? rr(1.5, 3.5) : 0, x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
      peaks.push({ x, z, y: heightAt(x, z) - 0.6, s: rr(0.8, 1.2), sy: rr(1.15, 2.6) * (i ? 0.8 : 1), ry: rr(0, 6), rx: rr(-0.2, 0.2), rz: rr(-0.2, 0.2) }); }
  }
  if (t.type === 'cradle') for (let k = 0; k < 2; k++) for (let i = 0; i < 6; i++) {   // two half-buried ribcages along their spines
    const a0 = k ? 2.2 : -0.9, x = Math.cos(a0) * 17 + Math.cos(a0 + Math.PI / 2) * (i - 2.5) * 2.6, z = Math.sin(a0) * 17 + Math.sin(a0 + Math.PI / 2) * (i - 2.5) * 2.6;
    ribs.push({ x, z, y: heightAt(x, z) - 0.8, s: 1.35 - Math.abs(i - 2.5) * 0.12, ry: -a0 });
  }
}
{   // the volcano's rim: eight to ten leaning spikes so it reads as a broken crown
  const top = heightAt(0, 0);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + rr(-0.15, 0.15), r = 6.2, x = Math.cos(a) * r, z = Math.sin(a) * r;
    crownSpikes.push({ x, z, y: heightAt(x, z) - 1, s: rr(0.8, 1.2), sy: rr(0.8, 1.5), ry: rr(0, 6), rx: Math.sin(a) * 0.28, rz: -Math.cos(a) * 0.28 }); }
  for (let i = 0; i < 46; i++) {   // dark rocks near the shore
    const a = rand() * Math.PI * 2, r = rr(118, 140), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (heightAt(x, z) > 1.2) continue; shoreRocks.push({ x, z, y: -0.5, s: rr(0.6, 1.4), sy: rr(1, 2), ry: rr(0, 6), rz: rr(-0.2, 0.2) });
  }
}
// bare dead trees in three variants (twisted, split, leaning), 9-14 m tall, with three or four bare branches
const M4 = () => new THREE.Matrix4();
function treeGeo(v) {
  const parts = [], add = (geo, m4) => parts.push({ geo, m: m4 });
  const br = (y, rz, ry, l, x = 0) => add(new THREE.CylinderGeometry(0.04, 0.1, l, 4).translate(0, l / 2, 0), M4().makeTranslation(x, y, 0).multiply(M4().makeRotationY(ry)).multiply(M4().makeRotationZ(rz)));
  if (v === 0) {   // twisted: three offset segments
    add(new THREE.CylinderGeometry(0.2, 0.28, 2.2, 5).translate(0, 1.1, 0), M4());
    add(new THREE.CylinderGeometry(0.15, 0.2, 2.2, 5).translate(0, 1.1, 0), M4().makeTranslation(0.25, 2.1, 0).multiply(M4().makeRotationZ(-0.25)));
    add(new THREE.CylinderGeometry(0.08, 0.15, 2.2, 5).translate(0, 1.1, 0), M4().makeTranslation(-0.1, 4.1, 0).multiply(M4().makeRotationZ(0.3)));
    br(3.2, 0.8, 0, 2.2, 0.3); br(4.6, -0.7, 1.4, 1.8); br(5.6, 0.6, 3.3, 1.4, -0.3); br(2.6, -0.9, 4.4, 1.5);
  } else if (v === 1) {   // split: the trunk forks
    add(new THREE.CylinderGeometry(0.2, 0.3, 3.2, 5).translate(0, 1.6, 0), M4());
    for (const sd of [-1, 1]) add(new THREE.CylinderGeometry(0.07, 0.17, 3.4, 5).translate(0, 1.7, 0), M4().makeTranslation(0, 3.1, 0).multiply(M4().makeRotationZ(sd * 0.32)));
    br(4.6, 0.9, 0, 1.5, 0.8); br(4.4, -0.9, 0.2, 1.5, -0.8); br(2.4, 0.8, 2.2, 1.3);
  } else {   // leaning 15 degrees
    add(new THREE.CylinderGeometry(0.1, 0.28, 6, 5).translate(0, 3, 0), M4().makeRotationZ(0.26));
    br(3.0, 1.0, 0, 2.0, -0.8); br(4.3, -0.4, 1.5, 1.8, -1.1); br(5.2, 0.9, 3.4, 1.3, -1.4); br(2.2, -0.9, 4.2, 1.4, -0.5);
  }
  return mergeGeosEarly(parts);
}
const deadTree = treeGeo(2);
function mergeGeosEarly(parts) {
  const pos = [], nor = [];
  for (const { geo, m } of parts) { const g = (geo.index ? geo.toNonIndexed() : geo).applyMatrix4(m); pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return out;
}
const treeMat = swayMat(PAL.ink, 0.1);
for (let v = 0; v < 3; v++) instanced(treeGeo(v), treeMat, trees.filter(t => t.v === v));
instanced(new THREE.CylinderGeometry(0.5, 0.6, 1, 6).translate(0, 0.5, 0), mat(PAL.ink), stumps);
instanced(new THREE.BoxGeometry(0.6, 2.4, 0.6).translate(0, 1.2, 0), mat(PAL.ink), doorUp);
instanced(new THREE.BoxGeometry(3, 0.5, 0.7), mat(PAL.ink), doorLintel);
instanced(new THREE.OctahedronGeometry(0.16, 0).scale(1, 2.2, 1).translate(0, 1.75, 0), swayMat(PAL.ink, 1.4), ears);
instanced((() => { const parts = []; for (let i = 0; i < 4; i++) parts.push({ geo: new THREE.CylinderGeometry(0.03, 0.07, 2, 4).translate(0, 1, 0), m: M4().makeRotationY(i * 1.6).multiply(M4().makeRotationZ(0.35 + (i % 2) * 0.2)) }); return mergeGeosEarly(parts); })(), mat(PAL.ink), bushes);
instanced(new THREE.ConeGeometry(2.2, 9, 4).translate(0, 4.5, 0), mat(PAL.violet), crownSpikes);
instanced(new THREE.ConeGeometry(1.2, 2.5, 4).translate(0, 1.2, 0), mat(PAL.ink), shoreRocks);
instanced(new THREE.SphereGeometry(1, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), mat(PAL.violet), mounds);
instanced(new THREE.BoxGeometry(0.8, 3, 0.5).translate(0, 1.5, 0), mat(PAL.ink), standing);
instanced(new THREE.BoxGeometry(0.06, 1.6, 0.06).translate(0, 0.8, 0), swayMat(PAL.ink, 1.4), tufts);
instanced(new THREE.SphereGeometry(0.25, 8, 6).scale(1, 2, 1), mat(PAL.bone), cocoons);
instanced(new THREE.ConeGeometry(2.4, 8, 5).translate(0, 4, 0), mat(PAL.ink), peaks);
instanced(new THREE.TorusGeometry(3.2, 0.3, 5, 14, Math.PI * 0.85).scale(1, 1.6, 1), mat(PAL.bone), ribs);
function makeCow(t) {
  const g = new THREE.Group(), body = mat(pick([0x6b3f22, 0x8a5a33, 0xe9e2d4, 0x3b2a20]));
  const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 1.1), body); b.position.y = 1.2; g.add(b);
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), body); h.position.set(1.35, 1.55, 0); g.add(h);
  const horn = mat(0xeeeadd);
  for (const s of [-1, 1]) { const hn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.6, 4), horn); hn.position.set(1.4, 2.05, s * 0.35); hn.rotation.x = s * 0.6; g.add(hn); }
  const leg = new THREE.BoxGeometry(0.25, 0.7, 0.25), lm = mat(0x2b211a);
  for (const [lx, lz] of [[-0.8, -0.35], [-0.8, 0.35], [0.8, -0.35], [0.8, 0.35]]) { const l = new THREE.Mesh(leg, lm); l.position.set(lx, 0.35, lz); g.add(l); }
  g.traverse(o => o.castShadow = true);
  const p = placeIn(t, 6, HEX_R * 0.65); g.position.set(p.x, p.y, p.z); g.rotation.y = rr(0, 6); scene.add(g);
  return { g, t };
}

const lavaLight = new THREE.PointLight(PAL.ember, 120, 40, 2);
// the Cradle: lava pool, smoke, three dragon eggs (teaser)
{
  const lava = new THREE.Mesh(new THREE.CircleGeometry(5.5, 10), new THREE.MeshBasicMaterial({ color: PAL.ember, transparent: true, opacity: 0.55 }));
  lava.rotation.x = -Math.PI / 2; lava.position.set(0, heightAt(0, 0) + 1.0, 0); scene.add(lava);
  const glow = lavaLight; glow.intensity = 120; glow.position.set(0, heightAt(0, 0) + 4, 0); scene.add(glow);
  for (let i = 0; i < 30; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.smoke, color: new THREE.Color(PAL.bone).lerp(new THREE.Color(PAL.violet), 0.35), transparent: true, depthWrite: false }));
    s.userData.age = rr(0, 1); s.userData.base = rr(4, 7); smoke.push(s); scene.add(s);
  }
}

// ---------------------------------------------------------------- number banners
function bannerTexture(num, icon, ring = '#8E8AA3') {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 176;
  const g = cv.getContext('2d'); g.scale(2, 2);
  g.fillStyle = '#1E1A26'; g.fillRect(30.6, 0, 2.8, 9);
  g.fill(new Path2D('M27.40 12.50a4.6 4.6 0 1 0 9.20 0a4.6 4.6 0 1 0 -9.20 0zM29.80 12.50a2.2 2.2 0 1 0 4.40 0a2.2 2.2 0 1 0 -4.40 0z'), 'evenodd');
  g.fillRect(22, 16, 20, 2.6);
  g.beginPath(); g.arc(32, 52, 29, 0, Math.PI * 2); g.fillStyle = '#EDE6DA'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = '#1E1A26'; g.stroke();
  g.beginPath(); g.arc(32, 52, 25.6, 0, Math.PI * 2); g.lineWidth = 2.6; g.strokeStyle = ring; g.stroke();
  g.font = '14px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#1E1A26'; g.fillText(icon || '', 32, 36);   // the resource icon
  const red = num === 6 || num === 8, ink = red ? '#8C3B4A' : '#1E1A26';
  g.fillStyle = ink; g.font = `700 ${num > 9 ? 21 : 25}px Cinzel, Georgia, serif`; g.textBaseline = 'alphabetic'; g.fillText(String(num), 32, 63.5);   // lining figures
  const pips = 6 - Math.abs(7 - num);
  for (let i = 0; i < pips; i++) { g.beginPath(); g.arc(32 + (i - (pips - 1) / 2) * 5.4, 72, 1.8, 0, Math.PI * 2); g.fill(); }
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; return tx;
}
for (const t of tiles) {
  if (!t.num) continue;
  const y = heightAt(t.x, t.z);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 7, 5), mat(PAL.ink)); pole.position.set(t.x, y + 3.5, t.z); pole.castShadow = true; scene.add(pole);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bannerTexture(t.num, RES[t.type].icon, RES[t.type].color), fog: false, alphaTest: 0.5 }));
  sp.scale.set(5, 6.9, 1); sp.position.set(t.x, y + 10, t.z); scene.add(sp);
  t.banner = sp; t.pole = pole;
}

// comic caption textures for labels in the world
function labelTexture(text, bg = '#EDE6DA', fg = '#1E1A26') {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 100; const g = cv.getContext('2d');
  g.globalAlpha = 0.9; g.fillStyle = bg; g.beginPath(); g.roundRect(6, 10, 500, 80, 40); g.fill(); g.globalAlpha = 1;
  g.lineWidth = 2; g.strokeStyle = 'rgba(58,51,80,.45)'; g.stroke();
  g.fillStyle = fg; g.font = "700 40px 'Cormorant Garamond', Georgia, serif"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 52);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// floating "+1 🌲" popups in the world
const floats = [];
function floatText(text, x, y, z, color = '#1E1A26') {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 96; const g = cv.getContext('2d');
  g.font = "700 54px 'Cormorant Garamond', Georgia, serif"; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 10; g.strokeStyle = 'rgba(237,230,218,.92)'; g.strokeText(text, 128, 50); g.fillStyle = color; g.fillText(text, 128, 50);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false, transparent: true }));
  s.scale.set(7, 2.6, 1); s.position.set(x, y, z); s.renderOrder = 10; scene.add(s);
  floats.push({ s, t: 0 });
}
function updateFloats(dt) {
  for (let i = floats.length - 1; i >= 0; i--) {
    const f = floats[i]; f.t += dt; f.s.position.y += dt * 2.2; f.s.material.opacity = Math.min(1, 3 - f.t);
    if (f.t > 3) { scene.remove(f.s); f.s.material.map.dispose(); f.s.material.dispose(); floats.splice(i, 1); }
  }
}
// show what every building you can see harvests
function harvestPopups(sum) {
  for (const t of tiles) {
    if (t.num !== sum || t === reaverTile || t.scorchedUntil >= state.harvests) continue;
    for (const cid of t.corners) {
      const c = corners[cid]; if (!c.building) continue;
      if (c.building.owner !== P && !c.tiles.some(id => visible.has(id))) continue;
      const n = (c.building.type === 'keep' ? 2 : 1) + (state.dawnBounty ? 1 : 0);
      floatText(`+${n} ${RES[t.type].icon}`, c.x + rr(-2, 2), c.y + (c.building.type === 'keep' ? 15 : 9), c.z + rr(-2, 2), c.building.owner === P ? '#1E1A26' : '#3A3350');
    }
  }
}

// ---------------------------------------------------------------- reavers
const reavers = (() => {
  const g = new THREE.Group(), ink = mat(PAL.ink), vio = mat(PAL.violet);
  for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.TorusGeometry(4.2 - i * 1.1, 1.05 - i * 0.18, 8, 22), i % 2 ? vio : ink); c.rotation.x = Math.PI / 2; c.position.y = 0.8 + i * 1.3; g.add(c); }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 4.5, 8), ink); neck.position.set(3.6, 2.6, 1.2); neck.rotation.set(0.4, 0, -0.9); g.add(neck);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.85, 2.8, 6), ink); head.position.set(5.6, 3.9, 1.9); head.rotation.set(0, 0, -1.9); g.add(head);
  for (const sz of [-1, 1]) { const horn = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.3, 4), vio); horn.position.set(5.0, 4.8, 1.9 + sz * 0.4); horn.rotation.z = 0.5; g.add(horn); }
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.17, 6, 4), new THREE.MeshBasicMaterial({ color: PAL.ember })); eye.position.set(5.75, 4.2, 2.45); g.add(eye);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 1.6, sp = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.3, 4), vio); sp.position.set(Math.cos(a) * 4.2, 2.0, Math.sin(a) * 4.2); g.add(sp); }
  for (const sz of [-1, 1]) {   // folded wings
    const w = new THREE.Mesh(new THREE.ConeGeometry(2.2, 5.5, 3), vio); w.position.set(-0.5, 4.4, sz * 1.6); w.rotation.set(sz * 0.5, 0, 0.35); w.scale.z = 0.25; g.add(w);
  }
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture('The Wyrm · no harvest here'), depthWrite: false, transparent: true })); tag.scale.set(11, 2.2, 1); tag.position.y = 11; g.add(tag);
  g.userData.breath = g.children[2]; scene.add(g); return g;
})();
let reaverTile = tiles.find(t => t.type === 'cradle');
// The Wyrm wakes and flies: the coiled sleeper hides, a winged Wyrm rises 20 m, arcs to its new tile over 2.5 s, lands and coils (1 s)
let wyrmFly = null, wyrmFlyer = null;
function placeReavers(t) {
  const first = !reaverTile || !reavers.userData.placed;
  reaverTile = t;
  const x = t.x + 9, z = t.z + 5, to = new THREE.Vector3(x, heightAt(x, z), z);
  if (first || state.phase !== 'play') { reavers.position.copy(to); reavers.userData.placed = true; return; }
  if (reavers.position.distanceTo(to) < 1) return;
  wyrmFly = { from: (wyrmFly ? wyrmFly.to : reavers.position).clone(), to, t: 0 };
  if (!wyrmFlyer) {
    wyrmFlyer = makeDragon({ color: PAL.ember });
    wyrmFlyer.traverse(o => { if (o.isMesh && o.material && !o.material.isMeshBasicMaterial) { o.material = o.material.clone(); o.material.color.setHex(o.material.side === THREE.DoubleSide ? PAL.violet : PAL.ink); } });
    wyrmFlyer.scale.setScalar(1.7);
  }
  wyrmFlyer.visible = true; reavers.visible = false;
  sfx('raid');
}
function updateWyrmFlight(dt, time) {
  if (!wyrmFly) return;
  const f = wyrmFly, FLY = 2.5, COIL = 1.0; f.t += dt;
  const k = Math.min(1, f.t / FLY), e = k * k * (3 - 2 * k);
  if (f.t <= FLY) {
    const x = f.from.x + (f.to.x - f.from.x) * e, z = f.from.z + (f.to.z - f.from.z) * e;
    const y = f.from.y + (f.to.y - f.from.y) * e + Math.sin(Math.PI * k) * 20 + 4 * Math.min(1, k * 6) * (1 - k);
    wyrmFlyer.position.set(x, y, z); wyrmFlyer.rotation.set(-Math.cos(Math.PI * k) * 0.35, Math.atan2(f.to.x - f.from.x, f.to.z - f.from.z), 0);
    wyrmFlyer.userData.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * Math.sin(time * Math.PI * 2 / 1.2) * 0.75; });
  } else {   // land and coil
    const c = Math.min(1, (f.t - FLY) / COIL);
    wyrmFlyer.visible = c < 0.5; reavers.visible = c >= 0.5;
    reavers.position.copy(f.to); reavers.scale.setScalar(0.6 + 0.4 * c);
    if (c >= 1) { wyrmFly = null; reavers.scale.setScalar(1); }
  }
}
placeReavers(reaverTile);

// ---------------------------------------------------------------- rune stones (dice in the sky)
const RUNE_PIPS = { 1: [[24, 19.4]], 2: [[14, 9.4], [34, 29.4]], 3: [[14, 9.4], [24, 19.4], [34, 29.4]], 4: [[14, 9.4], [34, 9.4], [14, 29.4], [34, 29.4]],
  5: [[14, 9.4], [34, 9.4], [24, 19.4], [14, 29.4], [34, 29.4]], 6: [[14, 9.4], [34, 9.4], [14, 19.4], [34, 19.4], [14, 29.4], [34, 29.4]] };
function runeTexture(n) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'); g.scale(128 / 48, 128 / 48);
  const body = new Path2D('M10 3h27l8 7v28l-7 7H10l-7-8V10z');
  g.fillStyle = '#EDE6DA'; g.fill(body); g.lineWidth = 1.5; g.lineJoin = 'round'; g.strokeStyle = '#1E1A26'; g.stroke(body);
  g.lineWidth = 1.1; g.strokeStyle = '#8E8AA3'; g.stroke(new Path2D('M10 5.6h26.2l6.4 5.6'));
  g.fillStyle = '#1E1A26'; for (const [x, y] of RUNE_PIPS[n]) g.fill(new Path2D(`M${x} ${y}l3.6 4.6-3.6 4.6-3.6-4.6z`));
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
const runeTex = [null, 1, 2, 3, 4, 5, 6].map(n => n && runeTexture(n));
const runes = [0, 1].map(i => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: runeTex[1], fog: false, transparent: true, alphaTest: 0.5 }));
  s.scale.set(9, 9, 1); s.position.set(i ? 6 : -6, 62, 0); s.visible = false; scene.add(s); return s;
});

// ---------------------------------------------------------------- buildings
// a heraldic banner: the house colour with its crest, a gold border
const SIGILS = {   // 24-unit sigil paths from the batch 1 banners
  varn: [{ d: 'M3 2l5 5h8l5-5v9l-4 6-2.5 5h-5L7 17l-4-6zM7.5 10.5l3 1.6-3 .9zM16.5 10.5l-3 1.6 3 .9z', eo: true }],
  calder: [{ d: 'M9.3 12h5.4l-1.1 7-1.6 3-1.6-3z' }, { d: 'M9.6 12.3L5.6 11l3.6 3.4z' }, { d: 'M14.4 12.3l4-1.3-3.6 3.4z' },
    { d: 'M10.4 12.2c-.6-2.2-4.2-2.6-5.2-5.6V2h1.6v4c.5 1 1.3 1.6 2.2 2V4h1.6v5.2c.9.6 1.4 1.7 1.4 3z' },
    { d: 'M10.4 12.2c-.6-2.2-4.2-2.6-5.2-5.6V2h1.6v4c.5 1 1.3 1.6 2.2 2V4h1.6v5.2c.9.6 1.4 1.7 1.4 3z', mirror: true }],
  morrow: [{ d: 'M17 3c-5-1.5-10 0-10 4 0 3 3 4 6 5 2 .7 3.5 1.2 3.5 2.7 0 2-3.5 2.6-8 1.3L7 19c6 2 12.5.8 12.5-4 0-3.2-3-4.4-6-5.3-2-.6-3.5-1.1-3.5-2.4 0-1.6 3-2 6.5-1z' },
    { d: 'M15.5 1.8l5.5 1 1.8 2.2-1.8 2-5.5.8z' }, { d: 'M9 15.6l-6.5 1.6L8 19.4z' }],
  ashby: [{ d: 'M12.00 1.00L13.71 5.62L17.50 2.47L16.67 7.33L21.53 6.50L18.38 10.29L23.00 12.00L18.38 13.71L21.53 17.50L16.67 16.67L17.50 21.53L13.71 18.38L12.00 23.00L10.29 18.38L6.50 21.53L7.33 16.67L2.47 17.50L5.62 13.71L1.00 12.00L5.62 10.29L2.47 6.50L7.33 7.33L6.50 2.47L10.29 5.62zM8.80 12.00a3.2 3.2 0 1 0 6.40 0a3.2 3.2 0 1 0 -6.40 0z', eo: true }],
};
function drawSigil(g, key, color) {
  g.fillStyle = color;
  for (const p of SIGILS[key] || []) { g.save(); if (p.mirror) g.transform(-1, 0, 0, 1, 24, 0); g.fill(new Path2D(p.d), p.eo ? 'evenodd' : 'nonzero'); g.restore(); }
}
const clothOf = h => h.banner || h.css, sigilOn = h => /EDE6DA/i.test(clothOf(h)) ? '#1E1A26' : '#EDE6DA';
// crest: the cloth with the sigil (shields, tabards, caparisons, pennants)
function drawCrest(h, cv) {
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 192, 128);
  g.fillStyle = clothOf(h); g.fillRect(0, 0, 192, 128);
  g.setTransform(4.2, 0, 0, 4.2, 96 - 50.4, 64 - 50.4); drawSigil(g, h.key, sigilOn(h)); g.setTransform(1, 0, 0, 1, 0, 0);
}
// banner: the hanging gonfalon with three tails (buildings)
function drawBanner(h, cv) {
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 192, 128); g.scale(2, 2);
  g.fillStyle = '#1E1A26'; g.fillRect(0, 2, 96, 3.2);
  const cloth = new Path2D('M5 5h86v44L72 39 48 60 24 39 5 49z');
  g.fillStyle = clothOf(h); g.fill(cloth); g.lineWidth = 1.5; g.lineJoin = 'round'; g.strokeStyle = '#1E1A26'; g.stroke(cloth);
  g.translate(31.2, 7.5); g.scale(1.4, 1.4); drawSigil(g, h.key, sigilOn(h)); g.setTransform(1, 0, 0, 1, 0, 0);
}
function crestMaterial(h) {
  const cv = document.createElement('canvas'); cv.width = 192; cv.height = 128; drawCrest(h, cv);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshToonMaterial({ map: t, gradientMap: toonRamp }); m.userData.cv = cv; return m;
}
function bannerMaterial(h) {
  const cv = document.createElement('canvas'); cv.width = 192; cv.height = 128; drawBanner(h, cv);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshToonMaterial({ map: t, gradientMap: toonRamp, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }); m.userData.cv = cv; return m;
}
for (const h of Object.values(HOUSES)) { h.mat = mat(h.color); h.crestMat = crestMaterial(h); h.bannerMat = bannerMaterial(h); h.winMat = new THREE.MeshBasicMaterial({ color: PAL.violet }); }
// colours by seat: you are ink plum with a bone-white banner; rivals are dried rose, moss grey and ash lavender
function applyPalette() {
  const me = players[P]?.house || HOUSE, rest = [[PAL.rose, '#8C3B4A'], [PAL.moss, '#5F6B5E'], [PAL.lavender, '#8E8AA3'], [PAL.straw, '#A89A86']];
  const order = [...players.map(p => p.house).filter(h => h !== me), ...Object.values(HOUSES).filter(h => h !== me && !players.some(p => p.house === h))];
  me.color = PAL.ink; me.css = '#1E1A26'; me.banner = '#EDE6DA';
  order.forEach((h, i) => { [h.color, h.css] = rest[i]; h.banner = h.css; });
  for (const h of Object.values(HOUSES)) {
    h.mat.color.setHex(h.color); drawCrest(h, h.crestMat.userData.cv); h.crestMat.map.needsUpdate = true;
    drawBanner(h, h.bannerMat.userData.cv); h.bannerMat.map.needsUpdate = true;
    h.winMat.color.setHex(h === me ? PAL.ember : PAL.violet);
  }
}
let houseCrest = null;
let houseMat = HOUSE.mat;
const wallMat = mat(PAL.ashen), woodMat = mat(PAL.ink), stoneMat = mat(PAL.barrow), roadMat = mat(PAL.barrow);
const M = {
  woodDark: mat(PAL.ink), woodLight: mat(PAL.violet), turf: mat(PAL.moss), thatch: mat(PAL.straw), slate: mat(PAL.violet),
  moss: mat(PAL.moss), sand: mat(PAL.ashen), white: mat(PAL.bone), plaster: wallMat, stone: stoneMat, iron: mat(PAL.ink),
};
// glowing bits that come alive at night
const windowMat = new THREE.MeshToonMaterial({ gradientMap: toonRamp, color: 0x2a1c10, emissive: 0xffa040, emissiveIntensity: 0 });
const flameMat = new THREE.MeshBasicMaterial({ color: PAL.ember });
const glowMat = (() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,190,90,1)'); gr.addColorStop(0.4, 'rgba(255,140,40,.45)'); gr.addColorStop(1, 'rgba(255,120,30,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 });
})();

// small builders: B = box resting on y, roof = triangular prism, cone/cyl helpers
function B(w, h, d, m, x = 0, y = 0, z = 0, ry = 0) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y + h / 2, z); o.rotation.y = ry; return o; }
function roof(w, h, len, m, x = 0, y = 0, z = 0, ry = 0) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false }); g.translate(0, 0, -len / 2);
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.rotation.y = ry; return o;
}
function cone(r, h, seg, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m); o.position.set(x, y + h / 2, z); return o; }
function cyl(r1, r2, h, seg, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); o.position.set(x, y + h / 2, z); return o; }
function dome(r, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), m); o.position.set(x, y, z); return o; }
function win(x, y, z, ry = 0) { const o = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.1), windowMat); o.position.set(x, y, z); o.rotation.y = ry; return o; }
function torch(x, z, h = 2.2) {
  const g = new THREE.Group();
  g.add(cyl(0.08, 0.1, h, 4, M.woodDark));
  const f = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 5), flameMat); f.position.y = h + 0.25; g.add(f);
  const s = new THREE.Sprite(glowMat); s.scale.set(4.5, 4.5, 1); s.position.y = h + 0.3; g.add(s);
  g.position.set(x, 0, z); return g;
}
function flagPole(h) {
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, h, 5), woodMat); p.position.y = h / 2; g.add(p);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.4), houseCrest || houseMat); f.position.set(1.05, h - 0.75, 0); g.add(f);
  const fin = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 5), M.iron); fin.position.y = h + 0.2; g.add(fin);
  return g;
}
const STYLES = {
  // House Varn: Nordic longhouses with turf roofs; keep = great hall behind a palisade with a watchtower
  nordic: {
    hamlet() {
      const g = new THREE.Group();
      g.add(B(6, 2, 3, M.woodDark, -0.5, 0, 0.6, 0.35));
      const r = roof(3.9, 2.8, 6.6, houseMat, -0.5, 2, 0.6, 0.35 + Math.PI / 2); g.add(r);
      for (const sx of [-1, 1]) { const beam = B(0.25, 1.6, 0.2, houseMat, -0.5 + Math.cos(0.35) * sx * 3.3, 4.2, 0.6 - Math.sin(0.35) * sx * 3.3); beam.rotation.z = 0.5; g.add(beam); }
      g.add(win(-0.5 + Math.sin(0.35) * 1.55, 1.1, 0.6 + Math.cos(0.35) * 1.55, 0.35));
      g.add(B(2.4, 1.6, 2.4, M.woodLight, 2.6, 0, -2.0, -0.3)); g.add(roof(2.8, 1.6, 2.6, houseMat, 2.6, 1.6, -2.0, -0.3));
      g.add(torch(1.6, 2.4)); const f = flagPole(6.5); f.position.set(-3.2, 0, -1.6); g.add(f);
      return g;
    },
    keep() {
      const g = new THREE.Group();
      for (let i = 0; i < 18; i++) {   // palisade with a gate gap
        const a = i / 18 * Math.PI * 2; if (Math.abs(a - Math.PI / 2) < 0.35) continue;
        const st = cyl(0.3, 0.3, 2.6, 5, M.woodDark, Math.cos(a) * 6.2, 0, Math.sin(a) * 6.2); g.add(st); g.add(cone(0.3, 0.6, 5, M.woodDark, Math.cos(a) * 6.2, 2.6, Math.sin(a) * 6.2));
      }
      g.add(B(7.5, 3, 4, M.woodDark, 0, 0, -0.8)); g.add(roof(5, 3.6, 8.2, houseMat, 0, 3, -0.8, Math.PI / 2));
      for (const x of [-2.4, 0, 2.4]) { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 8), houseMat); sh.rotation.x = Math.PI / 2; sh.position.set(x, 1.6, 1.25); g.add(sh); }
      g.add(win(-1.2, 1.4, 1.22)); g.add(win(1.2, 1.4, 1.22));
      // watchtower
      for (const [px, pz] of [[3.4, 2.2], [4.8, 2.2], [3.4, 3.6], [4.8, 3.6]]) g.add(cyl(0.15, 0.15, 7, 4, M.woodLight, px, 0, pz));
      g.add(B(2.2, 0.3, 2.2, M.woodLight, 4.1, 7, 2.9)); g.add(cone(1.9, 2.2, 4, houseMat, 4.1, 7.3, 2.9));
      g.add(torch(-1.2, 4.6)); g.add(torch(1.2, 4.6));
      const f = flagPole(5); f.position.set(0, 6.4, -0.8); g.add(f);
      return g;
    },
  },
  // House Calder: grey stone & slate; keep = square tower with four round corner turrets
  stone: {
    hamlet() {
      const g = new THREE.Group();
      g.add(B(3.2, 2.4, 3.4, M.stone, -1.6, 0, 1, 0.4)); g.add(roof(3.6, 2, 3.8, houseMat, -1.6, 2.4, 1, 0.4 + Math.PI / 2));
      g.add(B(0.6, 1.4, 0.6, M.stone, -0.9, 3.2, 0.3)); g.add(win(-1.6 + Math.sin(0.4) * 1.72, 1.2, 1 + Math.cos(0.4) * 1.72, 0.4));
      g.add(B(2.6, 2.1, 2.8, M.stone, 2, 0, -1.2, -0.6)); g.add(roof(3, 1.6, 3.2, houseMat, 2, 2.1, -1.2, -0.6 + Math.PI / 2));
      g.add(torch(0.4, 2.8)); const f = flagPole(6.5); f.position.set(0.5, 0, -2.8); g.add(f);
      return g;
    },
    keep() {
      const g = new THREE.Group();
      g.add(B(6, 9, 6, M.stone));
      for (let i = 0; i < 4; i++) for (let k = -1; k <= 1; k++) {
        const side = i % 2 ? [k * 2, 2.9] : [2.9, k * 2], sx = i < 2 ? 1 : -1;
        g.add(B(0.8, 0.9, 0.8, M.stone, side[0] * sx, 9, side[1] * sx));
      }
      for (const [x, z] of [[3, 3], [-3, 3], [3, -3], [-3, -3]]) { g.add(cyl(1.2, 1.3, 11, 8, M.stone, x, 0, z)); g.add(cone(1.5, 2.6, 8, houseMat, x, 11, z)); }
      for (const y of [3, 6]) { g.add(win(-1.2, y, 3.05)); g.add(win(1.2, y, 3.05)); }
      g.add(B(1.6, 2.4, 0.2, M.woodDark, 0, 0, 3.05));
      g.add(torch(-1.6, 4.4)); g.add(torch(1.6, 4.4));
      const f = flagPole(5); f.position.set(0, 9, 0); g.add(f);
      return g;
    },
  },
  // House Morrow: fen-folk stilt huts; keep = mossy round tower with a balcony
  fen: {
    hamlet() {
      const g = new THREE.Group();
      for (const [x, z, s] of [[-1.8, 1.2, 1], [2, -0.6, 0.85], [-0.4, -2.4, 0.75]]) {
        const h = new THREE.Group();
        for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) h.add(cyl(0.12, 0.12, 1, 4, M.woodDark, px, 0, pz));
        h.add(cyl(1.5, 1.5, 0.2, 8, M.woodLight, 0, 1, 0)); h.add(cyl(1.3, 1.4, 1.7, 8, M.plaster, 0, 1.2, 0));
        h.add(cone(2, 2.2, 8, houseMat, 0, 2.9, 0)); h.add(win(0, 2, 1.36));
        h.position.set(x, 0, z); h.scale.setScalar(s); g.add(h);
      }
      g.add(torch(0.6, 2.6)); const f = flagPole(6.5); f.position.set(3, 0, 2); g.add(f);
      return g;
    },
    keep() {
      const g = new THREE.Group();
      g.add(cyl(2.4, 3, 11, 9, M.moss));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.25, 4, 18), M.woodLight); ring.rotation.x = Math.PI / 2; ring.position.y = 8; g.add(ring);
      g.add(cone(3.2, 4.2, 9, houseMat, 0, 11, 0));
      for (const y of [3, 6, 9]) g.add(win(0, y, 2.55 - y * 0.03));
      for (const [x, z] of [[4.3, 1.5], [-4, -1.8]]) { g.add(cyl(1.2, 1.3, 1.6, 8, M.plaster, x, 0, z)); g.add(cone(1.7, 1.8, 8, houseMat, x, 1.6, z)); }
      g.add(torch(-1.4, 3.8)); g.add(torch(1.6, 3.6));
      const f = flagPole(4); f.position.set(0, 14.5, 0); g.add(f);
      return g;
    },
  },
  // House Ashby: sunstone houses with domes; keep = citadel with a great golden dome and slender towers
  sun: {
    hamlet() {
      const g = new THREE.Group();
      g.add(B(3, 2.4, 3, M.sand, -1.4, 0, 0.8, 0.3)); g.add(B(2, 1.4, 2, M.sand, -1.6, 2.4, 0.6, 0.3)); g.add(dome(0.9, houseMat, -1.6, 3.8, 0.6));
      g.add(win(-1.4 + Math.sin(0.3) * 1.52, 1.2, 0.8 + Math.cos(0.3) * 1.52, 0.3));
      g.add(B(2.6, 2, 2.6, M.white, 2, 0, -1.3, -0.4)); g.add(dome(1.2, houseMat, 2, 2, -1.3));
      const aw = B(2, 0.1, 1.2, houseMat, -0.9, 2.1, 2.6, 0.3); aw.rotation.x = -0.25; g.add(aw);
      g.add(torch(1.2, 2.6)); const f = flagPole(6.5); f.position.set(3.2, 0, 1.6); g.add(f);
      return g;
    },
    keep() {
      const g = new THREE.Group();
      g.add(B(8, 4, 8, M.sand)); g.add(B(5, 4, 5, M.white, 0, 4, 0)); g.add(dome(2.6, houseMat, 0, 8, 0));
      g.add(cone(0.25, 1.2, 6, houseMat, 0, 10.4, 0));
      for (const [x, z] of [[3.6, 3.6], [-3.6, -3.6]]) { g.add(cyl(0.6, 0.75, 12, 8, M.white, x, 0, z)); g.add(dome(0.85, houseMat, x, 12, z)); }
      for (const x of [-2.2, 0, 2.2]) g.add(win(x, 2.4, 4.05));
      g.add(torch(-1.4, 5.2)); g.add(torch(1.4, 5.2));
      return g;
    },
  },
};
function withHouse(h, fn) { const prev = houseMat, pc = houseCrest; houseMat = h.mat; houseCrest = h.bannerMat; try { return fn(); } finally { houseMat = prev; houseCrest = pc; } }
const GOTH = { body: mat(PAL.violet), roof: mat(PAL.ink), trim: mat(PAL.barrow), iron: mat(PAL.ink), bone: mat(PAL.bone), door: mat(PAL.ink) };
// a square pyramid spire of the given base width and height; Morrow's spires twist 45 degrees
function spire(base, hgt, m, x = 0, y = 0, z = 0, h) {
  const geo = new THREE.ConeGeometry(base / Math.SQRT2, hgt, 4, 6).rotateY(Math.PI / 4);
  if (h && h.key === 'morrow') { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const a = (p.getY(i) / hgt + 0.5) * Math.PI / 4, X = p.getX(i), Z = p.getZ(i); p.setX(i, X * Math.cos(a) - Z * Math.sin(a)); p.setZ(i, X * Math.sin(a) + Z * Math.cos(a)); } geo.computeVertexNormals(); }
  const o = new THREE.Mesh(geo, m); o.position.set(x, y + hgt / 2, z); return o;
}
function cross(g, x, y, z, s = 1) { g.add(B(0.18 * s, 1.6 * s, 0.18 * s, GOTH.iron, x, y, z)); g.add(B(0.9 * s, 0.16 * s, 0.16 * s, GOTH.iron, x, y + 1.0 * s, z)); }
function antlers(g, x, y, z) {   // Calder: antler finials on the spire tips
  for (const sd of [-1, 1]) { const a = new THREE.Group(); a.position.set(x, y, z); a.rotation.z = sd * 0.5; g.add(a);
    a.add(B(0.12, 1.5, 0.12, GOTH.bone, 0, 0, 0)); const t1 = B(0.1, 0.6, 0.1, GOTH.bone, 0, 0.6, 0); t1.rotation.z = -sd * 0.7; a.add(t1); }
}
// a spire with its house detail, and a cross or finial at the tip
function houseSpire(g, h, base, hgt, x, y, z, finial = true) {
  if (h.key === 'ashby') { const d = new THREE.Mesh(new THREE.SphereGeometry(base * 0.42, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), GOTH.roof); d.position.set(x, y, z); g.add(d); y += base * 0.3; hgt = Math.max(2, hgt - 2); }
  g.add(spire(base, hgt, GOTH.roof, x, y, z, h));
  if (h.key === 'calder') antlers(g, x, y + hgt - 0.2, z); else if (finial) cross(g, x, y + hgt - 0.1, z, base > 4 ? 1.2 : 0.9);
  return y + hgt;
}
function gable(g, h, w, ht, len, x, y, z) {   // a steep gable roof; Varn's beam ends cross past the peak
  g.add(roof(w + 0.3, ht, len, GOTH.roof, x, y, z, 0));
  if (h.key === 'varn') for (const ez of [-len / 2 - 0.05, len / 2 + 0.05]) for (const sd of [-1, 1]) {
    const bm = B(0.18, ht * 0.75, 0.18, GOTH.iron, x + sd * 0.35, y + ht * 0.55, z + ez); bm.rotation.z = sd * 0.6; g.add(bm); }
}
function lancet(h, w, ht, x, y, z, ry = 0) {   // a pointed window; it burns ember gold on your own buildings
  const g = new THREE.Group(); g.add(B(w, ht, 0.12, h.winMat, 0, 0, 0));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(w * 0.72, w * 0.9, 4), h.winMat); tip.position.y = ht + w * 0.35; tip.rotation.y = Math.PI / 4; tip.scale.z = 0.15; g.add(tip);
  g.position.set(x, y, z); g.rotation.y = ry; return g;
}
function archDoor(w, ht, x, y, z, ry = 0) { const g = lancet({ winMat: GOTH.door }, w, ht, 0, 0, 0); g.position.set(x, y, z); g.rotation.y = ry; return g; }
function banner(h, hgt, x, y, z) {
  const g = new THREE.Group();
  g.add(cyl(0.07, 0.07, hgt, 4, GOTH.iron, 0, 0, 0));
  const f = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), h.bannerMat); f.position.set(1.25, hgt - 0.8, 0); g.add(f);
  g.position.set(x, y, z); return g;
}
// Hamlet (14 x 7, 16 m, banner to 19): tower 4 x 4 x 10 with a 6 m spire; chapel 5 x 7 x 4 with a gable to 7 and a bell-cote; three headstones
function gothHamlet(h) {
  const g = new THREE.Group(), tx = -3.2;
  g.add(B(4, 10, 4, GOTH.body, tx, 0, 0)); g.add(B(4.5, 0.4, 4.5, GOTH.trim, tx, 10, 0));
  const top = houseSpire(g, h, 5.2, 6, tx, 10.4, 0, false);
  g.add(archDoor(1.4, 2.4, tx, 0, 2.03)); g.add(lancet(h, 0.7, 1.6, tx, 6.4, 2.03));
  const cy = h.key === 'morrow' ? 1.5 : 0;   // Morrow raises the chapel on stilts
  if (cy) for (const [sx, sz] of [[-2, -3], [2, -3], [-2, 3], [2, 3]]) g.add(B(0.4, 1.5, 0.4, GOTH.iron, 2.5 + sx, 0, sz));
  g.add(B(5, 4, 7, GOTH.body, 2.5, cy, 0)); gable(g, h, 5, 3, 7, 2.5, 4 + cy, 0);
  g.add(B(0.6, 1.2, 0.6, GOTH.roof, 2.5, 7 + cy - 0.2, 0)); g.add(spire(0.9, 0.9, GOTH.roof, 2.5, 8 + cy - 0.2, 0));   // bell-cote
  g.add(lancet(h, 0.5, 1.2, 2.5, 1.2 + cy, 3.53)); cross(g, 2.5, 7 + cy, 3.6, 0.8);
  for (const k of [0, 1, 2]) g.add(B(0.7, 1.1, 0.2, GOTH.trim, 5.9, 0, -2 + k * 1.6));   // headstones
  g.add(banner(h, 3, tx, top - 0.3, 0));
  return g;
}
// Keep (21 x 18, 32 m, banner to 34.5), built at 0.8 so it sits between the walls: nave 12 x 18 x 9 with a gable to 13,
// central tower 5 x 5 x 20 with a 12 m spire, two front side towers 3 x 3 x 14, flying buttresses, a rose window
function gothKeep(h) {
  const g = new THREE.Group(), k = new THREE.Group(); k.scale.setScalar(0.8); g.add(k);
  k.add(B(12, 9, 18, GOTH.body, 0, 0, -4)); gable(k, h, 12, 4, 18, 0, 9, -4);
  k.add(B(5, 20, 5, GOTH.body, 0, 0, 5)); k.add(B(5.6, 0.5, 5.6, GOTH.trim, 0, 20, 5));
  const top = houseSpire(k, h, 6, 12, 0, 20.5, 5, false);
  for (const sx of [-1, 1]) {
    k.add(B(3, 14, 3, GOTH.body, sx * 5, 0, 6)); k.add(B(3.4, 0.4, 3.4, GOTH.trim, sx * 5, 14, 6)); houseSpire(k, h, 3.8, 8, sx * 5, 14.4, 6);
    k.add(lancet(h, 0.6, 1.8, sx * 5, 9, 7.53));
    for (let i = 0; i < 4; i++) {   // flying buttresses on the long sides
      const bt = B(1.4, 8, 0.8, GOTH.body, sx * 7.4, 0, -11 + i * 4.4); bt.rotation.z = sx * 0.28; k.add(bt);
      k.add(lancet(h, 0.6, 2.2, sx * 6.03, 3.4, -11 + i * 4.4 + 2.2, sx * Math.PI / 2));
    }
  }
  const rose = new THREE.Mesh(new THREE.CircleGeometry(1.5, 16), h.winMat); rose.position.set(0, 12.5, 7.53); k.add(rose);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.18, 4, 18), GOTH.iron); ring.position.set(0, 12.5, 7.55); k.add(ring);
  k.add(archDoor(2.4, 4, 0, 0, 7.53));
  k.add(banner(h, 2.5, 0, top - 0.4, 5));
  return g;
}
const makeHamlet = (h = HOUSE) => withHouse(h, () => gothHamlet(h));
const makeKeep = (h = HOUSE) => withHouse(h, () => gothKeep(h));
// Walls in the style of the Great Wall: a stone wall with battlements on both edges, a walkway
// on top in the house colour, and a small watchtower at each end. (Internally they are still "roads".)
const WALL_H = 2.6, WALL_TRIM = 6.5, GATE_HALF = 2.2;   // a gate in the middle of every wall
const wallGates = [];   // { e, pivots: [left, right], open }
const boxAt = (...args) => B(...args);   // (inside makeRoad, B is a corner)
const wallStone = mat(PAL.barrow), _wm = new THREE.Matrix4(), _wt = new THREE.Matrix4(), _wo = new THREE.Object3D();
function mergeGeos(parts) {
  const pos = [], nor = [];
  for (const { geo, m } of parts) {
    const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(m);
    pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return out;
}
const WG = { body: new THREE.BoxGeometry(1.6, 1, 1), merlon: new THREE.BoxGeometry(0.5, 0.8, 1), walk: new THREE.BoxGeometry(0.8, 0.08, 1),
  spike: new THREE.ConeGeometry(0.2, 0.7, 4), buttress: new THREE.BoxGeometry(1.6, 1, 1.2),
  tower: new THREE.BoxGeometry(3, 1, 3), roof: new THREE.ConeGeometry(2.3, 2.4, 4).rotateY(Math.PI / 4) };
const wallIron = mat(PAL.ink);
function makeRoad(e, h = HOUSE) {
  const A = corners[e.a], B = corners[e.b], dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz), N = 6;
  const stone = [], colour = [], iron = [];
  const at = (t) => { const x = A.x + dx * t, z = A.z + dz * t; return { x, y: heightAt(x, z), z }; };
  // two runs of wall with the gate between them
  const runs = [[WALL_TRIM, L / 2 - GATE_HALF - 0.6], [L / 2 + GATE_HALF + 0.6, L - WALL_TRIM]], segs = [];
  for (const [a, b] of runs) for (let i = 0; i < 3; i++) segs.push([(a + (b - a) * i / 3) / L, (a + (b - a) * (i + 1) / 3) / L]);
  for (const [t0, t1] of segs) {
    const p0 = at(t0), p1 = at(t1), len = Math.hypot(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z) + 0.2;
    // segment frame: centred on the wall's mid-height, facing along the wall
    _wo.position.set((p0.x + p1.x) / 2, (p0.y + p1.y) / 2 + WALL_H / 2 - 0.4, (p0.z + p1.z) / 2);
    _wo.lookAt(p1.x, p1.y + WALL_H / 2 - 0.4, p1.z); _wo.scale.set(1, 1, 1); _wo.updateMatrix(); _wm.copy(_wo.matrix);
    stone.push({ geo: WG.body, m: _wm.clone().multiply(_wt.makeScale(1, WALL_H + 0.8, len)) });
    for (const side of [-0.55, 0.55]) for (const k of [-0.33, 0, 0.33]) {   // merlons, each with an iron spike
      stone.push({ geo: WG.merlon, m: _wm.clone().multiply(_wt.makeTranslation(side, WALL_H / 2 + 0.8, k * len)) });
      iron.push({ geo: WG.spike, m: _wm.clone().multiply(_wt.makeTranslation(side, WALL_H / 2 + 1.55, k * len)) });
    }
    for (const side of [-1, 1]) stone.push({ geo: WG.buttress, m: _wm.clone().multiply(_wt.makeTranslation(side * 0.9, -0.2, 0)).multiply(new THREE.Matrix4().makeScale(0.5, WALL_H * 0.8, 1)) });
    colour.push({ geo: WG.walk, m: _wm.clone().multiply(_wt.makeTranslation(0, WALL_H / 2 + 0.44, 0)).multiply(new THREE.Matrix4().makeScale(1, 1, len * 0.85)) });
  }
  for (const t of [WALL_TRIM / L, 1 - WALL_TRIM / L]) {   // watchtowers at both ends
    const p = at(t), th = 5;
    stone.push({ geo: WG.tower, m: new THREE.Matrix4().makeTranslation(p.x, p.y + th / 2 - 0.4, p.z).multiply(new THREE.Matrix4().makeScale(1, th, 1)) });
    iron.push({ geo: WG.roof, m: new THREE.Matrix4().makeTranslation(p.x, p.y + th - 0.4 + 1.2, p.z) });
  }
  const g = new THREE.Group();
  g.add(new THREE.Mesh(mergeGeos(stone), wallStone));
  g.add(new THREE.Mesh(mergeGeos(colour), h.mat));
  g.add(new THREE.Mesh(mergeGeos(iron), wallIron));
  // the gate: two pillars, a pointed lintel with a strip of the owner's colour, and an iron portcullis that rises for its owner
  const G = at(0.5), gate = new THREE.Group(); gate.position.set(G.x, G.y - 0.3, G.z); gate.rotation.y = Math.atan2(dx, dz);
  for (const sd of [-1, 1]) gate.add(boxAt(1.8, 5, 1.6, wallStone, 0, 0, sd * (GATE_HALF + 0.8)));
  const lin = new THREE.Shape(); lin.moveTo(-GATE_HALF - 1.6, 0); lin.lineTo(GATE_HALF + 1.6, 0); lin.lineTo(0, 2); lin.closePath();
  const lintel = new THREE.Mesh(new THREE.ExtrudeGeometry(lin, { depth: 1.8, bevelEnabled: false }).translate(0, 0, -0.9), wallStone); lintel.rotation.y = Math.PI / 2; lintel.position.y = 5; gate.add(lintel);
  gate.add(boxAt(1.9, 0.4, GATE_HALF * 2 + 3.2, h.mat, 0, 4.6, 0));
  const grid = new THREE.Group(); gate.add(grid);   // the portcullis: 5 vertical and 4 horizontal iron bars
  for (let i = 0; i < 5; i++) grid.add(boxAt(0.12, 3.6, 0.12, M.iron, 0, 0, -GATE_HALF + 0.3 + i * (GATE_HALF * 2 - 0.6) / 4));
  for (let i = 0; i < 4; i++) grid.add(boxAt(0.12, 0.12, GATE_HALF * 2, M.iron, 0, 0.4 + i * 1.0, 0));
  g.add(gate); g.userData.gate = { pivots: [], grid, pos: { x: G.x, z: G.z } };
  g.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
  return g;
}
// Walls protect their owner: no rival lord can cross them (or walk into them). Only the owner crosses.
function distSeg(x, z, A, B) {
  const dx = B.x - A.x, dz = B.z - A.z, t = Math.max(0, Math.min(1, ((x - A.x) * dx + (z - A.z) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(A.x + dx * t - x, A.z + dz * t - z);
}
function crosses(x0, z0, x1, z1, A, B) {
  const s = (ax, az, bx, bz, cx, cz) => (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
  const d1 = s(A.x, A.z, B.x, B.z, x0, z0), d2 = s(A.x, A.z, B.x, B.z, x1, z1), d3 = s(x0, z0, x1, z1, A.x, A.z), d4 = s(x0, z0, x1, z1, B.x, B.z);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
// the rival wall (if any) that stops `pid` moving from (x0,z0) to (x1,z1)
// where along the wall (0..1) is the point closest to (x,z)?
function wallT(e, x, z) { const A = corners[e.a], B = corners[e.b], dx = B.x - A.x, dz = B.z - A.z; return ((x - A.x) * dx + (z - A.z) * dz) / (dx * dx + dz * dz); }
function inGate(e, x, z) { const A = corners[e.a], B = corners[e.b], L = Math.hypot(B.x - A.x, B.z - A.z); return Math.abs(wallT(e, x, z) - 0.5) * L < GATE_HALF - 0.5; }
// where the owner may pass their own wall: the gate, or right beside their own settlement at either end
function ownerPass(e, x, z) {
  const A = corners[e.a], B = corners[e.b], L = Math.hypot(B.x - A.x, B.z - A.z), t = wallT(e, x, z);
  const byOwn = c => c.building && c.building.owner === e.road;   // only beside a settlement of theirs, never through a bare joint
  return inGate(e, x, z) || (t * L < WALL_TRIM + 1 && byOwn(A)) || ((1 - t) * L < WALL_TRIM + 1 && byOwn(B));
}
// where two or more walls meet at a corner with no settlement, close the gap: short wall stubs into a corner tower
const wallJoints = new Map();   // corner id -> mesh group
function refreshJoint(c) {
  const old = wallJoints.get(c.id); if (old) { scene.remove(old); wallJoints.delete(c.id); }
  const ws = c.edges.map(i => edges[i]).filter(e => e.road !== null);
  if (c.building || ws.length < 2) return;
  const stone = [], g = new THREE.Group(), colours = new Map();
  for (const e of ws) {
    const o = corners[e.a === c.id ? e.b : e.a], L = Math.hypot(o.x - c.x, o.z - c.z), k = (WALL_TRIM + 0.3) / L;
    const p0 = { x: c.x, z: c.z }, p1 = { x: c.x + (o.x - c.x) * k, z: c.z + (o.z - c.z) * k };
    p0.y = heightAt(p0.x, p0.z); p1.y = heightAt(p1.x, p1.z);
    const len = Math.hypot(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z);
    _wo.position.set((p0.x + p1.x) / 2, (p0.y + p1.y) / 2 + WALL_H / 2 - 0.4, (p0.z + p1.z) / 2);
    _wo.lookAt(p1.x, p1.y + WALL_H / 2 - 0.4, p1.z); _wo.scale.set(1, 1, 1); _wo.updateMatrix(); _wm.copy(_wo.matrix);
    stone.push({ geo: WG.body, m: _wm.clone().multiply(_wt.makeScale(1, WALL_H + 0.8, len)) });
    for (const side of [-1.0, 1.0]) for (const kk of [-0.25, 0.25]) stone.push({ geo: WG.merlon, m: _wm.clone().multiply(_wt.makeTranslation(side, WALL_H / 2 + 0.7, kk * len)) });
    if (!colours.has(e.road)) colours.set(e.road, []);
    colours.get(e.road).push({ geo: WG.walk, m: _wm.clone().multiply(_wt.makeTranslation(0, WALL_H / 2 + 0.44, 0)).multiply(new THREE.Matrix4().makeScale(1, 1, len * 0.85)) });
  }
  const y = heightAt(c.x, c.z) - 0.4, th = 6;   // a round corner tower
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, th, 8), wallStone); tower.position.set(c.x, y + th / 2, c.z); g.add(tower);
  const corbel = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.1, 0.5, 8), wallStone); corbel.position.set(c.x, y + th + 0.25, c.z); g.add(corbel);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.5), wallStone); m.position.set(c.x + Math.cos(a) * 2.05, y + th + 0.9, c.z + Math.sin(a) * 2.05); m.rotation.y = -a + Math.PI / 2; g.add(m); }
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.1, 8), wallIron); cap.position.set(c.x, y + th + 0.5 + 1.55, c.z); g.add(cap);
  g.add(new THREE.Mesh(mergeGeos(stone), wallStone));
  for (const [pid, parts] of colours) g.add(new THREE.Mesh(mergeGeos(parts), (players[pid]?.house || HOUSE).mat));
  g.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
  scene.add(g); wallJoints.set(c.id, g);
}
function refreshJointsAt(...cs) { for (const c of cs) refreshJoint(c); }
const tollPasses = {};   // "pid:edgeId" -> time (duelClock) until which the gate lets them through
const TOLL_TIME = 12;
const hasPass = (pid, e) => (tollPasses[`${pid}:${e.id}`] || 0) > duelClock;
function wallBlocks(pid, x0, z0, x1, z1, crossOnly = false) {
  for (const e of edges) {
    if (e.road === null || (crossOnly && e.road === pid)) continue;
    const own = e.road === pid || (!crossOnly && hasPass(pid, e)), A = corners[e.a], B = corners[e.b];
    const ownWall = e.road === pid;
    if (crosses(x0, z0, x1, z1, A, B)) { const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; if (ownWall ? ownerPass(e, mx, mz) : own && inGate(e, mx, mz)) continue; return e; }   // owners: gate or beside their settlement; toll payers: gate
    if (crossOnly) continue;
    const dn = distSeg(x1, z1, A, B);
    if (dn < 1.5 && dn < distSeg(x0, z0, A, B) && !(ownWall ? ownerPass(e, x1, z1) : own && inGate(e, x1, z1))) return e;   // can't walk into the wall itself
  }
  return null;
}
// pay the gate's owner 1 resource (from your largest stock) to pass through
function payToll(pid, e) {
  const p = players[pid], owner = e.road;
  const k = RES_KEYS.slice().sort((a, b) => p.res[b] - p.res[a])[0];
  if (!k || p.res[k] < 1) return false;
  p.res[k]--; players[owner].res[k]++;
  tollPasses[`${pid}:${e.id}`] = duelClock + TOLL_TIME;
  tell(pid, { log: `🚪 You pay ${nameOf(owner)} 1 ${RES[k].icon} to pass their gate`, flash: [k], loss: true, sfx: 'build' });
  tell(owner, { log: `🚪 ${nameOf(pid)} pays you 1 ${RES[k].icon} toll to pass your gate`, flash: [k], sfx: 'build' });
  updateHUD();
  return true;
}
// the nearest rival gate you are standing at (within 7 m)
function rivalGateNear(x, z) {
  let best = null, bd = 7;
  for (const g of wallGates) if (g.e.road !== P) { const d = Math.hypot(g.pos.x - x, g.pos.z - z); if (d < bd) { bd = d; best = g; } }
  return best;
}
let tollGate = null;
function updateToll() {
  let g = state.phase === 'play' && !state.riding && !duel ? rivalGateNear(player.pos.x, player.pos.z) : null;
  const pt = player.pendingToll && wallGates.find(w => w.e === player.pendingToll.e);   // the gate you walked to, first
  if (g && pt && Math.hypot(pt.pos.x - player.pos.x, pt.pos.z - player.pos.z) < 7) g = pt;
  const show = g && !hasPass(P, g.e);
  if ((show ? g : null) !== tollGate) {
    tollGate = show ? g : null; $('tollBtn').classList.toggle('hidden', !tollGate);
    if (tollGate) $('tollBtn').innerHTML = `🚪 Pay 1 to pass ${players[tollGate.e.road].house.sigil} ${players[tollGate.e.road].house.name.replace('House ', '')}'s gate <span class="muted">(${resTotal(P) ? 'from your largest stock' : 'you have nothing to pay'})</span>`;
  }
}
function tryToll() {
  if (!tollGate) return;
  const e = tollGate.e;
  if (resTotal(P) < 1) { log('⚠️ You have nothing to pay the toll'); sfx('bad'); return; }
  if (NET.guest) { netAct({ a: 'toll', e: e.id }); tollPasses[`${P}:${e.id}`] = duelClock + TOLL_TIME; }
  else payToll(P, e);
  if (player.pendingToll && player.pendingToll.e === e) {   // carry on through the gate
    const t = player.pendingToll; player.pendingToll = null;
    player.via = [t.far, t.target]; player.autoTarget = t.far;
  }
  tollGate = null; $('tollBtn').classList.add('hidden');
}

function registerGate(o, e) { if (o.userData.gate) wallGates.push({ e, ...o.userData.gate, open: 0 }); }
// gate points on both sides of a wall: walk to `near`, then through to `far`
function gatePath(e, fromX, fromZ) {
  const A = corners[e.a], B = corners[e.b], dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz);
  const gx = (A.x + B.x) / 2, gz = (A.z + B.z) / 2, nx = -dz / L, nz = dx / L;
  const side = Math.sign((fromX - gx) * nx + (fromZ - gz) * nz) || 1;
  return [{ x: gx + nx * side * 3.5, z: gz + nz * side * 3.5 }, { x: gx - nx * side * 3.5, z: gz - nz * side * 3.5 }];
}
// doors swing open when their owner comes near
function updateGates(dt) {
  for (const g of wallGates) {
    const o = g.e.road, op = lordAt(o);
    const payer = players.find(q => hasPass(q.id, g.e) && lordAt(q.id) && Math.hypot(lordAt(q.id).x - g.pos.x, lordAt(q.id).z - g.pos.z) < 9);
    const want = (op && Math.hypot(op.x - g.pos.x, op.z - g.pos.z) < 9) || payer ? 1 : 0;
    g.open += (want - g.open) * Math.min(1, dt * 4);
    if (g.grid) g.grid.position.y = g.open * 3.2; else { g.pivots[0].rotation.y = g.open * 1.35; g.pivots[1].rotation.y = -g.open * 1.35; }
  }
}
let wallMsgT = 0;
function blockedByWall(e) {
  player.autoTarget = null; player.via = null; destMarker.visible = false;
  if (performance.now() > wallMsgT) { wallMsgT = performance.now() + 4000; log(e.road === P ? '🚪 Your wall: cross it through its gate (in the middle)' : `🧱 ${nameOf(e.road)}'s wall blocks your way: walk around it`); }
}
// AI lords look for a way around: past the nearer open end of the wall; if the wall line is closed, they give up
function aiDetour(p, e, target) {
  p.detours = (p.detours || 0) + 1;
  if (p.detours > 4) { p.task = null; p.wander = null; p.detour = null; p.detourQ = null; p.tollE = null; p.wait = rr(2, 5); p.detours = 0; return; }   // stuck: try something else
  if (e.road === p.id) { const [near, far] = gatePath(e, p.pos.x, p.pos.z); p.detourQ = [far]; p.detour = near; return; }   // own wall: use the gate
  const A = corners[e.a], B = corners[e.b];
  const fenceGoesOn = c => c.edges.some(id => id !== e.id && edges[id].road === e.road);
  if (resTotal(p.id) > 0 && (rand() < 0.4 || [A, B].every(fenceGoesOn))) {   // pay at the gate instead of walking around
    const [near, far] = gatePath(e, p.pos.x, p.pos.z); p.detour = near; p.detourQ = [far]; p.tollE = e.id; return;
  }
  const ends = [[A, B], [B, A]].filter(([c]) => !fenceGoesOn(c))
    .sort((u, v) => Math.hypot(u[0].x - target.x, u[0].z - target.z) - Math.hypot(v[0].x - target.x, v[0].z - target.z));
  if (!ends.length) { p.task = null; p.wander = null; p.detour = null; p.wait = rr(2, 5); p.detours = 0; return; }
  const [c, o] = ends[0], L = Math.hypot(c.x - o.x, c.z - o.z) || 1;
  p.detour = { x: c.x + (c.x - o.x) / L * 7, z: c.z + (c.z - o.z) / L * 7 };
}

// you can walk along the top of any wall, like the Great Wall
function walkHeight(x, z) {
  const base = heightAt(x, z);
  for (const e of edges) {
    if (e.road === null) continue;
    const A = corners[e.a], B = corners[e.b], dx = B.x - A.x, dz = B.z - A.z, L2 = dx * dx + dz * dz, L = Math.sqrt(L2);
    const t = ((x - A.x) * dx + (z - A.z) * dz) / L2;
    if (t < WALL_TRIM / L || t > 1 - WALL_TRIM / L) continue;
    if (Math.hypot(A.x + dx * t - x, A.z + dz * t - z) < 1.3 && Math.abs(t - 0.5) * L > GATE_HALF) return base + WALL_H + 0.4;
  }
  return base;
}
function ghostify(g, color) {
  const gm = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, depthWrite: false });
  g.traverse(o => { if (o.isMesh) { o.material = gm; o.castShadow = false; } if (o.isSprite) o.visible = false; });
  g.userData.gm = gm; return g;
}
function placeAtCorner(obj, c) { obj.position.set(c.x, c.y, c.z); obj.rotation.y = Math.atan2(c.x, c.z); }

// ---------------------------------------------------------------- game state
const state = {
  phase: 'title',            // title | setup | play | won
  setupStep: 0,              // your landing steps: 0 hamlet, 1 road, 2 hamlet, 3 road
  setupCorner: null,
  setupQueue: [], setupTurn: 0,
  order: [], hornIdx: -1,    // turn order (snake for landing) and who holds the Harvest Horn
  res: { timber: 0, stone: 0, wheat: 0, cattle: 0, ember: 0 },
  built: { road: 0, hamlet: 0, keep: 0, roost: 0, tower: 0 },
  mode: null,                // 'road' | 'hamlet' | 'keep'
  harvestT: HARVEST_MAX,
  harvestLen: HARVEST_MAX,
  rolling: 0,
  lastRoll: null,
  longest: 0,
  highwayHolder: null,
  recallCD: 0,
  recallIdx: 0,
  startTime: 0,
  harvests: 0,
  paused: false,
  reaverPick: false,
  dragonEye: false,          // Milestone 3: a grown dragon reveals the whole map
};
const players = [];          // players[0] is you; the rest are AI houses
const explored = new Set(), visible = new Set();
const SIGHT = 48;            // how far you can see on foot (tile centres within this radius)
const buildingObjs = new Map();   // corner id -> Object3D
const PL = pid => players[pid] || { res: state.res, built: state.built };
const nameOf = pid => { const p = players[pid]; return `${p.house.sigil} ${!p.ai && p.name ? `${p.name} of ${p.house.name.replace('House ', '')}` : p.house.name}`; };

// ---------------------------------------------------------------- rules (pid = which house; defaults to you)
const owns = (c, pid = P) => !!c.building && c.building.owner === pid;
function hamletProblem(c, pid = P) {
  if (c.building) return 'This corner is already claimed';
  if (c.adj.some(id => corners[id].building)) return 'Too close to another settlement';
  if (state.phase === 'play' && !c.edges.some(id => edges[id].road === pid)) return 'Must connect to one of your walls';
  return null;
}
function roadProblem(e, pid = P) {
  if (e.road !== null) return 'A wall already stands here';
  if (state.phase === 'setup') { const sc = PL(pid).setupCorner; return (sc != null && (e.a === sc || e.b === sc)) ? null : 'Must start at your new Hamlet'; }
  for (const cid of [e.a, e.b]) {
    const c = corners[cid];
    if (owns(c, pid)) return null;
    if (!c.building && c.edges.some(id => id !== e.id && edges[id].road === pid)) return null;
  }
  return 'Must connect to your walls or Hamlets';
}
function keepProblem(c, pid = P) {
  if (!owns(c, pid)) return 'Upgrade one of your own Hamlets';
  if (c.building.type === 'keep') return 'Already a Keep';
  return null;
}
function roostProblem(c, pid = P) {
  if (!owns(c, pid) || c.building.type !== 'keep') return 'A Dragon Roost must stand beside one of your Keeps';
  if (c.roost != null) return 'There is already a Roost here';
  return null;
}
function towerProblem(c, pid = P) {
  if (!owns(c, pid)) return 'Scorpion Towers stand beside your own Hamlets or Keeps';
  if (c.tower != null) return 'There is already a Scorpion Tower here';
  return null;
}
function missing(kind, pid = P) {
  if (state.phase === 'setup') return [];
  if (kind === 'road' && PL(pid).freeRoads > 0) return [];
  const res = PL(pid).res, out = [];
  for (const [k, n] of Object.entries(COST[kind])) if (res[k] < n) out.push(`${n - res[k]} ${RES[k].name}`);
  return out;
}
function limitHit(kind, pid = P) { return PL(pid).built[kind] >= LIMITS[kind]; }
function pay(kind, pid = P) {
  if (state.phase === 'setup') return;
  if (kind === 'road' && PL(pid).freeRoads > 0) { PL(pid).freeRoads--; return; }
  for (const [k, n] of Object.entries(COST[kind])) PL(pid).res[k] -= n; }
const resTotal = pid => RES_KEYS.reduce((s, k) => s + PL(pid).res[k], 0);

const secretOf = pid => (players[pid]?.scrolls || []).filter(c => c.type === 'renown').length;
const totalRenown = pid => renown(pid) + secretOf(pid);   // what counts for victory
function renown(pid = P) {   // public renown (Renown Scrolls stay secret)
  let r = 0;
  for (const c of corners) if (owns(c, pid)) r += c.building.type === 'keep' ? 2 : 1;
  if (state.highwayHolder === pid) r += 2;
  if (state.hostHolder === pid) r += 2;
  r += dragonRenown(pid);
  return r;
}
function longestRoad(pid = P) {
  const mine = edges.filter(e => e.road === pid);
  let best = 0;
  const used = new Set();
  function dfs(cid, len) {
    best = Math.max(best, len);
    const c = corners[cid];
    if (c.building && c.building.owner !== pid && len > 0) return;   // a rival's settlement cuts your road
    for (const eid of c.edges) {
      const e = edges[eid];
      if (e.road !== pid || used.has(eid)) continue;
      used.add(eid); dfs(e.a === cid ? e.b : e.a, len + 1); used.delete(eid);
    }
  }
  for (const e of mine) { dfs(e.a, 0); dfs(e.b, 0); }
  return best;
}
// The Great Wall: first to 5 connected roads; taken by anyone who builds a strictly longer one
function updateHighway() {
  players.forEach(p => p.longest = longestRoad(p.id));
  state.longest = players[P] ? players[P].longest : 0;
  const h = state.highwayHolder;
  let best = h, bestLen = h === null ? 4 : players[h].longest;
  for (const p of players) if (p.longest > bestLen) { best = p.id; bestLen = p.longest; }
  if (h !== null && players[h].longest < 5 && best === h) {   // holder's road was cut below 5
    const others = players.filter(p => p.longest >= 5).sort((a, b) => b.longest - a.longest);
    best = others.length ? others[0].id : null;
  }
  if (best !== h) {
    state.highwayHolder = best;
    if (best === P) { announce('THE GREAT WALL', 'Your walls are the longest in Embervale. +2 Renown'); log('🏯 You hold the Great Wall (+2★)'); }
    else if (best !== null) { announce('GREAT WALL SEIZED!', `${nameOf(best)} now holds the Great Wall (+2★)`); log(`🏯 ${nameOf(best)} takes the Great Wall`); }
  }
}

// ---------------------------------------------------------------- actions
function buildHamlet(c, pid = P) {
  c.building = { owner: pid, type: 'hamlet' };
  const o = makeHamlet(players[pid]?.house || HOUSE); o.traverse(m => { m.castShadow = true; m.receiveShadow = true; }); placeAtCorner(o, c); scene.add(o);
  buildingObjs.set(c.id, o); PL(pid).built.hamlet++;
  popIn(o); refreshJoint(c); if (players.length) updateHighway();
}
function buildKeep(c, pid = P) {
  scene.remove(buildingObjs.get(c.id));
  c.building.type = 'keep';
  const o = makeKeep(players[pid]?.house || HOUSE); o.traverse(m => { m.castShadow = true; m.receiveShadow = true; }); placeAtCorner(o, c); scene.add(o);
  buildingObjs.set(c.id, o); PL(pid).built.keep++; PL(pid).built.hamlet--;
  popIn(o);
}
function buildRoad(e, pid = P) {
  e.road = pid; const o = makeRoad(e, players[pid]?.house || HOUSE); scene.add(o); PL(pid).built.road++; registerGate(o, e);
  popIn(o); refreshJointsAt(corners[e.a], corners[e.b]);
  if (players.length) updateHighway();
}
const pops = [];
function popIn(o) { o.scale.setScalar(0.01); pops.push({ o, t: 0 }); }

function tryBuild(tgt = currentTarget) {
  if (!tgt) return;
  if (state.phase === 'setup' && !myLandingTurn()) return;   // wait for your turn on the war table
  const kind = tgt.kind || state.mode;
  if (!kind || (kind === 'road') !== !!tgt.e) return;
  tgt.problem = problemFor(kind, tgt);
  if (tgt.problem) { log('⚠️ ' + tgt.problem); sfx('bad'); return; }
  if (NET.guest) { netAct({ a: 'build', kind, c: tgt.c?.id, e: tgt.e?.id }); sfx('build'); currentTarget = null; return; }
  pay(kind);
  if (kind === 'hamlet') buildHamlet(tgt.c);
  else if (kind === 'keep') buildKeep(tgt.c);
  else if (kind === 'roost') buildRoost(tgt.c);
  else if (kind === 'tower') buildTower(tgt.c);
  else buildRoad(tgt.e);
  sfx('build');
  if (state.phase === 'setup') advanceSetup(tgt);
  else {
    log({ road: '🧱 Wall built', hamlet: '🏘️ Hamlet founded (+1★)', keep: '🏰 Keep raised (+1★)', roost: '🐉 Dragon Roost built: now fetch an egg from the Ashen Waste', tower: '🏹 Scorpion Tower built: dragons cannot scorch the regions around it' }[kind]);
    if (kind === 'roost') announce('THE ROOST IS READY', 'Walk to the Ashen Waste, press E at an egg, and carry it home');
    if (state.mode && (!canAfford(state.mode) || limitHit(state.mode))) setMode(null);
    state.builtInPlay = true; updateObjective();
  }
  refreshMarkers(); updateHUD(); checkWin();
}
function problemFor(kind, tgt, pid = P) {
  let p = kind === 'road' ? roadProblem(tgt.e, pid) : kind === 'hamlet' ? hamletProblem(tgt.c, pid) : kind === 'roost' ? roostProblem(tgt.c, pid) : kind === 'tower' ? towerProblem(tgt.c, pid) : keepProblem(tgt.c, pid);
  if (!p && limitHit(kind, pid)) p = `No ${kind === 'road' ? 'wall' : kind}s left in your supply`;
  if (!p) { const m = missing(kind, pid); if (m.length) p = 'Need ' + m.join(', '); }
  return p;
}
function canAfford(kind, pid = P) { return missing(kind, pid).length === 0; }

// ---------------------------------------------------------------- landing (snake order on the war table)
const setupPid = () => state.setupQueue[state.setupTurn];
const myLandingTurn = () => state.phase === 'setup' && setupPid() === P;
function beginSetup() {
  cradleEggs.forEach((e, i) => { if (i >= players.length) { e.taken = true; e.mesh.visible = false; } });   // one egg per house
  state.order = shuffle(players.map(p => p.id));
  state.setupQueue = [...state.order, ...state.order.slice().reverse()];
  state.setupTurn = 0; players.forEach(p => { p.setupStep = 0; p.setupCorner = null; });
  log('📜 Landing order: ' + state.order.map(id => players[id].house.sigil).join(' → ') + ' then back again');
  nextSetupTurn();
}
function nextSetupTurn() {
  if (state.setupTurn >= state.setupQueue.length) return finishSetup();
  const pid = setupPid();
  if (players[pid].ai) {
    state.mode = null; refreshMarkers(); updateObjective();
    setTimeout(() => { if (state.phase !== 'setup') return; aiSetupPlace(pid); sfx('build'); state.setupTurn++; nextSetupTurn(); }, 1300);
  } else if (pid === P) { setMode('hamlet'); updateObjective(); }
  else { state.mode = null; refreshMarkers(); updateObjective(); }   // a friend's turn: wait for their click
}
function grantStart(pid, c) {
  const got = [];
  for (const tid of c.tiles) { const t = tiles[tid]; if (RES[t.type]) { players[pid].res[t.type]++; got.push(RES[t.type].icon); } }
  return got;
}
function advanceSetup(tgt, pid = P) {
  const p = players[pid];
  p.setupStep++;
  if (p.setupStep % 2 === 1) { p.setupCorner = tgt.c.id; if (pid === P) setMode('road'); }
  else {
    if (p.setupStep === 4) { const got = grantStart(pid, corners[p.setupCorner]); if (pid === P) state.startGot = got; else tell(pid, { startGot: got }); }
    p.setupCorner = null; if (pid === P) state.mode = null; state.setupTurn++; nextSetupTurn();
  }
  updateObjective();
}
function finishSetup() {
  state.phase = 'play'; setMode(null);
  state.harvestT = state.harvestLen = 8;    // a quick first harvest to get going
  const got = state.startGot || [];
  announce('THE HOUSES HAVE LANDED', got.length ? 'Your starting supplies: ' + got.join(' ') : 'Let the harvests begin');
  log('🎺 Landing complete. The mist rolls in… explore to reveal the isles.');
  endLanding(); spawnAvatars(); updateHUD(); updateObjective();
  if (NET.host) wsSend({ t: 'close' });
}

function setMode(m) {
  if (m && state.phase === 'setup') m = myLandingTurn() ? ((players[P]?.setupStep || 0) % 2 === 0 ? 'hamlet' : 'road') : null;
  state.mode = m; currentTarget = null; refreshMarkers(); updateHUD();
}

// ---------------------------------------------------------------- harvest
const hornBearer = () => state.order[((state.hornIdx % state.order.length) + state.order.length) % state.order.length];
function startHarvest() {
  state.harvests++; state.hornIdx++; state.rollsLeft = ROLLS_PER_HARVEST;
  dragonsOnHarvest();
  sfx('horn'); updateHUD(); startRoll();
}
function startRoll() {
  clearTimeout(state.runeHide);
  state.rolling = 1.8; state.rollNo = ROLLS_PER_HARVEST - state.rollsLeft + 1;
  runes.forEach(r => r.visible = true);
}
function resolveHarvest() {
  const d1 = 1 + Math.floor(Math.random() * 6), d2 = 1 + Math.floor(Math.random() * 6), sum = d1 + d2;
  runes[0].material.map = runeTex[d1]; runes[1].material.map = runeTex[d2];
  runes.forEach(r => { r.material.rotation = 0; r.material.needsUpdate = true; });
  state.lastRoll = sum; state.rollSeq = (state.rollSeq || 0) + 1; state.dice = [d1, d2];
  clearTimeout(state.runeHide); state.runeHide = setTimeout(() => runes.forEach(r => r.visible = false), 2600);
  if (sum === 7) return reaverRaid();
  const gain = {};
  for (const t of tiles) {
    if (t.num !== sum) continue;
    pulse.push({ s: t.banner, t: 0 });
    if (t === reaverTile) { if (t.corners.some(cid => owns(corners[cid]))) log(`🏴 The Wyrm blocks ${BIOME[t.type].name} (${sum})`); continue; }
    if (t.scorchedUntil >= state.harvests) { if (t.corners.some(cid => owns(corners[cid]))) log(`🔥 ${BIOME[t.type].name} (${sum}) is scorched and yields nothing`); continue; }
    for (const cid of t.corners) {
      const c = corners[cid]; if (!c.building) continue;
      const n = (c.building.type === 'keep' ? 2 : 1) + (state.dawnBounty ? 1 : 0);   // dawn bounty
      players[c.building.owner].res[t.type] += n;
      if (c.building.owner === P) gain[t.type] = (gain[t.type] || 0) + n;
    }
  }
  harvestPopups(sum);
  if (state.dawnBounty) log('🌅 Dawn bounty: +1 for every producing Hamlet and Keep');
  const parts = Object.entries(gain).map(([k, n]) => { flashRes(k); return `+${n} ${RES[k].icon}`; });
  announce(`HARVEST ${state.rollNo || 1}/${ROLLS_PER_HARVEST} · ${sum}`, parts.length ? parts.join('  ') : 'Your lands yield nothing this time');
  log(`🎲 Rune Stones show ${d1} + ${d2} = ${sum}` + (parts.length ? ' → ' + parts.join(' ') : ''));
  updateHUD(); refreshMarkers();
}
function loseHalf(pid) {
  const res = players[pid].res, total = resTotal(pid);
  if (total <= 7) return null;
  let lose = Math.floor(total / 2); const lost = {};
  while (lose > 0) {   // lose from the largest stockpile first
    const k = RES_KEYS.slice().sort((a, b) => res[b] - res[a])[0];
    res[k]--; lost[k] = (lost[k] || 0) + 1; lose--; if (pid === P) flashRes(k, true);
  }
  return lost;
}
function reaverRaid() {
  let lostTxt = '';
  for (const p of players) {
    const lost = loseHalf(p.id);
    if (lost && p.id === P) lostTxt = 'They plunder your Hold: ' + Object.entries(lost).map(([k, n]) => `-${n} ${RES[k].icon}`).join(' ') + '. ';
  }
  sfx('raid');
  const bearer = hornBearer();
  if (players[bearer].ai) {
    const t = aiChooseReaverTile(bearer);
    sendReavers(bearer, t, lostTxt);
  } else if (bearer === P) {
    announce('THE WYRM WAKES!', lostTxt + 'You hold the Horn: choose where the Wyrm descends.');
    startReaverPick();
  } else { state.pickFor = bearer; state.pickT = 25; log(`🎺 ${nameOf(bearer)} holds the Horn and chooses where the Wyrm descends…`); }
  updateHUD(); refreshMarkers();
}
function sendReavers(pid, t, prefix = '', title = 'THE WYRM WAKES!') {
  placeReavers(t); computeVisibility();
  const seen = visible.has(t.id) || pid === P;
  const where = seen ? `in ${BIOME[t.type].name}${t.num ? ' (' + t.num + ')' : ''}` : 'somewhere in the mist';
  // steal one random card from a rival with a settlement on that region
  const victims = [...new Set(t.corners.map(cid => corners[cid].building?.owner).filter(o => o !== undefined && o !== pid && resTotal(o) > 0))];
  let steal = '';
  if (victims.length) {
    const v = pick(victims), pool = RES_KEYS.flatMap(k => Array(players[v].res[k]).fill(k)), k = pick(pool);
    players[v].res[k]--; players[pid].res[k]++;
    if (pid === P) steal = ` You steal 1 ${RES[k].icon} from ${nameOf(v)}!`;
    else if (v === P) { steal = ` ${nameOf(pid)} steals 1 ${RES[k].icon} from you!`; flashRes(k, true); }
    else if (seen) steal = ` ${nameOf(pid)} robs ${nameOf(v)}.`;
    if (pid !== P) tell(pid, { log: `🏴 The Wyrm robs ${nameOf(v)} for you: +1 ${RES[k].icon}`, flash: [k] });
    if (v !== P) tell(v, { big: title, small: `${nameOf(pid)} steals 1 ${RES[k].icon} from you!`, flash: [k], loss: true });
  }
  const who = pid === P ? 'The Wyrm coils' : `${nameOf(pid)} sends the Wyrm. It coils`;
  announce(title, `${prefix}${who} ${where}.${steal}`);
  log(`${title === 'THE WYRM WAKES!' ? '🏴 7!' : '⚔️ Sellswords!'} ${who} ${where}.${steal}`);
  updateHUD(); refreshMarkers();
}
function startReaverPick(reason = 'raid') {
  state.reaverReason = reason; state.reaverPick = true; state.paused = !NET.online;
  document.exitPointerLock?.(); setWarMap(true); updateObjective();
}
function finishReaverPick(t) {
  state.reaverPick = false; state.paused = false; setWarMap(false); updateObjective();
  if (NET.guest) {   // tell the host where our Reavers go
    if (state.reaverReason === 'sellsword') netAct({ a: 'scroll_play', idx: state.sellswordIdx, arg: t.id }); else netAct({ a: 'reaver_pick', t: t.id });
    lockPointer(); return;
  }
  sendReavers(P, t, '', state.reaverReason === 'sellsword' ? 'SELLSWORDS!' : 'THE WYRM WAKES!'); lockPointer();
}
const pulse = [];

function checkWin() {
  if (state.phase !== 'play') return;
  const winner = players.find(p => totalRenown(p.id) >= GOAL);
  if (!winner) return;
  state.phase = 'won'; state.winner = winner.id;
  showWin(winner);
}
function showWin(winner) {
  document.exitPointerLock?.();
  const mins = ((performance.now() - state.startTime) / 60000).toFixed(1);
  const me = winner.id === P;
  $('winTitle').textContent = me ? 'VICTORY' : 'DEFEAT';
  $('winHouse').textContent = winner.house.name;
  $('winStats').innerHTML = `${totalRenown(winner.id)} Renown in ${mins} minutes · ${state.harvests} harvests<br>` +
    players.slice().sort((a, b) => totalRenown(b.id) - totalRenown(a.id)).map(p => `${p.house.sigil} ${p.house.name}: ${totalRenown(p.id)}★${secretOf(p.id) ? ` (👑${secretOf(p.id)} secret)` : ''}`).join(' · ');
  $('win').classList.remove('hidden');
  sfx(me ? 'win' : 'raid');
}

// ---------------------------------------------------------------- AI houses
const PIPS = n => n ? 6 - Math.abs(7 - n) : 0;
function ownedTypes(pid) { const s = new Set(); for (const c of corners) if (owns(c, pid)) c.tiles.forEach(id => RES[tiles[id].type] && s.add(tiles[id].type)); return s; }
function cornerScore(c, pid, have = ownedTypes(pid)) {
  let s = 0; const types = new Set();
  for (const tid of c.tiles) { const t = tiles[tid]; if (!t.num) continue; s += PIPS(t.num) * (t === reaverTile ? 0.4 : 1); types.add(t.type); }
  s += types.size * 1.2;
  for (const ty of types) if (!have.has(ty)) s += 1.6;
  if (types.has('wheat')) s += 0.5; if (types.has('ember')) s += 0.5;
  return s;
}
const freeSpot = c => !c.building && !c.adj.some(id => corners[id].building);
function aiSetupPlace(pid) {
  const have = ownedTypes(pid);
  const best = corners.filter(freeSpot).map(c => ({ c, s: cornerScore(c, pid, have) + rand() * 0.8 })).sort((a, b) => b.s - a.s)[0].c;
  buildHamlet(best, pid);
  // road toward the most promising free corner nearby
  const roads = best.edges.map(id => edges[id]).filter(e => e.road === null);
  const far = e => corners[e.a === best.id ? e.b : e.a];
  const rs = e => Math.max(0, ...far(e).adj.map(id => corners[id]).filter(freeSpot).map(c => cornerScore(c, pid)));
  const road = roads.sort((a, b) => rs(b) - rs(a))[0];
  if (road) buildRoad(road, pid);
  if (players[pid].built.hamlet === 2) grantStart(pid, best);
  log(`${nameOf(pid)} lands at ${best.tiles.map(id => tiles[id]).map(t => t.num ? RES[t.type].icon + t.num : '🌋').join(' ')}`);
  refreshMarkers(); updateHUD();
}
// The Horn-Bearer sends the Reavers where they hurt the leading rival most, never onto their own lands
function aiChooseReaverTile(pid) {
  const lead = Math.max(...players.filter(p => p.id !== pid).map(p => renown(p.id)));
  let best = null, bs = -1e9;
  for (const t of tiles) {
    if (t === reaverTile) continue;
    let s = rand() * 0.5;
    for (const cid of t.corners) {
      const b = corners[cid].building; if (!b) continue;
      if (b.owner === pid) s -= 100;
      else s += (b.type === 'keep' ? 2 : 1) * PIPS(t.num) * (renown(b.owner) >= lead ? 2 : 1);
    }
    if (s > bs) { bs = s; best = t; }
  }
  return best;
}
function bestSite(pid) {
  let best = null, bs = -1; const have = ownedTypes(pid);
  for (const c of corners) if (!hamletProblem(c, pid)) { const s = cornerScore(c, pid, have); if (s > bs) { bs = s; best = c; } }
  return best;
}
function bestRoad(pid, noise = true) {
  let best = null, bs = 0.5; const have = ownedTypes(pid);
  for (const e of edges) {
    if (roadProblem(e, pid)) continue;
    let s = 0;
    for (const cid of [e.a, e.b]) {
      const c = corners[cid];
      if (owns(c, pid) || c.edges.some(id => edges[id].road === pid)) continue;   // the end we already reach
      if (freeSpot(c)) s = Math.max(s, cornerScore(c, pid, have));
      else s = Math.max(s, 0.55 * Math.max(0, ...c.adj.map(id => corners[id]).filter(freeSpot).map(x => cornerScore(x, pid, have))));
    }
    s += noise ? rand() * 0.6 : 0;
    if (players[pid].longest >= 3 && state.highwayHolder !== pid) s += 1;   // chase the Great Wall
    if (s > bs) { bs = s; best = e; }
  }
  return best;
}
function aiGoal(pid) {
  const p = players[pid];
  if (p.built.hamlet > 0 && !limitHit('keep', pid) && p.res.wheat + p.res.ember >= 3) return 'keep';
  if (!limitHit('hamlet', pid) && bestSite(pid)) return 'hamlet';
  if (!limitHit('road', pid)) return 'road';
  return 'keep';
}
const needOf = (goal, k) => COST[goal][k] || 0;
function aiGuildTrade(p) {
  const goal = aiGoal(p.id), lack = RES_KEYS.filter(k => p.res[k] < needOf(goal, k));
  if (!lack.length) return false;
  // first try a fair 1:1 swap with another AI house that wants what we have spare
  for (const q of shuffle(players.filter(q => q.ai && q !== p))) {
    const want = lack.find(k => aiSpare(q, k));
    const giveK = want && RES_KEYS.find(k => k !== want && aiSpare(p, k) && aiWants(q, k));
    if (want && giveK) { p.res[giveK]--; q.res[giveK]++; q.res[want]--; p.res[want]++; return true; }
  }
  // otherwise the Guild: 4 of a surplus for 1 of what we lack (more eager when the Reavers could take half)
  const hoard = resTotal(p.id) > 7;
  const spare = RES_KEYS.filter(k => p.res[k] - (hoard ? 0 : needOf(goal, k)) >= 4 && !lack.includes(k)).sort((a, b) => p.res[b] - p.res[a])[0];
  if (spare) { p.res[spare] -= 4; p.res[lack[0]]++; return true; }
  return false;
}
function aiThink(p) {
  if (state.phase !== 'play' || p.task) return;
  const pid = p.id;
  if (aiPlayScroll(p)) { p.think = 1; return; }
  if (aiDragonPlans(p)) return;
  if (aiRaidPlan(p)) return;
  if (canAfford('keep', pid) && !limitHit('keep', pid)) {
    const c = corners.filter(c => owns(c, pid) && c.building.type === 'hamlet').sort((a, b) => cornerScore(b, pid) - cornerScore(a, pid))[0];
    if (c) { p.task = { kind: 'keep', c }; return; }
  }
  const site = !limitHit('hamlet', pid) ? bestSite(pid) : null;
  if (site && canAfford('hamlet', pid)) { p.task = { kind: 'hamlet', c: site }; return; }
  if (canAfford('road', pid) && !limitHit('road', pid)) {
    const saving = !p.freeRoads && site && missing('hamlet', pid).length <= 2 && !(p.res.timber >= 2 && p.res.stone >= 2);
    if (!saving) { const e = bestRoad(pid); if (e) { p.task = { kind: 'road', e }; return; } }
  }
  // nothing to build: maybe study a Lore Scroll (more likely when the Reavers could take half)
  if (deck.length && canAfford('scroll', pid) && (resTotal(pid) > 7 || rand() < 0.3) && !(aiGoal(pid) === 'keep' && p.res.ember < 4)) {
    buyScroll(pid); log(`📜 ${nameOf(pid)} buys a Lore Scroll`); updateHUD(); return;
  }
  if (aiGuildTrade(p)) p.think = 0.5;   // trade, then think again soon
}
function aiPlayScroll(p) {
  const pid = p.id;
  for (let i = 0; i < p.scrolls.length; i++) {
    const c = p.scrolls[i]; if (!canPlay(p, c)) continue;
    if (c.type === 'sellsword' && (reaverTile.corners.some(cid => owns(corners[cid], pid)) || p.knights >= 2 || rand() < 0.3)) { playScroll(pid, i); return true; }
    if (c.type === 'roads' && !limitHit('road', pid) && bestRoad(pid)) { playScroll(pid, i); return true; }
    if (c.type === 'harvest') {
      const goal = aiGoal(pid), lack = RES_KEYS.flatMap(k => Array(Math.max(0, needOf(goal, k) - p.res[k])).fill(k));
      playScroll(pid, i, [...lack, 'wheat', 'ember'].slice(0, 2)); return true;
    }
    if (c.type === 'decree') {
      const k = RES_KEYS.slice().sort((a, b) => players.reduce((s, q) => s + (q === p ? 0 : q.res[b]), 0) - players.reduce((s, q) => s + (q === p ? 0 : q.res[a]), 0))[0];
      if (players.reduce((s, q) => s + (q === p ? 0 : q.res[k]), 0) >= 3) { playScroll(pid, i, k); return true; }
    }
  }
  return false;
}

// ---------------------------------------------------------------- Lore Scrolls (development cards)
const SCROLLS = {
  sellsword: { name: 'Sellsword', icon: '⚔️', desc: 'Move the Wyrm and rob a rival there. Counts toward the Mightiest Host.' },
  renown:    { name: 'Renown Scroll', icon: '👑', desc: '+1 Renown, kept secret from the other houses.' },
  roads:     { name: 'Wall Builders', icon: '🧱', desc: 'Build your next 2 walls for free.' },
  harvest:   { name: 'Bountiful Harvest', icon: '🌾', desc: 'Take any 2 resources.' },
  decree:    { name: 'Royal Decree', icon: '📯', desc: 'Name a resource: every other house gives you all of theirs.' },
};
let deck = [];
function makeDeck() { deck = shuffle([...Array(14).fill('sellsword'), ...Array(5).fill('renown'), 'roads', 'roads', 'harvest', 'harvest', 'decree', 'decree']); }
function buyScroll(pid = P) {
  if (!deck.length) return null;
  if (!canAfford('scroll', pid)) return null;
  pay('scroll', pid);
  const type = deck.pop();
  players[pid].scrolls.push({ type, boughtAt: state.harvests });
  return type;
}
// a scroll can be played from the harvest after it was bought, and each house plays at most one per harvest
const canPlay = (p, c) => c.type !== 'renown' && state.harvests > c.boughtAt && p.playedAt !== state.harvests;
function updateHost() {
  const h = state.hostHolder;
  let best = h, bestN = h === null || h === undefined ? 2 : players[h].knights;
  for (const p of players) if (p.knights > bestN) { best = p.id; bestN = p.knights; }
  if (best !== h && best !== undefined) {
    state.hostHolder = best;
    if (best === P) { announce('THE MIGHTIEST HOST', 'Your Sellswords are the strongest force. +2 Renown'); log('🎖️ You command the Mightiest Host (+2★)'); }
    else { announce('A MIGHTY HOST!', `${nameOf(best)} commands the Mightiest Host (+2★)`); log(`🎖️ ${nameOf(best)} takes the Mightiest Host`); }
  }
}
function playScroll(pid, idx, arg) {
  const p = players[pid], card = p.scrolls[idx], S = SCROLLS[card.type];
  p.scrolls.splice(idx, 1); p.playedAt = state.harvests;
  const who = pid === P ? 'You play' : `${nameOf(pid)} plays`;
  if (card.type === 'sellsword') {
    p.knights++; updateHost();
    log(`${S.icon} ${who} a Sellsword`);
    if (pid === P && arg == null) startReaverPick('sellsword'); else sendReavers(pid, arg != null ? tiles[arg] : aiChooseReaverTile(pid), '', 'SELLSWORDS!');
  } else if (card.type === 'roads') {
    p.freeRoads += 2;
    log(`${S.icon} ${who} Wall Builders: 2 free walls`);
    if (pid === P) announce('WALL BUILDERS', 'Your next 2 walls are free');
  } else if (card.type === 'harvest') {
    arg.forEach(k => { p.res[k]++; if (pid === P) flashRes(k); });
    log(`${S.icon} ${who} Bountiful Harvest` + (pid === P ? `: +1 ${RES[arg[0]].icon} +1 ${RES[arg[1]].icon}` : ''));
  } else if (card.type === 'decree') {
    let n = 0;
    for (const q of players) if (q !== p) { n += q.res[arg]; if (q.id === P && q.res[arg]) flashRes(arg, true); p.res[arg] += q.res[arg]; q.res[arg] = 0; }
    if (pid === P) flashRes(arg);
    announce('ROYAL DECREE!', `${who.replace(' play', ' claim').replace('You claims', 'You claim')} every ${RES[arg].icon} ${RES[arg].name} in Embervale (${n})`);
    log(`${S.icon} ${who} a Royal Decree: all ${RES[arg].icon} go to ${pid === P ? 'you' : nameOf(pid)} (${n})`);
  }
  updateHUD(); refreshMarkers(); checkWin();
}
function taskPos(task) {
  if (task.kind === 'egg') return { x: task.egg.x * 0.72, z: task.egg.z * 0.72 };
  const x = task.c ? task.c.x : task.e.mx, z = task.c ? task.c.z : task.e.mz, L = Math.hypot(x, z) || 1;
  return { x: x - x / L * 5, z: z - z / L * 5 };   // stand a few steps inland of the spot
}
function aiExecute(p) {
  const t = p.task; p.task = null;
  if (t.kind === 'egg' || t.kind === 'deliver') return aiEggStep(p, t);
  if (t.kind === 'raid') { if (!raidProblem(p.id, t.c, p.pos)) raid(p.id, t.c); return; }
  if (problemFor(t.kind, t, p.id)) return;          // someone took the spot, or resources were lost
  pay(t.kind, p.id);
  if (t.kind === 'hamlet') buildHamlet(t.c, p.id); else if (t.kind === 'keep') buildKeep(t.c, p.id);
  else if (t.kind === 'roost') buildRoost(t.c, p.id); else if (t.kind === 'tower') buildTower(t.c, p.id); else buildRoad(t.e, p.id);
  reportBuild(p.id, t);
  refreshMarkers(); updateHUD(); checkWin();
}
// news travels: you see it if you can see the spot; otherwise ravens report settlements
function reportBuild(pid, t) {
  const tile = t.c ? t.c.tiles.map(id => tiles[id]) : [corners[t.e.a], corners[t.e.b]].flatMap(c => c.tiles.map(id => tiles[id]));
  const seen = tile.some(x => visible.has(x.id));
  const what = { road: 'builds a wall', hamlet: 'founds a Hamlet (+1★)', keep: 'raises a Keep (+1★)', roost: 'builds a Dragon Roost 🐉', tower: 'builds a Scorpion Tower 🏹' }[t.kind];
  if (seen) { log(`👀 ${nameOf(pid)} ${what} nearby`); sfx('build'); }
  else if (t.kind !== 'road') log(`🐦 Ravens report: ${nameOf(pid)} ${what}`);
}
// AI lords walk the isles in person
// A lord on horseback: a horse in a caparison of the house colour, an armoured rider with a plumed helm,
// a crest shield and a lance with the house banner.
// A lord on horseback, in some detail: a barded warhorse and an armoured knight with crest shield, lance and cloak.
const COATS = { varn: { coat: PAL.ink, socks: false }, calder: { coat: PAL.ink, socks: false }, morrow: { coat: PAL.ink, socks: false }, ashby: { coat: PAL.ink, socks: false } };
const KM = {};   // shared materials per house (built once)
function knightMats(h) {
  if (KM[h.key]) return KM[h.key];
  const c = COATS[h.key] || COATS.morrow;
  return (KM[h.key] = {
    coat: mat(c.coat), sock: mat(c.socks ? PAL.bone : c.coat), mane: mat(PAL.ink), hoof: mat(PAL.ink),
    steel: mat(PAL.violet), darkSteel: mat(PAL.ink), leather: mat(PAL.ink), gold: mat(PAL.straw), skin: mat(PAL.ashen),
    cloth: h.mat, clothDS: Object.assign(h.mat.clone(), { side: THREE.DoubleSide }),
    crestDS: new THREE.MeshToonMaterial({ map: h.crestMat.map, gradientMap: toonRamp, side: THREE.DoubleSide }),
    eye: new THREE.MeshBasicMaterial({ color: PAL.ink }),
  });
}
const KG = {   // shared geometry
  sphere: new THREE.SphereGeometry(1, 12, 9), hemi: new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
};
function mesh(geo, m, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); return o; }
function tube(r1, r2, h, m, seg = 8) { return new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); }
function normalizeUV(geo) {
  geo.computeBoundingBox(); const b = geo.boundingBox, p = geo.attributes.position, uv = [];
  for (let i = 0; i < p.count; i++) uv.push((p.getX(i) - b.min.x) / (b.max.x - b.min.x), (p.getY(i) - b.min.y) / (b.max.y - b.min.y));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); return geo;
}
function kiteShape(s = 1) {
  const k = new THREE.Shape();
  k.moveTo(-0.3 * s, 0.35 * s); k.quadraticCurveTo(0, 0.45 * s, 0.3 * s, 0.35 * s); k.lineTo(0.28 * s, 0);
  k.quadraticCurveTo(0.2 * s, -0.3 * s, 0, -0.52 * s); k.quadraticCurveTo(-0.2 * s, -0.3 * s, -0.28 * s, 0); k.closePath();
  return k;
}
function makeAvatar(h, label = `${h.sigil} ${h.name}`) {
  const m = knightMats(h);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  // ---- the horse (faces +z)
  body.add(mesh(KG.sphere, m.coat, 0, 1.75, 0, 0.6, 0.64, 1.12));          // barrel
  body.add(mesh(KG.sphere, m.coat, 0, 1.85, 0.82, 0.56, 0.62, 0.55));      // chest
  body.add(mesh(KG.sphere, m.coat, 0, 1.88, -0.82, 0.6, 0.6, 0.6));        // hindquarters
  const neck = new THREE.Group(); neck.position.set(0, 2.05, 1.05); neck.rotation.x = 0.62; body.add(neck);
  const nk = tube(0.21, 0.34, 1.2, m.coat); nk.position.y = 0.55; neck.add(nk);
  for (let i = 0; i < 6; i++) { const mn = mesh(new THREE.BoxGeometry(0.09, 0.22, 0.2), m.mane, 0, 0.05 + i * 0.2, -0.27 + i * 0.012); mn.rotation.x = -0.25; neck.add(mn); }
  const head = new THREE.Group(); head.position.y = 1.08; head.rotation.x = 1.55; neck.add(head);
  head.add(mesh(new THREE.BoxGeometry(0.38, 0.46, 0.42), m.coat, 0, 0.12, 0));
  const muzzle = tube(0.15, 0.22, 0.62, m.coat); muzzle.position.set(0, 0.62, 0.03); head.add(muzzle);
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.26, 4), m.coat); ear.position.set(sx * 0.12, -0.02, -0.24); ear.rotation.x = -Math.PI / 2; head.add(ear);
    head.add(mesh(KG.sphere, m.eye, sx * 0.2, 0.22, -0.06, 0.05, 0.05, 0.05));
    head.add(mesh(KG.sphere, m.eye, sx * 0.07, 0.93, 0.07, 0.035, 0.035, 0.035));                          // nostrils
  }
  const chan = mesh(new THREE.BoxGeometry(0.26, 0.74, 0.04), m.steel, 0, 0.44, -0.2); chan.rotation.x = 0.1; head.add(chan);   // chanfron
  head.add(mesh(new THREE.BoxGeometry(0.28, 0.05, 0.05), m.gold, 0, 0.08, -0.23));
  const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.25, 4), m.gold); spike.position.set(0, 0.16, -0.27); spike.rotation.x = -Math.PI / 2; head.add(spike);
  const bridle = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.025, 4, 12), m.leather); bridle.rotation.x = Math.PI / 2; bridle.position.y = 0.6; head.add(bridle);
  // barding: steel peytral across the chest, a flowing caparison with the crest, saddle and stirrups
  const pey = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.3, 12, 1, true, -Math.PI / 2, Math.PI), m.darkSteel); pey.position.set(0, 1.66, 0.98); pey.scale.z = 0.62; body.add(pey);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.78, 0.95, 14, 1, true), m.clothDS); cap.position.set(0, 1.28, -0.05); cap.scale.z = 1.75; body.add(cap);
  const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.785, 0.79, 0.1, 14, 1, true), m.gold); hem.position.set(0, 0.84, -0.05); hem.scale.z = 1.75; body.add(hem);
  for (const sx of [-1, 1]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.62), m.crestDS); c.position.set(sx * 0.74, 1.3, -0.1); c.rotation.y = sx * Math.PI / 2; c.rotation.z = sx * 0.06; body.add(c); }
  body.add(mesh(new THREE.BoxGeometry(1.0, 0.06, 1.0), m.gold, 0, 2.36, -0.1));
  body.add(mesh(new THREE.BoxGeometry(0.62, 0.12, 0.72), m.leather, 0, 2.43, -0.1));
  body.add(mesh(new THREE.BoxGeometry(0.58, 0.36, 0.1), m.leather, 0, 2.58, -0.46));                      // cantle
  body.add(mesh(new THREE.BoxGeometry(0.36, 0.26, 0.1), m.leather, 0, 2.5, 0.28));                       // pommel
  for (const sx of [-1, 1]) {
    body.add(mesh(new THREE.BoxGeometry(0.03, 0.75, 0.04), m.leather, sx * 0.55, 2.0, 0.12));
    const st = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 4, 8), m.darkSteel); st.position.set(sx * 0.55, 1.6, 0.12); body.add(st);
  }
  // legs: hip → knee/hock → hoof
  const legs = [];
  for (const [x, z, front] of [[-0.3, 0.85, 1], [0.3, 0.85, 1], [-0.3, -0.85, 0], [0.3, -0.85, 0]]) {
    const hip = new THREE.Group(); hip.position.set(x, 1.42, z); body.add(hip);
    const up = tube(0.12, 0.17, 0.62, m.coat); up.position.y = -0.3; hip.add(up);
    const knee = new THREE.Group(); knee.position.y = -0.62; hip.add(knee);
    const low = tube(0.075, 0.1, 0.56, m.sock, 6); low.position.y = -0.27; knee.add(low);
    knee.add(mesh(KG.sphere, m.sock, 0, -0.56, 0, 0.1, 0.1, 0.1));
    const hoof = tube(0.12, 0.14, 0.15, m.hoof, 8); hoof.position.y = -0.66; knee.add(hoof);
    legs.push({ hip, knee, front });
  }
  const tail = new THREE.Group(); tail.position.set(0, 2.05, -1.38); body.add(tail);
  for (const [rx, ry, l] of [[2.55, 0, 1.15], [2.75, 0.18, 1.0], [2.7, -0.18, 1.0]]) {
    const t = new THREE.Mesh(new THREE.ConeGeometry(0.14, l, 5), m.mane); t.rotation.set(rx, ry, 0); t.position.set(0, -l * 0.42, -0.25); tail.add(t);
  }
  // ---- the knight
  const rider = new THREE.Group(); rider.position.set(0, 2.5, -0.1); body.add(rider);
  for (const sx of [-1, 1]) {   // armoured legs in the stirrups
    const th = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.22), m.steel); th.position.set(sx * 0.33, -0.12, 0.16); th.rotation.set(-1.0, 0, sx * 0.25); rider.add(th);
    const gr = tube(0.08, 0.1, 0.6, m.steel, 6); gr.position.set(sx * 0.5, -0.62, 0.3); rider.add(gr);
    rider.add(mesh(new THREE.BoxGeometry(0.15, 0.1, 0.3), m.darkSteel, sx * 0.53, -0.95, 0.36));
  }
  rider.add(mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.3, 8), m.steel, 0, 0.08, 0));                  // fauld
  rider.add(mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.62, 8), m.steel, 0, 0.5, 0));                   // breastplate
  const tab = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.66), m.crestDS); tab.position.set(0, 0.42, 0.33); rider.add(tab);   // tabard with crest
  const tabB = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.66), m.clothDS); tabB.position.set(0, 0.42, -0.33); rider.add(tabB);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.035, 4, 12), m.leather); belt.rotation.x = Math.PI / 2; belt.position.y = 0.2; rider.add(belt);
  const sword = new THREE.Group(); sword.position.set(0.36, 0.1, 0.05); sword.rotation.z = 0.35; rider.add(sword);   // sword at the hip
  sword.add(mesh(new THREE.BoxGeometry(0.07, 0.8, 0.1), m.leather, 0, -0.4, 0));
  sword.add(mesh(new THREE.BoxGeometry(0.26, 0.04, 0.05), m.steel, 0, 0.02, 0));
  sword.add(mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), m.leather, 0, 0.12, 0));
  sword.add(mesh(KG.sphere, m.gold, 0, 0.22, 0, 0.045, 0.045, 0.045));
  for (const sx of [-1, 1]) rider.add(mesh(KG.hemi, m.steel, sx * 0.36, 0.74, 0, 0.19, 0.17, 0.2));     // pauldrons
  rider.add(mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.12, 8), m.steel, 0, 0.84, 0));                 // gorget
  // great helm with eye slit, gold cross and plume
  rider.add(mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.36, 10), m.steel, 0, 1.06, 0));
  rider.add(mesh(KG.hemi, m.steel, 0, 1.24, 0, 0.2, 0.12, 0.2));
  rider.add(mesh(new THREE.BoxGeometry(0.34, 0.035, 0.06), m.eye, 0, 1.1, 0.19));
  rider.add(mesh(new THREE.BoxGeometry(0.04, 0.3, 0.03), m.gold, 0, 1.0, 0.21));
  rider.add(mesh(new THREE.BoxGeometry(0.2, 0.035, 0.03), m.gold, 0, 0.98, 0.21));
  rider.add(mesh(new THREE.ConeGeometry(0.2, 0.3, 8), m.steel, 0, 1.42, 0));   // the great helm's pointed top
  const crestBone = mat(PAL.bone);
  if (h.key === 'varn') for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 4), m.steel); e.position.set(sx * 0.12, 1.5, -0.02); e.rotation.z = -sx * 0.25; rider.add(e); }   // wolf ears
  else if (h.key === 'calder') for (const sx of [-1, 1]) { const a = new THREE.Group(); a.position.set(sx * 0.1, 1.42, 0); a.rotation.z = -sx * 0.55; rider.add(a);
    a.add(mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.6, 4), crestBone, 0, 0.3, 0)); const t1 = mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.28, 4), crestBone, sx * 0.08, 0.36, 0); t1.rotation.z = -sx * 0.8; a.add(t1); }   // antlers
  else if (h.key === 'morrow') { const s = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.04, 5, 12, Math.PI * 1.6), m.cloth); s.position.set(0, 1.6, 0); s.rotation.x = Math.PI / 2; rider.add(s); rider.add(mesh(KG.sphere, m.cloth, 0.12, 1.66, 0.06, 0.06, 0.05, 0.08)); }   // a coiled serpent
  else { const d = new THREE.Mesh(new THREE.CircleGeometry(0.2, 12), crestBone); d.position.set(0, 1.7, 0); rider.add(d); const d2 = d.clone(); d2.rotation.y = Math.PI; rider.add(d2); }   // a sun disc
  // arms: right holds the lance, left holds the shield
  const armR = new THREE.Group(); armR.position.set(-0.4, 0.68, 0); armR.rotation.set(0.35, 0, 0.15); rider.add(armR);
  const uR = tube(0.075, 0.065, 0.4, m.steel, 6); uR.position.y = -0.2; armR.add(uR);
  const foreR = new THREE.Group(); foreR.position.y = -0.4; foreR.rotation.x = -1.1; armR.add(foreR);
  const lR = tube(0.065, 0.055, 0.36, m.steel, 6); lR.position.y = -0.18; foreR.add(lR);
  foreR.add(mesh(KG.sphere, m.darkSteel, 0, -0.38, 0, 0.08, 0.08, 0.08));
  const lance = new THREE.Group(); lance.position.set(-0.42, 0.25, 0.42); lance.rotation.x = 0.18; rider.add(lance);
  const shaft = tube(0.035, 0.06, 4.2, m.leather, 6); shaft.position.y = 1.2; lance.add(shaft);
  const vamp = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 8), m.steel); vamp.position.y = 0.2; vamp.rotation.x = Math.PI; lance.add(vamp);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.32, 5), m.steel); tip.position.y = 3.45; lance.add(tip);
  const pShape = new THREE.Shape(); pShape.moveTo(0, 0); pShape.lineTo(1.05, 0); pShape.lineTo(0.82, -0.27); pShape.lineTo(1.05, -0.54); pShape.lineTo(0, -0.54); pShape.closePath();
  const pen = new THREE.Mesh(normalizeUV(new THREE.ShapeGeometry(pShape)), m.crestDS); pen.position.set(0, 3.15, 0); pen.rotation.y = Math.PI / 2; lance.add(pen);
  const armL = new THREE.Group(); armL.position.set(0.4, 0.68, 0); armL.rotation.set(0.2, 0, -0.25); rider.add(armL);
  const uL = tube(0.075, 0.065, 0.42, m.steel, 6); uL.position.y = -0.21; armL.add(uL);
  const shield = new THREE.Group(); shield.position.set(0.56, 0.3, 0.12); shield.rotation.set(0, Math.PI / 2 - 0.25, 0); rider.add(shield);
  const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(kiteShape(1.08), { depth: 0.05, bevelEnabled: false }), m.gold); rim.position.z = -0.05; shield.add(rim);
  shield.add(new THREE.Mesh(new THREE.ExtrudeGeometry(kiteShape(1), { depth: 0.06, bevelEnabled: false }), m.leather));
  const face = new THREE.Mesh(normalizeUV(new THREE.ShapeGeometry(kiteShape(0.96))), m.crestDS); face.position.z = 0.065; shield.add(face);
  // cloak with folds
  const cg = new THREE.PlaneGeometry(0.9, 1.3, 6, 6), cp = cg.attributes.position;
  for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 14) * 0.05 * (0.6 - cp.getY(i)));
  cg.computeVertexNormals();
  const cloak = new THREE.Mesh(cg, m.clothDS); cloak.position.set(0, 0.2, -0.3); cloak.rotation.x = 0.22; rider.add(cloak);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.06, 0.03), m.gold); trim.position.set(0, -0.62, 0); cloak.add(trim);
  const egg = makeEgg(); egg.scale.set(0.45, 0.62, 0.45); egg.position.set(0, 1.8, 0); egg.visible = false; rider.add(egg);
  // name plaque
  const cv = document.createElement('canvas'); cv.width = 320; cv.height = 72; const x = cv.getContext('2d');
  x.globalAlpha = 0.9; x.fillStyle = '#EDE6DA'; x.beginPath(); x.roundRect(4, 6, 312, 60, 30); x.fill(); x.globalAlpha = 1;
  x.lineWidth = 4; x.strokeStyle = h.css; x.stroke();
  x.fillStyle = '#1E1A26'; x.font = "700 30px 'Cormorant Garamond', Georgia, serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, 160, 38);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthWrite: false, transparent: true }));
  tag.scale.set(4.4, 1.0, 1); tag.position.y = 5.3; g.add(tag);
  g.userData = { body, legs, egg, rider, neck, tail, cloak, pen };
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(1.05); scene.add(g); return g;
}
// trot: legs swing in diagonal pairs with the knees and hocks folding, the head nods, the tail and cloak sway
function animateAvatar(av, moving, time) {
  const u = av.userData, w = 10;
  u.legs.forEach((l, i) => {
    const ph = time * w + (i === 0 || i === 3 ? 0 : Math.PI), sw = Math.sin(ph);
    l.hip.rotation.x = moving ? sw * 0.5 : 0;
    const fold = moving ? Math.max(0, -sw) * 0.95 : 0;
    l.knee.rotation.x = l.front ? fold : -fold * 0.8;
  });
  u.body.position.y = moving ? Math.abs(Math.sin(time * w)) * 0.09 : Math.sin(time * 1.6) * 0.012;   // trot bounce / breathing
  u.neck.rotation.x = 0.62 + (moving ? Math.sin(time * w * 2) * 0.05 : Math.sin(time * 0.7) * 0.04);
  u.tail.rotation.y = Math.sin(time * (moving ? 6 : 1.5)) * 0.18; u.tail.rotation.x = moving ? -0.25 : 0;
  u.rider.position.y = 2.5 + (moving ? Math.abs(Math.sin(time * w + 0.6)) * 0.05 : 0);
  u.cloak.rotation.x = 0.22 + (moving ? 0.3 : 0) + Math.sin(time * 3.2) * 0.05;
  u.pen.rotation.x = Math.sin(time * 4) * 0.12;
}
function spawnAvatars() {
  for (const p of players) {
    if (p.id === P || p.avatar) continue;
    const c = corners.find(c => owns(c, p.id)) || corners[0], L = Math.hypot(c.x, c.z) || 1;
    p.avatar = makeAvatar(p.house, !p.ai && p.name ? `${p.house.sigil} ${p.name}` : undefined); p.pos = { x: c.x - c.x / L * 6, z: c.z - c.z / L * 6 };
    p.think = rr(1, 4); p.task = null; p.wander = null; p.wait = 0;
  }
}
function updateAI(dt, time) {
  for (const p of players) {
    if (!p.ai || !p.avatar) continue;
    aiDuelCheck(p, dt);
    if (p.duelWith != null) { p.avatar.position.set(p.pos.x, heightAt(p.pos.x, p.pos.z), p.pos.z); continue; }   // fighting: stand and face the foe
    p.think -= dt;
    if (p.think <= 0) { p.think = rr(2, 4); aiThink(p); if (Math.random() < 0.08) aiRavenOffer(p); }
    let target = p.detour || (p.task ? taskPos(p.task) : p.wander);
    if (!target) {
      if ((p.wait -= dt) <= 0) {   // stroll between your own holdings
        const mine = corners.filter(c => owns(c, p.id)), c = pick(mine), L = Math.hypot(c.x, c.z) || 1;
        p.wander = { x: c.x - c.x / L * rr(5, 12) + rr(-4, 4), z: c.z - c.z / L * rr(5, 12) + rr(-4, 4) };
      }
    }
    target = p.detour || (p.task ? taskPos(p.task) : p.wander);
    let moving = false;
    if (target) {
      const dx = target.x - p.pos.x, dz = target.z - p.pos.z, d = Math.hypot(dx, dz);
      if (d < 1.2) { if (p.detour) { if (p.tollE != null) { const te = edges[p.tollE]; p.tollE = null; if (te.road !== p.id && !payToll(p.id, te)) { p.task = null; p.wander = null; p.detourQ = null; } } p.detour = p.detourQ && p.detourQ.length ? p.detourQ.shift() : null; } else if (p.task) { p.detours = 0; aiExecute(p); } else { p.wander = null; p.wait = rr(3, 9); } }
      else {
        const sp = Math.min(d, (p.task ? (p.carrying ? 6 : 9) : 4) * dt), nx = p.pos.x + dx / d * sp, nz = p.pos.z + dz / d * sp;
        const w = wallBlocks(p.id, p.pos.x, p.pos.z, nx, nz);
        if (w) aiDetour(p, w, p.task ? taskPos(p.task) : (p.wander || target));
        else { p.pos.x = nx; p.pos.z = nz; p.avatar.rotation.y = Math.atan2(dx, dz); moving = true; }
      }
    }
    const y = walkHeight(p.pos.x, p.pos.z);
    p.avatar.position.set(p.pos.x, y, p.pos.z);
    animateAvatar(p.avatar, moving, time + p.id);
    p.avatar.userData.egg.visible = !!p.carrying;
    // the mist hides rivals you can't see
    const t = tileAtWorld(p.pos.x, p.pos.z);
    p.avatar.visible = state.dragonEye || Math.hypot(p.pos.x - player.pos.x, p.pos.z - player.pos.z) < SIGHT + 10 || (t && visible.has(t.id));
  }
}

// ---------------------------------------------------------------- ravens (trading with the houses)
let ravenOffer = null;
function aiWants(p, k) { const goal = aiGoal(p.id); return p.res[k] < needOf(goal, k) || p.res[k] === 0; }
function aiSpare(p, k) { return p.res[k] - needOf(aiGoal(p.id), k) >= 1 && p.res[k] >= 1; }
// would this AI house take the bundle? (give/get are from the asking player's side)
function aiAccepts(p, give, get, from = P) {
  if (renown(from) >= renown(p.id) + 3) return 'refuses to aid the mightiest house';
  const goal = aiGoal(p.id);
  for (const k of RES_KEYS) if ((get[k] || 0) > 0) {
    if (p.res[k] < get[k]) return `has too few ${RES[k].icon}`;
    if (p.res[k] - needOf(goal, k) < get[k]) return `needs its ${RES[k].icon}`;
  }
  const nG = bundleSum(give), nR = bundleSum(get);
  if (nG < nR) return 'wants a fairer deal';
  const helps = RES_KEYS.some(k => (give[k] || 0) > 0 && aiWants(p, k));
  if (!helps && nG < nR + 2 && !isDusk()) return 'has no need of it';   // at dusk any fair deal will do
  return null;
}
function sendRaven(give, get) {
  if (!RES_KEYS.every(k => state.res[k] >= (give[k] || 0))) return;
  $('ravenStatus').textContent = '🐦 Your ravens fly to the other houses…';
  if (NET.guest) { netAct({ a: 'raven', give, get }); return; }
  setTimeout(() => ravenDeal(P, give, get), 1500);
}
function ravenDeal(from, give, get) {   // the AI houses answer an offer
  const me = players[from], replies = [];
  for (const p of shuffle(players.filter(p => p.ai))) {
    const no = aiAccepts(p, give, get, from);
    if (!no && RES_KEYS.every(k => me.res[k] >= (give[k] || 0))) {
      applyBundle(from, give, get, p);
      const msg = `🤝 ${nameOf(p.id)} accepts: your ${bundleTxt(give)} for their ${bundleTxt(get)}`;
      if (from === P) { $('ravenStatus').textContent = msg; log(msg); RES_KEYS.forEach(k => get[k] && flashRes(k)); sfx('build'); resetTrade(); updateHUD(); refreshMarkers(); renderTrade(); }
      else tell(from, { raven: msg, log: msg, flash: RES_KEYS.filter(k => get[k]), sfx: 'build' });
      return;
    }
    replies.push(`${p.house.sigil} ${no}`);
  }
  const msg = '✖ No takers. ' + (replies.join(' · ') || 'no other house will trade');
  if (from === P) $('ravenStatus').textContent = msg; else tell(from, { raven: msg });
}
function aiRavenOffer(p) {
  if (ravenOffer || state.phase !== 'play' || renown(P) >= renown(p.id) + 3) return;
  const want = RES_KEYS.filter(k => aiWants(p, k) && state.res[k] >= 2);
  const give = RES_KEYS.filter(k => aiSpare(p, k) && p.res[k] >= 2 && !want.includes(k));
  if (!want.length || !give.length) return;
  ravenOffer = { p, want: pick(want), give: pick(give), t: 20 };
  $('ravenText').innerHTML = `🐦 <b>${nameOf(p.id)}</b> offers <b>1 ${RES[ravenOffer.give].icon}</b> for your <b>1 ${RES[ravenOffer.want].icon}</b>`;
  $('raven').classList.remove('hidden'); sfx('build');
}
function answerRaven(yes) {
  if (!ravenOffer) return;
  const { p, want, give } = ravenOffer; ravenOffer = null; $('raven').classList.add('hidden');
  if (!yes) { log(`🐦 You decline ${nameOf(p.id)}'s offer`); return; }
  if (state.res[want] < 1 || p.res[give] < 1) { log('🐦 The trade fell through'); return; }
  state.res[want]--; state.res[give]++; p.res[want]++; p.res[give]--;
  log(`🤝 Trade with ${nameOf(p.id)}: 1 ${RES[want].icon} → 1 ${RES[give].icon}`); flashRes(give); sfx('build'); updateHUD(); refreshMarkers();
}

// ---------------------------------------------------------------- player & input
const player = { pos: new THREE.Vector3(), vy: 0, yaw: 0, pitch: -0.15, onGround: true };
const keys = {};
let pointerLocked = false, dragLook = false, dragMoved = 0;
function spawn() {
  // land on the coast-facing side of a random ring-1 tile, looking at the volcano
  const t = pick(tiles.filter(t => Math.max(Math.abs(t.q), Math.abs(t.r), Math.abs(t.q + t.r)) === 1));
  const x = t.x * 1.15, z = t.z * 1.15;
  player.pos.set(x, heightAt(x, z), z);
  player.yaw = Math.atan2(x, z);
}
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (state.phase !== 'setup' && state.phase !== 'play') return;
  if (e.code === 'KeyT' && !state.reaverPick && $('lore').classList.contains('hidden')) { toggleTrade(); return; }
  if (e.code === 'KeyL' && !state.reaverPick && $('trade').classList.contains('hidden')) { toggleLore(); return; }
  if (ravenOffer && (e.code === 'KeyY' || e.code === 'KeyN')) { answerRaven(e.code === 'KeyY'); return; }
  if (state.phase === 'setup') { if (e.code === 'KeyQ' || e.code === 'Escape') return; }
  if (!document.getElementById('trade').classList.contains('hidden') || !$('lore').classList.contains('hidden')) return;
  if (e.code === 'Digit1') setMode(state.mode === 'road' ? null : 'road');
  if (e.code === 'Digit2') setMode(state.mode === 'hamlet' ? null : 'hamlet');
  if (e.code === 'Digit3') setMode(state.mode === 'keep' ? null : 'keep');
  if (e.code === 'Digit4') setMode(state.mode === 'roost' ? null : 'roost');
  if (e.code === 'Digit5') setMode(state.mode === 'tower' ? null : 'tower');
  if (e.code === 'KeyE' && state.phase === 'play') tryEgg();
  if (e.code === 'KeyF' && state.phase === 'play') toggleRide();
  if (e.code === 'KeyG' && state.riding) dragonfire();
  if (e.code === 'KeyQ') setMode(null);
  if (e.code === 'KeyM' && state.phase === 'play') toggleMap();
  if (e.code === 'KeyH') $('helpOverlay').classList.toggle('hidden');
  if (e.code === 'KeyR') recall();
  if (e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

// No mouse capture: drag to look around, click (or tap) to act. Works with a mouse and with touch.
function lockPointer() {}
document.getElementById('pause').addEventListener('click', () => { document.getElementById('pause').classList.add('hidden'); state.paused = false; });
const ptr = { down: false, id: null, lx: 0, ly: 0, moved: 0, hover: null };
canvas.addEventListener('pointerdown', e => {
  if (state.phase !== 'play') return;
  if (e.button === 2) { setMode(null); return; }
  ptr.down = true; ptr.id = e.pointerId; ptr.lx = e.clientX; ptr.ly = e.clientY; ptr.moved = 0;
  try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse') ptr.hover = { x: e.clientX, y: e.clientY };
  if (!ptr.down || e.pointerId !== ptr.id) return;
  const dx = e.clientX - ptr.lx, dy = e.clientY - ptr.ly; ptr.lx = e.clientX; ptr.ly = e.clientY;
  ptr.moved += Math.abs(dx) + Math.abs(dy);
  if (ptr.moved > 6) {
    const k = e.pointerType === 'touch' ? 0.006 : 0.0042;
    player.yaw += dx * k; player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch + dy * k));   // drag the world around you
  }
});
canvas.addEventListener('pointerup', e => {
  if (!ptr.down || e.pointerId !== ptr.id) return;
  ptr.down = false;
  if (ptr.moved <= 6) tapAt(e.clientX, e.clientY);
});
canvas.addEventListener('pointercancel', () => { ptr.down = false; });
canvas.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') ptr.hover = null; });
canvas.addEventListener('contextmenu', e => e.preventDefault());

// what is under a screen point?
const _rc = new THREE.Raycaster(), _ndc = new THREE.Vector2();
function groundAt(sx, sy, maxD = 320) {
  _ndc.set(sx / innerWidth * 2 - 1, -(sy / innerHeight) * 2 + 1); _rc.setFromCamera(_ndc, camera);
  const o = _rc.ray.origin, d = _rc.ray.direction;
  for (let t = 0.5; t < maxD; t += t < 80 ? 0.5 : 1.5) {
    const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
    if (y <= heightAt(x, z)) return { x, z, d: t };
  }
  return null;
}
function tapAt(sx, sy) {
  if (state.paused || state.phase !== 'play') return;
  closeMenus();
  const hit = groundAt(sx, sy);
  if (!hit || state.riding) return;   // tapping the ground never moves you: walk with WASD / arrows / D-pad
  // an egg in the Ashen Waste?
  const egg = cradleEggs.find(e => !e.taken && Math.hypot(e.x - hit.x, e.z - hit.z) < 4);
  if (egg) { if (Math.hypot(egg.x - player.pos.x, egg.z - player.pos.z) < 6) tryEgg(); else log('🥚 Get closer to the egg first'); return; }
  const rb = isNight() && corners.find(c => c.building && c.building.owner !== P && Math.hypot(c.x - hit.x, c.z - hit.z) < 5);
  if (rb) { if (Math.hypot(rb.x - player.pos.x, rb.z - player.pos.z) < RAID_RANGE) tryRaid(rb); else log('🌙 Get closer to raid it'); return; }
  const foe = players.find(p => p.id !== P && p.avatar && p.avatar.visible && Math.hypot(p.pos.x - hit.x, p.pos.z - hit.z) < 3.5);
  if (foe) { if (Math.hypot(foe.pos.x - player.pos.x, foe.pos.z - player.pos.z) < DUEL_RANGE) challenge(foe.id); else log('⚔️ Ride closer to challenge them'); return; }
  const tgt = hit.d < 120 ? targetNear(hit) : null;
  if (tgt && !tgt.problem) { currentTarget = tgt; tryBuild(tgt); return; }   // gold sign: build it
  if (tgt && state.mode) { log('⚠️ ' + tgt.problem); sfx('bad'); return; }   // placing something: explain why not
}
// click-to-move (and click-to-fly)
const destMarker = (() => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ map: TEX.dest, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); return m;
})();
function walkTo(p) {
  player.via = null; player.pendingToll = null;
  if (heightAt(p.x, p.z) < 0.6) { const L = Math.hypot(p.x, p.z), k = Math.min(1, 150 / L); p = { x: p.x * k, z: p.z * k }; }   // not into the sea
  player.autoTarget = { x: p.x, z: p.z };
  destMarker.position.set(p.x, heightAt(p.x, p.z) + 0.4, p.z); destMarker.visible = true;
}
function flyTo(p) { player.autoTarget = { x: p.x, z: p.z }; destMarker.position.set(p.x, heightAt(p.x, p.z) + 0.6, p.z); destMarker.visible = true; }

function recall() {
  if (state.riding || state.carrying) { log('⚠️ The Recall Horn cannot be used while flying or carrying an egg'); return; }
  if (state.recallCD > 0) { log(`⏳ Recall Horn ready in ${Math.ceil(state.recallCD)}s`); return; }
  const mine = corners.filter(owns);
  if (!mine.length) return;
  const c = mine[state.recallIdx++ % mine.length];
  const dx = -c.x, dz = -c.z, L = Math.hypot(dx, dz) || 1;
  const x = c.x + dx / L * 18, z = c.z + dz / L * 18;
  player.pos.set(x, heightAt(x, z), z); player.vy = 0; player.yaw = Math.atan2(c.x - x, c.z - z) + Math.PI;
  state.recallCD = 30; sfx('horn'); log('📯 Recalled to your ' + c.building.type);
}

function onOwnRoad(x, z) {
  for (const e of edges) {
    if (e.road !== P) continue;
    const A = corners[e.a], B = corners[e.b], dx = B.x - A.x, dz = B.z - A.z;
    const t = Math.max(0, Math.min(1, ((x - A.x) * dx + (z - A.z) * dz) / (dx * dx + dz * dz)));
    if (Math.hypot(A.x + dx * t - x, A.z + dz * t - z) < 2.2) return true;
  }
  return false;
}

function updatePlayer(dt) {
  if (keys.ArrowLeft) player.yaw += 2 * dt;
  if (keys.ArrowRight) player.yaw -= 2 * dt;
  if (state.riding) return updateFlight(dt);
  let fx = 0, fz = 0;
  if (keys.KeyW || keys.ArrowUp) fz -= 1; if (keys.KeyS || keys.ArrowDown) fz += 1; if (keys.KeyA) fx -= 1; if (keys.KeyD) fx += 1;
  if (state.dazeT > 0) { state.dazeT -= dt; fx = fz = 0; player.autoTarget = null; destMarker.visible = false; }   // knocked down in a duel
  if (fx || fz) { player.autoTarget = null; player.via = null; destMarker.visible = false; }
  else if (player.autoTarget) {   // click-to-move: turn toward the target and walk
    const dx = player.autoTarget.x - player.pos.x, dz = player.autoTarget.z - player.pos.z, d = Math.hypot(dx, dz);
    if (d < 1.5 && player.pendingToll && !player.via) { player.autoTarget = null; destMarker.visible = false; }   // wait at the gate to pay
    else if (d < 1.5) { if (player.via && player.via.length > 1) { player.via.shift(); player.autoTarget = player.via[0]; if (player.via.length === 1) player.via = null; } else { player.autoTarget = null; player.via = null; destMarker.visible = false; } }
    else {
      const want = Math.atan2(-dx, -dz); let dy = want - player.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      player.yaw += dy * Math.min(1, dt * 4);
      const sp = (d > 30 ? 15 : 10) * (onOwnRoad(player.pos.x, player.pos.z) ? 1.5 : 1) * (state.carrying ? 0.7 : 1) * dt;
      const nx = player.pos.x + dx / d * Math.min(sp, d), nz = player.pos.z + dz / d * Math.min(sp, d);
      const w = wallBlocks(P, player.pos.x, player.pos.z, nx, nz);
      if (w && w.road === P && !player.via) {   // your own wall: walk through its gate
        const [near, far] = gatePath(w, player.pos.x, player.pos.z); player.via = [near, far, player.autoTarget]; player.autoTarget = near;
      } else if (w && w.road !== P && !player.pendingToll && player.autoTarget && !player.via) {   // a rival wall: go to its gate, pay to pass
        const [near, far] = gatePath(w, player.pos.x, player.pos.z);
        player.pendingToll = { e: w, far, target: player.autoTarget }; player.autoTarget = near;
        if (performance.now() > wallMsgT) { wallMsgT = performance.now() + 4000; log(`🧱 ${nameOf(w.road)}'s wall is in the way: walking to its gate (toll: 1 resource)`); }
      } else if (w) blockedByWall(w);
      else if (heightAt(nx, nz) > 0.6) { player.pos.x = nx; player.pos.z = nz; } else { player.autoTarget = null; destMarker.visible = false; }
    }
  }
  const len = Math.hypot(fx, fz);
  if (len > 0) {
    fx /= len; fz /= len;
    let speed = keys.ShiftLeft || keys.ShiftRight ? 16 : 9;
    if (onOwnRoad(player.pos.x, player.pos.z)) speed *= 1.6;
    if (state.carrying) speed *= 0.7;
    const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
    const mx = (fx * cos + fz * sin) * speed * dt, mz = (-fx * sin + fz * cos) * speed * dt;
    const nx = player.pos.x + mx, nz = player.pos.z + mz;
    const ok = (x, z) => heightAt(x, z) > 0.6 && !wallBlocks(P, player.pos.x, player.pos.z, x, z);
    if (ok(nx, nz)) { player.pos.x = nx; player.pos.z = nz; }
    else if (ok(nx, player.pos.z)) player.pos.x = nx;          // slide along walls and coasts
    else if (ok(player.pos.x, nz)) player.pos.z = nz;
    else { const w = wallBlocks(P, player.pos.x, player.pos.z, nx, nz); if (w) blockedByWall(w); }
  }
  const g = walkHeight(player.pos.x, player.pos.z);
  if (keys.Space && player.onGround) { player.vy = 9; player.onGround = false; }
  player.vy -= 28 * dt; player.pos.y += player.vy * dt;
  if (player.pos.y <= g) { player.pos.y = g; player.vy = 0; player.onGround = true; }
  placeCamera(dt);
}
// ---------------------------------------------------------------- camera views
// high (default): eyes raised to a rider's height with a wide view; hero: over the shoulder; first: classic first person
const VIEWS = {
  high:  { label: '👁️ View: High',   eye: 4.2, fov: 80 },
  hero:  { label: '👁️ View: Behind', eye: 3.2, fov: 78, back: 10, up: 2.6 },
  first: { label: '👁️ View: First',  eye: 1.7, fov: 70 },
};
let viewMode = 'high', meAvatar = null, meLast = { x: 0, z: 0 };
try { const v = localStorage.getItem('dh-view'); if (VIEWS[v]) viewMode = v; } catch (_) {}
function setView(m) {
  viewMode = m; try { localStorage.setItem('dh-view', m); } catch (_) {}
  camera.fov = VIEWS[m].fov; camera.updateProjectionMatrix();
  $('btnView').textContent = VIEWS[m].label;
}
const _look = new THREE.Vector3();
function placeCamera(dt) {
  const v = VIEWS[viewMode];
  if (viewMode === 'hero') {
    const cp = Math.cos(player.pitch), dx = -Math.sin(player.yaw) * cp, dy = Math.sin(player.pitch), dz = -Math.cos(player.yaw) * cp;
    const x = player.pos.x - dx * v.back, z = player.pos.z - dz * v.back;
    const y = Math.max(player.pos.y + v.eye + v.up - dy * v.back, heightAt(x, z) + 1.2);
    camera.position.set(x, y, z);
    _look.set(player.pos.x + dx * 8, player.pos.y + v.eye + dy * 8, player.pos.z + dz * 8); camera.lookAt(_look);
  } else {
    camera.position.set(player.pos.x, player.pos.y + v.eye, player.pos.z);
    camera.rotation.set(player.pitch, player.yaw, 0);
  }
  // your own lord, seen from behind
  if (!meAvatar && players[P]) {
    meAvatar = makeAvatar(players[P].house);
    meAvatar.children.forEach(o => { if (o.isSprite) o.visible = false; });
  }
  if (meAvatar) {
    meAvatar.visible = viewMode === 'hero' && state.phase === 'play' && !state.riding;
    const moving = Math.hypot(player.pos.x - meLast.x, player.pos.z - meLast.z) > 0.01; meLast = { x: player.pos.x, z: player.pos.z };
    meAvatar.position.copy(player.pos); meAvatar.rotation.y = player.yaw + Math.PI;
    animateAvatar(meAvatar, moving, performance.now() / 1000);
    meAvatar.userData.egg.visible = !!state.carrying;
  }
}

// ---------------------------------------------------------------- aiming & ghosts
const ghosts = {};
function buildGhosts() {
  for (const k of ['hamlet', 'keep', 'roost', 'tower']) {
    if (ghosts[k]) scene.remove(ghosts[k]);
    ghosts[k] = ghostify({ hamlet: makeHamlet, keep: makeKeep, roost: makeRoost, tower: makeTower }[k](), 0x7dff8a); ghosts[k].visible = false; scene.add(ghosts[k]);
  }
}
buildGhosts();
let roadGhost = null, roadGhostEdge = -1;
let currentTarget = null;
const _dir = new THREE.Vector3();
function aimPoint() { return ptr.hover && !ptr.down ? groundAt(ptr.hover.x, ptr.hover.y, 120) : null; }
// What can be built where? Used by the ground signs and by aiming.
// With no blueprint selected you can aim at any sign and click: the sign decides what gets built.
function siteReady(kind, x) {
  if (kind === 'roost') return !roostProblem(x) && !limitHit('roost');
  if (kind === 'tower') return !towerProblem(x) && !limitHit('tower');
  if (kind === 'road') return !roadProblem(x) && !limitHit('road');
  if (kind === 'hamlet') return !hamletProblem(x) && !limitHit('hamlet');
  return !keepProblem(x) && !limitHit('keep');
}
function updateAim() {
  currentTarget = null;
  Object.values(ghosts).forEach(g => g.visible = false);
  if (roadGhost) roadGhost.visible = false;
  const tip = document.getElementById('tip');
  if (state.paused) { tip.classList.add('hidden'); return; }
  if (state.riding) {   // in the saddle: the crosshair shows Dragonfire instead of building
    const d = dragonOf(P), t = tileAtWorld(camera.position.x, camera.position.z);
    const prob = d.stage === 'grown' ? scorchProblem(P, t) : 'A Wyrmling is too young for Dragonfire';
    tip.classList.remove('hidden', 'ok', 'bad'); tip.classList.add(prob ? 'bad' : 'ok');
    tip.textContent = prob ? `🔥 ${prob}` : `🔥 Press FIRE to scorch ${BIOME[t.type].name} (${t.num})`;
    tip.style.left = '50%'; tip.style.top = '62%';
    return;
  }
  const hit = aimPoint();
  if (!hit) { tip.classList.add('hidden'); return; }
  const best = targetNear(hit);
  if (!best) { tip.classList.add('hidden'); return; }
  tip.style.left = (ptr.hover.x + 18) + 'px'; tip.style.top = (ptr.hover.y + 14) + 'px';
  showTarget(best, tip);
}
// candidates: with a blueprint, every spot of that kind (so you learn why a spot is invalid);
// without one, only spots that have a sign on them
function targetNear(hit) {
  let best = null, bd = 8;
  const kinds = state.mode ? [state.mode] : ['hamlet', 'keep', 'road'];
  for (const kind of kinds) {
    if (kind === 'road') {
      for (const e of edges) {
        if (!state.mode && !siteReady('road', e)) continue;
        const d = Math.hypot(e.mx - hit.x, e.mz - hit.z) + 2;    // corners win when you aim near them
        if (d < bd) { bd = d; best = { e, kind }; }
      }
    } else {
      for (const c of corners) {
        if (!state.mode && !siteReady(kind, c)) continue;
        const d = Math.hypot(c.x - hit.x, c.z - hit.z);
        if (d < bd) { bd = d; best = { c, kind }; }
      }
    }
  }
  if (best) best.problem = problemFor(best.kind, best);
  return best;
}
function showTarget(best, tip) {
  currentTarget = best;
  const col = best.problem ? 0xff5040 : 0x7dff8a;
  const showGhost = state.mode || !best.problem;   // no blueprint: only preview what you can actually build
  if (best.kind === 'road') {
    if (roadGhostEdge !== best.e.id) { if (roadGhost) scene.remove(roadGhost); roadGhost = ghostify(makeRoad(best.e), 0x7dff8a); scene.add(roadGhost); roadGhostEdge = best.e.id; }
    roadGhost.visible = showGhost; roadGhost.userData.gm.color.setHex(col);
  } else {
    const g = ghosts[best.kind]; placeAtCorner(g, best.c); g.visible = showGhost; g.scale.setScalar(1); g.userData.gm.color.setHex(col);
  }
  const names = { road: 'Wall', hamlet: 'Hamlet', keep: 'Keep', roost: 'Dragon Roost', tower: 'Scorpion Tower' };
  const where = best.c ? '   ' + best.c.tiles.map(id => tiles[id]).map(t => t.num ? `${RES[t.type]?.icon || ''}${t.num}` : '🌋').join(' ') : '';
  tip.classList.remove('hidden', 'ok', 'bad');
  tip.classList.add(best.problem ? 'bad' : 'ok');
  tip.textContent = best.problem ? `${names[best.kind]}: ✖ ${best.problem}` : `Click to build ${names[best.kind]}${best.kind === 'keep' ? ' (upgrade)' : ''}${where}`;
}

// ---------------------------------------------------------------- ground signs
// GOLD   = you can build here right now (click it)
// WHITE  = allowed here, but you need more resources
// FAINT  = a future Hamlet plot: lay one more road to reach it
const signGold = new THREE.MeshBasicMaterial({ color: PAL.ember, transparent: true, opacity: 0.95 });
const signWhite = new THREE.MeshBasicMaterial({ color: PAL.bone, transparent: true, opacity: 0.7 });
const signFaint = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false });
const signCloth = { gold: new THREE.MeshBasicMaterial({ color: PAL.ember }), white: mat(PAL.bone) };
function signTexture(icon, title, cost, ok) {
  const cv = document.createElement('canvas'); cv.width = 320; cv.height = 128; const g = cv.getContext('2d');
  if (ok) { g.fillStyle = '#E0A24A'; g.fillRect(4, 8, 312, 112); }
  g.globalAlpha = ok ? 1 : 0.8; g.fillStyle = '#EDE6DA'; g.fillRect(ok ? 12 : 8, ok ? 16 : 12, ok ? 296 : 304, ok ? 96 : 104); g.globalAlpha = 1;
  g.strokeStyle = '#1E1A26'; g.lineWidth = 3; g.strokeRect(14, 18, 292, 92); g.lineWidth = 1.5; g.strokeRect(21, 25, 278, 78);
  g.font = '56px serif'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillStyle = '#1E1A26'; g.fillText(icon, 66, 64);
  g.textAlign = 'left'; g.fillStyle = ok ? '#1E1A26' : '#3A3350'; g.font = "700 36px 'Grenze Gotisch', 'Cormorant Garamond', Georgia, serif"; g.fillText(title, 112, 48);
  g.font = '26px serif'; g.fillText(cost, 112, 86);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
const costIcons = kind => Object.entries(COST[kind]).map(([k, n]) => RES[k].icon.repeat(n)).join('');
const signMats = {};
for (const [kind, icon, title] of [['hamlet', '🏠', 'Hamlet'], ['keep', '🏰', 'Keep ⬆'], ['road', '🧱', 'Wall'], ['roost', '🪺', 'Roost'], ['tower', '🏹', 'Tower']])
  for (const ok of [true, false])
    signMats[kind + ok] = new THREE.SpriteMaterial({ map: signTexture(icon, title, costIcons(kind), ok), transparent: true, depthWrite: false });

// corner signs: a staked-out plot (ring + 4 stakes with pennants) + floating label
const ringGeo = new THREE.PlaneGeometry(6, 6); ringGeo.rotateX(-Math.PI / 2);
const keepRingGeo = new THREE.PlaneGeometry(13, 13); keepRingGeo.rotateX(-Math.PI / 2);
const markGold = new THREE.MeshBasicMaterial({ map: TEX.build, transparent: true, depthWrite: false, opacity: 1 });
const markWhite = new THREE.MeshBasicMaterial({ map: TEX.buildBone, transparent: true, depthWrite: false, opacity: 0.7 });
const markFaint = new THREE.MeshBasicMaterial({ map: TEX.buildBone, transparent: true, depthWrite: false, opacity: 0.25 });
const stakeGeo = new THREE.CylinderGeometry(0.09, 0.12, 1.6, 4); stakeGeo.translate(0, 0.8, 0);
const pennantGeo = new THREE.BoxGeometry(0.5, 0.32, 0.04); pennantGeo.translate(0.27, 1.4, 0);
const cornerSigns = corners.map(c => {
  const g = new THREE.Group(), ring = new THREE.Mesh(ringGeo, markGold); ring.position.y = 0.35; g.add(ring);
  const stakes = [];
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + Math.PI / 4, st = new THREE.Group();
    st.add(new THREE.Mesh(stakeGeo, woodMat)); st.add(new THREE.Mesh(pennantGeo, signCloth.gold));
    st.position.set(Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6); st.rotation.y = -a; g.add(st); stakes.push(st);
  }
  g.position.set(c.x, c.y, c.z); g.visible = false; scene.add(g);
  const label = new THREE.Sprite(signMats.hamlettrue); label.scale.set(6.2, 2.5, 1); label.visible = false; scene.add(label);
  return { g, ring, stakes, label, state: null };
});
// edge signs: a dashed survey line along the edge
const dashGeo = new THREE.BoxGeometry(0.7, 0.14, 2.4);
const edgeSigns = edges.map(e => {
  const g = new THREE.Group(), A = corners[e.a], B = corners[e.b], dx = B.x - A.x, dz = B.z - A.z, N = 6;
  for (let i = 0; i < N; i++) {
    const t = 0.18 + 0.64 * (i + 0.5) / N, x = A.x + dx * t, z = A.z + dz * t;
    const d = new THREE.Mesh(dashGeo, signGold); d.position.set(x, heightAt(x, z) + 0.25, z);
    d.lookAt(x + dx, heightAt(x, z) + 0.25, z + dz); g.add(d);
  }
  g.visible = false; scene.add(g);
  const label = new THREE.Sprite(signMats.roadtrue); label.scale.set(4.6, 1.85, 1);
  label.position.set(e.mx, heightAt(e.mx, e.mz) + 3, e.mz); label.visible = false; scene.add(label);
  return { g, label };
});
function refreshMarkers() {
  const play = state.phase === 'play', filter = state.mode;
  corners.forEach((c, i) => {
    const s = cornerSigns[i];
    let kind = null;
    if (filter === 'roost' || filter === 'tower') kind = siteReady(filter, c) ? filter : null;
    else if (siteReady('keep', c)) kind = 'keep';
    else if (siteReady('hamlet', c)) kind = 'hamlet';
    // future plot: legal for distance rule, and one road away from your network
    const future = play && !kind && !c.building && !c.adj.some(id => corners[id].building) && c.edges.some(id => !roadProblem(edges[id]));
    const show = play && ((kind && (!filter || filter === kind)) || (future && (!filter || filter === 'hamlet' || filter === 'road')));
    s.g.visible = !!show; s.label.visible = !!(show && kind);
    if (!show) return;
    const ok = kind && canAfford(kind);
    const m = !kind ? markFaint : ok ? markGold : markWhite;
    s.ring.material = m; s.stakes.forEach(st => { st.visible = !!kind; st.children[1].material = ok ? signCloth.gold : signCloth.white; });
    s.ring.geometry = kind && kind !== 'hamlet' ? keepRingGeo : ringGeo; s.ring.position.y = 0.3;
    if (kind) { s.label.material = signMats[kind + !!ok]; s.label.position.set(c.x, c.y + (kind === 'hamlet' ? 5.5 : 12), c.z); }
  });
  edges.forEach((e, i) => {
    const s = edgeSigns[i], ready = play && siteReady('road', e) && (!filter || filter === 'road');
    s.g.visible = ready; s.label.visible = ready && (!!filter || canAfford('road'));
    if (!ready) return;
    const ok = canAfford('road');
    s.g.children.forEach(d => d.material = ok ? signGold : signWhite);
    s.label.material = signMats['road' + ok];
  });
}

// ---------------------------------------------------------------- HUD
const $ = id => document.getElementById(id);
$('resources').innerHTML = RES_KEYS.map(k => `<div class="res" id="r-${k}" style="--rc:${RES[k].color}" title="${RES[k].name}: ${RES[k].lore}"><div class="ic">${RES[k].icon}</div><div class="n">0</div><div class="nm">${RES[k].name}</div></div>`).join('');
const costStr = kind => Object.entries(COST[kind]).map(([k, n]) => RES[k].icon.repeat(n)).join(' ');
$('buildMenu').innerHTML = [['road', '🧱', 'Wall'], ['hamlet', '🏠', 'Hamlet'], ['keep', '🏰', 'Keep'], ['roost', '🪺', 'Roost'], ['tower', '🏹', 'Tower']].map(([k, ic, nm]) =>
  `<div class="slot" id="b-${k}" data-k="${k}"><i>${ic}</i><div><b>${nm}</b><div class="c">${costStr(k).replace(/ /g, '')}</div></div></div>`).join('');
$('buildMenu').addEventListener('click', e => { const k = e.target.closest('[data-k]')?.dataset.k; if (!k || state.phase !== 'play') return; setMode(state.mode === k ? null : k); });
function closeMenus() {}
$('actTrade').addEventListener('click', () => { closeMenus(); if (state.phase === 'play' && !state.reaverPick) toggleTrade(); });
$('actLore').addEventListener('click', () => { closeMenus(); if (state.phase === 'play' && !state.reaverPick) toggleLore(); });
$('actMap').addEventListener('click', () => { closeMenus(); if (state.phase === 'play') toggleMap(); });
$('actHome').addEventListener('click', () => { closeMenus(); recall(); });
$('actFire').addEventListener('click', () => dragonfire());
$('actDragon').addEventListener('click', () => {
  closeMenus(); if (state.phase !== 'play') return;
  const d = dragonOf(P);
  if (state.riding || (d && d.stage !== 'egg')) return toggleRide();
  if (state.carrying) return log('🥚 Walk back to your Roost: the egg is placed in the nest automatically');
  if (d) return log(`🥚 ${dragonStatus()}`);
  if (!roostOf(P)) { setMode('roost'); return log('🐉 First build a Dragon Roost beside one of your Keeps (gold signs show where)'); }
  const egg = cradleEggs.filter(e => !e.taken).sort((a, b) => Math.hypot(a.x - player.pos.x, a.z - player.pos.z) - Math.hypot(b.x - player.pos.x, b.z - player.pos.z))[0];
  if (!egg) return log('⚠️ No dragon eggs are left in the Ashen Waste');
  if (Math.hypot(egg.x - player.pos.x, egg.z - player.pos.z) < 6) tryEgg(); else { walkTo({ x: egg.x * 0.8, z: egg.z * 0.8 }); log('🥚 Walking to the Ashen Waste to fetch an egg…'); }
});
$('modeChip').addEventListener('click', () => setMode(null));
$('ravenYes').addEventListener('click', () => answerRaven(true));
$('hurryBtn').addEventListener('click', () => { if (!NET.online && state.phase === 'play' && state.harvestT > 1) { state.harvestT = 0.6; log('⏩ You call the harvest early'); } });
$('ravenNo').addEventListener('click', () => answerRaven(false));
$('houseToggle').addEventListener('click', () => $('details').classList.toggle('hidden'));
// help overlay and the beginner guide
let guideOn = true;
try { guideOn = localStorage.getItem('dh-guide') !== 'off'; } catch (_) {}
function setGuide(on) {
  guideOn = on; try { localStorage.setItem('dh-guide', on ? 'on' : 'off'); } catch (_) {}
  $('btnGuide').textContent = on ? '🎓 Guide: ON' : '🎓 Guide: OFF'; $('btnGuide').classList.toggle('on', on); if (state.phase !== 'title') updateObjective();
}
$('btnGuide').addEventListener('click', () => setGuide(!guideOn));
$('btnHelp').addEventListener('click', () => $('helpOverlay').classList.remove('hidden'));
$('startHelp').addEventListener('click', () => $('helpOverlay').classList.remove('hidden'));
$('helpClose').addEventListener('click', () => $('helpOverlay').classList.add('hidden'));
setGuide(guideOn);
$('goal').textContent = GOAL;
function updateHUD() {
  for (const k of RES_KEYS) document.querySelector(`#r-${k} .n`).textContent = state.res[k];
  for (const k of ['road', 'hamlet', 'keep', 'roost', 'tower']) {
    const el = $('b-' + k);
    el.classList.toggle('active', state.mode === k);
    el.classList.toggle('poor', state.phase === 'play' && (!canAfford(k) || limitHit(k)));
  }
  $('actTrade').classList.toggle('poor', !RES_KEYS.some(k => state.res[k] >= 1));
  $('renown').textContent = totalRenown(P);
  const me = players[P];
  if (me) $('dragonbits').textContent = dragonStatus();
  $('actLore').classList.toggle('poor', state.phase === 'play' && !canAfford('scroll') && !(me && me.scrolls.some(c => canPlay(me, c))));
  $('actBuild').classList.toggle('ready', state.phase === 'play' && ['road', 'hamlet', 'keep', 'roost', 'tower'].some(k => canAfford(k) && !limitHit(k)));
  $('modeChip').classList.toggle('hidden', !state.mode || state.phase !== 'play');
  if (state.mode) $('modeChip').textContent = `Placing: ${{ road: 'Wall', hamlet: 'Hamlet', keep: 'Keep', roost: 'Dragon Roost', tower: 'Scorpion Tower' }[state.mode]}  ✕`;
  if (me) {
    const d = dragonOf(P);
    $('actDragonLabel').textContent = state.riding ? 'Land' : d && d.stage !== 'egg' ? 'Ride' : state.carrying ? 'Carrying' : d ? 'Egg' : roostOf(P) ? 'Get egg' : 'Dragon';
    $('actDragon').classList.toggle('poor', !roostOf(P) && !canAfford('roost'));
    $('actFire').classList.toggle('hidden', !(state.riding && d && d.stage === 'grown'));
    $('actHome').classList.toggle('hidden', !!state.riding);
    document.querySelectorAll('#dpad .fly').forEach(b => b.classList.toggle('hidden', !state.riding));
  }
  if (me) $('lorebits').textContent = `📜 ${me.scrolls.length} scrolls` + (secretOf(P) ? ` (👑 ${secretOf(P)} secret ★)` : '') + ` · ⚔️ ${me.knights} Sellswords` + (state.hostHolder === P ? ' · 🎖️ Mightiest Host +2★' : ' (Host: 3+ and the most)') + (me.freeRoads ? ` · 🧱 ${me.freeRoads} free walls` : '');
  $('housesub').textContent = `Hamlets ${state.built.hamlet}/${LIMITS.hamlet} · Keeps ${state.built.keep}/${LIMITS.keep} · Walls ${state.built.road}/${LIMITS.road}`;
  $('highway').textContent = state.highwayHolder === P ? `🏯 Great Wall held (${state.longest} walls) +2★` : `Longest wall: ${state.longest} (Great Wall: 5+ and the longest)`;
  const bearer = state.order.length && state.hornIdx >= 0 ? hornBearer() : null;
  $('scores').innerHTML = players.map(p => `<div class="row ${p.id === P ? 'me' : ''}" style="--hc:${p.house.css}"><span class="sw"></span>${p.house.sigil} ${p.id === P ? 'You' : (!p.ai && p.name ? p.name : p.house.name.replace('House ', '')) + (!p.ai ? ' 👤' : '')}` +
    `<span class="tags">${p.dragon ? { egg: '🥚', wyrmling: '🐲', grown: '🐉' }[p.dragon.stage] : ''}${p.scrolls?.length && p.id !== P ? '📜' + p.scrolls.length : ''}${state.highwayHolder === p.id ? '🏯' : ''}${state.hostHolder === p.id ? '🎖️' : ''}${bearer === p.id ? '🎺' : ''}</span><b>${p.id === P ? totalRenown(p.id) : renown(p.id)}★</b></div>`).join('');
}
function updateObjective() {
  const o = $('objective');
  let html = null, go = null;
  if (state.phase === 'setup') {
    const msgs = ['Click a <b>gold dot</b> on the map to place your first Hamlet. More dots under the numbers = more harvests',
      'Click a <b>gold dot</b> next to your Hamlet to build a wall',
      'Place your <b>second Hamlet</b>. Its lands give your starting supplies',
      'Build a wall from your second Hamlet. Then the mist rolls in'];
    html = myLandingTurn() ? `🎯 <b>Your turn</b> · ${msgs[players[P]?.setupStep || 0]}` : `⏳ ${nameOf(setupPid())} is choosing where to land…`;
  } else if (state.reaverPick) {
    html = (state.reaverReason === 'sellsword' ? '⚔️ Your Sellswords march!' : '🎺 You hold the Horn!') + ' <b>Click a region</b> on the map: the Wyrm blocks it and robs a rival there';
  } else if (state.phase === 'play' && guideOn) {
    const g = nextGoal(); currentGoal = g;
    html = `<span class="goal-tag">🎯 Next goal</span> ${g.text}`;
    go = g.target;
  }
  o.classList.toggle('hidden', !html);
  if (html) o.innerHTML = html + (go ? ' <button class="small go" id="goBtn">🧭 Go</button>' : '');
  if (go) $('goBtn').onclick = () => { if (state.riding) flyTo(go); else walkTo(go); };
  beacon.visible = !!(go && guideOn && state.phase === 'play');
  if (beacon.visible) beacon.position.set(go.x, heightAt(go.x, go.z), go.z);
}
let currentGoal = null;
const beacon = (() => {   // a pillar of light over the next goal
  const m = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.2, 70, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xe8c070, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.geometry.translate(0, 35, 0); m.visible = false; scene.add(m); return m;
})();
const needTxt = kind => { const m = []; for (const [k, n] of Object.entries(COST[kind])) if (state.res[k] < n) m.push(`${n - state.res[k]} ${RES[k].icon}`); return m.join(' '); };
const at = c => ({ x: c.x - c.x / (Math.hypot(c.x, c.z) || 1) * 4, z: c.z - c.z / (Math.hypot(c.x, c.z) || 1) * 4 });
// ---------------------------------------------------------------- the coach
// It watches what happens to you (builds, harvests, the Wyrm, losses) and answers right away, then
// warns of danger, then suggests one clear next step with the reason for it.
const coach = { snap: null, flash: null, seen: {} };
const kindName = { road: 'Wall', hamlet: 'Hamlet', keep: 'Keep', roost: 'Dragon Roost', tower: 'Scorpion Tower', scroll: 'Lore Scroll' };
const numsOf = c => c.tiles.map(id => tiles[id]).filter(t => t.num).map(t => `${t.num} ${RES[t.type].icon}`).join(', ');
const myNums = () => [...new Set(corners.filter(c => owns(c)).flatMap(c => c.tiles.map(id => tiles[id].num)).filter(Boolean))].sort((a, b) => a - b);
const affordable = () => ['keep', 'hamlet', 'road', 'roost', 'tower', 'scroll'].filter(k => canAfford(k) && (k === 'scroll' ? deckCount() > 0 : !limitHit(k)));
function coachSay(text, secs = 9, target = null) { coach.flash = { text, until: performance.now() + secs * 1000, target }; }
function coachObserve() {
  const me = players[P]; if (!me || state.phase !== 'play') return;
  const mine = corners.filter(c => owns(c)).map(c => c.id + c.building.type[0]).join(',');
  const snap = { mine, roads: state.built.road, res: { ...state.res }, total: resTotal(P), roll: state.rollSeq || 0, wyrm: reaverTile?.id, aff: affordable().join(','), dragon: dragonOf(P)?.stage || '' };
  const prev = coach.snap; coach.snap = snap; if (!prev) return;
  // you built something
  if (snap.mine !== prev.mine) {
    const before = new Set(prev.mine.split(',')), fresh = corners.filter(c => owns(c) && !before.has(c.id + c.building.type[0]))[0];
    if (fresh && fresh.building.type === 'keep') return coachSay(`✔ <b>Keep raised</b> (+1★). It now harvests <b>double</b> on ${numsOf(fresh)}. A Keep can also hold a <b>Dragon Roost</b>`, 10, at(fresh));
    if (fresh) return coachSay(`✔ <b>Hamlet founded</b> (+1★). It harvests on ${numsOf(fresh)}. ${state.built.hamlet >= 2 && !state.built.keep ? 'Upgrade your best Hamlet to a <b>Keep</b> next: it doubles its harvest' : 'Keep spreading toward new numbers'}`, 10, at(fresh));
  }
  if (snap.roads > prev.roads) {
    const open = corners.filter(c => siteReady('hamlet', c)).length;
    return coachSay(open ? `✔ <b>Wall built</b>. ${open === 1 ? 'A Hamlet plot is' : open + ' Hamlet plots are'} now open (gold rings): found a Hamlet there for 🌲🪨🌾🦋` : `✔ <b>Wall built</b>. Keep walling toward an empty corner (no Hamlet may stand next to another)` + (state.longest >= 3 && state.highwayHolder !== P ? `. ${Math.max(0, 5 - state.longest)} more for the <b>Great Wall</b> (+2★)` : ''), 9);
  }
  // the Wyrm moved onto (or off) your lands
  if (snap.wyrm !== prev.wyrm && reaverTile) {
    const hurt = reaverTile.corners.some(cid => owns(corners[cid]));
    if (hurt) return coachSay(`🏴 The Wyrm now sits on your <b>${BIOME[reaverTile.type].name} (${reaverTile.num})</b>: it yields nothing while it lies there. The next 7, or a <b>Sellsword</b> scroll, moves it`, 11, { x: reaverTile.x, z: reaverTile.z });
  }
  // a harvest happened
  if (snap.roll !== prev.roll) {
    const got = RES_KEYS.filter(k => snap.res[k] > prev.res[k]), lost = prev.total - snap.total;
    if (state.lastRoll === 7 && lost > 0) return coachSay(`💀 A 7: you held ${prev.total} cards and lost ${lost}. Over 7 cards is risky: spend or trade before the stones are cast`, 11);
    const newly = snap.aff.split(',').filter(k => k && !prev.aff.split(',').includes(k));
    if (newly.length) { const k = newly[0]; return coachSay(`✔ You can now afford a <b>${kindName[k]}</b>${k === 'scroll' ? ' (📜 Scrolls)' : ': pick it in the build bar on the left, then click a gold marker'}`, 10); }
    if (!got.length && state.lastRoll !== 7) {
      const nums = myNums(), rich = [6, 8, 5, 9].filter(n => !nums.includes(n));
      return coachSay(`The stones showed <b>${state.lastRoll}</b>: none of your lands. You harvest on <b>${nums.join(', ') || 'nothing yet'}</b>.${rich.length ? ` Plots on <b>${rich.slice(0, 2).join(' or ')}</b> harvest far more often (more dots under the number)` : ''}`, 9);
    }
  }
  if (snap.dragon !== prev.dragon && snap.dragon) {
    const msg = { egg: 'Your egg is in the Roost. Feed it 🔩 at harvests: it hatches after 3', wyrmling: 'Your egg hatched: a <b>Wyrmling</b> (+1★)! Press <b>Ride</b> to fly and see through the mist', grown: 'Your dragon is <b>grown</b> (+2★): ride it and press <b>Fire</b> over a rival region' }[snap.dragon];
    if (msg) return coachSay('🐉 ' + msg, 11);
  }
}
// help for whatever you are placing right now
function modeGoal() {
  const m = state.mode; if (!m) return null;
  const spots = m === 'road' ? edges.filter(e => siteReady('road', e)) : corners.filter(c => siteReady(m, c));
  const near = spots.map(x => ({ x, d: Math.hypot((x.mx ?? x.x) - player.pos.x, (x.mz ?? x.z) - player.pos.z) })).sort((a, b) => a.d - b.d)[0];
  const how = { road: 'Walls go on the edges between regions, joined to your own walls or settlements', hamlet: 'Hamlets go on corners touching your wall, never next to another settlement', keep: 'Upgrade one of your own Hamlets', roost: 'The Roost goes beside one of your Keeps', tower: 'A Scorpion Tower guards one of your settlements' }[m];
  if (!canAfford(m)) return { text: `Placing a <b>${kindName[m]}</b>: you still need ${needTxt(m)}. ${how}`, target: null };
  if (!near) return { text: `No spot for a <b>${kindName[m]}</b> right now. ${how}. Press ✕ to cancel`, target: null };
  const tgt = m === 'road' ? { x: near.x.mx, z: near.x.mz } : at(near.x);
  return { text: `Placing a <b>${kindName[m]}</b>: ${spots.length} spot${spots.length > 1 ? 's' : ''} glow gold. Walk close and <b>click the gold marker</b>. ${how}`, target: tgt };
}
// dangers worth interrupting for
function dangerGoal() {
  const total = resTotal(P);
  if (total > 7 && state.harvestT < 12 && !state.rolling) {
    const k = affordable()[0];
    return { text: `⚠ You hold <b>${total} cards</b>. If the stones show 7 you lose ${Math.floor(total / 2)}. ${k ? `Build a <b>${kindName[k]}</b> now` : 'Trade some away (⚖️ Trade)'} before the harvest`, target: null };
  }
  const leader = players.filter(p => p.id !== P).sort((a, b) => renown(b.id) - renown(a.id))[0];
  if (leader && renown(leader.id) >= GOAL - 2 && !coach.seen['lead' + renown(leader.id)]) {
    coach.seen['lead' + renown(leader.id)] = true;
    coachSay(`⚠ <b>${nameOf(leader.id)}</b> has ${renown(leader.id)} Renown, ${GOAL - renown(leader.id)} from victory! Send the Wyrm onto their best region, raid them at night, or out-build them`, 12);
    return coach.flash;
  }
  return null;
}
// one card short: say exactly which trade gets you there
function tradeGoal(goal) {
  const lack = RES_KEYS.filter(k => state.res[k] < (COST[goal][k] || 0)), missingN = lack.reduce((n, k) => n + COST[goal][k] - state.res[k], 0);
  if (!lack.length) return null;
  const spare = RES_KEYS.filter(k => state.res[k] - (COST[goal][k] || 0) >= 1).sort((a, b) => state.res[b] - state.res[a]);
  const guild = spare.find(k => state.res[k] - (COST[goal][k] || 0) >= guildRate());
  if (guild) return { text: `${isDusk() ? '🌇 Dusk market (3:1)! ' : ''}You need ${needTxt(goal)} for a <b>${kindName[goal]}</b>. Trade ${guildRate()} ${RES[guild].icon} → 1 ${RES[lack[0]].icon} at the Guild (⚖️ Trade)`, target: null };
  if (missingN <= 2 && spare.length) return { text: `Only ${needTxt(goal)} short of a <b>${kindName[goal]}</b>. Offer a spare ${RES[spare[0]].icon} to the other houses: ⚖️ Trade → give 1 ${RES[spare[0]].icon}, get 1 ${RES[lack[0]].icon} → <b>Offer to houses</b>`, target: null };
  return null;
}
function nextGoal() {
  coachObserve();
  const m = modeGoal(); if (m) return m;   // you are placing something: help with that first
  const d = dangerGoal(); if (d) return d;
  if (coach.flash && performance.now() < coach.flash.until) return coach.flash;   // then react to what just happened
  coach.flash = null;
  return planGoal();
}
// What should a beginner do right now? One clear step at a time.
function planGoal() {
  const me = players[P], d = dragonOf(P), have = ownedTypes(P);
  if (state.carrying) { const c = roostOf(P); return { text: 'Carry the <b>dragon egg</b> home to your Roost', target: c && at(c) }; }
  if (state.riding && d && d.stage === 'grown' && d.fireCD === 0 && !d.restless) {
    const t = tiles.find(t => !scorchProblem(P, t));
    return { text: 'Fly over a rival\'s region and press <b>🔥 FIRE</b>. It yields nothing next harvest', target: t && { x: t.x, z: t.z } };
  }
  if (state.riding) return { text: 'Click anywhere to fly there. Higher up you see through the mist. Press <b>Land</b> to get off', target: null };
  if (canAfford('keep') && !limitHit('keep')) {
    const c = corners.filter(c => owns(c) && c.building.type === 'hamlet').sort((a, b) => cornerScore(b, P) - cornerScore(a, P))[0];
    if (c) return { text: `Upgrade your Hamlet on ${numsOf(c)} to a <b>Keep</b> (+1★, double harvest): <b>Keep</b> in the build bar, then click the gold marker`, target: at(c) };
  }
  const site = !limitHit('hamlet') ? bestSite(P) : null;
  if (site && canAfford('hamlet')) return { text: `Found a <b>Hamlet</b> on ${numsOf(site)} (+1★): <b>Hamlet</b> in the build bar, then click the gold marker`, target: at(site) };
  if (canAfford('road') && !limitHit('road') && !(site && missing('hamlet').length <= 1)) {
    const e = bestRoad(P, false);
    if (e) return { text: `Build a <b>Wall</b> toward an empty corner, so you can found a new Hamlet there: <b>Wall</b> in the build bar, then click the gold dashed line`, target: { x: e.mx * 0.92, z: e.mz * 0.92 } };
  }
  if (roostOf(P) && !d) { const egg = cradleEggs.find(e => !e.taken); if (egg) return { text: 'Fetch a <b>dragon egg</b> from the volcano and carry it to your Roost', target: { x: egg.x * 0.8, z: egg.z * 0.8 } }; }
  if (!roostOf(P) && me.built.keep > 0 && canAfford('roost')) { const c = corners.find(c => owns(c) && c.building.type === 'keep' && !roostProblem(c)); if (c) return { text: 'Build a <b>Dragon Roost</b> beside your Keep (🔨 Build → Dragon Roost)', target: at(c) }; }
  if (d && d.stage !== 'egg' && !d.restless && !state.riding) return { text: 'Your dragon is ready: press <b>Ride</b> to fly and scout through the mist', target: null };
  if (isNight()) {
    const c = corners.filter(c => c.building && c.building.owner !== P && c.raided !== dayCount).sort((a, b) => Math.hypot(a.x - player.pos.x, a.z - player.pos.z) - Math.hypot(b.x - player.pos.x, b.z - player.pos.z))[0];
    if (c && Math.hypot(c.x - player.pos.x, c.z - player.pos.z) < 120) return { text: '🌙 Night: sneak to a rival Hamlet and press <b>Raid</b> to steal 1 resource. Beware their towers and lords', target: at(c) };
  }
  // what are we saving for, and can the Guild help?
  const goal = site || corners.some(c => !c.building && !c.adj.some(id => corners[id].building) && c.edges.some(id => !roadProblem(edges[id]))) ? 'hamlet' : me.built.hamlet ? 'keep' : 'road';
  const lack = RES_KEYS.filter(k => state.res[k] < (COST[goal][k] || 0)), spare = RES_KEYS.find(k => state.res[k] - (COST[goal][k] || 0) >= guildRate());
  const tg = tradeGoal(goal); if (tg) return tg; void lack; void spare;
  if (canAfford('scroll') && deckCount() && resTotal(P) >= 6) return { text: 'Study a <b>Lore Scroll</b> (📜 Scrolls): Sellswords, secret Renown and more', target: null };
  const nums = [...new Set(corners.filter(c => owns(c)).flatMap(c => c.tiles.map(id => tiles[id].num)).filter(Boolean))].sort((a, b) => a - b);
  void have;
  return { text: `Saving for a <b>${kindName[goal]}</b>: you need ${needTxt(goal) || 'nothing more'}. Your lands harvest when the stones show <b>${nums.join(', ') || '—'}</b>${state.harvestT > 3 && !NET.online ? '. Nothing to do? Press <b>Cast the stones</b>' : ''}`, target: null };
}
setInterval(() => { if (state.phase === 'play') updateObjective(); }, 700);
function flashRes(k, loss) {
  const el = $('r-' + k); el.classList.remove('flash', 'loss'); void el.offsetWidth; el.classList.add(loss ? 'loss' : 'flash');
  setTimeout(() => el.classList.remove('flash', 'loss'), 900);
}
function log(msg) {
  const d = document.createElement('div'); d.textContent = msg; $('log').prepend(d);
  while ($('log').children.length > 9) $('log').lastChild.remove();
}
let annTimer = 0;
const SMALLW = new Set(['of', 'the', 'a', 'an', 'in', 'at', 'to', 'and', 'is', 'on', 'for']);
const titleCase = t => t === t.toUpperCase() ? t.toLowerCase().replace(/[\p{L}']+/gu, (w, i) => i > 0 && SMALLW.has(w) ? w : w[0].toUpperCase() + w.slice(1)) : t;
function announce(big, small) { $('annBig').textContent = titleCase(big); $('annSmall').textContent = small || ''; $('announce').classList.add('show'); annTimer = 2.8; }

// trade
const tgive = {}, tget = {};
const bundleSum = o => RES_KEYS.reduce((n, k) => n + (o[k] || 0), 0);
const bundleTxt = o => RES_KEYS.filter(k => o[k] > 0).map(k => `${o[k]}${RES[k].icon}`).join(' ') || 'nothing';
function resetTrade() { RES_KEYS.forEach(k => { tgive[k] = 0; tget[k] = 0; }); }
resetTrade();
// Guild: 4 of one kind for each 1 of anything; the bundle may combine several such swaps
const guildRate = () => isDusk() ? 3 : 4;
function guildOK(give, get, res) {
  const g = bundleSum(give), r = bundleSum(get), q = guildRate();
  return g > 0 && r > 0 && g === q * r && RES_KEYS.every(k => (give[k] || 0) % q === 0 && !(give[k] && get[k]) && res[k] >= (give[k] || 0));
}
function renderTrade() {
  $('tradeTable').innerHTML = '<tr><th>Resource</th><th>Have</th><th>You give</th><th>You get</th></tr>' + RES_KEYS.map(k => `<tr>
    <td><span class="trdot" style="background:${RES[k].color}"></span>${RES[k].icon} <b style="color:var(--ink)">${RES[k].name}</b></td><td class="have">${state.res[k]}</td>
    <td><button class="st" data-a="g-" data-k="${k}">−</button><b class="${tgive[k] ? 'on' : ''}">${tgive[k]}</b><button class="st" data-a="g+" data-k="${k}">+</button></td>
    <td><button class="st" data-a="r-" data-k="${k}">−</button><b class="${tget[k] ? 'on' : ''}">${tget[k]}</b><button class="st" data-a="r+" data-k="${k}">+</button></td></tr>`).join('');
  const g = bundleSum(tgive), r = bundleSum(tget);
  $('tradeInfo').innerHTML = `<b>Guild</b>: ${guildRate()} of one kind for each 1 of anything${isDusk() ? ' <b>(🌇 dusk market!)</b>' : ''}. <b>Ravens</b>: offer any bundle to the other houses; they accept if it helps them and is fair.`;
  $('tradeSummary').innerHTML = g || r ? `You give <b>${bundleTxt(tgive)}</b> → you get <b>${bundleTxt(tget)}</b>` + (g && r && !guildOK(tgive, tget, state.res) ? `<div class="muted">Guild: give ${guildRate()} of one kind for each 1 you get</div>` : '') : '<span class="muted">Use + and − to build an offer</span>';
  const enough = RES_KEYS.every(k => state.res[k] >= tgive[k]);
  $('tradeBtn').disabled = !guildOK(tgive, tget, state.res); $('tradeBtn').style.opacity = $('tradeBtn').disabled ? 0.5 : 1;
  $('ravenBtn').disabled = !(g && r && enough); $('ravenBtn').style.opacity = $('ravenBtn').disabled ? 0.5 : 1;
}
$('tradeTable').addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if (!b) return;
  const k = b.dataset.k, a = b.dataset.a;
  if (a === 'g+' && tgive[k] < state.res[k]) { tgive[k]++; tget[k] = 0; }
  if (a === 'g-' && tgive[k] > 0) tgive[k]--;
  if (a === 'r+' && tget[k] < 9) { tget[k]++; tgive[k] = 0; }
  if (a === 'r-' && tget[k] > 0) tget[k]--;
  renderTrade();
});
$('tradeClear').addEventListener('click', () => { resetTrade(); $('ravenStatus').textContent = ''; renderTrade(); });
function applyBundle(pid, give, get, other = null) {
  RES_KEYS.forEach(k => { const g = give[k] || 0, r = get[k] || 0; players[pid].res[k] += r - g; if (other) other.res[k] += g - r; });
}
$('tradeBtn').addEventListener('click', () => {
  if (!guildOK(tgive, tget, state.res)) return;
  if (NET.guest) netAct({ a: 'guild', give: { ...tgive }, get: { ...tget } });
  else { applyBundle(P, tgive, tget); log(`⚖️ Guild trade: ${bundleTxt(tgive)} → ${bundleTxt(tget)}`); RES_KEYS.forEach(k => tget[k] && flashRes(k)); sfx('build'); updateHUD(); refreshMarkers(); }
  resetTrade(); renderTrade();
});
$('tradeClose').addEventListener('click', () => toggleTrade(false));
$('ravenBtn').addEventListener('click', () => { if (!$('ravenBtn').disabled) sendRaven({ ...tgive }, { ...tget }); });
function toggleTrade(force) {
  const el = $('trade'), open = force ?? el.classList.contains('hidden');
  if (open) {
    if (state.phase === 'setup') { log('⚠️ Finish your landing first'); return; }
    el.classList.remove('hidden'); state.paused = !NET.online; resetTrade(); $('ravenStatus').textContent = ''; renderTrade(); document.exitPointerLock?.();
  } else {
    el.classList.add('hidden'); state.paused = false; $('pause').classList.add('hidden'); lockPointer();
  }
}

// Lore panel
let lorePick = null;   // { idx, type, picks: [] } while choosing resources for Bountiful Harvest / Royal Decree
function renderLore() {
  const me = players[P];
  $('deckLeft').textContent = `${deckCount()} scrolls left in the library · cost ${costStr('scroll')}`;
  if (!$('cardBack').innerHTML) $('cardBack').innerHTML = CARD_SVG.back;
  $('buyScroll').disabled = !deckCount() || !canAfford('scroll'); $('buyScroll').style.opacity = $('buyScroll').disabled ? 0.5 : 1;
  $('hand').innerHTML = me.scrolls.length ? me.scrolls.map((c, i) => {
    const S = SCROLLS[c.type];
    const btn = c.type === 'renown' ? '<div class="muted">kept secret · +1★</div>'
      : canPlay(me, c) ? `<button class="small" data-play="${i}">PLAY</button>`
      : `<div class="muted">${me.playedAt === state.harvests && state.harvests > c.boughtAt ? 'one scroll per harvest' : 'ready after the next harvest'}</div>`;
    return `<div class="scard art">${CARD_SVG[c.type]}${btn}</div>`;
  }).join('') : '<div class="muted">You hold no scrolls yet.</div>';
  if (lorePick) {
    const n = lorePick.type === 'harvest' ? 2 : 1;
    $('lorePick').innerHTML = `<div style="margin:8px 0 4px">${lorePick.type === 'harvest' ? `Choose 2 resources (${lorePick.picks.map(k => RES[k].icon).join(' ') || '…'})` : 'Name the resource to claim:'}</div>` +
      `<div class="grid">${RES_KEYS.map(k => `<div class="pick" data-res="${k}">${RES[k].icon}<br>${RES[k].name}${lorePick.type === 'decree' ? `<br><span class="muted">rivals hold ?</span>` : ''}</div>`).join('')}</div>`;
    void n;
  } else $('lorePick').innerHTML = '';
}
$('buyScroll').addEventListener('click', () => {
  if (NET.guest) { if (canAfford('scroll')) { netAct({ a: 'scroll_buy' }); $('loreStatus').textContent = '📜 Unrolling…'; } return; }
  const t = buyScroll(P); if (!t) return;
  const S = SCROLLS[t];
  $('loreStatus').textContent = `📜 You unroll a scroll: ${S.icon} ${S.name}!`; log(`📜 You buy a Lore Scroll: ${S.icon} ${S.name}`); sfx('build');
  updateHUD(); refreshMarkers(); renderLore(); checkWin();
});
$('hand').addEventListener('click', e => {
  const b = e.target.closest('[data-play]'); if (!b) return;
  const i = +b.dataset.play, c = players[P].scrolls[i];
  if (c.type === 'harvest' || c.type === 'decree') { lorePick = { idx: i, type: c.type, picks: [] }; renderLore(); return; }
  if (c.type === 'sellsword') { $('lore').classList.add('hidden'); if (NET.guest) { state.sellswordIdx = i; startReaverPick('sellsword'); } else playScroll(P, i); return; }   // opens the war map
  if (NET.guest) { netAct({ a: 'scroll_play', idx: i }); return; }
  playScroll(P, i); renderLore();
});
$('lorePick').addEventListener('click', e => {
  const k = e.target.closest('[data-res]')?.dataset.res; if (!k || !lorePick) return;
  lorePick.picks.push(k);
  if (lorePick.type === 'decree' || lorePick.picks.length === 2) {
    const { idx, picks, type } = lorePick; lorePick = null;
    if (NET.guest) netAct({ a: 'scroll_play', idx, arg: type === 'decree' ? picks[0] : picks });
    else playScroll(P, idx, type === 'decree' ? picks[0] : picks);
  }
  renderLore();
});
$('loreClose').addEventListener('click', () => toggleLore(false));
function toggleLore(force) {
  const el = $('lore'), open = force ?? el.classList.contains('hidden');
  if (open) {
    if (state.phase !== 'play') return;
    el.classList.remove('hidden'); state.paused = !NET.online; lorePick = null; $('loreStatus').textContent = ''; renderLore(); document.exitPointerLock?.();
  } else {
    el.classList.add('hidden'); state.paused = false; $('pause').classList.add('hidden'); lockPointer();
  }
}

// ---------------------------------------------------------------- visibility (fog of war)
function computeVisibility() {
  visible.clear();
  if (state.phase !== 'play' || state.dragonEye) { tiles.forEach(t => visible.add(t.id)); return; }
  const sight = SIGHT + (state.riding ? Math.min(170, Math.max(0, player.pos.y - heightAt(player.pos.x, player.pos.z)) * 1.8) : 0);   // higher = see further
  for (const t of tiles) if (Math.hypot(t.x - player.pos.x, t.z - player.pos.z) < sight) visible.add(t.id);
  for (const c of corners) if (owns(c)) c.tiles.forEach(id => visible.add(id));
  for (const e of edges) if (e.road === P) [e.a, e.b].forEach(cid => corners[cid].tiles.forEach(id => visible.add(id)));
  visible.forEach(id => explored.add(id));
}
const isKnown = t => state.phase !== 'play' || state.dragonEye || explored.has(t.id);
function applyFogToWorld(dt) {
  for (const t of tiles) if (t.banner) { const k = isKnown(t); t.banner.visible = k; t.pole.visible = k; }
  reavers.visible = visible.has(reaverTile.id);
  const thick = state.phase === 'play' && !state.dragonEye;
  const alt = state.riding ? Math.max(0, player.pos.y - heightAt(player.pos.x, player.pos.z)) : 0;
  const near = thick ? 45 - night * 12 + alt : 160, far = thick ? Math.min(600, 200 - night * 45 + alt * 2.6) : 650, a = Math.min(1, dt * 0.8);
  scene.fog.near += (near - scene.fog.near) * a; scene.fog.far += (far - scene.fog.far) * a;
}

// ---------------------------------------------------------------- war map (minimap / war table)
const mm = $('minimap'), mctx = mm.getContext('2d');
let mapHover = null;
const mapScale = () => mm.width / (mm.classList.contains('big') ? 300 : 330);
function toggleMap() { setWarMap(!mm.classList.contains('big')); }
function setWarMap(open) {
  mm.classList.toggle('big', open); mm.width = mm.height = open ? 1000 : 460;
}
function mapToWorld(ev) {
  const r = mm.getBoundingClientRect(), px = (ev.clientX - r.left) * mm.width / r.width, py = (ev.clientY - r.top) * mm.height / r.height;
  const sc = mapScale(); return { x: (px - mm.width / 2) / sc, z: (py - mm.height / 2) / sc };
}
function mapTargetAt(ev) {
  if (state.phase !== 'setup' || !state.mode) return null;
  const w = mapToWorld(ev); let best = null, bd = 1e9;
  if (state.mode === 'road') { for (const e of edges) { const d = Math.hypot(e.mx - w.x, e.mz - w.z); if (d < bd) { bd = d; best = { e }; } } }
  else for (const c of corners) { const d = Math.hypot(c.x - w.x, c.z - w.z); if (d < bd) { bd = d; best = { c }; } }
  if (bd > 11) return null;
  best.problem = problemFor(state.mode, best); return best;
}
let reaverHover = null;
mm.addEventListener('mousemove', ev => { mapHover = mapTargetAt(ev); if (state.reaverPick) { const w = mapToWorld(ev); reaverHover = tileAtWorld(w.x, w.z); } });
mm.addEventListener('mouseleave', () => { mapHover = null; });
mm.addEventListener('mousedown', ev => {
  if (state.reaverPick) { const w = mapToWorld(ev), tile = tileAtWorld(w.x, w.z); if (tile && tile !== reaverTile) finishReaverPick(tile); return; }
  if (state.phase === 'play') {   // click the map to travel there
    const w = mapToWorld(ev); if (state.riding) flyTo(w); else walkTo(w);
    if (mm.classList.contains('big')) setWarMap(false);
    return;
  }
  const t = mapTargetAt(ev); if (!t) return;
  if (t.problem) { log('⚠️ ' + t.problem); sfx('bad'); return; }
  tryBuild(t); mapHover = null;
});

function cornerInfo(c) {
  const ts = c.tiles.map(id => tiles[id]);
  return ts.map(t => t.num ? `${RES[t.type].icon}${t.num}` : '🌋').join('  ') + `   ·   ${ts.reduce((s, t) => s + PIPS(t.num), 0)} pips`;
}
function hexPath(t, X, Y) { mctx.beginPath(); t.corners.forEach((cid, i) => { const c = corners[cid]; i ? mctx.lineTo(X(c.x), Y(c.z)) : mctx.moveTo(X(c.x), Y(c.z)); }); mctx.closePath(); }
function drawMinimap() {
  const W = mm.width, big = mm.classList.contains('big'), sc = mapScale(), u = W / 460;
  const X = x => W / 2 + x * sc, Y = z => W / 2 + z * sc;
  const fs = W * (big ? 0.03 : 0.042);
  mctx.clearRect(0, 0, W, W);
  mctx.fillStyle = '#E4DCCF'; mctx.fillRect(0, 0, W, W);
  mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
  for (const t of tiles) {
    const known = isKnown(t), live = visible.has(t.id);
    hexPath(t, X, Y);
    mctx.fillStyle = known ? BIOME[t.type].mini : '#4b525c'; mctx.fill();
    if (known && !live) { mctx.fillStyle = 'rgba(185,180,198,.55)'; mctx.fill(); }
    mctx.strokeStyle = 'rgba(237,230,218,.95)'; mctx.lineWidth = 2.5 * u; mctx.stroke();
    if (!known) {   // drifting mist
      mctx.fillStyle = 'rgba(142,138,163,.35)';
      for (let k = 0; k < 4; k++) { mctx.beginPath(); mctx.arc(X(t.x) + Math.cos(k * 1.7 + t.id) * 12 * sc / 1.5, Y(t.z) + Math.sin(k * 2.3 + t.id) * 9 * sc / 1.5, 11 * sc / 1.5, 0, 7); mctx.fill(); }
      mctx.fillStyle = 'rgba(30,26,38,.5)'; mctx.font = `bold ${fs}px Georgia`; mctx.fillText('?', X(t.x), Y(t.z));
      continue;
    }
    if (t.num) {
      mctx.fillStyle = '#EDE6DA'; mctx.beginPath(); mctx.arc(X(t.x), Y(t.z), fs * 0.95, 0, 7); mctx.fill();
      mctx.fillStyle = (t.num === 6 || t.num === 8) ? '#b3261e' : '#2b1d12';
      mctx.font = `bold ${fs}px Georgia`; mctx.fillText(t.num, X(t.x), Y(t.z) + 1);
    } else { mctx.font = `${fs * 1.4}px serif`; mctx.fillText('🌋', X(t.x), Y(t.z)); }
    if (big && RES[t.type]) { mctx.font = `${fs * 1.1}px serif`; mctx.fillText(RES[t.type].icon, X(t.x), Y(t.z) - fs * 2.1); }
    if (t === reaverTile && live) { mctx.font = `${fs * 1.3}px serif`; mctx.fillText('🏴', X(t.x) + fs * 1.5, Y(t.z) + fs * 0.9); }
  }
  // war-table markers during landing
  if (state.phase === 'setup' && state.mode) {
    mctx.fillStyle = 'rgba(224,162,74,.9)';
    if (state.mode === 'road') edges.forEach(e => { if (!roadProblem(e)) { mctx.beginPath(); mctx.arc(X(e.mx), Y(e.mz), 5 * u, 0, 7); mctx.fill(); } });
    else corners.forEach(c => { if (!hamletProblem(c)) { mctx.beginPath(); mctx.arc(X(c.x), Y(c.z), 4.5 * u, 0, 7); mctx.fill(); } });
  }
  // rival holdings only appear where you have explored (you can't see through the mist)
  const cornerKnown = c => c.building?.owner === P || c.tiles.some(id => isKnown(tiles[id]));
  const css = pid => players[pid]?.house.css || HOUSE.css;
  mctx.lineWidth = 4 * u;
  for (const e of edges) if (e.road !== null && (e.road === P || (cornerKnown(corners[e.a]) && cornerKnown(corners[e.b])))) {
    const A = corners[e.a], B = corners[e.b]; mctx.strokeStyle = css(e.road); mctx.beginPath(); mctx.moveTo(X(A.x), Y(A.z)); mctx.lineTo(X(B.x), Y(B.z)); mctx.stroke();
    mctx.fillStyle = '#EDE6DA'; mctx.beginPath(); mctx.arc(X((A.x + B.x) / 2), Y((A.z + B.z) / 2), 2.2 * u, 0, 7); mctx.fill();   // the gate
  }
  for (const c of corners) if (c.building && cornerKnown(c)) {
    const s = (c.building.type === 'keep' ? 9 : 6) * u;
    mctx.fillStyle = css(c.building.owner); mctx.strokeStyle = c.building.owner === P ? '#fff' : '#17110d'; mctx.lineWidth = 2 * u;
    mctx.beginPath(); c.building.type === 'keep' ? mctx.rect(X(c.x) - s, Y(c.z) - s, s * 2, s * 2) : mctx.arc(X(c.x), Y(c.z), s, 0, 7); mctx.fill(); mctx.stroke();
  }
  // rival lords you can currently see
  for (const p of players) if (p.id !== P && p.avatar && p.avatar.visible && state.phase === 'play') {
    mctx.fillStyle = p.house.css; mctx.strokeStyle = '#EDE6DA'; mctx.lineWidth = 2 * u;
    mctx.beginPath(); mctx.arc(X(p.pos.x), Y(p.pos.z), 7 * u, 0, 7); mctx.fill(); mctx.stroke();
    mctx.font = `${9 * u}px serif`; mctx.fillText(p.house.sigil, X(p.pos.x), Y(p.pos.z) + 0.5 * u);
  }
  for (const p of players) {
    const d = p.dragon; if (!d || !d.mesh || !d.mesh.visible || state.phase !== 'play' || (p.id === P && state.riding)) continue;
    mctx.font = `${16 * u}px serif`; mctx.fillText('🐉', X(d.pos.x), Y(d.pos.z));
    mctx.strokeStyle = p.house.css; mctx.lineWidth = 2.5 * u; mctx.beginPath(); mctx.arc(X(d.pos.x), Y(d.pos.z), 10 * u, 0, 7); mctx.stroke();
  }
  if (state.reaverPick && reaverHover) {
    hexPath(reaverHover, X, Y); mctx.lineWidth = 5 * u;
    mctx.strokeStyle = reaverHover === reaverTile ? '#888' : '#d01818'; mctx.stroke();
    mctx.fillStyle = 'rgba(140,59,74,.3)'; mctx.fill();
    const owners = [...new Set(reaverHover.corners.map(cid => corners[cid].building?.owner).filter(o => o !== undefined && o !== P))];
    const txt = reaverHover === reaverTile ? 'The Wyrm already lies here' : `🏴 Send the Wyrm here · rob: ${owners.length ? owners.map(o => players[o].house.sigil).join(' ') : 'nobody'}`;
    mctx.font = `${fs * 1.05}px Georgia`; const tw = mctx.measureText(txt).width + 30;
    mctx.fillStyle = 'rgba(30,26,38,.88)'; mctx.fillRect(W / 2 - tw / 2, W - fs * 3.2, tw, fs * 2.2);
    mctx.fillStyle = '#EDE6DA'; mctx.fillText(txt, W / 2, W - fs * 2.1);
  }
  // hover preview on the war table
  if (mapHover) {
    const ok = !mapHover.problem;
    mctx.strokeStyle = ok ? '#7dff8a' : '#ff5040'; mctx.fillStyle = ok ? 'rgba(125,255,138,.35)' : 'rgba(255,80,64,.35)'; mctx.lineWidth = 3 * u;
    if (mapHover.e) { const A = corners[mapHover.e.a], B = corners[mapHover.e.b]; mctx.lineWidth = 7 * u; mctx.beginPath(); mctx.moveTo(X(A.x), Y(A.z)); mctx.lineTo(X(B.x), Y(B.z)); mctx.stroke(); }
    else { mctx.beginPath(); mctx.arc(X(mapHover.c.x), Y(mapHover.c.z), 10 * u, 0, 7); mctx.fill(); mctx.stroke(); }
    const txt = mapHover.problem ? '✖ ' + mapHover.problem : mapHover.c ? cornerInfo(mapHover.c) : 'Click to build this wall';
    mctx.font = `${fs * 1.05}px Georgia`; const tw = mctx.measureText(txt).width + 30;
    mctx.fillStyle = 'rgba(30,26,38,.88)'; mctx.fillRect(W / 2 - tw / 2, W - fs * 3.2, tw, fs * 2.2);
    mctx.fillStyle = ok ? '#f3e9d2' : '#ff9a8a'; mctx.fillText(txt, W / 2, W - fs * 2.1);
  }
  if (state.phase !== 'play') return;
  if (beacon.visible) { mctx.font = `${18 * u}px serif`; mctx.fillText('🎯', X(beacon.position.x), Y(beacon.position.z)); }
  if (destMarker.visible) { mctx.strokeStyle = '#1E1A26'; mctx.lineWidth = 2 * u; mctx.setLineDash([4 * u, 4 * u]); mctx.beginPath(); mctx.moveTo(X(player.pos.x), Y(player.pos.z)); mctx.lineTo(X(destMarker.position.x), Y(destMarker.position.z)); mctx.stroke(); mctx.setLineDash([]); }
  // player arrow
  const px = X(player.pos.x), py = Y(player.pos.z), a = -player.yaw;   // arrow points where you look
  mctx.save(); mctx.translate(px, py); mctx.rotate(a);
  mctx.scale(u, u); mctx.fillStyle = '#EDE6DA'; mctx.strokeStyle = '#1E1A26'; mctx.lineWidth = 2;
  mctx.beginPath(); mctx.moveTo(0, -11); mctx.lineTo(7, 8); mctx.lineTo(0, 4); mctx.lineTo(-7, 8); mctx.closePath(); mctx.fill(); mctx.stroke();
  mctx.restore();
}

function endLanding() {
  setWarMap(false);
  const first = corners.find(c => owns(c)) || corners[0];
  const dx = -first.x, dz = -first.z, L = Math.hypot(dx, dz) || 1;
  const x = first.x + dx / L * 22, z = first.z + dz / L * 22;
  player.pos.set(x, heightAt(x, z), z); player.yaw = Math.atan2(first.x - x, first.z - z) + Math.PI; player.pitch = -0.22;
  lockPointer();
}

// ---------------------------------------------------------------- tiny sound (WebAudio, no assets)
let actx = null;
function sfx(kind) {
  try {
    actx = actx || new AudioContext();
    const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
    o.connect(g); g.connect(actx.destination);
    const set = { build: ['triangle', 330, 520, 0.18], bad: ['square', 160, 120, 0.15], horn: ['sawtooth', 147, 196, 0.9], raid: ['sawtooth', 110, 70, 1.0], win: ['triangle', 392, 784, 1.4] }[kind];
    o.type = set[0]; o.frequency.setValueAtTime(set[1], t); o.frequency.linearRampToValueAtTime(set[2], t + set[3]);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(kind === 'horn' || kind === 'raid' ? 0.12 : 0.08, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + set[3] + 0.1);
    o.start(t); o.stop(t + set[3] + 0.15);
  } catch (_) {}
}

// ---------------------------------------------------------------- start / loop
// house picker on the title screen
let chosen = 'varn';
$('housePick').innerHTML = Object.values(HOUSES).map(h => `<div class="hcard ${h.key === chosen ? 'sel' : ''}" data-k="${h.key}" style="--hc:${h.css}"><div class="sig">${h.sigil}</div><div class="hn">${h.name}</div><div class="hd">${h.desc.split('. ')[0]}.</div></div>`).join('');
$('housePick').addEventListener('click', e => {
  const c = e.target.closest('.hcard'); if (!c) return; chosen = c.dataset.k;
  document.querySelectorAll('.hcard').forEach(x => x.classList.toggle('sel', x.dataset.k === chosen));
});
let rivalCount = 3;
$('rivalPick').addEventListener('click', e => {
  const b = e.target.closest('[data-n]'); if (!b) return; rivalCount = +b.dataset.n;
  document.querySelectorAll('#rivalPick [data-n]').forEach(x => x.classList.toggle('sel', +x.dataset.n === rivalCount));
});
$('startBtn').addEventListener('click', () => {
  const seats = [{ id: 0, house: chosen, name: '', ai: false }];
  shuffle(Object.values(HOUSES).filter(h => h.key !== chosen)).slice(0, rivalCount).forEach((h, i) => seats.push({ id: i + 1, house: h.key, ai: true }));
  startMatch(seats);
});
// seats: [{ id, house (key), name, ai, remote }]
function startMatch(seats) {
  players.length = 0;
  for (const st of seats) players.push({
    id: st.id, house: HOUSES[st.house], name: st.name || '', ai: !!st.ai, remote: !!st.remote,
    res: st.id === P ? state.res : { timber: 0, stone: 0, wheat: 0, cattle: 0, ember: 0 },
    built: st.id === P ? state.built : { road: 0, hamlet: 0, keep: 0, roost: 0, tower: 0 },
    longest: 0, scrolls: [], knights: 0, freeRoads: 0, playedAt: -1, setupStep: 0, setupCorner: null,
  });
  HOUSE = players[P].house; houseMat = HOUSE.mat; applyPalette(); buildGhosts(); dayT = 0.1;
  if (!NET.guest) makeDeck();
  document.querySelector('#house .name').textContent = `${HOUSE.sigil} ${players[P].name || HOUSE.name}`;
  $('start').classList.add('hidden'); $('lobby').classList.add('hidden'); $('hud').classList.remove('hidden');
  state.phase = 'setup'; state.startTime = performance.now();
  spawn(); setWarMap(true); updateHUD();
  announce('THE WAR TABLE', 'Study the isles now. Once you land, the mist rolls in.');
  if (!NET.guest) beginSetup();
  log('⚓ Your longships reach Embervale. The whole isle is visible from the sea.');
  sfx('horn');
}
$('againBtn').addEventListener('click', () => location.reload());

// ---------------------------------------------------------------- DRAGONS (Milestone 3)
// Roost on a Keep → fetch an egg from the Ashen Waste → feed it (🔥 ×3) → Wyrmling (+1★, ride) → feed (🐄🐄 ×3)
// → Grown Dragon (+2★, Dragonfire, Dragon's Eye). A grown dragon eats 🐄🔥 every 3rd harvest or turns Restless.
const DRAGON_FEED = { egg: { ember: 1 }, wyrmling: { cattle: 2 } };
const UPKEEP = { cattle: 1, ember: 1 };
const dragonOf = pid => players[pid]?.dragon || null;
function dragonRenown(pid) { const d = dragonOf(pid); return !d ? 0 : d.stage === 'grown' ? 2 : d.stage === 'wyrmling' ? 1 : 0; }
const hasRes = (pid, need) => Object.entries(need).every(([k, n]) => players[pid].res[k] >= n);
const takeRes = (pid, need) => Object.entries(need).forEach(([k, n]) => { players[pid].res[k] -= n; });
const iconsOf = need => Object.entries(need).map(([k, n]) => RES[k].icon.repeat(n)).join('');

// --- models
const eggMat = mat(PAL.barrow, { emissive: PAL.ember, emissiveIntensity: 0.12 });
const eggGeo = new THREE.SphereGeometry(1, 10, 8);
function makeEgg() { const m = new THREE.Mesh(eggGeo, eggMat); m.scale.set(1, 1.4, 1); m.castShadow = true; return m; }
function roostDir(c) { const L = Math.hypot(c.x, c.z) || 1; return { x: c.x / L, z: c.z / L }; }
function nestPos(c) { const d = roostDir(c); return new THREE.Vector3(c.x + d.x * 9, c.y + 4.4, c.z + d.z * 9); }
function makeRoost(h = HOUSE) {
  return withHouse(h, () => {
    const g = new THREE.Group(), o = new THREE.Group(); o.position.set(0, 0, 13); g.add(o);
    o.add(cyl(3, 4, 3, 10, M.stone, 0, -0.4, 0));
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + Math.PI / 4;
      for (const [r, ht, tb] of [[4.6, 9, 0.5], [3.6, 6.5, 0.35]]) {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(r, tb, 5, 14, Math.PI * 0.7), GOTH.bone);
        rib.position.set(Math.cos(a) * 0.4, 2.6, Math.sin(a) * 0.4); rib.rotation.set(0, -a, Math.PI * 0.1); rib.scale.set(0.55, ht / r, 1); o.add(rib); } }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.2, 5, 20), M.iron); ring.rotation.x = Math.PI / 2; ring.position.y = 6; o.add(ring);
    const nest = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.6, 5, 10), M.woodDark); nest.rotation.x = Math.PI / 2; nest.position.y = 3; o.add(nest);
    return g;
  });
}
function makeTower(h = HOUSE) {
  return withHouse(h, () => {
    const g = new THREE.Group(), o = new THREE.Group(); o.position.set(11, 0, 0); g.add(o);
    o.add(cyl(1.5, 2.8, 12, 4, M.iron, 0, -0.4, 0)).rotation.y = Math.PI / 4;
    o.add(B(5, 1, 5, GOTH.body, 0, 11.6, 0));
    for (const [x, z] of [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]]) { o.add(B(0.6, 0.7, 0.6, GOTH.body, x, 12.6, z)); o.add(B(0.25, 4, 0.25, M.iron, x, 12.6, z)); }
    o.add(spire(5.2, 2.5, GOTH.roof, 0, 16.6, 0));
    const bow = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.12, 4, 14, Math.PI * 0.75), M.iron); bow.rotation.set(Math.PI / 2, 0, Math.PI * 0.125); bow.position.set(0, 13.4, 1.2); bow.scale.y = 0.7; o.add(bow);
    o.add(B(0.4, 0.4, 3.2, M.iron, 0, 13.2, 0));
    o.add(banner(h, 2.4, -2.2, 16.6, -2.2));
    return g;
  });
}
function wingGeometry() {
  const pts = [[0, 0, 0.6], [5, 0.9, 1.7], [10, 1.5, 1.3], [15.5, 0.7, -0.6], [12.5, 0.1, -3], [13.4, -0.3, -5.8], [9.4, 0, -4.4], [8.6, -0.2, -7.4], [5.2, 0, -5.2], [3.6, 0, -7], [1.2, 0, -3.8]];
  const p = [];
  for (let i = 1; i < pts.length - 1; i++) p.push(...pts[0], ...pts[i], ...pts[i + 1]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.computeVertexNormals(); return g;
}
const WING_GEO = wingGeometry();
// Big, heavy and scary: armoured hide like cooled lava rock, glowing cracks and spines in the house colour
function makeDragon(h) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); g.rotation.order = 'YXZ';
  const hide = mat(0x2a2321), plate = mat(0x46372e), membrane = mat(0x3c2420, { side: THREE.DoubleSide }), bone = mat(0xd8ccb4);
  const glow = new THREE.MeshBasicMaterial({ color: h.color });
  const torso = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 1), hide); torso.scale.set(1, 0.85, 2.1); body.add(torso);
  const belly = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 1), plate); belly.scale.set(0.85, 0.55, 1.8); belly.position.y = -0.7; body.add(belly);
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 1.7), glow); c.position.set(sx * 2.15, 0.3 - i * 0.5, -1.2 + i * 1.2); c.rotation.y = sx * 0.25; c.rotation.x = 0.3 * i; body.add(c); }
  for (let i = 0; i < 7; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 4), glow); sp.position.set(0, 2 - Math.abs(i - 3) * 0.15, -4 + i * 1.3); sp.rotation.x = -0.35; body.add(sp); }
  // neck + head
  const neck = new THREE.Group(); neck.position.set(0, 0.9, 4); body.add(neck);
  for (let i = 0; i < 4; i++) {
    const n = new THREE.Mesh(new THREE.BoxGeometry(1.6 - i * 0.15, 1.5 - i * 0.12, 1.7), hide); n.position.set(0, i * 0.8, i * 1.25); n.rotation.x = -0.45; neck.add(n);
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1, 4), glow); sp.position.set(0, i * 0.8 + 0.9, i * 1.2); sp.rotation.x = -0.4; neck.add(sp);
  }
  const head = new THREE.Group(); head.position.set(0, 3.5, 5.6); neck.add(head);
  head.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.25, 2.4), hide));
  const snout = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.8, 1.8), hide); snout.position.set(0, -0.15, 1.9); head.add(snout);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.35, 2.7), plate); jaw.position.set(0, -0.8, 1.25); jaw.rotation.x = 0.28; head.add(jaw);
  for (const sx of [-1, 1]) {
    for (let k = 0; k < 3; k++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 3), bone); t.rotation.x = Math.PI; t.position.set(sx * 0.55, -0.6, 1.6 + k * 0.5); head.add(t); }
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.4), glow); eye.position.set(sx * 0.75, 0.28, 0.8); head.add(eye);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.3, 2.8, 5), bone); horn.position.set(sx * 0.65, 0.9, -1.2); horn.rotation.set(-2.2, 0, sx * 0.35); head.add(horn);
    const horn2 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.4, 4), bone); horn2.position.set(sx * 0.95, 0.2, -0.9); horn2.rotation.set(-2, 0, sx * 0.9); head.add(horn2);
  }
  // tail
  const tail = [];
  let parent = body;
  for (let i = 0; i < 8; i++) {
    const seg = new THREE.Group(); seg.position.set(0, i ? -0.1 : -0.2, i ? -1.7 : -4); parent.add(seg);
    const k = 1 - i / 9; seg.add(new THREE.Mesh(new THREE.BoxGeometry(1.3 * k, 1 * k, 1.9), hide));
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.28 * k + 0.1, 0.8, 4), glow); sp.position.y = 0.6 * k; seg.add(sp);
    tail.push(seg); parent = seg;
  }
  const spade = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 4), glow); spade.rotation.x = -Math.PI / 2; spade.position.z = -1.6; parent.add(spade);
  // wings with bony leading edges
  const wings = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group(); pivot.position.set(sx * 1.7, 1.3, 1.4); body.add(pivot);
    const w = new THREE.Mesh(WING_GEO, membrane); w.scale.x = sx; pivot.add(w);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.35, 0.35), hide); arm.position.set(sx * 7.6, 0.8, 0.6); arm.rotation.y = -sx * 0.12; pivot.add(arm);
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.2, 4), bone); claw.position.set(sx * 15.6, 0.7, -0.6); claw.rotation.z = -sx * Math.PI / 2; pivot.add(claw);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(14, 0.08, 0.08), glow); edge.position.set(sx * 7, 0.55, -2.5); edge.rotation.y = sx * 0.35; pivot.add(edge);
    wings.push(pivot);
  }
  for (const [x, zz] of [[-1.4, 2.2], [1.4, 2.2], [-1.4, -2.2], [1.4, -2.2]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2, 0.8), hide); leg.position.set(x, -1.7, zz); leg.rotation.x = 0.6; body.add(leg);
    const cl = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 4), bone); cl.position.set(x, -2.6, zz + 0.5); cl.rotation.x = 1.6; body.add(cl);
  }
  g.userData = { body, wings, tail, head };
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  scene.add(g); return g;
}

// --- eggs waiting in the Ashen Waste (one per house)
const cradleEggs = [0, 1, 2, 3].map(i => {
  const a = i * Math.PI / 2 + 0.5, x = Math.cos(a) * 9, z = Math.sin(a) * 9, m = makeEgg();
  m.position.set(x, heightAt(x, z) + 1.2, z); scene.add(m);
  return { mesh: m, x, z, taken: false };
});
const carryEgg = makeEgg(); carryEgg.scale.set(0.35, 0.5, 0.35); carryEgg.position.set(0.55, -0.55, -1.3); carryEgg.visible = false;
camera.add(carryEgg); scene.add(camera);

// --- building
function buildRoost(c, pid = P) {
  c.roost = pid; PL(pid).built.roost++;
  const o = makeRoost(players[pid]?.house || HOUSE); placeAtCorner(o, c); o.traverse(m => { m.castShadow = true; m.receiveShadow = true; }); scene.add(o); popIn(o);
}
function buildTower(c, pid = P) {
  c.tower = pid; PL(pid).built.tower++;
  const o = makeTower(players[pid]?.house || HOUSE); placeAtCorner(o, c); o.traverse(m => { m.castShadow = true; m.receiveShadow = true; }); scene.add(o); popIn(o);
}
const roostOf = pid => corners.find(c => c.roost === pid) || null;

// --- eggs: fetch & deliver
function hatchery(pid, c) {
  const p = players[pid], pos = nestPos(c), egg = makeEgg(); egg.position.copy(pos); egg.position.y += 0.4; scene.add(egg);
  p.dragon = { stage: 'egg', progress: 0, restless: false, fireCD: 0, upkeepN: 0, roost: c, mesh: null, egg, ang: rand() * 6.28, pos: pos.clone(), strike: null };
}
function tryEgg() {
  if (state.carrying || state.riding) return;
  const me = players[P];
  if (me.dragon) { log('🐉 Your house already has a dragon'); return; }
  if (!roostOf(P)) { log('⚠️ First build a Dragon Roost beside one of your Keeps (key 4)'); return; }
  const e = cradleEggs.find(e => !e.taken && Math.hypot(e.x - player.pos.x, e.z - player.pos.z) < 6);
  if (!e) { log('⚠️ Walk right up to a glowing egg in the Ashen Waste, then press E'); return; }
  if (NET.guest) { netAct({ a: 'egg', i: cradleEggs.indexOf(e) }); return; }
  e.taken = true; e.mesh.visible = false; state.carrying = true; carryEgg.visible = true; sfx('build');
  announce('A DRAGON EGG!', 'Carry it home to your Roost. You walk slower while carrying it');
  log('🥚 You lift a dragon egg. Bring it to your Roost!'); updateHUD();
}
function aiEggStep(p, t) {
  if (t.kind === 'egg') {
    if (t.egg.taken || p.dragon) return;
    t.egg.taken = true; t.egg.mesh.visible = false; p.carrying = true;
    p.task = { kind: 'deliver', c: roostOf(p.id) };
    if (Math.hypot(p.pos.x - player.pos.x, p.pos.z - player.pos.z) < SIGHT + 20) log(`👀 ${nameOf(p.id)} carries off a dragon egg!`);
  } else {
    p.carrying = false; hatchery(p.id, t.c);
    log(`🐦 Ravens report: ${nameOf(p.id)} has a dragon egg in its Roost 🥚`); updateHUD();
  }
}

// --- each harvest: feeding, growing, hunger, AI dragonfire
function grow(p) {
  const d = p.dragon, me = p.id === P;
  if (d.stage === 'egg') {
    d.stage = 'wyrmling'; d.progress = 0; scene.remove(d.egg);
    d.mesh = makeDragon(p.house); d.mesh.scale.setScalar(0.45); d.mesh.position.copy(d.pos);
    announce(me ? 'THE EGG HATCHES!' : 'A DRAGON IS BORN', me ? 'Your Wyrmling is here (+1★). Press F to ride it!' : `${nameOf(p.id)} has hatched a Wyrmling (+1★)`);
  } else {
    d.stage = 'grown'; d.progress = 0; d.mesh.scale.setScalar(1);
    announce(me ? 'DRAGON ASCENDANT!' : 'BEWARE THE SKIES!', me ? 'Your dragon is grown (+2★): Dragonfire (G) and the Dragon\'s Eye are yours' : `${nameOf(p.id)}'s dragon is fully grown. Scorpion Towers (key 5) keep its fire away`);
  }
  log(`🐉 ${me ? 'Your' : nameOf(p.id) + "'s"} dragon grows: ${d.stage === 'grown' ? 'Grown Dragon (+2★)' : 'Wyrmling (+1★)'}`);
  sfx('win');
}
function dragonsOnHarvest() {
  for (const t of tiles) if (t.flames && state.harvests > t.scorchedUntil) { scene.remove(t.flames); t.flames = null; if (t.banner) t.banner.material.color.setHex(0xffffff); }
  for (const p of players) {
    const d = p.dragon; if (!d) continue;
    const me = p.id === P;
    d.fireCD = Math.max(0, d.fireCD - 1);
    if (d.stage !== 'grown') {
      const need = DRAGON_FEED[d.stage];
      if (hasRes(p.id, need)) {
        takeRes(p.id, need); d.progress++;
        if (me) log(`${d.stage === 'egg' ? '🥚 Your egg drinks' : '🐲 Your Wyrmling devours'} ${iconsOf(need)} (${d.progress}/3)`);
        if (d.progress >= 3) grow(p);
      } else if (me) log(`⚠️ Your ${d.stage} needs ${iconsOf(need)} to grow. Nothing fed this harvest`);
    } else {
      d.upkeepN++;
      if (d.restless || d.upkeepN >= 3) {
        if (hasRes(p.id, UPKEEP)) {
          takeRes(p.id, UPKEEP); if (me) log(`🐉 Your dragon feeds: ${iconsOf(UPKEEP)}`);
          if (d.restless && me) announce('YOUR DRAGON IS CALM', 'Fed again: its powers return');
          d.restless = false; d.upkeepN = 0;
        } else if (!d.restless) {
          d.restless = true; d.upkeepN = 0;
          if (me) { announce('YOUR DRAGON IS RESTLESS!', `It needs ${iconsOf(UPKEEP)}. No riding, fire or Dragon's Eye until fed`); if (state.riding) forceLand(); }
        }
      }
      if (p.ai && !d.restless && d.fireCD === 0) aiDragonfire(p);
    }
  }
  updateHUD(); checkWin();
}

// --- Dragonfire & Scorpion Towers
const guardedBy = (t, attacker) => t.corners.some(cid => corners[cid].tower != null && corners[cid].tower !== attacker);
function scorchProblem(pid, t) {
  const d = dragonOf(pid);
  if (!d || d.stage !== 'grown') return 'Only a grown dragon breathes fire';
  if (d.restless) return 'Your dragon is Restless: it needs feeding';
  if (d.fireCD > 0) return `Dragonfire recovers in ${d.fireCD} harvest${d.fireCD > 1 ? 's' : ''}`;
  if (!t || !t.num) return 'Nothing here worth burning';
  if (t.scorchedUntil >= state.harvests + 1) return 'Already scorched';
  if (guardedBy(t, pid)) return 'A Scorpion Tower guards this region';
  if (!t.corners.some(cid => { const b = corners[cid].building; return b && b.owner !== pid; })) return 'No rival holdings in this region';
  return null;
}
function scorch(pid, t) {
  const d = dragonOf(pid); d.fireCD = 3;
  t.scorchedUntil = state.harvests + 1;
  if (!t.flames) {
    const g = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const p = placeIn(t, 4, HEX_R * 0.7), f = new THREE.Mesh(new THREE.ConeGeometry(rr(0.8, 1.5), rr(2.5, 4.5), 5), flameMat);
      f.position.set(p.x, p.y + 1.5, p.z); g.add(f);
      const s = new THREE.Sprite(glowMat); s.scale.set(7, 7, 1); s.position.set(p.x, p.y + 2, p.z); g.add(s);
    }
    scene.add(g); t.flames = g; t.banner.material.color.setHex(0xff6a3a);
  }
  const victims = [...new Set(t.corners.map(cid => corners[cid].building?.owner).filter(o => o !== undefined && o !== pid))];
  const where = `${BIOME[t.type].name} (${t.num})`;
  if (pid === P) { announce('DRAGONFIRE!', `${where} burns: it yields nothing next harvest`); log(`🔥 You scorch ${where}`); }
  else if (victims.includes(P)) { announce('DRAGONFIRE!', `${nameOf(pid)}'s dragon scorches your ${where}!`); log(`🔥 ${nameOf(pid)}'s dragon scorches ${where}`); }
  else if (visible.has(t.id)) log(`🔥 ${nameOf(pid)}'s dragon scorches ${where}`);
  if (pid !== P) tell(pid, { big: 'DRAGONFIRE!', small: `${where} burns: it yields nothing next harvest` });
  victims.forEach(v => { if (v !== P) tell(v, { big: 'DRAGONFIRE!', small: `${nameOf(pid)}'s dragon scorches your ${where}!` }); });
  sfx('raid');
}
function dragonfire() {
  const t = tileAtWorld(camera.position.x, camera.position.z), prob = scorchProblem(P, t);
  if (prob) { log('⚠️ ' + prob); sfx('bad'); return; }
  if (NET.guest) { netAct({ a: 'fire', t: t.id }); return; }
  scorch(P, t);
  const d = dragonOf(P), from = new THREE.Vector3(); d.mesh.userData.head.getWorldPosition(from);
  breathe(from, new THREE.Vector3(camera.position.x, heightAt(camera.position.x, camera.position.z), camera.position.z));
  updateHUD();
}
function aiDragonfire(p) {
  const lead = Math.max(...players.filter(q => q !== p).map(q => renown(q.id)));
  let best = null, bs = 0;
  for (const t of tiles) {
    if (scorchProblem(p.id, t)) continue;
    let s = 0;
    for (const cid of t.corners) { const b = corners[cid].building; if (!b) continue; if (b.owner === p.id) s -= 4; else s += (b.type === 'keep' ? 2 : 1) * PIPS(t.num) * (renown(b.owner) >= lead ? 2 : 1); }
    if (s > bs) { bs = s; best = t; }
  }
  if (best) { scorch(p.id, best); p.dragon.strike = { t: best, breathed: false, timer: 0 }; }
}
function aiDragonPlans(p) {
  const pid = p.id;
  if (p.carrying) { p.task = { kind: 'deliver', c: roostOf(pid) }; return true; }
  const roost = roostOf(pid);
  if (roost && !p.dragon) { const egg = cradleEggs.find(e => !e.taken); if (egg) { p.task = { kind: 'egg', egg }; return true; } }
  if (!roost && p.built.keep > 0 && canAfford('roost', pid) && renown(pid) >= 4) {
    const c = corners.find(c => owns(c, pid) && c.building.type === 'keep' && !roostProblem(c, pid));
    if (c) { p.task = { kind: 'roost', c }; return true; }
  }
  const threat = players.some(q => q !== p && q.dragon && q.dragon.stage !== 'egg');
  if (threat && p.built.tower < 2 && canAfford('tower', pid)) {
    const c = corners.filter(c => owns(c, pid) && c.tower == null).sort((a, b) => cornerScore(b, pid) - cornerScore(a, pid))[0];
    if (c) { p.task = { kind: 'tower', c }; return true; }
  }
  return false;
}

// --- riding
function toggleRide() {
  const d = dragonOf(P);
  if (state.riding) {
    const g = heightAt(player.pos.x, player.pos.z);
    if (g < 0.6) { log('⚠️ You cannot land on the sea'); return; }
    if (player.pos.y - g > 35) { log('⚠️ Fly lower to land (hold C)'); return; }
    return forceLand();
  }
  if (state.carrying) { log('⚠️ Bring the egg home first'); return; }
  if (!d || d.stage === 'egg') { log('⚠️ You have no dragon to ride yet'); return; }
  if (d.restless) { log(`⚠️ Your dragon is Restless: it will eat ${iconsOf(UPKEEP)} at the next harvest`); return; }
  state.riding = true; setMode(null); player.pos.y += EYE + 9; player.pitch = -0.3; player.autoTarget = null; destMarker.visible = false;
  announce('TO THE SKIES!', 'W fly · Space climb · C dive · Shift faster · ' + (d.stage === 'grown' ? 'G Dragonfire · ' : '') + 'F land');
  sfx('horn'); updateHUD();
}
function forceLand() {
  state.riding = false; player.autoTarget = null; destMarker.visible = false;
  const x = player.pos.x, z = player.pos.z;
  if (heightAt(x, z) < 0.6) { const c = roostOf(P); player.pos.set(c.x * 0.9, heightAt(c.x * 0.9, c.z * 0.9), c.z * 0.9); }
  else player.pos.y = heightAt(x, z);
  player.vy = 0; log('🐉 You land'); updateHUD();
}
const _f = new THREE.Vector3();
function updateFlight(dt) {
  const d = dragonOf(P), grown = d.stage === 'grown';
  const sp = (keys.ShiftLeft || keys.ShiftRight ? 1.7 : 1) * (grown ? 34 : 24);
  const cy = Math.cos(player.pitch);
  _f.set(-Math.sin(player.yaw) * cy, Math.sin(player.pitch), -Math.cos(player.yaw) * cy);
  const fw = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0), st = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  if (fw || st) { player.autoTarget = null; destMarker.visible = false; }
  else if (player.autoTarget) {
    const dx = player.autoTarget.x - player.pos.x, dz = player.autoTarget.z - player.pos.z, d = Math.hypot(dx, dz);
    const want = Math.atan2(-dx, -dz); let dy = want - player.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    player.yaw += dy * Math.min(1, dt * 2.5);
    if (d < 3) { player.autoTarget = null; destMarker.visible = false; }
    else { player.pos.x += dx / d * Math.min(d, sp * dt); player.pos.z += dz / d * Math.min(d, sp * dt); }
    const cruise = Math.max(0, heightAt(player.pos.x, player.pos.z)) + (grown ? 45 : 30);
    player.pos.y += (cruise - player.pos.y) * Math.min(1, dt * 1.2);
  }
  player.pos.addScaledVector(_f, fw * sp * dt);
  player.pos.x += Math.cos(player.yaw) * st * sp * 0.6 * dt; player.pos.z -= Math.sin(player.yaw) * st * sp * 0.6 * dt;
  if (keys.Space) player.pos.y += 18 * dt;
  if (keys.KeyC || keys.ControlLeft) player.pos.y -= 22 * dt;
  const g = Math.max(0, heightAt(player.pos.x, player.pos.z));
  player.pos.y = Math.min(g + (grown ? 160 : 70), Math.max(g + 5, player.pos.y));
  const L = Math.hypot(player.pos.x, player.pos.z); if (L > 430) { player.pos.x *= 430 / L; player.pos.z *= 430 / L; }
  camera.position.copy(player.pos); camera.rotation.set(player.pitch, player.yaw, 0);
  if (meAvatar) meAvatar.visible = false;
}

// --- fire breath particles
const fireParts = [], fireGeo = new THREE.IcosahedronGeometry(0.8, 0);
const fireCols = [0xfff07a, 0xffa22a, 0xff5a12];
function breathe(from, to) {
  if (NET.host) NET.fx.push({ seq: ++NET.fxSeq, f: [from.x, from.y, from.z], t: [to.x, to.y, to.z] });   // guests see the fire too
  const dir = to.clone().sub(from), len = dir.length(); dir.normalize();
  for (let i = 0; i < 46; i++) {
    const m = new THREE.Mesh(fireGeo, new THREE.MeshBasicMaterial({ color: fireCols[i % 3], transparent: true, depthWrite: false }));
    m.position.copy(from); m.visible = false; scene.add(m);
    const v = dir.clone().multiplyScalar(len / rr(0.7, 1.0)).add(new THREE.Vector3(rr(-4, 4), rr(-2, 2), rr(-4, 4)));
    fireParts.push({ m, v, delay: i * 0.025, life: 0 });
  }
}
function updateFire(dt) {
  for (let i = fireParts.length - 1; i >= 0; i--) {
    const f = fireParts[i];
    if (f.delay > 0) { f.delay -= dt; continue; }
    f.m.visible = true; f.life += dt;
    f.m.position.addScaledVector(f.v, dt); f.m.scale.setScalar(0.6 + f.life * 4); f.m.material.opacity = Math.max(0, 1 - f.life);
    if (f.life >= 1) { scene.remove(f.m); f.m.material.dispose(); fireParts.splice(i, 1); }
  }
}

// --- dragons in the sky (circling their roost, striking, or carrying you)
const _hp = new THREE.Vector3();
function updateDragons(dt, time) {
  const mine = dragonOf(P);
  state.dragonEye = !!(mine && mine.stage === 'grown' && !mine.restless);
  for (const p of players) {   // friends carrying eggs home (host only)
    if (p.ai || p.id === P || !p.carrying || !p.rpos) continue;
    const c = roostOf(p.id), n = c && nestPos(c);
    if (n && Math.hypot(n.x - p.rpos.x, n.z - p.rpos.z) < 11) {
      p.carrying = false; hatchery(p.id, c);
      tell(p.id, { big: 'THE EGG IS HOME', small: `It needs ${iconsOf(DRAGON_FEED.egg)} at each of the next 3 harvests to hatch`, sfx: 'win' });
      log(`🐦 Ravens report: ${nameOf(p.id)} has a dragon egg in its Roost 🥚`);
    }
  }
  if (state.carrying) {   // deliver a carried egg
    const c = roostOf(P), n = c && nestPos(c);
    if (n && Math.hypot(n.x - player.pos.x, n.z - player.pos.z) < 11) {
      state.carrying = false; carryEgg.visible = false; hatchery(P, c);
      announce('THE EGG IS HOME', `It needs ${iconsOf(DRAGON_FEED.egg)} at each of the next 3 harvests to hatch`); log('🥚 Your egg rests in the Roost'); sfx('win'); updateHUD();
    }
  }
  for (const p of players) {
    const d = p.dragon; if (!d || !d.mesh) continue;
    const g = d.mesh, ud = g.userData, grown = d.stage === 'grown';
    let flap = 3.2;
    const rider = p.id === P && state.riding ? { x: camera.position.x, y: camera.position.y, z: camera.position.z, yaw: player.yaw, pitch: player.pitch }
      : (!p.ai && p.riding && p.rpos) ? p.rpos : null;
    if (rider) {
      const s = g.scale.x;
      g.position.set(rider.x + Math.sin(rider.yaw) * 1.5 * s, rider.y - 7.2 * s, rider.z + Math.cos(rider.yaw) * 1.5 * s);
      g.rotation.set(-(rider.pitch || 0) * 0.6, rider.yaw + Math.PI, 0);
      d.pos.copy(g.position); flap = 4.5;
    } else if (false) {
      const s = g.scale.x;
      // rider sits high behind the head: the neck and horns sit low in view, the world stays visible
      g.position.set(camera.position.x + Math.sin(player.yaw) * 1.5 * s, camera.position.y - 7.2 * s, camera.position.z + Math.cos(player.yaw) * 1.5 * s);
      g.rotation.set(-player.pitch * 0.6, player.yaw + Math.PI, 0);
      d.pos.copy(g.position); flap = 4.5;
    } else {
      const home = nestPos(d.roost);
      let tx, ty, tz;
      if (d.strike) {
        const t = d.strike.t; tx = t.x; tz = t.z; ty = heightAt(t.x, t.z) + 24;
        if (Math.hypot(d.pos.x - tx, d.pos.z - tz) < 8 && !d.strike.breathed) {
          d.strike.breathed = true; ud.head.getWorldPosition(_hp); breathe(_hp.clone(), new THREE.Vector3(tx, heightAt(tx, tz), tz));
        }
        if (d.strike.breathed && (d.strike.timer += dt) > 2.5) d.strike = null;
      } else if (d.restless) { tx = home.x; tz = home.z; ty = home.y + 2; }    // a hungry dragon sulks on its roost
      else {
        d.ang += dt * (grown ? 0.22 : 0.35);
        const r = grown ? 24 : 12; tx = home.x + Math.cos(d.ang) * r; tz = home.z + Math.sin(d.ang) * r; ty = home.y + (grown ? 26 : 12);
      }
      const dx = tx - d.pos.x, dy = ty - d.pos.y, dz = tz - d.pos.z, dist = Math.hypot(dx, dy, dz);
      const sp = Math.min(dist, (d.strike ? 38 : 16) * dt);
      if (dist > 0.01) { d.pos.x += dx / dist * sp; d.pos.y += dy / dist * sp; d.pos.z += dz / dist * sp; }
      if (Math.hypot(dx, dz) > 0.5) g.rotation.y = Math.atan2(dx, dz);
      g.rotation.x = 0;
      g.position.copy(d.pos);
      if (d.restless && dist < 3) flap = 0.4;
    }
    ud.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * Math.sin(time * flap + p.id) * 0.6; });
    ud.tail.forEach((s, i) => { s.rotation.y = Math.sin(time * 1.8 + i * 0.6 + p.id) * 0.12; });
    // dragons are huge: seen from far away, but not across the whole isle (unless you have the Dragon's Eye)
    g.visible = p.id === P || state.dragonEye || Math.hypot(d.pos.x - player.pos.x, d.pos.z - player.pos.z) < 230;
  }
}
function dragonStatus() {
  const me = players[P], d = me.dragon;
  if (!d) {
    if (state.carrying) return '🥚 Carry the egg to your Roost!';
    if (roostOf(P)) return '🥚 Fetch an egg from the Ashen Waste: walk up and press E';
    return '🐉 Dragons: build a Roost beside a Keep (key 4)';
  }
  if (d.stage === 'egg') return `🥚 Egg warming ${d.progress}/3 · eats ${iconsOf(DRAGON_FEED.egg)} each harvest`;
  if (d.stage === 'wyrmling') return `🐲 Wyrmling ${d.progress}/3 · eats ${iconsOf(DRAGON_FEED.wyrmling)} each harvest · F ride`;
  return `🐉 Grown dragon${d.restless ? ' · RESTLESS: needs ' + iconsOf(UPKEEP) : ''} · 🔥 ${d.fireCD ? 'in ' + d.fireCD : 'ready (ride + G)'} · 👁️ Dragon's Eye`;
}

// ---------------------------------------------------------------- day / night
const C = h => new THREE.Color(h);
// t, sky top, horizon, sun colour, sun intensity, hemi sky, hemi ground, hemi intensity, water
const _ca = new THREE.Color(), _cb = new THREE.Color();
function lerpHex(a, b, k, out) { return out.copy(_ca.setHex(a)).lerp(_cb.setHex(b), k); }
const sunAngle = t => t < 0.78 ? t / 0.78 * Math.PI : Math.PI + (t - 0.78) / 0.22 * Math.PI;   // long days, short nights
let dayT = 0.74, dayCount = 1, night = 0, lastTod = null;
// time-of-day rules: dusk market (Guild 3:1), night raids, dawn bounty
function isDusk() { return dayT >= 0.70 && dayT < 0.80; }   // ~48 s
function isNight() { return dayT >= 0.80; }                  // ~96 s
function todAnnounce(tod) {
  if (tod === 'dusk') announce('🌇 DUSK MARKET', 'Until nightfall the Guild trades 3:1 and the houses take any fair deal');
  if (tod === 'night') announce('🌙 NIGHT FALLS', 'Raid rival Hamlets in the dark, but beware their towers and their lords');
  if (tod === 'dawn') announce('🌅 DAWN', 'The next harvest is bountiful: +1 for every Hamlet and Keep');
}
const TOD_KEYS = {"dawn": {"skyTop": "#8E8AA3", "skyHorizon": "#E6CFC8", "fog": "#D9CFD2", "sceneTint": "#F3E6E0", "emberGlow": 0.5, "mistOpacity": 0.9, "stars": 0}, "day": {"skyTop": "#A9A5BA", "skyHorizon": "#EDE6DA", "fog": "#B9B4C6", "sceneTint": "#FFFFFF", "emberGlow": 0.25, "mistOpacity": 0.6, "stars": 0}, "afternoon": {"skyTop": "#9C97AE", "skyHorizon": "#E9DFCF", "fog": "#BDB6C2", "sceneTint": "#F6EEE2", "emberGlow": 0.3, "mistOpacity": 0.5, "stars": 0}, "dusk": {"skyTop": "#5A5070", "skyHorizon": "#C79AA0", "fog": "#8E8AA3", "sceneTint": "#D9C3CC", "emberGlow": 0.8, "mistOpacity": 0.7, "stars": 0.15}, "night": {"skyTop": "#1E1A26", "skyHorizon": "#3A3350", "fog": "#4A4460", "sceneTint": "#8F8BB0", "emberGlow": 1, "mistOpacity": 0.8, "stars": 0.6}, "deep_night": {"skyTop": "#17141E", "skyHorizon": "#2C2740", "fog": "#3A3350", "sceneTint": "#7873A0", "emberGlow": 1, "mistOpacity": 0.9, "stars": 1}};
// when each keyframe holds during the day (dayT 0..1); blends between neighbours are long and soft
const TOD_TIMES = [[0.00, 'dawn'], [0.08, 'day'], [0.50, 'day'], [0.64, 'afternoon'], [0.75, 'dusk'], [0.82, 'night'], [0.91, 'deep_night'], [0.97, 'night'], [1.00, 'dawn']];
const _todC = { top: new THREE.Color(), hor: new THREE.Color(), fog: new THREE.Color(), tint: new THREE.Color() };
function todAt(t) {
  let i = 0; while (TOD_TIMES[i + 1][0] < t) i++;
  const [t0, a] = TOD_TIMES[i], [t1, b] = TOD_TIMES[i + 1], k = smooth(0, 1, (t - t0) / (t1 - t0)), A = TOD_KEYS[a], B = TOD_KEYS[b];
  const mixC = (key, out) => out.set(A[key]).lerp(_cb.set(B[key]), k);
  mixC('skyTop', _todC.top); mixC('skyHorizon', _todC.hor); mixC('fog', _todC.fog); mixC('sceneTint', _todC.tint);
  const num = key => A[key] + (B[key] - A[key]) * k;
  return { ..._todC, ember: num('emberGlow'), mist: num('mistOpacity'), stars: num('stars') };
}
const _sunDir = new THREE.Vector3();
let todNow = null;
function updateDayNight(dt) {
  if (state.phase === 'play' && (!state.paused || NET.online)) { dayT += dt / DAY_LENGTH; if (dayT >= 1) { dayT -= 1; dayCount++; log(`🌅 Dawn of day ${dayCount}`); if (!NET.guest) state.dawnBounty = true; } }
  const T = todNow = todAt(dayT);
  const a = sunAngle(dayT); _sunDir.set(-Math.cos(a) * 0.9, Math.sin(a), 0.42).normalize();
  night = 1 - smooth(-0.12, 0.18, _sunDir.y);
  skyU.top.value.copy(T.top); skyU.horizon.value.copy(T.hor); skyU.sunCol.value.setHex(PAL.bone).multiplyScalar(1 - night);
  skyU.sunDir.value.copy(_sunDir); skyU.moonDir.value.copy(_sunDir).negate(); skyU.night.value = night;
  skyU.bottom.value.setHex(PAL.lavender).multiply(T.tint); skyU.uT.value = performance.now() / 1000;
  inkU.fogCol.value.copy(T.fog); inkU.emberK.value = T.ember;
  inkU.paper.value.setHex(PAL.bone).lerp(_cb.setHex(0x3a3350), night * 0.85);
  // flat washes: the light is the scene tint (multiply); sprites (tokens, plaques) ignore it and stay bone-white
  const lightDir = _sunDir.y > -0.05 ? _sunDir : _sunDir.clone().negate();
  sun.position.copy(lightDir).multiplyScalar(300); sun.color.copy(T.tint); sun.intensity = 1.9;
  hemi.color.copy(T.tint); hemi.groundColor.copy(T.tint).multiplyScalar(0.72); hemi.intensity = 1.35;
  water.material.color.setHex(PAL.lavender);
  cloudMat.color.setRGB(1, 1, 1).lerp(T.hor, 0.35).lerp(T.top, night * 0.6);
  stars.material.opacity = T.stars;
  windowMat.emissiveIntensity = 0.15 + T.ember * 1.6;
  glowMat.opacity = 0.1 + T.ember * 0.85;
  lavaLight.intensity = 80 + T.ember * 160;
  if (state.phase === 'play') {
    const names = [[0.06, '🌅 Dawn'], [0.30, '☀️ Morning'], [0.44, '☀️ Midday'], [0.70, '🌤️ Afternoon'], [0.80, '🌇 Dusk'], [0.97, '🌙 Night'], [1.01, '🌌 Before dawn']];
    $('clock').textContent = `Day ${dayCount} · ${names.find(n => dayT < n[0])[1]}` + (isDusk() ? ' · Guild 3:1' : isNight() ? ' · raids possible' : state.dawnBounty ? ' · bountiful harvest next' : '');
    const tod = isDusk() ? 'dusk' : isNight() ? 'night' : dayT < 0.06 ? 'dawn' : 'day';
    if (tod !== lastTod) { if (lastTod) todAnnounce(tod); lastTod = tod; }
  }
}

// ---------------------------------------------------------------- ONLINE (Milestone 4)
// The host's browser runs the whole game (rules, dice, AI houses, dragons) and sends each friend a
// snapshot 10× a second. Friends ("guests") render the snapshot and send their actions back.
// The Render server (server/server.js) only relays messages inside a room and serves these files.
const NET = { online: false, host: false, guest: false, ws: null, code: null, seats: [], lobby: null, last: null, fx: [], fxSeq: 0, fxSeen: 0, t: 0, deckLeft: 25, name: '', aiFill: 1, prevKey: '' };
const deckCount = () => NET.guest ? NET.deckLeft : deck.length;
const wsSend = m => { if (NET.ws && NET.ws.readyState === 1) NET.ws.send(JSON.stringify(m)); };
const netAct = a => wsSend({ t: 'up', msg: { t: 'act', ...a } });
const seatCid = pid => NET.seats.find(s => s.seat === pid)?.cid;
// send a personal message (log line, announcement, flashes) to one player
function tell(pid, m) {
  if (pid === P) return applyTell(m);
  if (NET.host && players[pid] && !players[pid].ai) { const cid = seatCid(pid); if (cid) wsSend({ t: 'to', cid, msg: { t: 'msg', ...m } }); }
}
function applyTell(m) {
  if (m.log) log(m.log);
  if (m.big) announce(m.big, m.small || '');
  if (m.flash) m.flash.forEach(k => flashRes(k, m.loss));
  if (m.lore) $('loreStatus').textContent = m.lore;
  if (m.raven) $('ravenStatus').textContent = m.raven;
  if (m.startGot) state.startGot = m.startGot;
  if (m.sfx) sfx(m.sfx);
  if (m.daze) knockDown(null, 2);
  if (m.duel != null && !duel && state.phase === 'play') startDuel(m.duel, true);   // an AI lord challenges a friend
}

// ---- the simulation (single player and host)
function simStep(dt, time) {
  updateAI(dt, time); updateDragons(dt, time); updateHumanAvatars(dt);
  if (state.pickFor != null && (state.pickT -= dt) <= 0) {   // a friend took too long with the Horn
    const pid = state.pickFor; state.pickFor = null; sendReavers(pid, aiChooseReaverTile(pid));
  }
  if (state.rolling > 0) {
    state.rolling -= dt;
    runes.forEach((r, i) => { r.material.map = runeTex[1 + Math.floor(Math.random() * 6)]; r.material.rotation += dt * (i ? 9 : -11); });
    if (state.rolling <= 0) {
      resolveHarvest(); state.rollsLeft = (state.rollsLeft || 1) - 1;
      if (state.rollsLeft <= 0) state.dawnBounty = false;   // the bounty lasts one harvest (both casts)
      state.harvestT = state.harvestLen = state.rollsLeft > 0 ? 3 : nextHarvestDelay();   // short pause, then the second cast
    }
  } else {
    state.harvestT -= dt;
    if (state.harvestT <= 0) state.rollsLeft > 0 ? startRoll() : startHarvest();
  }
}
// browsers stop animating hidden tabs: keep the host's world turning anyway
setInterval(() => { if (document.hidden && NET.host && state.phase === 'play') { simStep(0.1, performance.now() / 1000); netTick(0.1); } }, 100);

// friends (and, on guests, every other house) are shown as lords walking the isles
function updateHumanAvatars(dt) {
  for (const p of players) {
    if (p.id === P || !p.avatar || (p.ai && !NET.guest)) continue;
    const src = NET.guest ? p.netPos : p.rpos && { x: p.rpos.x, z: p.rpos.z, ry: p.rpos.yaw + Math.PI };
    if (!src) continue;
    p.pos = p.pos || { x: src.x, z: src.z };
    const k = Math.min(1, dt * 10);
    p.pos.x += (src.x - p.pos.x) * k; p.pos.z += (src.z - p.pos.z) * k;
    const mv = Math.hypot(src.x - p.pos.x, src.z - p.pos.z) > 0.05;
    p.avatar.position.set(p.pos.x, walkHeight(p.pos.x, p.pos.z), p.pos.z);
    p.avatar.rotation.y = src.ry || 0; animateAvatar(p.avatar, mv, performance.now() / 1000);
    p.avatar.userData.egg.visible = !!p.carrying;
    const t = tileAtWorld(p.pos.x, p.pos.z);
    p.avatar.visible = !p.riding && (state.dragonEye || Math.hypot(p.pos.x - player.pos.x, p.pos.z - player.pos.z) < SIGHT + 10 || (t && visible.has(t.id)));
  }
}

// ---- network clock: host sends snapshots, guests send where they are
function netTick(dt) {
  if ((NET.t += dt) < 0.1) return; NET.t = 0;
  if (NET.host && ['setup', 'play', 'won'].includes(state.phase)) {
    if (NET.fx.length > 20) NET.fx.splice(0, NET.fx.length - 20);
    for (const s of NET.seats) if (players[s.seat] && !players[s.seat].ai) wsSend({ t: 'to', cid: s.cid, msg: snapFor(s.seat) });
  }
  if (NET.guest && state.phase === 'play') netAct({ a: 'pos', x: player.pos.x, y: player.pos.y, z: player.pos.z, yaw: player.yaw, pitch: player.pitch, riding: !!state.riding });
}
function snapFor(seat) {
  const posOf = p => p.id === P ? { x: player.pos.x, y: player.pos.y, z: player.pos.z, ry: player.yaw + Math.PI }
    : p.ai ? (p.pos ? { x: p.pos.x, y: 0, z: p.pos.z, ry: p.avatar ? p.avatar.rotation.y : 0 } : null)
    : (p.rpos ? { x: p.rpos.x, y: p.rpos.y, z: p.rpos.z, ry: p.rpos.yaw + Math.PI } : null);
  return {
    t: 'snap',
    st: {
      phase: state.phase, harvestT: state.harvestT, harvestLen: state.harvestLen, rolling: state.rolling, rollNo: state.rollNo, rollsLeft: state.rollsLeft,
      lastRoll: state.lastRoll, rollSeq: state.rollSeq || 0, dice: state.dice || null, hornIdx: state.hornIdx, order: state.order,
      setupQueue: state.setupQueue, setupTurn: state.setupTurn, highwayHolder: state.highwayHolder, hostHolder: state.hostHolder ?? null,
      harvests: state.harvests, dawnBounty: !!state.dawnBounty, reaver: reaverTile.id, pickFor: state.pickFor ?? null, dayT, dayCount, deck: deck.length, winner: state.winner ?? null,
    },
    pl: players.map(p => ({
      id: p.id, res: p.res, built: p.built, longest: p.longest, knights: p.knights, freeRoads: p.freeRoads || 0, playedAt: p.playedAt,
      setupStep: p.setupStep || 0, setupCorner: p.setupCorner ?? null, ai: p.ai,
      scrolls: p.id === seat ? p.scrolls : p.scrolls.map(() => ({ type: 'hidden', boughtAt: 0 })),   // other hands stay secret
      pos: posOf(p), carrying: p.id === P ? !!state.carrying : !!p.carrying, riding: p.id === P ? !!state.riding : !!p.riding,
      dragon: p.dragon ? { stage: p.dragon.stage, progress: p.dragon.progress, restless: p.dragon.restless, fireCD: p.dragon.fireCD, roost: p.dragon.roost.id,
        pos: [p.dragon.pos.x, p.dragon.pos.y, p.dragon.pos.z], ry: p.dragon.mesh ? p.dragon.mesh.rotation.y : 0 } : null,
    })),
    c: corners.map(c => c.building ? [c.building.owner, c.building.type === 'keep' ? 2 : 1, c.roost ?? -1, c.tower ?? -1] : 0),
    e: edges.map(e => e.road ?? -1),
    sc: tiles.map(t => t.scorchedUntil ?? -1),
    eggs: cradleEggs.map(e => e.taken ? 1 : 0),
    fx: NET.fx.slice(-6),
  };
}

// ---- host: apply a friend's action (every rule is checked again here)
const cleanBundle = o => { if (!o || typeof o !== 'object') return null; const r = {}; for (const k of RES_KEYS) { const n = o[k] | 0; if (n < 0 || n > 40) return null; r[k] = n; } return r; };
function hostAct(pid, a) {
  const p = players[pid]; if (!p || p.ai) return;
  const no = msg => tell(pid, { log: '⚠️ ' + msg, sfx: 'bad' });
  switch (a.a) {
    case 'pos':
      p.rpos = { x: +a.x || 0, y: +a.y || 0, z: +a.z || 0, yaw: +a.yaw || 0, pitch: +a.pitch || 0 };
      p.riding = !!a.riding && !!p.dragon && p.dragon.stage !== 'egg' && !p.dragon.restless;
      return;
    case 'build': {
      const t = { kind: a.kind, c: a.c != null ? corners[a.c] : undefined, e: a.e != null ? edges[a.e] : undefined };
      if (!['road', 'hamlet', 'keep', 'roost', 'tower'].includes(t.kind) || (t.kind === 'road' ? !t.e : !t.c)) return;
      if (state.phase === 'setup') {
        if (setupPid() !== pid) return no('Wait for your turn on the war table');
        if (t.kind !== (p.setupStep % 2 === 0 ? 'hamlet' : 'road')) return;
      } else if (state.phase !== 'play') return;
      const prob = problemFor(t.kind, t, pid); if (prob) return no(prob);
      pay(t.kind, pid);
      ({ hamlet: () => buildHamlet(t.c, pid), keep: () => buildKeep(t.c, pid), roost: () => buildRoost(t.c, pid), tower: () => buildTower(t.c, pid), road: () => buildRoad(t.e, pid) })[t.kind]();
      if (state.phase === 'setup') advanceSetup(t, pid); else reportBuild(pid, t);
      refreshMarkers(); updateHUD(); checkWin();
      return;
    }
    case 'guild': {
      const give = cleanBundle(a.give), get = cleanBundle(a.get);
      if (give && get && guildOK(give, get, p.res)) { applyBundle(pid, give, get); tell(pid, { log: `⚖️ Guild trade: ${bundleTxt(give)} → ${bundleTxt(get)}`, flash: RES_KEYS.filter(k => get[k]), sfx: 'build' }); }
      return;
    }
    case 'raven': {
      const give = cleanBundle(a.give), get = cleanBundle(a.get);
      if (give && get && bundleSum(give) && bundleSum(get)) setTimeout(() => ravenDeal(pid, give, get), 1500);
      return;
    }
    case 'duel_result': {   // a friend finished a duel against an AI lord on their screen
      const q = players[a.opp]; if (!q || !q.ai) return;
      if (q.duelWith === pid) q.duelWith = null;
      const w = a.won ? pid : q.id, l = a.won ? q.id : pid;
      endDuelEffects(w, l, applyDuel(w, l, a.yield ? 1 : lootSize(w, l)));
      return;
    }
    case 'raid': {
      const c = corners[a.c], prob = raidProblem(pid, c, p.rpos);
      if (prob) return no(prob);
      raid(pid, c); return;
    }
    case 'toll': {
      const e = edges[a.e];
      if (!e || e.road === null || e.road === pid || !p.rpos) return;
      if (Math.hypot(p.rpos.x - (corners[e.a].x + corners[e.b].x) / 2, p.rpos.z - (corners[e.a].z + corners[e.b].z) / 2) > 9) return no('Stand at the gate to pay');
      if (!payToll(pid, e)) no('You have nothing to pay the toll');
      return;
    }
    case 'duel_human':
      if (players[a.target] && !players[a.target].ai && canDuel(pid, a.target)) autoDuel(pid, a.target);
      return;
    case 'scroll_buy': {
      if (state.phase !== 'play') return;
      if (!buyScroll(pid)) return no('You cannot study a scroll right now');
      log(`📜 ${nameOf(pid)} buys a Lore Scroll`); updateHUD(); checkWin();
      return;
    }
    case 'scroll_play': {
      const c = p.scrolls[a.idx]; if (!c || !canPlay(p, c)) return no('That scroll cannot be played now');
      let arg = a.arg;
      if (c.type === 'harvest' && !(Array.isArray(arg) && arg.length === 2 && arg.every(k => RES[k]))) return;
      if (c.type === 'decree' && !RES[arg]) return;
      if (c.type === 'sellsword' && (!tiles[arg] || tiles[arg] === reaverTile)) arg = null;
      playScroll(pid, a.idx, arg);
      return;
    }
    case 'reaver_pick':
      if (state.pickFor === pid && tiles[a.t] && tiles[a.t] !== reaverTile) { state.pickFor = null; sendReavers(pid, tiles[a.t]); }
      return;
    case 'egg': {
      const e = cradleEggs[a.i];
      if (!e || e.taken || p.dragon || p.carrying || !roostOf(pid) || !p.rpos || Math.hypot(e.x - p.rpos.x, e.z - p.rpos.z) > 8) return no('You cannot take that egg');
      e.taken = true; e.mesh.visible = false; p.carrying = true;
      if (Math.hypot(p.rpos.x - player.pos.x, p.rpos.z - player.pos.z) < SIGHT + 20) log(`👀 ${nameOf(pid)} carries off a dragon egg!`);
      return;
    }
    case 'fire': {
      const t = tiles[a.t], prob = scorchProblem(pid, t); if (prob) return no(prob);
      scorch(pid, t);
      const from = new THREE.Vector3(); p.dragon.mesh.userData.head.getWorldPosition(from);
      breathe(from, new THREE.Vector3(t.x, heightAt(t.x, t.z), t.z)); updateHUD();
      return;
    }
  }
}

// ---- guest: mirror the host's world
function addFlames(t) {
  const g = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const p = placeIn(t, 4, HEX_R * 0.7), f = new THREE.Mesh(new THREE.ConeGeometry(rr(0.8, 1.5), rr(2.5, 4.5), 5), flameMat);
    f.position.set(p.x, p.y + 1.5, p.z); g.add(f);
    const s = new THREE.Sprite(glowMat); s.scale.set(7, 7, 1); s.position.set(p.x, p.y + 2, p.z); g.add(s);
  }
  scene.add(g); t.flames = g; if (t.banner) t.banner.material.color.setHex(0xff6a3a);
}
function removeFlames(t) { scene.remove(t.flames); t.flames = null; if (t.banner) t.banner.material.color.setHex(0xffffff); }
function syncCorner(c, v) {
  if (!v) return;
  const [owner, lvl, roost, tower] = v, type = lvl === 2 ? 'keep' : 'hamlet';
  if (!c.building || c.building.type !== type) {
    if (buildingObjs.get(c.id)) scene.remove(buildingObjs.get(c.id));
    c.building = { owner, type };
    const o = (type === 'keep' ? makeKeep : makeHamlet)(players[owner].house);
    o.traverse(m => { m.castShadow = true; m.receiveShadow = true; }); placeAtCorner(o, c); scene.add(o); buildingObjs.set(c.id, o); popIn(o); refreshJoint(c);
  }
  if (roost >= 0 && c.roost == null) { c.roost = roost; const o = makeRoost(players[roost].house); placeAtCorner(o, c); scene.add(o); popIn(o); }
  if (tower >= 0 && c.tower == null) { c.tower = tower; const o = makeTower(players[tower].house); placeAtCorner(o, c); scene.add(o); popIn(o); }
}
function syncDragon(p, sd) {
  if (!sd) return;
  let d = p.dragon;
  if (!d) d = p.dragon = { roost: corners[sd.roost], mesh: null, egg: null, pos: new THREE.Vector3(...sd.pos), net: new THREE.Vector3(...sd.pos), ry: 0 };
  Object.assign(d, { stage: sd.stage, progress: sd.progress, restless: sd.restless, fireCD: sd.fireCD, ry: sd.ry }); d.net.set(...sd.pos);
  if (d.stage === 'egg' && !d.egg) { d.egg = makeEgg(); d.egg.position.copy(nestPos(d.roost)); d.egg.position.y += 0.4; scene.add(d.egg); }
  if (d.stage !== 'egg') {
    if (d.egg) { scene.remove(d.egg); d.egg = null; }
    if (!d.mesh) { d.mesh = makeDragon(p.house); d.pos.copy(d.net); }
    d.mesh.scale.setScalar(d.stage === 'grown' ? 1 : 0.45);
  }
}
function applySnapshot(s) {
  const prev = NET.last; NET.last = s;
  const st = s.st;
  for (const k of ['harvestT', 'harvestLen', 'rolling', 'rollNo', 'rollsLeft', 'lastRoll', 'hornIdx', 'order', 'setupQueue', 'setupTurn', 'highwayHolder', 'hostHolder', 'harvests', 'pickFor', 'dawnBounty']) state[k] = st[k];
  dayT = st.dayT; dayCount = st.dayCount; NET.deckLeft = st.deck;
  for (const sp of s.pl) {
    const p = players[sp.id]; if (!p) continue;
    Object.assign(p.res, sp.res); Object.assign(p.built, sp.built);
    Object.assign(p, { longest: sp.longest, knights: sp.knights, freeRoads: sp.freeRoads, playedAt: sp.playedAt, setupStep: sp.setupStep, setupCorner: sp.setupCorner, ai: sp.ai, scrolls: sp.scrolls, netPos: sp.pos, carrying: sp.carrying, riding: sp.riding });
    syncDragon(p, sp.dragon);
  }
  state.longest = players[P].longest;
  if (!!state.carrying !== !!s.pl[P].carrying) { state.carrying = s.pl[P].carrying; carryEgg.visible = state.carrying; }
  corners.forEach((c, i) => syncCorner(c, s.c[i]));
  edges.forEach((e, i) => { const r = s.e[i]; if (r >= 0 && e.road === null) { e.road = r; const o = makeRoad(e, players[r].house); scene.add(o); popIn(o); registerGate(o, e); refreshJointsAt(corners[e.a], corners[e.b]); } });
  tiles.forEach((t, i) => { t.scorchedUntil = s.sc[i]; const burning = s.sc[i] >= state.harvests; if (burning && !t.flames) addFlames(t); if (!burning && t.flames) removeFlames(t); });
  if (st.reaver !== reaverTile.id) placeReavers(tiles[st.reaver]);
  cradleEggs.forEach((e, i) => { e.taken = !!s.eggs[i]; e.mesh.visible = !e.taken; });
  for (const f of s.fx) if (f.seq > NET.fxSeen) { NET.fxSeen = f.seq; if (prev) breathe(new THREE.Vector3(...f.f), new THREE.Vector3(...f.t)); }
  if (prev) guestEvents(prev, s);
  if (st.phase !== state.phase) {
    if (st.phase === 'play' && state.phase === 'setup') guestEnterPlay();
    else if (st.phase === 'won') { state.phase = 'won'; showWin(players[st.winner]); }
    else state.phase = st.phase;
  }
  if (state.phase === 'setup') {
    const want = myLandingTurn() ? (players[P].setupStep % 2 === 0 ? 'hamlet' : 'road') : null;
    if (state.mode !== want) setMode(want);
    updateObjective();
  }
  if (st.pickFor === P && !state.reaverPick) { announce('THE WYRM WAKES!', 'You hold the Horn: choose where the Wyrm descends (25 s)'); startReaverPick('raid'); }
  else if (st.pickFor !== P && state.reaverPick && state.reaverReason === 'raid') { state.reaverPick = false; setWarMap(false); updateObjective(); }
  const key = JSON.stringify([state.res, s.c, s.e, state.harvests, state.phase]);
  if (key !== NET.prevKey) { NET.prevKey = key; refreshMarkers(); }
  updateHUD();
}
// a guest works out its own news from what changed between two snapshots
function guestEvents(prev, s) {
  const st = s.st, me = s.pl[P], pm = prev.pl[P];
  const delta = RES_KEYS.map(k => [k, me.res[k] - pm.res[k]]);
  if (st.rollSeq !== prev.st.rollSeq && st.dice) {
    const [d1, d2] = st.dice, sum = d1 + d2;
    runes[0].material.map = runeTex[d1]; runes[1].material.map = runeTex[d2];
    runes.forEach(r => { r.visible = true; r.material.rotation = 0; r.material.needsUpdate = true; });
    clearTimeout(state.runeHide); state.runeHide = setTimeout(() => runes.forEach(r => r.visible = false), 2600);
    if (sum === 7) {
      const lost = delta.filter(([, n]) => n < 0); lost.forEach(([k]) => flashRes(k, true));
      announce('THE WYRM WAKES!', lost.length ? 'They plunder your Hold: ' + lost.map(([k, n]) => `${n} ${RES[k].icon}`).join(' ') : 'The Wyrm stirs');
      log(`🎲 Rune Stones show ${d1} + ${d2} = 7: the Wyrm wakes!`); sfx('raid');
    } else {
      harvestPopups(sum);
      const gain = delta.filter(([, n]) => n > 0); gain.forEach(([k]) => flashRes(k));
      const parts = gain.map(([k, n]) => `+${n} ${RES[k].icon}`);
      announce(`HARVEST ${st.rollNo || 1}/${ROLLS_PER_HARVEST} · ${sum}`, parts.length ? parts.join('  ') : 'Your lands yield nothing this time');
      log(`🎲 Rune Stones show ${d1} + ${d2} = ${sum}` + (parts.length ? ' → ' + parts.join(' ') : ''));
      if ((st.rollNo || 1) === 1) sfx('horn');
    }
  }
  s.c.forEach((v, i) => {
    const pv = prev.c[i]; if (!v || (pv && pv[1] === v[1] && pv[2] === v[2] && pv[3] === v[3])) return;
    const owner = v[0], kind = !pv ? 'hamlet' : pv[1] !== v[1] ? 'keep' : pv[2] !== v[2] ? 'roost' : 'tower';
    if (owner === P) log({ hamlet: '🏘️ Hamlet founded (+1★)', keep: '🏰 Keep raised (+1★)', roost: '🐉 Dragon Roost built: now fetch an egg from the Ashen Waste', tower: '🏹 Scorpion Tower built' }[kind]);
    else if (state.phase === 'play') reportBuild(owner, { kind, c: corners[i] });
    else log(`${nameOf(owner)} lands at ${corners[i].tiles.map(id => tiles[id]).map(t => t.num ? RES[t.type].icon + t.num : '🌋').join(' ')}`);
  });
  s.e.forEach((r, i) => { if (r >= 0 && prev.e[i] < 0) { if (r === P) log('🧱 Wall built'); else if (state.phase === 'play') reportBuild(r, { kind: 'road', e: edges[i] }); } });
  if (st.highwayHolder !== prev.st.highwayHolder && st.highwayHolder != null)
    announce(st.highwayHolder === P ? 'THE GREAT WALL' : 'GREAT WALL SEIZED!', st.highwayHolder === P ? 'Your walls are the longest in Embervale. +2 Renown' : `${nameOf(st.highwayHolder)} now holds the Great Wall (+2★)`);
  if (st.hostHolder !== prev.st.hostHolder && st.hostHolder != null)
    announce(st.hostHolder === P ? 'THE MIGHTIEST HOST' : 'A MIGHTY HOST!', st.hostHolder === P ? 'Your Sellswords are the strongest force. +2 Renown' : `${nameOf(st.hostHolder)} commands the Mightiest Host (+2★)`);
  s.pl.forEach((sp, i) => {
    const pp = prev.pl[i]; if (!pp) return;
    const mine = sp.id === P, was = pp.dragon?.stage, now = sp.dragon?.stage;
    if (now && now !== was) {
      if (now === 'egg' && !mine) log(`🐦 Ravens report: ${nameOf(sp.id)} has a dragon egg in its Roost 🥚`);
      if (now === 'wyrmling') { announce(mine ? 'THE EGG HATCHES!' : 'A DRAGON IS BORN', mine ? 'Your Wyrmling is here (+1★). Press F to ride it!' : `${nameOf(sp.id)} has hatched a Wyrmling (+1★)`); sfx('win'); }
      if (now === 'grown') { announce(mine ? 'DRAGON ASCENDANT!' : 'BEWARE THE SKIES!', mine ? "Your dragon is grown (+2★): Dragonfire (G) and the Dragon's Eye are yours" : `${nameOf(sp.id)}'s dragon is fully grown. Scorpion Towers (key 5) keep its fire away`); sfx('win'); }
    }
    if (mine && sp.dragon && pp.dragon && sp.dragon.restless !== pp.dragon.restless)
      announce(sp.dragon.restless ? 'YOUR DRAGON IS RESTLESS!' : 'YOUR DRAGON IS CALM', sp.dragon.restless ? `It needs ${iconsOf(UPKEEP)}. No riding, fire or Dragon's Eye until fed` : 'Fed again: its powers return');
    if (!mine && sp.knights > pp.knights) log(`⚔️ ${nameOf(sp.id)} plays a Sellsword`);
    if (!mine && sp.scrolls.length > pp.scrolls.length) log(`📜 ${nameOf(sp.id)} buys a Lore Scroll`);
    if (mine && sp.scrolls.length > pp.scrolls.length) {
      const c = sp.scrolls[sp.scrolls.length - 1], S = SCROLLS[c.type];
      if (S) { $('loreStatus').textContent = `📜 You unroll a scroll: ${S.icon} ${S.name}!`; log(`📜 You buy a Lore Scroll: ${S.icon} ${S.name}`); sfx('build'); }
      if (!$('lore').classList.contains('hidden')) renderLore();
    }
    if (mine && sp.scrolls.length < pp.scrolls.length && !$('lore').classList.contains('hidden')) renderLore();
    if (mine && sp.carrying && !pp.carrying) { announce('A DRAGON EGG!', 'Carry it home to your Roost. You walk slower while carrying it'); log('🥚 You lift a dragon egg. Bring it to your Roost!'); }
  });
}
function guestEnterPlay() {
  state.phase = 'play'; setMode(null);
  const got = state.startGot || [];
  announce('THE HOUSES HAVE LANDED', got.length ? 'Your starting supplies: ' + got.join(' ') : 'Let the harvests begin');
  log('🎺 Landing complete. The mist rolls in… explore to reveal the isles.');
  endLanding(); spawnAvatars(); updateHUD(); updateObjective();
}
function guestStep(dt, time) {
  const mine = dragonOf(P);
  state.dragonEye = !!(mine && mine.stage === 'grown' && !mine.restless);
  if (state.riding && (!mine || mine.restless || mine.stage === 'egg')) forceLand();
  if (state.rolling > 0) {
    state.rolling -= dt;
    runes.forEach((r, i) => { r.visible = true; r.material.map = runeTex[1 + Math.floor(Math.random() * 6)]; r.material.rotation += dt * (i ? 9 : -11); });
  }
  for (const p of players) {
    const d = p.dragon; if (!d || !d.mesh) continue;
    const g = d.mesh, ud = g.userData; let flap = 3.2;
    if (p.id === P && state.riding) {
      const s = g.scale.x;
      g.position.set(camera.position.x + Math.sin(player.yaw) * 1.5 * s, camera.position.y - 7.2 * s, camera.position.z + Math.cos(player.yaw) * 1.5 * s);
      g.rotation.set(-player.pitch * 0.6, player.yaw + Math.PI, 0); d.pos.copy(g.position); flap = 4.5;
    } else { d.pos.lerp(d.net, Math.min(1, dt * 8)); g.position.copy(d.pos); g.rotation.set(0, d.ry || 0, 0); if (d.restless) flap = 0.6; }
    ud.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * Math.sin(time * flap + p.id) * 0.6; });
    ud.tail.forEach((s2, i) => { s2.rotation.y = Math.sin(time * 1.8 + i * 0.6 + p.id) * 0.12; });
    g.visible = p.id === P || state.dragonEye || Math.hypot(d.pos.x - player.pos.x, d.pos.z - player.pos.z) < 230;
  }
  updateHumanAvatars(dt);
}

// ---- lobby
function lobbyStatus(t) { $('netStatus').textContent = t; $('lobbyStatus').textContent = t; }
function netConnect(then) {
  if (!/^https?:$/.test(location.protocol)) return lobbyStatus('Online play needs the Kingdom of Dragons server (see the README).');
  lobbyStatus('Connecting…');
  let ws;
  try { ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host); }
  catch (e) { return lobbyStatus('Could not reach the Kingdom of Dragons server.'); }
  NET.ws = ws;
  ws.onopen = then;
  ws.onerror = () => lobbyStatus('Could not reach the Kingdom of Dragons server. Online play works from the game\'s Render link.');
  ws.onmessage = ev => { let m; try { m = JSON.parse(ev.data); } catch { return; } netMsg(m); };
  ws.onclose = () => { if (NET.online && state.phase !== 'won' && state.phase !== 'title') { announce('CONNECTION LOST', 'The link to the other houses was cut'); log('⚠️ Connection to the server lost'); } };
}
const myName = () => ($('netName').value.trim() || 'Lord').slice(0, 16);
$('createBtn').addEventListener('click', () => { NET.name = myName(); netConnect(() => wsSend({ t: 'create', seed })); });
$('joinBtn').addEventListener('click', () => {
  const code = $('joinCode').value.trim().toUpperCase();
  if (!code) return lobbyStatus('Type the code your friend gave you');
  NET.name = myName(); netConnect(() => wsSend({ t: 'peek', code }));
});
if (URLQ.get('join')) {   // opened from an invite link
  $('joinCode').value = URLQ.get('join');
  if (URLQ.get('name')) { $('netName').value = URLQ.get('name'); setTimeout(() => $('joinBtn').click(), 300); }
  else { lobbyStatus('You were invited! Type your name and press JOIN.'); setTimeout(() => $('netName').focus(), 300); }
}
function lobbySeatsList() {
  if (NET.host) return [{ name: NET.name, house: chosen, host: true }, ...NET.seats.map(s => ({ name: s.name, house: s.house }))];
  return NET.lobby ? NET.lobby.seats : [];
}
function renderLobby() {
  const code = NET.host ? NET.code : NET.lobby?.code || NET.code;
  $('lobbyCode').textContent = code || '…';
  $('lobbyLink').textContent = `${location.origin}/?join=${code}`;
  const seats = lobbySeatsList(), aiFill = NET.host ? NET.aiFill : (NET.lobby?.aiFill ?? 1);
  $('lobbySeats').innerHTML = seats.map((s, i) => { const h = HOUSES[s.house]; return `<div class="seat" style="--hc:${h.css}"><span class="sig">${h.sigil}</span><b>${s.name}</b> <span class="muted">${h.name}${s.host ? ' · host' : ''}${!NET.host && i === P ? ' · you' : ''}</span></div>`; }).join('') +
    Array.from({ length: Math.min(aiFill, 4 - seats.length) }, () => '<div class="seat ai"><span class="sig">🤖</span><b>AI house</b> <span class="muted">fills an empty seat</span></div>').join('');
  $('lobbyHost').classList.toggle('hidden', !NET.host);
  $('lobbyGuest').classList.toggle('hidden', NET.host);
  document.querySelectorAll('#aiFill [data-n]').forEach(x => { const n = +x.dataset.n; x.classList.toggle('sel', n === NET.aiFill); x.style.display = n <= 4 - seats.length ? '' : 'none'; });
}
function lobbyBroadcast() {
  const seats = lobbySeatsList();
  wsSend({ t: 'bcast', msg: { t: 'lobby', code: NET.code, seats, aiFill: NET.aiFill } });
  renderLobby();
}
function showLobby() { $('start').classList.add('hidden'); $('lobby').classList.remove('hidden'); renderLobby(); }
$('aiFill').addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (!b || !NET.host) return; NET.aiFill = +b.dataset.n; lobbyBroadcast(); });
$('copyLink').addEventListener('click', () => { navigator.clipboard?.writeText($('lobbyLink').textContent).then(() => lobbyStatus('Invite link copied!'), () => lobbyStatus('Copy the link above by hand')); });
$('lobbyStart').addEventListener('click', () => {
  if (!NET.host) return;
  const seats = [{ id: 0, house: chosen, name: NET.name, ai: false }];
  NET.seats.forEach(s => seats.push({ id: s.seat, house: s.house, name: s.name, ai: false, remote: true }));
  const used = new Set(seats.map(s => s.house));
  shuffle(Object.keys(HOUSES).filter(k => !used.has(k))).slice(0, Math.max(0, Math.min(NET.aiFill, 4 - seats.length)))
    .forEach(k => seats.push({ id: seats.length, house: k, ai: true }));
  if (seats.length < 2) return lobbyStatus('Wait for a friend to join, or add at least one AI house');
  NET.seats.forEach(s => wsSend({ t: 'to', cid: s.cid, msg: { t: 'start', seats, you: s.seat } }));
  wsSend({ t: 'close' });
  startMatch(seats);
});
function netMsg(m) {
  switch (m.t) {
    case 'error': lobbyStatus('✖ ' + m.error); break;
    // --- host side
    case 'created': NET.online = NET.host = true; NET.code = m.code; NET.seats = []; showLobby(); lobbyStatus('Share the code or the link with your friends'); break;
    case 'join': {
      if (state.phase !== 'title' || NET.seats.length >= 3) return;
      const taken = new Set([chosen, ...NET.seats.map(s => s.house)]);
      const free = Object.keys(HOUSES).find(k => !taken.has(k)); if (!free) return;
      const seat = { cid: m.cid, name: m.name, house: free, seat: NET.seats.length + 1 };
      NET.seats.push(seat);
      wsSend({ t: 'to', cid: m.cid, msg: { t: 'welcome', code: NET.code } });
      lobbyBroadcast(); lobbyStatus(`${m.name} joined as ${HOUSES[free].name}`); sfx('build');
      break;
    }
    case 'left': {
      const s = NET.seats.find(x => x.cid === m.cid); if (!s) return;
      if (state.phase === 'title') { NET.seats = NET.seats.filter(x => x !== s); NET.seats.forEach((x, i) => x.seat = i + 1); lobbyBroadcast(); lobbyStatus(`${s.name} left`); return; }
      const p = players[s.seat]; if (!p || p.ai) return;
      Object.assign(p, { ai: true, think: 1, task: null, wander: null, wait: 0, carrying: false, riding: false });
      if (p.rpos) p.pos = { x: p.rpos.x, z: p.rpos.z };
      announce('A LORD DEPARTS', `${s.name} left: an AI steward now rules ${p.house.name}`); log(`👋 ${s.name} left the game; an AI steward takes over`);
      if (state.phase === 'setup' && setupPid() === p.id) {
        if (p.setupStep % 2 === 1) { const e = corners[p.setupCorner].edges.map(id => edges[id]).find(e => e.road === null); if (e) buildRoad(e, p.id); p.setupCorner = null; state.setupTurn++; }
        nextSetupTurn();
      }
      break;
    }
    case 'up': { const s = NET.seats.find(x => x.cid === m.cid); if (s && m.msg && m.msg.t === 'act') hostAct(s.seat, m.msg); break; }
    // --- guest side
    case 'peeked':
      if ((m.seed | 0) !== seed) location.replace(`?seed=${m.seed}&join=${encodeURIComponent(m.code)}&name=${encodeURIComponent(NET.name)}`);   // load the host's world first
      else wsSend({ t: 'join', code: m.code, name: NET.name });
      break;
    case 'welcome': NET.online = NET.guest = true; NET.code = m.code; showLobby(); lobbyStatus('You are in! Waiting for the host to start'); break;
    case 'lobby': NET.lobby = m; renderLobby(); break;
    case 'start': P = m.you; NET.last = null; startMatch(m.seats); break;
    case 'snap': if (NET.guest && state.phase !== 'title') applySnapshot(m); break;
    case 'msg': applyTell(m); break;
    case 'hostgone':
      lobbyStatus('The host left the game.');
      if (state.phase !== 'title') { announce('THE HOST HAS LEFT', 'This game cannot continue without them'); log('⚠️ The host left the game'); }
      break;
  }
}

// ---------------------------------------------------------------- DUELS (face to face)
// When two lords meet, either may challenge the other. Best of 3: Strike beats Feint, Feint beats Block,
// Block beats Strike; a tied round goes to the mightier lord. The winner takes 2 resources (3 if much mightier),
// the loser is knocked down for a moment. Might = 1 + Sellswords played + home ground + a grown dragon.
const DUEL_RANGE = 7;
const MOVES = { strike: { icon: '⚔️', name: 'Strike', beats: 'feint' }, block: { icon: '🛡️', name: 'Block', beats: 'strike' }, feint: { icon: '🌀', name: 'Feint', beats: 'block' } };
let duel = null, duelClock = 0, challengeTarget = null;
const duelCD = {};
const pairKey = (a, b) => a < b ? `${a}-${b}` : `${b}-${a}`;
function lordAt(pid) { const p = players[pid]; if (!p) return null; if (pid === P) return player.pos; if (NET.guest || p.ai) return p.pos; return p.rpos || p.pos; }
function homeGround(pid, at) { const t = at && tileAtWorld(at.x, at.z); return !!t && t.corners.some(cid => owns(corners[cid], pid)); }
function might(pid, at) { const p = players[pid]; return 1 + (p.knights || 0) + (homeGround(pid, at) ? 1 : 0) + (p.dragon && p.dragon.stage === 'grown' ? 1 : 0); }
function canDuel(a, b) {
  return state.phase === 'play' && a !== b && (duelCD[pairKey(a, b)] || 0) <= duelClock
    && !(a === P && state.riding) && !(b === P && state.riding) && !players[a]?.riding && !players[b]?.riding;
}
const lootSize = (w, l) => 2 + (might(w, lordAt(w)) >= might(l, lordAt(l)) + 2 ? 1 : 0);
function applyDuel(w, l, n) {   // the winner takes n random resources from the loser
  const taken = {};
  for (let i = 0; i < n; i++) {
    const pool = RES_KEYS.flatMap(k => Array(Math.max(0, players[l].res[k])).fill(k)); if (!pool.length) break;
    const k = pick(pool); players[l].res[k]--; players[w].res[k]++; taken[k] = (taken[k] || 0) + 1;
  }
  duelCD[pairKey(w, l)] = duelClock + 45;
  return taken;
}
function endDuelEffects(w, l, taken) {
  const loot = bundleTxt(taken), wa = lordAt(w);
  if (wa) floatText(`+${loot}`, wa.x, heightAt(wa.x, wa.z) + 6, wa.z, '#ffe27a');
  const lp = players[l];
  if (lp.ai) { lp.task = null; lp.wander = null; lp.wait = 4; lp.duelWith = null; }
  if (players[w].ai) players[w].duelWith = null;
  if (w !== P) tell(w, { big: 'DUEL WON!', small: `You take ${loot} from ${nameOf(l)}`, flash: RES_KEYS.filter(k => taken[k]), sfx: 'win' });
  if (l !== P) tell(l, { big: 'DUEL LOST', small: `${nameOf(w)} takes ${loot} from you`, flash: RES_KEYS.filter(k => taken[k]), loss: true, sfx: 'raid', daze: true });
  if (w !== P && l !== P) { const t = wa && tileAtWorld(wa.x, wa.z); if (t && visible.has(t.id)) log(`⚔️ ${nameOf(w)} defeats ${nameOf(l)} in a duel nearby`); }
  updateHUD();
}
function knockDown(fromPos, secs = 2) {
  if (fromPos) {
    const dx = player.pos.x - fromPos.x, dz = player.pos.z - fromPos.z, L = Math.hypot(dx, dz) || 1;
    const x = player.pos.x + dx / L * 8, z = player.pos.z + dz / L * 8;
    if (heightAt(x, z) > 0.6) player.pos.set(x, heightAt(x, z), z);
  }
  state.dazeT = secs; player.autoTarget = null; destMarker.visible = false;
}
// you start a fight
function challenge(opp) {
  if (duel || state.phase !== 'play') return;
  if (state.riding) return log('⚠️ Land your dragon first');
  if (!canDuel(P, opp)) return log(`⏳ ${nameOf(opp)} will not fight you again so soon`);
  if (!players[opp].ai) {   // two people: settled by might and luck on the host
    if (NET.guest) netAct({ a: 'duel_human', target: opp }); else autoDuel(P, opp);
    return;
  }
  startDuel(opp, false);
}
function startDuel(opp, challenged) {
  if (duel) return;
  const q = players[opp], qp = lordAt(opp);
  if (!NET.guest) { q.duelWith = P; q.duelT = 30; }
  duel = { opp, wins: [0, 0], rounds: 0, mine: might(P, player.pos), theirs: might(opp, qp), done: false };
  if (qp) {   // face each other
    player.yaw = Math.atan2(player.pos.x - qp.x, player.pos.z - qp.z); player.pitch = -0.05;
    if (q.avatar) q.avatar.rotation.y = Math.atan2(player.pos.x - qp.x, player.pos.z - qp.z);
  }
  player.autoTarget = null; destMarker.visible = false;
  $('duelWho').innerHTML = challenged ? `<b>${nameOf(opp)}</b> blocks your path and draws steel!` : `You challenge <b>${nameOf(opp)}</b>!`;
  $('duelMight').innerHTML = `Your might <b>${duel.mine}</b> · their might <b>${duel.theirs}</b><br><span class="muted">might = 1 + Sellswords + fighting on your own land + a grown dragon</span>`;
  $('duelLog').innerHTML = ''; renderDuel();
  $('duel').classList.remove('hidden'); if (!NET.online) state.paused = true; sfx('raid');
}
function renderDuel(msg) {
  const pip = n => '●'.repeat(n) + '○'.repeat(Math.max(0, 2 - n));
  $('duelScore').innerHTML = `You <span class="pips">${pip(duel.wins[0])}</span> &nbsp;vs&nbsp; <span class="pips">${pip(duel.wins[1])}</span> ${players[duel.opp].house.sigil}`;
  if (msg) { const d = document.createElement('div'); d.innerHTML = msg; $('duelLog').prepend(d); }
  document.querySelectorAll('#duelMoves button, #duelYield').forEach(b => { b.disabled = duel.done; b.style.opacity = duel.done ? 0.4 : 1; });
}
$('duelMoves').addEventListener('click', e => {
  const m = e.target.closest('[data-m]')?.dataset.m; if (!m || !duel || duel.done) return;
  const ai = pick(Object.keys(MOVES)); duel.rounds++;
  const w = MOVES[m].beats === ai ? 0 : MOVES[ai].beats === m ? 1 : duel.mine > duel.theirs ? 0 : duel.theirs > duel.mine ? 1 : -1;
  if (w >= 0) duel.wins[w]++;
  renderDuel(`${MOVES[m].icon} You ${MOVES[m].name.toLowerCase()} · ${MOVES[ai].icon} they ${MOVES[ai].name.toLowerCase()} → ` +
    (w === 0 ? '<b>you win the round</b>' : w === 1 ? '<b>they win the round</b>' : 'even') + (m === ai && w >= 0 ? ' (the mightier lord)' : ''));
  sfx(w === 0 ? 'build' : w === 1 ? 'bad' : 'build');
  if (duel.wins[0] >= 2 || duel.wins[1] >= 2 || duel.rounds >= 6) finishDuel(duel.wins[0] > duel.wins[1] || (duel.wins[0] === duel.wins[1] && duel.mine >= duel.theirs));
});
$('duelYield').addEventListener('click', () => { if (duel && !duel.done) finishDuel(false, true); });
function finishDuel(won, yielded = false) {
  duel.done = true;
  const opp = duel.opp, q = players[opp], qp = lordAt(opp) && { x: lordAt(opp).x, z: lordAt(opp).z };
  let text;
  if (NET.guest) {
    netAct({ a: 'duel_result', opp, won, yield: yielded });
    text = won ? 'VICTORY! Their goods are yours' : yielded ? 'You yield and pay 1 resource' : 'DEFEAT! They take your goods';
  } else {
    q.duelWith = null;
    const w = won ? P : opp, l = won ? opp : P;
    const taken = applyDuel(w, l, yielded ? 1 : lootSize(w, l));
    endDuelEffects(w, l, taken);
    RES_KEYS.forEach(k => taken[k] && flashRes(k, !won));
    text = won ? `VICTORY! You take ${bundleTxt(taken)}` : `${yielded ? 'You yield' : 'DEFEAT'}: they take ${bundleTxt(taken)}`;
  }
  duelCD[pairKey(P, opp)] = duelClock + 45;
  if (!won) knockDown(qp, yielded ? 0.5 : 2);
  renderDuel(`<div class="result ${won ? 'win' : 'lose'}">${text}</div>`);
  log(`⚔️ Duel with ${nameOf(opp)}: ${won ? 'won' : yielded ? 'yielded' : 'lost'}`);
  sfx(won ? 'win' : 'raid');
  setTimeout(() => { $('duel').classList.add('hidden'); duel = null; if (!NET.online) state.paused = false; updateHUD(); refreshMarkers(); }, 2300);
}
// people vs people online, and AI vs AI: might plus luck
function autoDuel(a, b) {
  const sa = might(a, lordAt(a)) + rand() * 3, sb = might(b, lordAt(b)) + rand() * 3;
  const w = sa >= sb ? a : b, l = w === a ? b : a;
  const taken = applyDuel(w, l, lootSize(w, l));
  endDuelEffects(w, l, taken);
  if (w === P) { announce('DUEL WON!', `You take ${bundleTxt(taken)} from ${nameOf(l)}`); RES_KEYS.forEach(k => taken[k] && flashRes(k)); sfx('win'); }
  if (l === P) { announce('DUEL LOST', `${nameOf(w)} takes ${bundleTxt(taken)} from you`); RES_KEYS.forEach(k => taken[k] && flashRes(k, true)); knockDown(lordAt(w)); sfx('raid'); }
}
// AI lords block your way: the more you lead (or the deeper into their land you walk), the likelier a fight
function aiDuelCheck(p, dt) {
  if (p.duelWith != null) { if ((p.duelT -= dt) <= 0) p.duelWith = null; return; }
  if ((p.duelLook = (p.duelLook || 0) - dt) > 0) return;
  p.duelLook = 1;
  for (const h of players) {
    if (h.ai || h === p) continue;
    const hp = lordAt(h.id); if (!hp) continue;
    if (Math.hypot(hp.x - p.pos.x, hp.z - p.pos.z) > 6 || !canDuel(p.id, h.id) || wallBlocks(p.id, p.pos.x, p.pos.z, hp.x, hp.z)) continue;   // safe behind your walls
    if (h.id === P && (duel || state.paused || state.reaverPick)) continue;
    const aggro = 0.25 + (renown(h.id) >= renown(p.id) + 2 ? 0.25 : 0) + (homeGround(p.id, p.pos) ? 0.3 : 0) + (resTotal(h.id) >= 5 ? 0.15 : 0);
    if (rand() > aggro) { duelCD[pairKey(p.id, h.id)] = duelClock + 20; continue; }   // lets you pass this time
    p.duelWith = h.id; p.duelT = 30; p.task = null;
    if (h.id === P) { announce('⚔️ CHALLENGE!', `${nameOf(p.id)} blocks your path!`); startDuel(p.id, true); }
    else tell(h.id, { duel: p.id });
    return;
  }
  for (const q of players) {
    if (!q.ai || q === p || q.duelWith != null || !q.pos) continue;
    if (Math.hypot(q.pos.x - p.pos.x, q.pos.z - p.pos.z) < 5 && canDuel(p.id, q.id) && !wallBlocks(p.id, p.pos.x, p.pos.z, q.pos.x, q.pos.z) && rand() < 0.3) { autoDuel(p.id, q.id); return; }
  }
}
// ---------------------------------------------------------------- NIGHT RAIDS
const RAID_RANGE = 9;
function raidProblem(pid, c, at) {
  if (!isNight()) return 'Raids only work at night';
  if (!c || !c.building || c.building.owner === pid) return 'Pick a rival Hamlet or Keep';
  if (c.raided === dayCount) return 'Already raided tonight';
  if (!at || Math.hypot(at.x - c.x, at.z - c.z) > RAID_RANGE) return 'Get closer to the building';
  const wb = wallBlocks(pid, at.x, at.z, c.x, c.z, true); if (wb && wb.road === c.building.owner) return 'Their wall protects it';
  if ((pid === P && state.riding) || players[pid].riding) return 'Land your dragon first';
  return null;
}
// host / single player: resolve a raid by `pid` on corner `c`
function raid(pid, c) {
  const owner = c.building.owner, where = `${nameOf(owner)}'s ${c.building.type === 'keep' ? 'Keep' : 'Hamlet'}`;
  c.raided = dayCount;
  const op = lordAt(owner);
  const ownerNear = op && Math.hypot(op.x - c.x, op.z - c.z) < 18 && !(owner === P ? state.riding : players[owner].riding);
  const towerSees = [c, ...c.adj.map(id => corners[id])].some(x => x.tower === owner);
  if (ownerNear) {   // caught red-handed: fight it out
    if (pid === P) { announce('CAUGHT!', `${nameOf(owner)} catches you at ${where}. Fight!`); startDuel(owner, true); }
    else if (owner === P) { announce('🌙 THIEF!', `You catch ${nameOf(pid)} raiding your ${c.building.type}. Fight!`); if (players[pid].ai) startDuel(pid, false); else autoDuel(owner, pid); }
    else if (players[owner].ai && !players[pid].ai) { players[owner].duelWith = pid; players[owner].duelT = 30; tell(pid, { big: 'CAUGHT!', small: `${nameOf(owner)} catches you at ${where}. Fight!`, duel: owner }); }
    else if (players[pid].ai && !players[owner].ai) { players[pid].duelWith = owner; players[pid].duelT = 30; tell(owner, { big: '🌙 THIEF!', small: `You catch ${nameOf(pid)} raiding your ${c.building.type}. Fight!`, duel: pid }); }
    else autoDuel(pid, owner);
    return 'caught';
  }
  if (towerSees) {
    if (pid === P) { announce('SPOTTED!', `A Scorpion Tower guards ${where}: the raid fails`); knockDown({ x: c.x, z: c.z }); }
    else tell(pid, { big: 'SPOTTED!', small: `A Scorpion Tower guards ${where}: the raid fails`, daze: true });
    tell(owner, { log: `🏹 Your Scorpion Tower drove off ${nameOf(pid)}'s night raid` });
    return 'tower';
  }
  const pool = RES_KEYS.flatMap(k => Array(Math.max(0, players[owner].res[k])).fill(k));
  if (!pool.length) { tell(pid, { big: '🌙 RAID', small: `${where} has an empty storehouse` }); return 'empty'; }
  const k = pick(pool); players[owner].res[k]--; players[pid].res[k]++;
  floatText(`+1 ${RES[k].icon}`, c.x, c.y + 9, c.z, '#c9b8ff');
  tell(pid, { big: '🌙 RAID!', small: `You steal 1 ${RES[k].icon} from ${where}`, log: `🌙 You steal 1 ${RES[k].icon} from ${where}`, flash: [k], sfx: 'build' });
  tell(owner, { big: '🌙 THIEVES!', small: `${nameOf(pid)} stole 1 ${RES[k].icon} from your ${c.building.type}`, log: `🌙 ${nameOf(pid)} stole 1 ${RES[k].icon} from your ${c.building.type} in the night`, flash: [k], loss: true, sfx: 'raid' });
  if (pid !== P && owner !== P && c.tiles.some(id => visible.has(id))) log(`🌙 ${nameOf(pid)} raids ${where}`);
  updateHUD(); refreshMarkers();
  return 'ok';
}
function tryRaid(c) {
  const prob = raidProblem(P, c, player.pos);
  if (prob) { log('⚠️ ' + prob); sfx('bad'); return; }
  if (NET.guest) { netAct({ a: 'raid', c: c.id }); c.raided = dayCount; return; }
  raid(P, c);
}
let raidTarget = null;
function updateRaid() {
  let best = null, bd = RAID_RANGE;
  if (state.phase === 'play' && isNight() && !duel && !state.riding) for (const c of corners) {
    if (!c.building || c.building.owner === P || c.raided === dayCount) continue;
    const d = Math.hypot(c.x - player.pos.x, c.z - player.pos.z);
    if (d < bd && !raidProblem(P, c, player.pos)) { bd = d; best = c; }
  }
  if (best !== raidTarget) {
    raidTarget = best; $('raidBtn').classList.toggle('hidden', !best);
    if (best) $('raidBtn').innerHTML = `🌙 Raid ${players[best.building.owner].house.sigil} ${best.building.type === 'keep' ? 'Keep' : 'Hamlet'} <span class="muted">(steal 1 · beware towers & lords)</span>`;
  }
}
$('raidBtn').addEventListener('click', () => { if (raidTarget) tryRaid(raidTarget); });
$('tollBtn').addEventListener('click', tryToll);
// AI lords go thieving at night
function aiRaidPlan(p) {
  if (!isNight() || p.carrying || rand() > 0.12) return false;
  const c = corners.filter(c => c.building && c.building.owner !== p.id && c.raided !== dayCount)
    .sort((a, b) => Math.hypot(a.x - p.pos.x, a.z - p.pos.z) - Math.hypot(b.x - p.pos.x, b.z - p.pos.z))[0];
  if (!c || Math.hypot(c.x - p.pos.x, c.z - p.pos.z) > 70) return false;
  p.task = { kind: 'raid', c }; return true;
}

// a "Challenge" button appears when a rival lord stands close to you
function updateChallenge() {
  let best = null, bd = DUEL_RANGE;
  if (state.phase === 'play' && !duel && !state.riding) for (const p of players) {
    if (p.id === P || !p.avatar || !p.avatar.visible || !p.pos) continue;
    const d = Math.hypot(p.pos.x - player.pos.x, p.pos.z - player.pos.z);
    if (d < bd && canDuel(P, p.id) && !wallBlocks(P, player.pos.x, player.pos.z, p.pos.x, p.pos.z)) { bd = d; best = p; }
  }
  const id = best ? best.id : null;
  if (id !== challengeTarget) {
    challengeTarget = id; $('challengeBtn').classList.toggle('hidden', id === null);
    if (best) $('challengeBtn').innerHTML = `⚔️ Challenge ${best.house.sigil} ${!best.ai && best.name ? best.name : best.house.name.replace('House ', '')} <span class="muted">(might ${might(best.id, best.pos)} vs your ${might(P, player.pos)})</span>`;
  }
}
$('challengeBtn').addEventListener('click', () => { if (challengeTarget != null) challenge(challengeTarget); });

// ---------------------------------------------------------------- on-screen D-pad (touch screens)
let dpadOn = matchMedia('(pointer: coarse)').matches;
try { const v = localStorage.getItem('dh-dpad'); if (v) dpadOn = v === 'on'; } catch (_) {}
function setDpad(on) {
  dpadOn = on; try { localStorage.setItem('dh-dpad', on ? 'on' : 'off'); } catch (_) {}
  $('dpad').classList.toggle('hidden', !on); $('btnDpad').classList.toggle('on', on); $('hud').classList.toggle('dpad-on', on);
}
$('btnDpad').addEventListener('click', () => setDpad(!dpadOn));
$('btnView').addEventListener('click', () => { const ks = Object.keys(VIEWS); setView(ks[(ks.indexOf(viewMode) + 1) % ks.length]); });
setView(viewMode);
setDpad(dpadOn);
document.querySelectorAll('#dpad [data-k]').forEach(b => {
  const k = b.dataset.k;
  const on = e => { e.preventDefault(); keys[k] = true; b.classList.add('held'); try { b.setPointerCapture(e.pointerId); } catch (_) {} };
  const off = () => { keys[k] = false; b.classList.remove('held'); };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
});

// title-screen camera orbit
let orbit = 0;
const clock = new THREE.Clock();
function loop() {
  const dt = Math.min(0.05, clock.getDelta()), time = clock.elapsedTime;
  if (state.phase === 'title' || state.phase === 'won' || state.phase === 'setup') {
    orbit += dt * 0.05;
    camera.position.set(Math.sin(orbit) * 210, 85, Math.cos(orbit) * 210);
    camera.lookAt(0, 8, 0);
  } else {
    if (!state.paused) updatePlayer(dt);
    if (state.phase === 'play' && !NET.guest && (NET.online || !state.paused)) simStep(dt, time);
    if (state.phase === 'play' && NET.guest) guestStep(dt, time);
    if (!state.paused) {
      state.recallCD = Math.max(0, state.recallCD - dt);
      if (ravenOffer && (ravenOffer.t -= dt) <= 0) { ravenOffer = null; $('raven').classList.add('hidden'); }
    }
  }
  if (NET.online) netTick(dt);
  // harvest bar
  if (state.phase === 'play') {
    $('harvestLabel').textContent = state.rolling > 0 ? `🎲 The Rune Stones are cast… (${state.rollNo}/${ROLLS_PER_HARVEST})` : state.rollsLeft > 0 ? '🎲 Second cast coming…' :
      `🎺 Next harvest in ${Math.ceil(state.harvestT)}s` + (state.lastRoll ? ` · last roll ${state.lastRoll}` : '');
    $('harvestFill').style.width = (state.rolling > 0 ? 100 : 100 * (1 - state.harvestT / state.harvestLen)) + '%';
    // single player: nothing to build or buy? call the harvest now instead of waiting
    const idle = !NET.online && !state.rolling && !(state.rollsLeft > 0) && state.harvestT > 3 && !state.riding
      && !['road', 'hamlet', 'keep', 'roost', 'tower', 'scroll'].some(k => canAfford(k) && (k === 'scroll' || !limitHit(k)));
    $('hurryBtn').classList.toggle('hidden', !idle);
  } else if (state.phase === 'setup') $('harvestLabel').textContent = 'Landing: found your first two Hamlets';

  updateDayNight(dt); computeVisibility(); applyFogToWorld(dt);
  if (state.phase === 'play') updateAim();
  if (state.phase === 'setup' || state.phase === 'play') drawMinimap();

  // world animation
  const wp = water.geometry.attributes.position, base = water.userData.base;
  for (let i = 0; i < wp.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; wp.array[i * 3 + 1] = Math.sin(x * 0.05 + time) * 0.35 + Math.cos(z * 0.07 + time * 0.8) * 0.35; }
  wp.needsUpdate = true; water.geometry.computeVertexNormals();
  windmills.forEach(b => b.rotation.z += dt * Math.PI * 2 / 10);
  windU.value = time; updateMotes(time); updateAtmosphere(time); updateWyrmFlight(dt, time);
  clouds.forEach(c => { c.position.x += dt * 3; if (c.position.x > 600) c.position.x = -600; });
  const top = heightAt(0, 0) + 2;
  smoke.forEach(s => { s.userData.age += dt * 0.12; if (s.userData.age > 1) s.userData.age = 0; const a = s.userData.age; s.position.set(Math.sin(a * 9 + s.id) * 3 + a * 18, top + a * 45, Math.cos(a * 7 + s.id) * 3); s.scale.setScalar(s.userData.base * (1 + a * 1.5)); s.material.opacity = Math.min(1, a * 6) * (1 - a); });
  cornerSigns.forEach((s, i) => { if (s.g.visible) { s.ring.rotation.y += dt * 0.6; if (s.label.visible) s.label.position.y += Math.sin(time * 2 + i) * 0.004; } });
  const glow = 0.75 + Math.sin(time * 3) * 0.2; signGold.opacity = glow; markGold.opacity = 0.8 + Math.sin(time * 2) * 0.2;
  if (destMarker.visible) destMarker.rotation.z += dt * Math.PI * 2 / 8;
  if (beacon.visible) beacon.material.opacity = 0.22 + Math.sin(time * 2.5) * 0.1;
  for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i]; p.t += dt * 3; const k = Math.min(1, p.t); p.o.scale.setScalar(0.2 + 0.8 * k + Math.sin(k * Math.PI) * 0.2); if (p.t >= 1) { p.o.scale.setScalar(1); pops.splice(i, 1); } }
  for (let i = pulse.length - 1; i >= 0; i--) { const p = pulse[i]; p.t += dt; const s = 5 + Math.sin(Math.min(1, p.t / 1.5) * Math.PI) * 4; p.s.scale.set(s, s * 1.38, 1); if (p.t > 1.5) { p.s.scale.set(5, 6.9, 1); pulse.splice(i, 1); } }
  updateFire(dt); updateFloats(dt); duelClock += dt; updateChallenge(); updateRaid(); updateGates(dt); updateToll();
  if (annTimer > 0) { annTimer -= dt; if (annTimer <= 0) $('announce').classList.remove('show'); }

  inkU.fadeNear.value = 180; inkU.fadeFar.value = 620;
  camera.updateMatrixWorld(); inkU.invProj.value.copy(camera.projectionMatrixInverse); inkU.camWorld.value.copy(camera.matrixWorld);
  renderer.setRenderTarget(inkRT); renderer.render(scene, camera);
  renderer.setRenderTarget(null); renderer.render(inkScene, inkCam);
  requestAnimationFrame(loop);
}
loop();

// debug hooks for automated testing
window.__dh = { get wyrmFly() { return wyrmFly; }, aiRavenOffer, refreshJoint, challenge, startDuel, toggleTrade, setView, buildHamlet, buildKeep, setWarMap, placeReavers, showWin, setDpad, get ravenOffer() { return ravenOffer; }, ownerPass, buildRoad, tollPasses, payToll, wallGates, gatePath, wallBlocks, walkHeight, get dayT() { return dayT; }, isNight, isDusk, raid, guildOK, nextHarvestDelay, keysW: () => !!keys.KeyW, project: (x, z) => { const v = new THREE.Vector3(x, heightAt(x, z) + 0.5, z).project(camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight, front: v.z < 1 }; }, currentGoalTarget: () => currentGoal && currentGoal.target, get dragons() { return players.map(p => p.dragon); }, cradleEggs, tryEgg, toggleRide, dragonfire, scorch, dragonsOnHarvest, buildRoost, buildTower, updateDragons, aiDragonfire, buyScroll, playScroll, get deck() { return deck; }, toggleLore, resolveHarvest, get reaverTile() { return reaverTile; }, players, aiThink, updateAI, sendReavers, finishReaverPick, answerRaven, sendRaven, setDay: t => { dayT = t; }, HOUSES, state, explored, visible, mapTargetAt, tiles, corners, edges, player, tryBuild, setMode, startHarvest, renown, heightAt, checkWin };
