// Trial of PixelFX (js/vendor/pixelfx.js, MIT) on our own monsters: the seven status effects the
// game has a match for and two hit effects. PixelFX's status effects wrap a character's silhouette
// (`o.actor`: mask + colours, feet at 0,0), so we hand them our monster's idle frame instead of
// their stock dummy and the flames, poison drips and sparks follow our monster's outline.
// Each tile draws PixelFX's back layer, then our sprite, then PixelFX's front layer.
{
  const PFX = window.PixelFX
  const TRIAL = [
    {
      key: 'burning',
      game: 'burn',
      name: 'ติดไฟ',
      note: 'ไฟเล็ก ๆ ลุกจาก 4 จุดบนตัว มีประกายไฟกับควันบาง ๆ ทุก 0.6 วิ ไฟวูบขึ้น ตัวกะพริบขาวแล้วส้ม มีรอยไหม้ลาม',
    },
    {
      key: 'poisoned',
      game: 'poison',
      name: 'ติดพิษ',
      note: 'สีเขียวไล่ขึ้นตัวเป็นระลอก เส้นเลือดดำลามจากแผล เหงื่อพิษหยด ทุก 0.8 วิ ตัวสั่น ตุ่มแตก มีวงพิษกระจายออก',
    },
    {
      key: 'stunned',
      game: 'stun',
      name: 'มึนงง',
      note: 'ดาว 3 ดวงกับนกตัวเล็ก 2 ตัวบินวนรอบหัว ลอดหลังหัวแล้ววนมาข้างหน้า มีประกายตาม',
    },
    {
      key: 'slowed',
      game: 'slow',
      name: 'ช้าลง',
      note: 'หน้าปัดนาฬิกาใสหลังหัวเดินทีละจังหวะหนัก ๆ มีหยดน้ำร่วงช้า ๆ กระจายเป็นวง',
    },
    {
      key: 'haste',
      game: 'haste',
      name: 'เร่งความเร็ว',
      note: 'ภาพติดตาเป็นริ้วลากตามหลัง เส้นความเร็วพุ่งผ่าน ฝุ่นฟุ้งจากเท้า',
    },
    {
      key: 'rage',
      game: 'rage',
      name: 'คลั่ง',
      note: 'ตัวสั่นตามจังหวะหัวใจ สัญลักษณ์โกรธเต้นที่ขมับ ไอพุ่งจากหัว พื้นแตกร้อนใต้เท้า',
    },
    {
      key: 'cursed',
      game: 'curse',
      name: 'คำสาป',
      note: 'ควันม่วงลอยจากตัว รอยดำลามขึ้นจากเท้า กะโหลกกระตุกโผล่เหนือหัว',
    },
    {
      key: 'hitSpark',
      game: 'โดนตี',
      name: 'ประกายโดนตี',
      note: 'แฉกแสงไขว้ แกนเพชรสีขาว แล้วประกายไฟกับเศษร่วงกระเด้ง (เล่นซ้ำทุก 1.2 วิ)',
      hit: true,
    },
    {
      key: 'critHit',
      game: 'คริติคอล',
      name: 'ตีติดคริ',
      note: 'ดาวแฉกขาวกระแทก วงแตกเป็นเสี้ยว เศษร่วงลงพื้น (เล่นซ้ำทุก 1.2 วิ)',
      hit: true,
    },
  ]
  const MONS = [
    ['sunking', 'เพลิง'],
    ['whaleking', 'วารี'],
    ['forestdeer', 'พฤกษ์'],
    ['mountturtle', 'ศิลา'],
    ['thunderking', 'อสนี'],
    ['sunqilin', 'รัศมี'],
    ['spiderqueen', 'รัตติกาล'],
    ['knightlord', 'เงา'],
  ].filter(([id]) => SPRITES[id])
  const W = 128,
    H = 128,
    FOOT = 112
  const HIT_EVERY = 1.2

  // Our sprite's idle frame as a PixelFX actor, cropped to its opaque pixels.
  const actorCache = new Map()
  function actorOf(id) {
    if (actorCache.has(id)) return actorCache.get(id)
    const img = getFrame(SPRITES[id], 'idle', 0)
    const src = img.cv,
      cx = src.getContext('2d'),
      D = cx.getImageData(0, 0, src.width, src.height).data
    let x0 = src.width,
      y0 = src.height,
      x1 = -1,
      y1 = -1
    for (let y = 0; y < src.height; y++)
      for (let x = 0; x < src.width; x++)
        if (D[(y * src.width + x) * 4 + 3] > 0) {
          x0 = Math.min(x0, x)
          x1 = Math.max(x1, x)
          y0 = Math.min(y0, y)
          y1 = Math.max(y1, y)
        }
    const w = x1 - x0 + 1,
      h = y1 - y0 + 1,
      data = new Uint8Array(w * h),
      pixels = new Uint32Array(w * h)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const j = ((y + y0) * src.width + x + x0) * 4
        if (D[j + 3] === 0) continue
        data[y * w + x] = 1
        pixels[y * w + x] = ((255 << 24) | (D[j + 2] << 16) | (D[j + 1] << 8) | D[j]) >>> 0
      }
    // the top of the head: the highest opaque pixel
    let hx = 0
    for (let x = 0; x < w; x++)
      if (data[x]) {
        hx = x
        break
      }
    const ax = -Math.floor(w / 2),
      ay = -h
    const a = {
      actor: {
        mask: { w, h, data },
        pixels,
        x: ax,
        y: ay,
        w,
        h,
        k: 2,
        head: [ax + hx, ay],
        chest: [0, ay + Math.round(h * 0.45)],
      },
      src,
      crop: [x0, y0, w, h],
    }
    actorCache.set(id, a)
    return a
  }

  // A frame's pixels onto a canvas context (transparent where the effect drew nothing).
  function blit(ctx, frame, img, tmp) {
    PFX.composite(frame, img.data, null)
    tmp.getContext('2d').putImageData(img, 0, 0)
    ctx.drawImage(tmp, 0, 0)
  }

  const tiles = []
  function makeFx(tile) {
    const t = TRIAL[tile.i],
      mod = PFX.FX[t.key],
      a = actorOf(tile.mon).actor
    // hits land on the monster's chest, coming from the left
    const o = t.hit
      ? { x: W / 2 + a.chest[0] - 6, y: FOOT + a.chest[1], seed: 7 }
      : { x: W / 2, y: FOOT, actor: a, seed: 3 }
    tile.fx = PFX.createFx(mod, o)
    tile.age = 0
  }
  function drawTile(tile, dt) {
    const t = TRIAL[tile.i]
    tile.age += dt
    if (t.hit && tile.age >= HIT_EVERY) makeFx(tile)
    tile.fx.update(dt)
    const { ctx, back, front, img, tmp } = tile
    ctx.clearRect(0, 0, W, H)
    ctx.imageSmoothingEnabled = false
    // floor shadow
    ctx.fillStyle = 'rgba(0,0,0,.35)'
    ctx.beginPath()
    ctx.ellipse(W / 2, FOOT + 1, 22, 4, 0, 0, Math.PI * 2)
    ctx.fill()
    PFX.clearFrame(back)
    tile.fx.draw(back, 'back')
    blit(ctx, back, img, tmp)
    const { src, crop } = actorOf(tile.mon)
    const [x0, y0, w, h] = crop
    ctx.drawImage(src, x0, y0, w, h, W / 2 - Math.floor(w / 2), FOOT - h, w, h)
    PFX.clearFrame(front)
    tile.fx.draw(front, 'front')
    blit(ctx, front, img, tmp)
  }

  const sec = document.getElementById('pfx-sec'),
    grid = document.getElementById('pfx-cards'),
    pick = document.getElementById('pfx-pick')
  if (PFX && sec && grid && pick) {
    for (const [id, el] of MONS) {
      const op = document.createElement('option')
      op.value = id
      op.textContent = el
      pick.append(op)
    }
    TRIAL.forEach((t, i) => {
      const card = document.createElement('div')
      card.className = 'card'
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const nm = document.createElement('div')
      nm.className = 'nm'
      nm.textContent = `${t.name} · ${t.game}`
      const old = document.createElement('div')
      old.className = 'old'
      old.textContent = `PixelFX: ${t.key} · ${t.note}`
      card.append(canvas, nm, old)
      grid.append(card)
      const tmp = document.createElement('canvas')
      tmp.width = W
      tmp.height = H
      const tile = {
        i,
        mon: pick.value,
        ctx: canvas.getContext('2d'),
        back: PFX.createFrame(W, H),
        front: PFX.createFrame(W, H),
        img: new ImageData(W, H),
        tmp,
      }
      makeFx(tile)
      tiles.push(tile)
    })
    pick.addEventListener('change', () => {
      for (const tile of tiles) {
        tile.mon = pick.value
        makeFx(tile)
      }
    })
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000))
      last = now
      if (!sec.hidden) for (const tile of tiles) drawTile(tile, dt)
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }
}
