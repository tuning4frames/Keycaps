const PREFIX = 'custom_dinnerbone';

function isDinnerbone(cw) {
  return !!cw && (cw.flip === true || (!!cw.id && cw.id.indexOf(PREFIX) === 0));
}

export function attachDinnerbone(app) {
  app.viewport.style.transform = '';
  app.sm.onUpdate(() => {
    const want = isDinnerbone(app.colorway);
    const z = want ? Math.PI : 0;
    const s = want ? 1 : -1;
    const kg = app.keys.group;
    kg.rotation.z = z;
    kg.position.x = s * app.keys.layout.width / 2;
    const cg = app.caseMgr.group;
    cg.rotation.z = z;
    cg.position.x = s * app.caseMgr.layout.width / 2;
  });
}