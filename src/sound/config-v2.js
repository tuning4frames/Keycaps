// soundpack config v2
// the newer one. actually has features, wow, i can actually code

import { Howl } from 'howler';
import { keycodesRemap, keycodesFill } from './keycodes.js';

export class SoundpackConfigV2 {
  constructor(config, meta) {
    this.name = config.name ?? null;
    this.key_define_type = config.key_define_type ?? null;
    this.sound = config.sound ?? null;
    this.soundup = config.soundup ?? null;
    this.defines = config.defines ?? null;

    this.pack_id = meta.pack_id ?? null;
    this.group = meta.group ?? null;
    this.abs_path = meta.abs_path ?? null;

    for (const key in this) {
      if (this[key] === null) {
        throw new Error('SoundpackConfig: Missing required property: ' + key);
      }
    }

    // pick the random file ranges now so each load is different
    Object.keys(keycodesFill(this.defines)).map((kc) => {
      const upkey = kc + '-up';
      const downkey = kc;

      const setSound = (sound, key) => {
        if (sound && sound.indexOf('{') >= 0) {
          const range = sound.match(/\{(.+?)\}/g)[0];
          const range_values = range.replace('{', '').replace('}', '').split('-');
          const random_number = Math.floor(
            Math.random() * (range_values[1] - range_values[0] + 1) + range_values[0]
          );
          sound = sound.replace(range, random_number);
        }
        this.defines[key] = sound;
      };

      setSound(this.defines[downkey] ?? this.sound, downkey);
      setSound(this.defines[upkey] ?? this.soundup, upkey);
    });

    this.version = 2;
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
      keycode = keycode + '-up';
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