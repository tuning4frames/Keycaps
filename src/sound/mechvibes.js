// sound engine
// ported from mechvibes, packs load over http

import { Howler } from 'howler';
import { SoundpackConfigV1 } from './config-v1.js';
import { SoundpackConfigV2 } from './config-v2.js';
import { BROWSER_TO_MV } from './mv-browser-codes.js';

export class MechVibes {
  constructor() {
    this.packs = [];
    this.current_pack = null;
    this.pressed_keys = {};
    this.enabled = false;
    this.volume = 0.8;
    this.loading = null;
    // if we lose focus (alt-tab etc) clear stuck keys so sounds unmute
    window.addEventListener('blur', () => {
      this.pressed_keys = {};
    });
  }

  async loadPacks() {
    const res = await fetch('./audio/packs.json');
    const folders = await res.json();

    const loaded = [];
    for (const folder of folders) {
      try {
        const cres = await fetch('./audio/' + folder + '/config.json');
        if (!cres.ok) {
          console.warn('Failed to load config.json: ' + folder);
          continue;
        }
        const config_json = await cres.json();
        const meta = {
          pack_id: 'default-' + folder,
          group: 'Default',
          abs_path: './audio/' + folder
        };
        let pack = null;
        if (config_json.version === undefined) {
          pack = new SoundpackConfigV1(config_json, meta);
        } else {
          try {
            if (config_json.version === 2) {
              pack = new SoundpackConfigV2(config_json, meta);
            } else {
              console.warn('Unsupported config version (' + config_json.version + '): ' + folder);
              continue;
            }
          } catch (e) {
            console.warn('Failed to construct soundpack: ' + folder, e);
            continue;
          }
        }
        loaded.push(pack);
      } catch (e) {
        console.warn('Failed to load soundpack: ' + folder, e);
      }
    }
    this.packs = loaded;
    return loaded;
  }

  getPack(pack_id) {
    return this.packs.find((p) => p.pack_id === pack_id);
  }

  // unload all, load new one
  loadPack(pack) {
    this.unloadAllPacks();
    this.loading = pack
      .LoadSounds()
      .then(() => {
        this.current_pack = pack;
      })
      .catch((e) => {
        console.warn('Failed to load pack', e);
      });
    return this.loading;
  }

  unloadAllPacks() {
    for (const pack of this.packs) {
      if (pack.audio !== undefined) pack.UnloadSounds();
    }
  }

  // play
  playSound(event, volume) {
    if (this.current_pack === null || this.current_pack.audio === undefined) {
      return; // sound for this pack hasn't been loaded
    }
    Howler.masterGain.gain.setValueAtTime(Number(volume), Howler.ctx.currentTime);
    if (this.current_pack.HandleEvent !== undefined) {
      this.current_pack.HandleEvent(event, volume);
    }
  }

  // keydown, no repeat spam
  handleKeydown(mvKeycode) {
    if (
      this.pressed_keys[mvKeycode] !== undefined &&
      this.pressed_keys[mvKeycode]
    ) {
      return;
    }
    this.pressed_keys[mvKeycode] = true;
    this.playSound({ type: 'keydown', keycode: mvKeycode }, this.volume);
  }

  // keyup
  handleKeyup(mvKeycode) {
    this.pressed_keys[mvKeycode] = false;
    this.playSound({ type: 'keyup', keycode: mvKeycode }, this.volume);
  }

  setVolume(v) {
    this.volume = v;
    if (Howler.ctx) {
      Howler.masterGain.gain.setValueAtTime(Number(v), Howler.ctx.currentTime);
    }
  }

  // remove old listeners
  unbindBrowserEvents() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  // browser events. keyFilter = only play for keys it allows
  bindBrowserEvents(keyFilter) {
    this.unbindBrowserEvents(); // avoid duplicate listeners on rebind
    this.onKeyDown = (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (keyFilter && !keyFilter(e)) return;
      const keycode = BROWSER_TO_MV[e.code];
      if (keycode) {
        this.handleKeydown(keycode);
      }
    };
    this.onKeyUp = (e) => {
      if (keyFilter && !keyFilter(e)) return;
      const keycode = BROWSER_TO_MV[e.code];
      if (keycode) {
        this.handleKeyup(keycode);
      }
    };
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }
}