# keycaps

3d mechanical keyboard designer/simulator that runs in your browser. built for [hack club's tagless](https://tagless.hackclub.com/), the whole point is shipping a site with **zero html tags**, so every button, panel, and slider is made with `document.createElement`. the only html in this repo is the empty shell vite needs to boot.

## what it does

- 15 board layouts, from 40% ortho to full-size, plus a 75% with a knob
- click keys to paint them, rename the legends, build your own colorway
- 2D layout editor (drag keys around, it updates live in 3D)
- import/export [KLE](https://www.keyboard-layout-editor.com/) json
- typing test mode
- mechanical keyboard sounds via [MechVibes](https://github.com/hainguyent13/mechvibes) soundpacks (cherry mx, nk creams, holy pandas, topre, etc)
- orbit the camera, screenshot the board, pretend you're buying it

## run it

```bash
npm install
npm run dev
npm run build
```

## credits

- [MechVibes](https://github.com/hainguyent13/mechvibes) by [hainguyent13](https://github.com/hainguyent13) - the sound engine is ported from it and all the key sound packs come from the mechvibes soundpack library. go star it.
- [keyboard-layout-editor](https://www.keyboard-layout-editor.com/) - KLE json format, used for import/export
- Ill link the source when i find it again - used it for different keyboard design inspo.

## license

mit. do whatever. dont blame me if it breaks :).