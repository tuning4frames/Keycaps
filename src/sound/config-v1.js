// soundpack config v1
// one file + howler sprites, grandpa format T-T

import { Howl } from 'howler';
import { keycodesRemap } from './keycodes.js';

export class SoundpackConfigV1 {
  constructor(config, meta) {
    this.name = config.name ?? null;
    this.key_define_type = config.key_define_type ?? null;
    this.includes_numpad = config.includes_numpad ?? null;
    this.sound = config.sound ?? null;
    this.defines = config.defines ?? null;

    this.pack_id = meta.pack_id ?? null;
    this.group = meta.group ?? null;
    this.abs_path = meta.abs_path ?? null;

    for (const key in this) {
      if (this[key] === null) {
        throw new Error('SoundpackConfig: Missing required property: ' + key);
      }
    }

    this.version = 1;
  }

  LoadSounds() {
    return new Promise((resolve, reject) => {
      const beforeReject = (e) => {
        if (this.key_define_type === 'single') {
          if (this.audio) {
            this.audio.unload();
            delete this.audio;
          }
        } else if (this.key_define_type === 'multi') {
          if (this.audio) {
            Object.keys(this.audio).map((kc) => this.audio[kc].unload());
            delete this.audio;
          }
        }
        reject(e);
      };
      const timeout = setTimeout(() => {
        beforeReject('The soundpack took too long to load.');
      }, 5000);

      const wait = (audio) => {
        return new Promise((res, rej) => {
          if (audio.state() === 'loaded') {
            res();
          } else {
            audio.once('load', () => res());
            audio.once('loaderror', (e) => rej(e));
          }
        });
      };

      if (this.key_define_type === 'single') {
        const sound = this.abs_path + '/' + this.sound;
        const sound_data = { src: [sound], sprite: keycodesRemap(this.defines) };
        const audio = new Howl(sound_data);
        wait(audio)
          .then(() => {
            clearTimeout(timeout);
            this.audio = audio;
            resolve();
          })
          .catch((e) => beforeReject(e));
      } else if (this.key_define_type === 'multi') {
        let sound_data = {};
        Object.keys(this.defines).map((kc) => {
          if (this.defines[kc]) {
            sound_data[kc] = { src: [this.abs_path + '/' + this.defines[kc]] };
          }
        });
        this.audio = {};
        sound_data = keycodesRemap(sound_data);
        Object.keys(sound_data).map((kc) => {
          const audio = new Howl(sound_data[kc]);
          wait(audio)
            .then(() => {
              clearTimeout(timeout);
              this.audio[kc] = audio;
              resolve();
            })
            .catch((e) => beforeReject(e));
        });
      } else {
        beforeReject('Invalid key_define_type');
      }
    });
  }

  HandleEvent(event) {
    let keycode = event.keycode;
    if (event.type === 'keyup') {
      // v1 doesn't support keyup sounds
      return;
    }
    const sound_id = 'keycode-' + keycode;
    const play_type = this.key_define_type ? this.key_define_type : 'single';
    const sound = play_type === 'single' ? this.audio : this.audio[sound_id];
    if (!sound) return;

    if (play_type === 'single') {
      sound.play(sound_id);
    } else {
      sound.play();
    }
  }

  UnloadSounds() {
    if (this.audio) {
      if (this.key_define_type === 'single') {
        this.audio.unload();
        delete this.audio;
      } else if (this.key_define_type === 'multi') {
        Object.keys(this.audio).map((kc) => this.audio[kc].unload());
        delete this.audio;
      }
    }
  }
}