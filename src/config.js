import { KEYBOARD_GALLERY } from './keyboardGallery.js';

export const LAYOUT_60 = {
  width: 15,
  height: 5,
  layout: [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
    { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 },
    { x: 10, y: 0 }, { x: 11, y: 0 }, { x: 12, y: 0 }, { x: 13, y: 0, w: 2 },
    { x: 0, y: 1, w: 1.5 }, { x: 1.5, y: 1 }, { x: 2.5, y: 1 }, { x: 3.5, y: 1 },
    { x: 4.5, y: 1 }, { x: 5.5, y: 1 }, { x: 6.5, y: 1 }, { x: 7.5, y: 1 },
    { x: 8.5, y: 1 }, { x: 9.5, y: 1 }, { x: 10.5, y: 1 }, { x: 11.5, y: 1 },
    { x: 12.5, y: 1 }, { x: 13.5, y: 1, w: 1.5 },
    { x: 0, y: 2, w: 1.75 }, { x: 1.75, y: 2 }, { x: 2.75, y: 2 }, { x: 3.75, y: 2 },
    { x: 4.75, y: 2 }, { x: 5.75, y: 2 }, { x: 6.75, y: 2 }, { x: 7.75, y: 2 },
    { x: 8.75, y: 2 }, { x: 9.75, y: 2 }, { x: 10.75, y: 2 }, { x: 11.75, y: 2 },
    { x: 12.75, y: 2, w: 2.25 },
    { x: 0, y: 3, w: 2.25 }, { x: 2.25, y: 3 }, { x: 3.25, y: 3 }, { x: 4.25, y: 3 },
    { x: 5.25, y: 3 }, { x: 6.25, y: 3 }, { x: 7.25, y: 3 }, { x: 8.25, y: 3 },
    { x: 9.25, y: 3 }, { x: 10.25, y: 3 }, { x: 11.25, y: 3 }, { x: 12.25, y: 3, w: 2.75 },
    { x: 0, y: 4, w: 1.25 }, { x: 1.25, y: 4, w: 1.25 }, { x: 2.5, y: 4, w: 1.25 },
    { x: 3.75, y: 4, w: 6.25 }, { x: 10, y: 4, w: 1.25 }, { x: 11.25, y: 4, w: 1.25 },
    { x: 12.5, y: 4, w: 1.25 }, { x: 13.75, y: 4, w: 1.25 }
  ]
};

export const KEYMAP_60 = [
  'KC_GESC', 'KC_1', 'KC_2', 'KC_3', 'KC_4', 'KC_5', 'KC_6', 'KC_7', 'KC_8', 'KC_9',
  'KC_0', 'KC_MINS', 'KC_EQL', 'KC_BSPC',
  'KC_TAB', 'KC_Q', 'KC_W', 'KC_E', 'KC_R', 'KC_T', 'KC_Y', 'KC_U', 'KC_I', 'KC_O',
  'KC_P', 'KC_LBRC', 'KC_RBRC', 'KC_BSLS',
  'KC_CAPS', 'KC_A', 'KC_S', 'KC_D', 'KC_F', 'KC_G', 'KC_H', 'KC_J', 'KC_K', 'KC_L',
  'KC_SCLN', 'KC_QUOT', 'KC_ENT',
  'KC_LSFT', 'KC_Z', 'KC_X', 'KC_C', 'KC_V', 'KC_B', 'KC_N', 'KC_M', 'KC_COMM',
  'KC_DOT', 'KC_SLSH', 'KC_RSFT',
  'KC_LCTL', 'KC_LGUI', 'KC_LALT', 'KC_SPC', 'KC_RALT', 'KC_RGUI', 'MO(1)', 'KC_RCTL'
];

export const ALPHAS = [
  'KC_Q', 'KC_W', 'KC_E', 'KC_R', 'KC_T', 'KC_Y', 'KC_U', 'KC_I', 'KC_O', 'KC_P',
  'KC_A', 'KC_S', 'KC_D', 'KC_F', 'KC_G', 'KC_H', 'KC_J', 'KC_K', 'KC_L',
  'KC_Z', 'KC_X', 'KC_C', 'KC_V', 'KC_B', 'KC_N', 'KC_M'
];

export const MODS = [
  'KC_BSPC', 'KC_TAB', 'KC_ENT', 'KC_LCTL', 'KC_RCTL', 'KC_LSFT', 'KC_RSFT',
  'KC_LALT', 'KC_RALT', 'KC_LGUI', 'KC_RGUI', 'KC_SPC', 'KC_CAPS', 'KC_APP',
  'MO(1)', 'MO(2)', 'MO(3)', 'MO(4)'
];

// browser keycodes -> qmk
export const QMK_CODES = {
  Digit0: 'KC_0', Digit1: 'KC_1', Digit2: 'KC_2', Digit3: 'KC_3', Digit4: 'KC_4',
  Digit5: 'KC_5', Digit6: 'KC_6', Digit7: 'KC_7', Digit8: 'KC_8', Digit9: 'KC_9',
  KeyQ: 'KC_Q', KeyW: 'KC_W', KeyE: 'KC_E', KeyR: 'KC_R', KeyT: 'KC_T',
  KeyY: 'KC_Y', KeyU: 'KC_U', KeyI: 'KC_I', KeyO: 'KC_O', KeyP: 'KC_P',
  KeyA: 'KC_A', KeyS: 'KC_S', KeyD: 'KC_D', KeyF: 'KC_F', KeyG: 'KC_G',
  KeyH: 'KC_H', KeyJ: 'KC_J', KeyK: 'KC_K', KeyL: 'KC_L',
  KeyZ: 'KC_Z', KeyX: 'KC_X', KeyC: 'KC_C', KeyV: 'KC_V', KeyB: 'KC_B',
  KeyN: 'KC_N', KeyM: 'KC_M',
  Escape: 'KC_ESC', Minus: 'KC_MINS', Equal: 'KC_EQL', Backspace: 'KC_BSPC',
  Tab: 'KC_TAB', BracketLeft: 'KC_LBRC', BracketRight: 'KC_RBRC', Enter: 'KC_ENT',
  ControlLeft: 'KC_LCTL', Semicolon: 'KC_SCLN', Quote: 'KC_QUOT',
  Backquote: 'KC_GESC', ShiftLeft: 'KC_LSFT', Backslash: 'KC_BSLS',
  Comma: 'KC_COMM', Period: 'KC_DOT', Slash: 'KC_SLSH', ShiftRight: 'KC_RSFT',
  AltLeft: 'KC_LALT', Space: 'KC_SPC', CapsLock: 'KC_CAPS',
  ControlRight: 'KC_RCTL', AltRight: 'KC_RALT',
  MetaLeft: 'KC_LGUI', MetaRight: 'KC_RGUI', ContextMenu: 'KC_APP',
  ArrowUp: 'KC_UP', ArrowLeft: 'KC_LEFT', ArrowRight: 'KC_RGHT', ArrowDown: 'KC_DOWN',
  Insert: 'KC_INS', Delete: 'KC_DEL', Home: 'KC_HOME', End: 'KC_END',
  PageUp: 'KC_PGUP', PageDown: 'KC_PGDN',
  PrintScreen: 'KC_PSCR', ScrollLock: 'KC_SLCK', Pause: 'KC_PAUSE',
  F1: 'KC_F1', F2: 'KC_F2', F3: 'KC_F3', F4: 'KC_F4', F5: 'KC_F5',
  F6: 'KC_F6', F7: 'KC_F7', F8: 'KC_F8', F9: 'KC_F9', F10: 'KC_F10',
  F11: 'KC_F11', F12: 'KC_F12',
  Numpad0: 'KC_P0', Numpad1: 'KC_P1', Numpad2: 'KC_P2', Numpad3: 'KC_P3',
  Numpad4: 'KC_P4', Numpad5: 'KC_P5', Numpad6: 'KC_P6', Numpad7: 'KC_P7',
  Numpad8: 'KC_P8', Numpad9: 'KC_P9', NumpadDecimal: 'KC_PDOT',
  NumpadAdd: 'KC_PPLS', NumpadSubtract: 'KC_PMNS', NumpadMultiply: 'KC_PAST',
  NumpadDivide: 'KC_PSLS', NumpadEnter: 'KC_PENT', NumLock: 'KC_NLCK'
};

// text legends
export const LEGENDS = {
  KC_GESC: 'Esc', KC_ESC: 'Esc',
  KC_1: '1', KC_2: '2', KC_3: '3', KC_4: '4', KC_5: '5',
  KC_6: '6', KC_7: '7', KC_8: '8', KC_9: '9', KC_0: '0',
  KC_MINS: '-', KC_EQL: '=', KC_BSPC: 'Backspace',
  KC_TAB: 'Tab', KC_Q: 'Q', KC_W: 'W', KC_E: 'E', KC_R: 'R', KC_T: 'T',
  KC_Y: 'Y', KC_U: 'U', KC_I: 'I', KC_O: 'O', KC_P: 'P',
  KC_LBRC: '[', KC_RBRC: ']', KC_BSLS: '\\',
  KC_CAPS: 'Caps', KC_A: 'A', KC_S: 'S', KC_D: 'D', KC_F: 'F', KC_G: 'G',
  KC_H: 'H', KC_J: 'J', KC_K: 'K', KC_L: 'L',
  KC_SCLN: ';', KC_QUOT: "'", KC_ENT: 'Enter',
  KC_LSFT: 'Shift', KC_Z: 'Z', KC_X: 'X', KC_C: 'C', KC_V: 'V', KC_B: 'B',
  KC_N: 'N', KC_M: 'M', KC_COMM: ',', KC_DOT: '.', KC_SLSH: '/', KC_RSFT: 'Shift',
  KC_LCTL: 'Ctrl', KC_LGUI: 'Win', KC_LALT: 'Alt', KC_SPC: '',
  KC_RALT: 'Alt', KC_RGUI: 'Win', 'MO(1)': 'Fn', KC_RCTL: 'Ctrl',
  KC_GRV: '`', KC_DEL: 'Del', KC_INS: 'Ins',
  KC_HOME: 'Home', KC_END: 'End', KC_PGUP: 'PgUp', KC_PGDN: 'PgDn',
  KC_PSCR: 'PSc', KC_SLCK: 'SLk', KC_NUBS: '\\', KC_NUHS: '#',
  KC_APP: 'App', KC_NO: '',
  KC_UP: 'Up', KC_DOWN: 'Dn', KC_LEFT: 'Lf', KC_RGHT: 'Rt',
  KC_F1: 'F1', KC_F2: 'F2', KC_F3: 'F3', KC_F4: 'F4', KC_F5: 'F5',
  KC_F6: 'F6', KC_F7: 'F7', KC_F8: 'F8', KC_F9: 'F9', KC_F10: 'F10',
  KC_F11: 'F11', KC_F12: 'F12', KC_PAUS: 'Pau',
  KC_PSLS: '/', KC_PAST: '*', KC_PMNS: '-', KC_PPLS: '+', KC_PDOT: '.',
  KC_P0: '0', KC_P1: '1', KC_P2: '2', KC_P3: '3', KC_P4: '4',
  KC_P5: '5', KC_P6: '6', KC_P7: '7', KC_P8: '8', KC_P9: '9',
  KC_PENT: 'Ent', KC_NLCK: 'Num',
  'MO(2)': 'Fn2', 'MO(3)': 'Fn3', 'MO(4)': 'Fn4'
};

// colorways
export const COLORWAYS = {
  carbon: {
    id: 'carbon',
    label: 'Carbon',
    swatches: {
      base: { background: '#e3d9c6', color: '#575d5e' },
      mods: { background: '#575d5e', color: '#ed6b21' },
      accent: { background: '#ed6b21', color: '#575d5e' }
    },
    override: { KC_ENT: 'accent', KC_ESC: 'accent', KC_GESC: 'accent' }
  },
  modern_dolch: {
    id: 'modern_dolch',
    label: 'Modern Dolch',
    swatches: {
      base: { background: '#777b7e', color: '#e7e7e8' },
      mods: { background: '#505356', color: '#e7e7e8' },
      accent: { background: '#79d1c7', color: '#e7e7e8' },
      accent2: { background: '#ac5160', color: '#e7e7e8' }
    },
    override: {
      KC_SPC: 'base', KC_ENT: 'accent2', KC_ESC: 'accent', KC_GESC: 'accent'
    }
  },
  olivia: {
    id: 'olivia',
    label: 'Olivia',
    swatches: {
      base: { background: '#e1dbd1', color: '#2b2b2b' },
      mods: { background: '#2b2b2b', color: '#f1beb0' },
      accent: { background: '#f1beb0', color: '#2b2b2b' }
    },
    override: { KC_ENT: 'accent', KC_ESC: 'accent', KC_GESC: 'accent' }
  },
  8008: {
    id: '8008',
    label: '8008',
    swatches: {
      base: { background: '#747e92', color: '#0e1415' },
      mods: { background: '#2b313f', color: '#da526e' },
      accent: { background: '#da526e', color: '#0e1415' }
    },
    override: {
      KC_SPC: 'base', KC_ENT: 'accent', KC_ESC: 'accent', KC_GESC: 'accent'
    }
  },
  nord: {
    id: 'nord',
    label: 'Nord',
    swatches: {
      base: { background: '#445163', color: '#889fb0' },
      mods: { background: '#2b303e', color: '#889fb0' },
      accent: { background: '#2b303e', color: '#71b5d1' },
      accent2: { background: '#2b303e', color: '#b1575f' },
      accent3: { background: '#2b303e', color: '#e1c38b' },
      accent4: { background: '#2b303e', color: '#77997d' },
      accent5: { background: '#2b303e', color: '#aa83a4' }
    },
    override: {
      KC_ESC: 'mods', KC_GESC: 'mods', KC_CAPS: 'accent2', KC_ENT: 'accent2',
      KC_LGUI: 'accent2', KC_RGUI: 'accent2', KC_TAB: 'accent3', KC_RALT: 'accent3',
      KC_RCTL: 'accent4', KC_LCTL: 'accent4', KC_LALT: 'accent5', KC_BSPC: 'accent5'
    }
  },
  1976: {
    id: '1976',
    label: '1976',
    swatches: {
      base: { background: '#6a3c1a', color: '#5dceba' },
      mods: { background: '#6a3c1a', color: '#5dceba' },
      accent: { background: '#e66701', color: '#ffffff' },
      accent2: { background: '#da3510', color: '#ffffff' },
      accent3: { background: '#5dceba', color: '#6a3c1a' },
      accent4: { background: '#e1ba43', color: '#6a3c1a' }
    },
    override: {
      KC_C: 'accent4', KC_F: 'accent4', KC_T: 'accent4', KC_6: 'accent4',
      KC_R: 'accent', KC_D: 'accent', KC_X: 'accent', KC_5: 'accent',
      KC_LALT: 'accent', KC_Z: 'accent2', KC_S: 'accent2', KC_E: 'accent2',
      KC_4: 'accent2', KC_LGUI: 'accent2', KC_LCTL: 'accent3', KC_ESC: 'accent3',
      KC_GESC: 'accent3', KC_LSFT: 'accent3', KC_TAB: 'accent3', KC_CAPS: 'accent3',
      KC_Q: 'accent3', KC_A: 'accent3', KC_W: 'accent3', KC_1: 'accent3',
      KC_2: 'accent3', KC_3: 'accent3'
    }
  }
};

for (const id of Object.keys(KEYBOARD_GALLERY)) {
  if (!COLORWAYS[id]) COLORWAYS[id] = KEYBOARD_GALLERY[id];
}

// defaults
export const DEFAULTS = {
  testing: false,
  sceneColor: '#3a3a41',
  caseColor: '#F8C200',
  caseMaterial: 'matte',
  caseBezel: 0.5,
  caseCorners: 'rounded',
  caseHeight: 1,
  legendStyle: 'topleft',
  legends: false,
  activeBackground: '#51cf59',
  activeColor: '#ffffff',
  colorway: 'carbon',
  soundPack: 'default-turquoise',
  board: '60'
};

// custom colorways, saved in localStorage
const CUSTOM_KEY = 'keycaps-custom-colorways';

export function loadCustomColorways() {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    for (const cw of arr) COLORWAYS[cw.id] = cw;
    return arr;
  } catch {
    return [];
  }
}

export function saveCustomColorway(cw) {
  const arr = loadCustomColorways();
  const idx = arr.findIndex((c) => c.id === cw.id);
  if (idx >= 0) arr[idx] = cw;
  else arr.push(cw);
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(arr));
  } catch { /* storage full or blocked - keep in memory only */ }
  COLORWAYS[cw.id] = cw;
}

export function deleteCustomColorway(id) {
  const arr = loadCustomColorways().filter((c) => c.id !== id);
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(arr));
  } catch { /* ignore */ }
  delete COLORWAYS[id];
}