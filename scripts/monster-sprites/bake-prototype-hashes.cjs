// Bakes every frame of every sprite in the monster-arena prototype (with stub canvases) and prints
// sprite-frames.golden.ts, the hashes sprite-registry.test.ts checks the TypeScript port against.
// Run only on purpose, after changing a sprite in both places:
//   node scripts/monster-sprites/bake-prototype-hashes.cjs > src/pages/project/tamagotchi/sprites/sprite-frames.golden.ts
// then `yarn prettier --write` that file and check that only the changed sprite's hashes moved.
/* eslint-disable */
const fs=require('fs'),path=require('path');
const dir=process.argv[2]||path.join(__dirname,'../../docs/tamagotchi/prototypes/monster-arena');
const files=['engine.js','sprites/fire.js','sprites/water.js','sprites/leaf.js','sprites/raid-bitmaps.js','sprites/raid.js','sprites/adventure-bitmaps.js','sprites/adventure.js','sprites/hybrid-bitmaps.js','sprites/hybrid.js','sprites/earth.js','sprites/bolt.js','sprites/bolt-new-bitmaps.js','sprites/bolt-new.js','sprites/holy.js','sprites/dark.js','sprites/shadow.js'];
const core=fs.readFileSync(path.join(dir,'js/core.js'),'utf8');
const animSrc=core.slice(core.indexOf('const lerp ='), core.indexOf('const SHADOW_IDS'));
let captured=null;
const document={createElement:()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:(img)=>{captured=captured||img.data},drawImage(){},fillRect(){}})})};
const window={matchMedia:()=>({matches:false})};
let code=files.map(f=>fs.readFileSync(path.join(dir,'js',f),'utf8').replace("'use strict'",'')).join('\n')+'\n'+animSrc+'\nmodule.exports={SPRITES,ANIM,Spr,scalePose,fullPose};';
const m={exports:{}};new Function('module','require','document','window',code)(m,require,document,window);
const {SPRITES,ANIM,Spr,scalePose,fullPose}=m.exports;
const fnv=(h,v)=>Math.imul(h^v,16777619)>>>0;
const out={};
for(const [id,def] of Object.entries(SPRITES)){
  const amp=(def.size>=96?2.2:def.size>=64?1.3:def.size>=56?1.15:1)*1.6;
  for(const name of Object.keys(ANIM)){
    const A=ANIM[name]; let h=2166136261;
    for(let i=0;i<A.n;i++){
      const s=new Spr(def.size,def.size);
      def.draw(s,scalePose(fullPose(A.pose(def.rig,A.loop?i/A.n:i/(A.n-1))),amp));
      captured=null; const b=s.bake();
      for(const v of captured) h=fnv(h,v);
      h=fnv(h,b.foot);
    }
    out[`${id}:${name}`]=h.toString(16).padStart(8,'0');
  }
}
console.log('// Hashes of every baked frame (sprite:animation), made from the prototype in\n// docs/tamagotchi/prototypes/monster-arena. See sprite-registry.test.ts.\nexport const SPRITE_FRAME_HASHES: Record<string, string> = '+JSON.stringify(out,null,2))
