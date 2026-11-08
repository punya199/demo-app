'use strict'
// Page wiring: skill buttons, skill cards, the section picker and the plan tables.
const GAME_SKILLS = {
  ...FIRE,
  ...WATER,
  ...LEAF,
  ...EARTH,
  ...BOLT,
  ...HOLY,
  ...DARK,
  ...SHADOW,
  ...RAID,
}
async function useFire(id, att, def) {
  const s = GAME_SKILLS[id]
  if (!s.passive) tag(att, s.icon + ' ' + s.name, s.el || skillEl(id))
  if (s.reach && !inRange(att, def, s.reach)) await keepRange(att, def, s.reach * 0.7)
  await s.run(att, def)
}

/* Controls */
const skillsRow = document.getElementById('skills')
for (const [k, v] of Object.entries(ELEM)) {
  const b = document.createElement('button')
  b.className = 'el'
  b.innerHTML = `<i style="background:${v.col}"></i>${v.name}`
  b.addEventListener('click', () => run(() => SKILL[k](me, foe)))
  skillsRow.append(b)
}
// Bring the arena into view when an action button is pressed below it (on a phone the arena is pinned already).
function showStage() {
  const el = document.querySelector('.stage'),
    r = el.getBoundingClientRect(),
    navh = document.querySelector('.jump').getBoundingClientRect().bottom
  if (r.top < navh - 1 || r.bottom > window.innerHeight)
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
}
document.querySelector('.controls').addEventListener('click', (ev) => {
  if (ev.target.closest('button') && ev.target.id !== 'b-auto') showStage()
})
{
  const nav = document.querySelector('.jump'),
    setNav = () =>
      document.documentElement.style.setProperty(
        '--navh',
        nav.getBoundingClientRect().height + 'px'
      )
  window.addEventListener('resize', setNav)
  setNav()
}
document.getElementById('b-atk').addEventListener('click', () => run(() => lungeHit(me, foe)))
document
  .getElementById('b-dodge')
  .addEventListener('click', () => run(() => lungeHit(foe, me, 'dodge')))
document
  .getElementById('b-guard')
  .addEventListener('click', () => run(() => lungeHit(foe, me, 'guard')))
const waterRow = document.getElementById('water-skills')
for (const [id, sk] of Object.entries(WATER)) {
  const b = document.createElement('button')
  b.className = 'el'
  b.textContent = `${sk.icon} ${sk.name}${sk.passive ? ' (ติดตัว)' : ''}`
  b.addEventListener('click', () => run(() => useFire(id, me, foe)))
  waterRow.append(b)
}
const shadowRow = document.getElementById('shadow-skills')
for (const [id, sk] of Object.entries(SHADOW)) {
  const b = document.createElement('button')
  b.className = 'el'
  b.textContent = `${sk.icon} ${sk.name}${sk.passive ? ' (ติดตัว)' : ''}`
  b.addEventListener('click', () => run(() => useFire(id, me, foe)))
  shadowRow.append(b)
}
const darkRow = document.getElementById('dark-skills')
for (const [id, sk] of Object.entries(DARK)) {
  const b = document.createElement('button')
  b.className = 'el'
  b.textContent = `${sk.icon} ${sk.name}${sk.passive ? ' (ติดตัว)' : ''}`
  b.addEventListener('click', () => run(() => useFire(id, me, foe)))
  darkRow.append(b)
}
const holyRow = document.getElementById('holy-skills')
for (const [id, sk] of Object.entries(HOLY)) {
  const b = document.createElement('button')
  b.className = 'el'
  b.textContent = `${sk.icon} ${sk.name}${sk.passive ? ' (ติดตัว)' : ''}`
  b.addEventListener('click', () => run(() => useFire(id, me, foe)))
  holyRow.append(b)
}
const boltRow = document.getElementById('bolt-skills')
for (const [id, sk] of Object.entries(BOLT)) {
  const b = document.createElement('button')
  b.className = 'el'
  b.textContent = `${sk.icon} ${sk.name}${sk.passive ? ' (ติดตัว)' : ''}`
  b.addEventListener('click', () => run(() => useFire(id, me, foe)))
  boltRow.append(b)
}
const earthRow = document.getElementById('earth-skills')
for (const [id, sk] of Object.entries(EARTH)) {
  const b = document.createElement('button')
  b.className = 'el'
  b.textContent = `${sk.icon} ${sk.name}${sk.passive ? ' (ติดตัว)' : ''}`
  b.addEventListener('click', () => run(() => useFire(id, me, foe)))
  earthRow.append(b)
}
const leafRow = document.getElementById('leaf-skills')
for (const [id, sk] of Object.entries(LEAF)) {
  const b = document.createElement('button')
  b.className = 'el'
  b.textContent = `${sk.icon} ${sk.name}${sk.passive ? ' (ติดตัว)' : ''}`
  b.addEventListener('click', () => run(() => useFire(id, me, foe)))
  leafRow.append(b)
}
// Raid boss skills: the button puts that skill's boss in the foe slot, then the boss uses it on our monster.
const raidRow = document.getElementById('raid-skills')
function setFoe(id, again = false) {
  if (foe.rid === id && !again) return
  pickFoe.value = id
  foe = makeEnt(id, 1)
  timer = 0
  showBanner('BOSS!', '#ff6a4a', 1000)
}
// Skip ahead to the next grow stage of a world boss (in a real fight it happens at 20 s and 40 s).
document.getElementById('b-grow').addEventListener('click', () => {
  if (!foe.boss || foe.bossKind !== 'บอสโลก') setFoe('boss')
  else if (foe.grown >= GROW_SECS.length) setFoe(foe.rid, true)
  timer = Math.max(timer, GROW_SECS[foe.grown] || 0)
})
for (const [id, sk] of Object.entries(RAID)) {
  const b = document.createElement('button')
  b.className = 'el'
  b.textContent = `${sk.icon} ${ROSTER[sk.boss].name} · ${sk.name}`
  b.addEventListener('click', () =>
    run(async () => {
      if (foe.rid !== sk.boss) {
        setFoe(sk.boss)
        await wait(700)
      }
      await useFire(id, foe, me)
    })
  )
  raidRow.append(b)
}
const fireRow = document.getElementById('fire-skills')
for (const [id, sk] of Object.entries(FIRE)) {
  const b = document.createElement('button')
  b.className = 'el'
  b.textContent = `${sk.icon} ${sk.name}${sk.passive ? ' (ติดตัว)' : ''}`
  b.addEventListener('click', () => run(() => useFire(id, me, foe)))
  fireRow.append(b)
}
pickMe.addEventListener('change', () => {
  me = makeEnt(pickMe.value, 0)
  showBanner('FIGHT!')
})
pickFoe.addEventListener('change', () => {
  foe = makeEnt(pickFoe.value, 1)
  timer = 0
  showBanner(foe.boss ? 'BOSS!' : 'FIGHT!', foe.boss ? '#ff6a4a' : '#ffd34a', 1200)
})
let autoOn = false
const autoBtn = document.getElementById('b-auto')
autoBtn.addEventListener('click', () => {
  autoOn = !autoOn
  autoBtn.setAttribute('aria-pressed', String(autoOn))
  if (autoOn) autoLoop()
  setBusy(busy)
})
async function autoLoop() {
  const ks = Object.keys(SKILL)
  while (autoOn) {
    if (!busy) {
      const r = Math.random()
      const react = () =>
        Math.random() < 0.4 ? 'dodge' : Math.random() < 0.5 ? 'guard' : undefined
      void ks
      if (r < 0.3)
        await run(async () => {
          await approach(me, foe)
          await lungeHit(me, foe, Math.random() < 0.25 ? react() : undefined)
        })
      else if (r < 0.5)
        await run(async () => {
          await approach(foe, me)
          await lungeHit(foe, me, react())
        })
      else if (me.stunT > 0) await wait(300)
      else if (r < 0.82 && me.silenceT > 0)
        await run(async () => {
          await approach(me, foe)
          await lungeHit(me, foe)
        })
      else if (r < 0.82) {
        const set =
          me.el === 'water'
            ? WATER
            : me.el === 'leaf'
              ? LEAF
              : me.el === 'earth'
                ? EARTH
                : me.el === 'bolt'
                  ? BOLT
                  : me.el === 'holy'
                    ? HOLY
                    : me.el === 'dark'
                      ? DARK
                      : me.el === 'shadow'
                        ? SHADOW
                        : FIRE
        const fk = Object.keys(set).filter((k) => !set[k].passive)
        const k = fk[Math.floor(Math.random() * fk.length)]
        await run(() => useFire(k, me, foe))
      } else {
        const list =
          foe.el === 'water'
            ? ['tide_whirl', 'tide_trident', 'tide_fang', 'tide_ink', 'tide_sword']
            : foe.el === 'leaf'
              ? ['leaf_root', 'leaf_wrath', 'leaf_fang', 'leaf_spore', 'leaf_antler', 'leaf_trunk']
              : foe.el === 'earth'
                ? ['earth_quake', 'earth_horn', 'earth_paw', 'earth_quill', 'earth_crawl']
                : foe.el === 'bolt'
                  ? ['ltn_bolt', 'ltn_roar', 'ltn_claw', 'ltn_wing', 'ltn_vajra']
                  : foe.el === 'shadow'
                    ? ['shd_end', 'shd_kunai', 'shd_arrow', 'shd_snake', 'shd_mist']
                    : foe.el === 'dark'
                      ? [
                          'dark_end',
                          'dark_curse',
                          'dark_web',
                          'dark_eye',
                          'dark_wrath',
                          'dark_fang',
                        ]
                      : foe.el === 'holy'
                        ? [
                            'holy_sun',
                            'holy_judge',
                            'holy_arrow',
                            'holy_bell',
                            'holy_lull',
                            'holy_blade',
                          ]
                        : ['flame_breath', 'flame_lava', 'flame_claw', 'flame_sun']
        const own = RAID_OF[foe.rid],
          pool = own || list
        const k = pool[Math.floor(Math.random() * pool.length)]
        await run(() => useFire(k, foe, me))
      }
      if (autoOn) await roam(2600 + Math.random() * 1600)
    }
    await new Promise((res) => setTimeout(res, 120))
  }
}

/* Render loop */
function drawEnt(c, e, t) {
  const d = e.def,
    img = frameOf(e, t)
  const a = anchor(e)
  const bob = 0
  const g = e.grow || 1,
    w = d.size * e.sx * g,
    h = d.size * e.sy * g
  const hv = d.hover ? d.hover + Math.sin(t * 2.2 + e.side) * 1.4 : 0
  const x = a.x - w / 2,
    y = a.y - d.img.foot * e.sy * g + bob - 1 - hv
  c.globalAlpha = 0.4 * e.alpha
  c.fillStyle = '#000'
  c.beginPath()
  c.ellipse(
    e.x + e.ox,
    e.y + e.oy - 1,
    d.size * g * (d.hover ? 0.22 : 0.3) * (1 - Math.min(0.5, -e.oy / 40)),
    3,
    0,
    0,
    7
  )
  c.fill()
  c.globalAlpha = 1
  for (const g of e.ghosts) {
    c.globalAlpha = g.a * 0.5
    drawImg(
      c,
      (g.img || img).white,
      g.x - d.size / 2,
      g.y - d.img.foot,
      d.size,
      d.size,
      e.flip,
      g.tint || '#7ee7ff'
    )
  }
  c.globalAlpha = 1
  if (d.aura) drawAura(c, d.aura, a.x - d.size / 2, y, t, e.flip, d.size)
  c.globalAlpha = e.alpha
  drawImg(c, img.cv, x, y, w, h, e.flip)
  drawGlows(c, d, x, y, e.sx * g, e.sy * g, e.flip, t, e.alpha, img)
  if (e.flash > 0) {
    c.globalAlpha = e.flash * e.alpha
    drawImg(c, img.white, x, y, w, h, e.flip)
  }
  if (e.status === 'shock' && Math.random() < 0.5) {
    const cc = centerOf(e)
    ps.add({
      x: cc.x + (Math.random() - 0.5) * d.size * 0.5,
      y: cc.y + (Math.random() - 0.5) * 20,
      vx: 0,
      vy: 0,
      life: 0.1,
      size: 1,
      cols: ['#ffe14a'],
      glow: true,
    })
  }
  if (e.status === 'burn' && Math.random() < 0.5) {
    const cc = centerOf(e)
    ps.add(makeParticle('flame', cc.x + (Math.random() - 0.5) * d.size * 0.4, cc.y + 6))
  }
  const top = centerOf(e).y - e.def.img.foot * 0.5
  if (e.blindT > 0 && e.blindLight) {
    const px = anchor(e).x,
      py = top + 2
    c.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 3; i++) {
      const an = t * 2 + i * 2.1,
        gx = Math.round(px + Math.cos(an) * 7),
        gy = Math.round(py + Math.sin(an) * 2),
        L = 2 + Math.round(1.5 * (1 + Math.sin(t * 9 + i * 2)))
      c.globalAlpha = 0.95
      c.fillStyle = '#fff6c8'
      c.fillRect(gx - L, gy, L * 2 + 1, 1)
      c.fillRect(gx, gy - L, 1, L * 2 + 1)
      c.fillStyle = '#ffffff'
      c.fillRect(gx, gy, 1, 1)
    }
    c.globalCompositeOperation = 'source-over'
  } else if (e.blindT > 0)
    for (let i = 0; i < 3; i++) {
      const an = t * 3 + i * 2.1,
        px = anchor(e).x + Math.cos(an) * 8,
        py = top + Math.sin(an) * 2
      c.globalAlpha = 0.85
      c.fillStyle = '#2e2830'
      c.beginPath()
      c.arc(px, py, 3, 0, 7)
      c.fill()
      c.fillStyle = '#4a4048'
      c.beginPath()
      c.arc(px - 1, py - 1, 1.6, 0, 7)
      c.fill()
    }
  if (e.defT > 0 && Math.floor(t * 4) % 2) {
    const px = anchor(e).x + 10,
      py = top - 6
    c.globalAlpha = 1
    c.fillStyle = '#8a8098'
    c.fillRect(px - 3, py - 3, 7, 5)
    c.fillRect(px - 2, py + 2, 5, 2)
    c.fillRect(px - 1, py + 4, 3, 1)
    c.fillStyle = '#ff5d62'
    c.fillRect(px, py - 3, 1, 3)
    c.fillRect(px + 1, py, 1, 3)
  }
  c.globalAlpha = 1
  if (e.slowT > 0) {
    const px = anchor(e).x - 10,
      py = top - 4 + ((t * 20) % 6)
    c.globalAlpha = 1
    c.fillStyle = '#7ac8f0'
    c.fillRect(px, py, 2, 3)
    c.fillRect(px + 4, py + 2, 2, 3)
  }
  if (e.defUpT > 0) {
    const px = anchor(e).x + 10,
      py = top - 6
    c.globalAlpha = 1
    c.fillStyle = '#5ad38a'
    c.fillRect(px - 3, py - 3, 7, 5)
    c.fillRect(px - 2, py + 2, 5, 2)
    c.fillStyle = '#ffffff'
    c.fillRect(px, py - 2, 1, 4)
    c.fillRect(px - 1, py - 1, 3, 1)
  }
  if (e.bubbleT > 0 && e.bubbleHp > 0) {
    const cc = centerOf(e),
      rx = d.size * 0.42,
      ry = d.size * 0.4,
      hvb = d.hover ? d.hover : 0
    c.globalCompositeOperation = 'lighter'
    c.globalAlpha = 0.28 + (e.bubbleHit > 0 ? 0.4 : 0) + 0.08 * Math.sin(t * 6)
    c.fillStyle = e.bubbleStone ? '#8a6a3a' : e.bubbleHoly ? '#c8981e' : '#3a90d2'
    c.beginPath()
    c.ellipse(cc.x, cc.y - hvb, rx, ry, 0, 0, 7)
    c.fill()
    if (e.bubbleStone) {
      c.globalCompositeOperation = 'source-over'
      for (let i = 0; i < 12; i++) {
        const an = (i / 12) * TAU + t * 0.4,
          px = cc.x + Math.cos(an) * rx,
          py = cc.y + Math.sin(an) * ry
        c.globalAlpha = 0.9
        c.fillStyle = '#6e6456'
        c.fillRect(Math.round(px - 2), Math.round(py - 2), 4, 3)
        c.fillStyle = '#c8bca6'
        c.fillRect(Math.round(px - 2), Math.round(py - 2), 2, 1)
      }
      c.globalCompositeOperation = 'lighter'
    }
    c.globalAlpha = 0.8
    c.strokeStyle = e.bubbleStone ? '#e2c492' : e.bubbleHoly ? '#fff0a0' : '#c8eeff'
    c.lineWidth = 1
    c.beginPath()
    c.ellipse(cc.x, cc.y - hvb, rx, ry, 0, 0, 7)
    c.stroke()
    c.fillStyle = '#ffffff'
    c.fillRect(cc.x - rx * 0.5, cc.y - hvb - ry * 0.6, 3, 1)
    c.fillRect(cc.x - rx * 0.6, cc.y - hvb - ry * 0.45, 1, 2)
    c.globalCompositeOperation = 'source-over'
  }
  c.globalAlpha = 1
  if (e.rootT > 0) {
    const fa = anchor(e),
      rx = d.size * 0.22
    for (let i = 0; i < 3; i++)
      for (let s = 0; s < 18; s++) {
        const an = (s / 18) * Math.PI + i * 0.7 + t * 0.3,
          px = fa.x + Math.cos(an) * rx * (1 - i * 0.12),
          py = fa.y - 2 - i * 3.2 + Math.sin(an) * 2
        c.fillStyle = s % 5 === 0 ? '#5ad35a' : s % 2 ? '#3e2614' : '#86582e'
        c.fillRect(Math.round(px), Math.round(py), 2, 1)
      }
  }
  if (e.stunT > 0) {
    for (let i = 0; i < 3; i++) {
      const an = t * 6 + (i * TAU) / 3,
        px = Math.round(anchor(e).x + Math.cos(an) * 9),
        py = Math.round(top - 8 + Math.sin(an) * 2.5)
      c.globalAlpha = 1
      c.fillStyle = '#ffe14a'
      c.fillRect(px - 1, py, 3, 1)
      c.fillRect(px, py - 1, 1, 3)
      c.fillStyle = '#ffffff'
      c.fillRect(px, py, 1, 1)
    }
  }
  if (e.staticT > 0 && Math.random() < 0.45) {
    const cc = centerOf(e),
      a = Math.random() * TAU,
      r = d.size * 0.3
    const x0 = cc.x + Math.cos(a) * r,
      y0 = cc.y + Math.sin(a) * r * 0.8
    boltLine(
      c,
      x0,
      y0,
      x0 + (Math.random() - 0.5) * 8,
      y0 + (Math.random() - 0.5) * 8,
      2,
      [[1, '#ffe14a']],
      2
    )
    c.globalCompositeOperation = 'source-over'
  }
  if (e.focusT > 0) {
    const px = Math.round(anchor(e).x),
      py = Math.round(top - 16)
    c.globalAlpha = 1
    c.strokeStyle = '#ffe14a'
    c.lineWidth = 1
    c.beginPath()
    c.arc(px, py, 3, 0, 7)
    c.stroke()
    c.fillStyle = '#ffe14a'
    c.fillRect(px - 5, py, 2, 1)
    c.fillRect(px + 4, py, 2, 1)
    c.fillRect(px, py - 5, 1, 2)
    c.fillRect(px, py + 4, 1, 2)
  }
  if (e.atkUpT > 0) {
    const px = Math.round(anchor(e).x - 14),
      py = Math.round(top - 6)
    c.globalAlpha = 1
    c.fillStyle = '#ff8a24'
    c.fillRect(px - 3, py - 3, 7, 5)
    c.fillRect(px - 2, py + 2, 5, 2)
    c.fillStyle = '#ffffff'
    c.fillRect(px, py - 2, 1, 4)
    c.fillRect(px - 1, py - 1, 3, 1)
  }
  if (e.silenceT > 0) {
    const px = Math.round(anchor(e).x - 15),
      py = Math.round(top - 12 + Math.sin(t * 3) * 1)
    c.fillStyle = '#f0ecff'
    c.fillRect(px, py, 11, 7)
    c.fillRect(px + 2, py + 7, 2, 2)
    c.fillStyle = '#5a5070'
    c.fillRect(px + 2, py + 3, 1, 1)
    c.fillRect(px + 5, py + 3, 1, 1)
    c.fillRect(px + 8, py + 3, 1, 1)
    c.fillStyle = '#ff5d62'
    for (let i = 0; i < 11; i++) c.fillRect(px + i, py + 6 - Math.round(i * 0.6), 1, 1)
  }
  if (e.curseT > 0) {
    const px = anchor(e).x,
      py = top - 6,
      rx = 9
    c.globalCompositeOperation = 'lighter'
    c.globalAlpha = 0.9
    c.strokeStyle = '#a04ae8'
    c.lineWidth = 1
    c.beginPath()
    c.ellipse(px, py, rx, rx * 0.35, 0, 0, 7)
    c.stroke()
    for (let i = 0; i < 5; i++) {
      const an = t * 2 + (i * TAU) / 5
      c.fillStyle = i % 2 ? '#e4b8ff' : '#c47aff'
      c.fillRect(
        Math.round(px + Math.cos(an) * rx - 1),
        Math.round(py + Math.sin(an) * rx * 0.35 - 1),
        2,
        2
      )
    }
    c.globalCompositeOperation = 'source-over'
    c.globalAlpha = 1
  }
  if (e.atkDownT > 0) {
    const px = Math.round(anchor(e).x - 14),
      py = Math.round(top - 6)
    c.globalAlpha = 1
    c.fillStyle = '#8a2430'
    c.fillRect(px - 3, py - 3, 7, 5)
    c.fillRect(px - 2, py + 2, 5, 2)
    c.fillStyle = '#ffffff'
    c.fillRect(px, py - 2, 1, 4)
    c.fillRect(px - 1, py + 1, 3, 1)
  }
  if (e.enraged && Math.random() < 0.5) {
    const cc = centerOf(e)
    ps.add({
      x: cc.x + (Math.random() - 0.5) * d.size * 0.5,
      y: cc.y + 6,
      vx: 0,
      vy: -16,
      life: 0.5,
      size: 1,
      cols: ['#ff5a5a', '#c8102a', '#ffb0b0'],
      glow: true,
    })
  }
  if (e.immuneT > 0) {
    const fa = anchor(e),
      rx = d.size * 0.3
    c.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 16; i++) {
      const an = t * 3 + (i * TAU) / 16
      c.globalAlpha = 0.5 + 0.4 * Math.sin(t * 8 + i)
      c.fillStyle = i % 2 ? '#ffffff' : '#ffd84a'
      c.fillRect(
        Math.round(fa.x + Math.cos(an) * rx),
        Math.round(fa.y - 2 + Math.sin(an) * rx * 0.3),
        2,
        1
      )
    }
    c.globalCompositeOperation = 'source-over'
    c.globalAlpha = 1
  }
  if (e.poisonT > 0 && Math.random() < 0.35) {
    const cc = centerOf(e)
    ps.add({
      x: cc.x + (Math.random() - 0.5) * d.size * 0.4,
      y: cc.y + 4,
      vx: 0,
      vy: -12,
      life: 0.7,
      size: Math.random() < 0.3 ? 2 : 1,
      cols: ['#d8ff8a', '#7ad35a', '#3a6a2a'],
      glow: true,
      sway: 1,
    })
  }
  if (e.shield > 0) {
    const cc = centerOf(e)
    c.globalCompositeOperation = 'lighter'
    c.globalAlpha = 0.55 + 0.2 * Math.sin(t * 20)
    c.strokeStyle = '#9ad8ff'
    c.lineWidth = 1
    c.beginPath()
    c.ellipse(cc.x + (e.side === 0 ? 8 : -8), cc.y, d.size * 0.22, d.size * 0.45, 0, 0, 7)
    c.stroke()
    c.fillStyle = 'rgba(154,216,255,.18)'
    c.fill()
    c.globalCompositeOperation = 'source-over'
  }
  c.globalAlpha = 1
}
const tint = document.createElement('canvas')
const tx = tint.getContext('2d')
function drawImg(c, src, x, y, w, h, flip, tintCol) {
  let s = src
  if (tintCol) {
    tint.width = src.width
    tint.height = src.height
    tx.drawImage(src, 0, 0)
    tx.globalCompositeOperation = 'source-in'
    tx.fillStyle = tintCol
    tx.fillRect(0, 0, src.width, src.height)
    tx.globalCompositeOperation = 'source-over'
    s = tint
  }
  c.save()
  if (flip) {
    c.translate(x + w, y)
    c.scale(-1, 1)
    c.drawImage(s, 0, 0, w, h)
  } else c.drawImage(s, x, y, w, h)
  c.restore()
}

function hud(t) {
  const Wd = stage.width,
    u = Wd / 960
  sx.save()
  const panel = (e, right) => {
    const pw = 300 * u,
      ph = 66 * u,
      px = right ? Wd - pw - 14 * u : 14 * u,
      py = 12 * u
    sx.fillStyle = 'rgba(12,10,20,.78)'
    sx.strokeStyle = 'rgba(255,255,255,.12)'
    sx.lineWidth = 1 * u
    sx.beginPath()
    sx.roundRect(px, py, pw, ph, 8 * u)
    sx.fill()
    sx.stroke()
    const bx2 = right ? px + pw - 62 * u : px + 8 * u
    sx.fillStyle = '#2a2338'
    sx.beginPath()
    sx.roundRect(bx2, py + 8 * u, 54 * u, 50 * u, 6 * u)
    sx.fill()
    sx.imageSmoothingEnabled = false
    const d = e.def
    const sc = Math.min((50 * u) / d.size, (46 * u) / d.size) * 1.3
    sx.save()
    sx.beginPath()
    sx.roundRect(bx2, py + 8 * u, 54 * u, 50 * u, 6 * u)
    sx.clip()
    if (!right)
      sx.drawImage(
        d.img.cv,
        bx2 + 27 * u - (d.size * sc) / 2,
        py + 58 * u - d.img.foot * sc,
        d.size * sc,
        d.size * sc
      )
    else {
      sx.translate(bx2 + 27 * u + (d.size * sc) / 2, py + 58 * u - d.img.foot * sc)
      sx.scale(-1, 1)
      sx.drawImage(d.img.cv, 0, 0, d.size * sc, d.size * sc)
    }
    sx.restore()
    const tx0 = right ? px + 12 * u : px + 70 * u,
      tw = pw - 82 * u
    sx.fillStyle = '#fff'
    sx.font = `700 ${17 * u}px "Chakra Petch", sans-serif`
    sx.textAlign = right ? 'left' : 'left'
    sx.textBaseline = 'alphabetic'
    sx.fillText(e.name, tx0, py + 25 * u)
    const el = ELEM[e.el]
    sx.font = `700 ${11 * u}px "Chakra Petch", sans-serif`
    const cw = sx.measureText(el.name).width + 14 * u
    const cx0 = tx0 + tw - cw
    sx.fillStyle = el.col
    sx.beginPath()
    sx.roundRect(cx0, py + 12 * u, cw, 16 * u, 8 * u)
    sx.fill()
    sx.fillStyle = '#1a1020'
    sx.fillText(el.name, cx0 + 7 * u, py + 24 * u)
    const by = py + 36 * u,
      bh = 12 * u
    sx.fillStyle = '#0a0810'
    sx.beginPath()
    sx.roundRect(tx0, by, tw, bh, 4 * u)
    sx.fill()
    const f = e.hpShown / e.hpMax
    sx.fillStyle = f > 0.5 ? '#4fd47c' : f > 0.25 ? '#ffc94a' : '#ff5d62'
    sx.beginPath()
    sx.roundRect(tx0 + 2 * u, by + 2 * u, Math.max(0, (tw - 4 * u) * f), bh - 4 * u, 3 * u)
    sx.fill()
    sx.fillStyle = '#ece6f4'
    sx.font = `${11 * u}px "Silkscreen", monospace`
    sx.fillText(`${Math.ceil(e.hp)}`, tx0, by + 26 * u)
    {
      const [sn, st, sc] = STAGES[STAGE_OF[e.def.id]] || ['', '', '#fff']
      sx.font = `700 ${12 * u}px "Chakra Petch", sans-serif`
      sx.fillStyle = sc
      sx.textAlign = 'right'
      sx.fillText(`${sn} ${st}`, tx0 + tw, by + 26 * u)
      sx.textAlign = 'left'
    }
  }
  panel(me, false)
  if (!foe.boss) panel(foe, true)
  else {
    const bw = 520 * u,
      bx2 = Wd / 2 - bw / 2,
      by = 88 * u
    sx.fillStyle = 'rgba(12,10,20,.82)'
    sx.beginPath()
    sx.roundRect(bx2 - 10 * u, by - 26 * u, bw + 20 * u, 48 * u, 8 * u)
    sx.fill()
    sx.fillStyle = '#ff8a6a'
    sx.font = `700 ${14 * u}px "Chakra Petch", sans-serif`
    sx.textAlign = 'left'
    sx.fillText(foe.bossKind + ' · ' + foe.name, bx2, by - 8 * u)
    sx.fillStyle = '#0a0810'
    sx.fillRect(bx2, by, bw, 12 * u)
    const f = foe.hpShown / foe.hpMax
    const g = sx.createLinearGradient(bx2, 0, bx2 + bw, 0)
    g.addColorStop(0, foe.el === 'leaf' ? '#2e9a3e' : '#ff3b2a')
    g.addColorStop(1, foe.el === 'leaf' ? '#b0f490' : '#ff9a2a')
    sx.fillStyle = g
    sx.fillRect(bx2 + 2 * u, by + 2 * u, (bw - 4 * u) * f, 8 * u)
    sx.fillStyle = '#ece6f4'
    sx.font = `${11 * u}px "Silkscreen", monospace`
    sx.textAlign = 'right'
    sx.fillText(`${Math.ceil(foe.hp)} / ${foe.hpMax}`, bx2 + bw, by - 8 * u)
    sx.textAlign = 'left'
  }
  // minimap: the whole arena, the camera view and both fighters
  {
    const mw = 150 * u,
      mh = (mw * WH) / WW,
      mx = Wd - mw - 14 * u,
      my = stage.height - mh - 14 * u,
      f = mw / WW
    sx.fillStyle = 'rgba(12,10,20,.72)'
    sx.beginPath()
    sx.roundRect(mx - 4 * u, my - 4 * u, mw + 8 * u, mh + 8 * u, 6 * u)
    sx.fill()
    sx.fillStyle = 'rgba(255,255,255,.08)'
    sx.beginPath()
    sx.moveTo(mx + edgeAt(FLOOR_TOP) * f, my + FLOOR_TOP * f)
    sx.lineTo(mx + (WW - edgeAt(FLOOR_TOP)) * f, my + FLOOR_TOP * f)
    sx.lineTo(mx + (WW - edgeAt(FLOOR_BOT)) * f, my + FLOOR_BOT * f)
    sx.lineTo(mx + edgeAt(FLOOR_BOT) * f, my + FLOOR_BOT * f)
    sx.fill()
    sx.strokeStyle = 'rgba(255,255,255,.55)'
    sx.lineWidth = 1 * u
    sx.strokeRect(mx + cam.x * f, my + cam.y * f, W * f, H * f)
    for (const [e, col] of [
      [me, '#ffb43a'],
      [foe, foe.boss ? '#ff5a3a' : '#39c6ff'],
    ]) {
      sx.fillStyle = col
      sx.beginPath()
      sx.arc(mx + e.x * f, my + e.y * f, (e.boss ? 4 : 3) * u, 0, 7)
      sx.fill()
    }
  }
  // skill name tags
  for (const tg of skillTags) {
    tg.age += 1 / 60
    const right = tg.e === foe,
      a = Math.min(1, tg.age * 6) * (tg.age > tg.life - 0.3 ? (tg.life - tg.age) / 0.3 : 1)
    sx.globalAlpha = Math.max(0, a)
    sx.font = `700 ${15 * u}px "Chakra Petch", sans-serif`
    const tw = sx.measureText(tg.text).width + 22 * u,
      px = right ? Wd - 14 * u - tw : 14 * u,
      py = (right && foe.boss ? 120 : 84) * u
    const slide = (1 - Math.min(1, tg.age * 6)) * 20 * u * (right ? 1 : -1)
    sx.fillStyle =
      tg.el === 'water'
        ? 'rgba(58,170,240,.92)'
        : tg.el === 'leaf'
          ? 'rgba(90,211,90,.92)'
          : tg.el === 'earth'
            ? 'rgba(212,170,110,.94)'
            : tg.el === 'bolt'
              ? 'rgba(255,225,74,.95)'
              : tg.el === 'holy'
                ? 'rgba(255,240,190,.96)'
                : tg.el === 'shadow'
                  ? 'rgba(170,150,230,.95)'
                  : tg.el === 'dark'
                    ? 'rgba(196,122,255,.95)'
                    : 'rgba(255,138,36,.92)'
    sx.beginPath()
    sx.roundRect(px + slide, py, tw, 26 * u, 13 * u)
    sx.fill()
    sx.fillStyle = '#1b0f02'
    sx.textAlign = 'left'
    sx.fillText(tg.text, px + slide + 11 * u, py + 18 * u)
  }
  skillTags = skillTags.filter((tg) => tg.age < tg.life)
  sx.globalAlpha = 1
  // timer
  const tm = Math.floor(timer)
  const label = `${Math.floor(tm / 60)}:${String(tm % 60).padStart(2, '0')}`
  sx.font = `${16 * u}px "Silkscreen", monospace`
  const tw2 = sx.measureText(label).width + 24 * u
  sx.fillStyle = 'rgba(12,10,20,.8)'
  sx.beginPath()
  sx.roundRect(Wd / 2 - tw2 / 2, 14 * u, tw2, 28 * u, 14 * u)
  sx.fill()
  sx.fillStyle = '#fff'
  sx.textAlign = 'center'
  sx.fillText(label, Wd / 2, 34 * u)
  // floating texts
  const k = Wd / W
  for (const f of texts) {
    const a = 1 - f.age / f.life
    sx.globalAlpha = Math.max(0, a)
    const size = (f.big ? 22 : 16) * u * (f.age < 0.12 ? 1 + (0.12 - f.age) * 4 : 1)
    sx.font = /[฀-๿]/.test(f.text)
      ? `700 ${size}px "Chakra Petch", sans-serif`
      : `${size}px "Silkscreen", monospace`
    const fx0 = (f.x - cam.x) * k,
      fy0 = (f.y - f.age * 22 - cam.y) * k
    sx.lineWidth = 4 * u
    sx.strokeStyle = '#120a14'
    sx.strokeText(f.text, fx0, fy0)
    sx.fillStyle = f.col
    sx.fillText(f.text, fx0, fy0)
  }
  sx.globalAlpha = 1
  if (banner) {
    const p = banner.age / banner.life
    const s = p < 0.15 ? 0.6 + (p / 0.15) * 0.5 : p < 0.25 ? 1.1 - (p - 0.15) : 1
    sx.globalAlpha = p > 0.8 ? (1 - p) / 0.2 : 1
    sx.save()
    sx.translate(Wd / 2, stage.height * 0.48)
    sx.scale(s, s)
    sx.transform(1, 0, -0.18, 1, 0, 0)
    sx.font = `italic 700 ${96 * u}px "Chakra Petch", sans-serif`
    sx.textAlign = 'center'
    sx.textBaseline = 'middle'
    sx.lineWidth = 12 * u
    sx.strokeStyle = '#1a0c06'
    sx.strokeText(banner.text, 0, 0)
    sx.fillStyle = banner.col
    sx.fillText(banner.text, 0, 0)
    sx.restore()
    sx.globalAlpha = 1
  }
  sx.restore()
}

function frame(dt) {
  clock += dt
  timer += dt
  checkGrow(foe)
  if (hitstop > 0) {
    hitstop -= dt
    dt = 0
  }
  for (const t of [...tasks]) {
    t.t += dt * 1000
    const k = Math.min(1, t.t / t.ms)
    t.fn(k)
    if (k >= 1 || (t.done && t.done())) {
      tasks.delete(t)
      t.res()
    }
  }
  for (const e of [me, foe]) {
    stepWalk(e, dt)
    if (e.charging && Math.random() < 0.9) {
      const m = mouthOf(e),
        a = Math.random() * 7,
        r = 12 + Math.random() * 10,
        col = ELEM[e.charging === 'fire' ? 'fire' : e.charging]?.col || '#fff'
      ps.add({
        x: m.x + Math.cos(a) * r,
        y: m.y + Math.sin(a) * r * 0.7,
        vx: -Math.cos(a) * r * 3.2,
        vy: -Math.sin(a) * r * 2.2,
        life: 0.3,
        size: 1,
        cols: ['fire', 'water', 'leaf', 'earth', 'bolt', 'holy', 'dark', 'shadow'].includes(
          e.charging
        )
          ? elCols(e.charging)
          : ['#ffffff', col],
        glow: true,
      })
    }
    if (e.released > 0) {
      e.released -= dt
      const m = mouthOf(e)
      if (e.released > 0.18)
        ps.burst(6, () => ({
          x: m.x,
          y: m.y,
          vx: (e.flip ? -1 : 1) * (30 + Math.random() * 50),
          vy: (Math.random() - 0.5) * 30,
          drag: 3,
          life: 0.35,
          size: 1,
          cols: elCols(e.castEl),
          glow: true,
        }))
    }
    e.flip = anchor(other(e)).x < anchor(e).x
    e.flash = Math.max(0, e.flash - dt * 6)
    e.hpShown += (e.hp - e.hpShown) * Math.min(1, dt * 6)
    e.ghosts.forEach((g) => (g.a -= dt * 2.5))
    e.ghosts = e.ghosts.filter((g) => g.a > 0)
    if (e.status) {
      e.statusT -= dt
      if (e.statusT <= 0) e.status = null
    }
    if (e.blindT > 0) e.blindT -= dt
    else e.blindLight = false
    if (e.defT > 0) e.defT -= dt
    if (e.immuneT > 0) e.immuneT -= dt
    if (e.curseT > 0) e.curseT -= dt
    if (e.atkDownT > 0) e.atkDownT -= dt
    if (e.rootT > 0) e.rootT -= dt
    if (e.silenceT > 0) e.silenceT -= dt
    if (e.stunT > 0) e.stunT -= dt
    if (e.atkUpT > 0) e.atkUpT -= dt
    if (e.hasteT > 0) e.hasteT -= dt
    if (e.focusT > 0) e.focusT -= dt
    if (e.evaT > 0) {
      e.evaT -= dt
      if (Math.random() < 0.25)
        e.ghosts.push({
          x: e.x + e.ox,
          y: e.y + e.oy,
          a: 0.3,
          img: frameOf(e, clock),
          tint: '#a04aff',
        })
    }
    if (e.staticT > 0) {
      e.staticT -= dt
      e.staticAcc = (e.staticAcc || 0) + dt
      if (e.staticAcc >= 1) {
        e.staticAcc -= 1
        if (Math.random() < 0.3) {
          e.stunT = Math.max(e.stunT || 0, 0.4)
          e.goal = null
          sayAt(e, 'ช็อต!', '#ffe14a')
          const cc = centerOf(e)
          zapBurst(cc.x, cc.y, 12, 50)
        }
      }
    }
    if (e.hasteT > 0 && e.walking > 0.3 && Math.random() < 0.35)
      e.ghosts.push({
        x: e.x + e.ox,
        y: e.y + e.oy,
        a: 0.4,
        img: frameOf(e, clock),
        tint: '#ffe14a',
      })
    if (e.poisonT > 0) {
      e.poisonT -= dt
      e.poisonAcc = (e.poisonAcc || 0) + dt
      if (e.poisonAcc >= 1 && e.hp > 0) {
        e.poisonAcc -= 1
        const h = Math.max(4, Math.round(e.hpMax * 0.02))
        e.hp = Math.max(1, e.hp - h)
        sayAt(e, '-' + h + ' พิษ', '#9aff6a')
      }
    }
    if (e.ent && e.hp < e.hpMax && e.hp > 0) {
      e.entAcc = (e.entAcc || 0) + dt
      if (e.entAcc >= 1) {
        e.entAcc -= 1
        const h = Math.max(1, Math.round(e.hpMax * 0.012))
        e.hp = Math.min(e.hpMax, e.hp + h)
        sayAt(e, '+' + h, '#9aff8a')
        const a = anchor(e)
        ps.burst(4, () => makeParticle('leaf', a.x, a.y - e.def.img.foot * 0.7))
      }
    }
    if (e.slowT > 0) e.slowT -= dt
    if (e.defUpT > 0) e.defUpT -= dt
    if (e.bubbleT > 0) e.bubbleT -= dt
    if (e.bubbleHit > 0) e.bubbleHit -= dt
    if (e.regenT > 0) {
      e.regenT -= dt
      e.regenAcc = (e.regenAcc || 0) + dt
      if (e.regenAcc >= 1) {
        e.regenAcc -= 1
        const h = Math.round(e.hpMax * 0.02)
        e.hp = Math.min(e.hpMax, e.hp + h)
        sayAt(e, '+' + h, '#5ad38a')
      }
      if (Math.random() < 0.3) {
        const a = anchor(e)
        ps.add({
          x: a.x + (Math.random() - 0.5) * e.def.size * 0.5,
          y: a.y - Math.random() * 10,
          vx: 0,
          vy: -16,
          life: 0.7,
          size: 1,
          cols: ['#a0f0c0', '#5ad38a'],
          glow: true,
        })
      }
    }
  }
  for (let i = fxs.length - 1; i >= 0; i--) {
    fxs[i].age += dt
    if (fxs[i].age >= fxs[i].life) fxs.splice(i, 1)
  }
  for (let i = texts.length - 1; i >= 0; i--) {
    texts[i].age += dt
    if (texts[i].age >= texts[i].life) texts.splice(i, 1)
  }
  if (banner) {
    banner.age += dt
    if (banner.age >= banner.life) banner = null
  }

  // camera follows the middle of the fight
  const ma = anchor(me),
    fa = anchor(foe)
  const tx = (ma.x + fa.x) / 2 - W / 2,
    ty = (ma.y + fa.y) / 2 - H * 0.58
  const follow = Math.min(1, dt * 2.5)
  cam.x = Math.max(0, Math.min(WW - W, cam.x + (tx - cam.x) * follow))
  cam.y = Math.max(0, Math.min(WH - H, cam.y + (ty - cam.y) * follow))
  const theme = foe.boss
    ? {
        fire: 'lava',
        leaf: 'forest',
        earth: 'canyon',
        bolt: 'storm',
        holy: 'temple',
        dark: 'eclipse',
        shadow: 'crypt',
      }[foe.el] || 'cave'
    : 'cave'
  const shx = reduceMotion ? 0 : (Math.random() - 0.5) * shake,
    shy = reduceMotion ? 0 : (Math.random() - 0.5) * shake
  shake = Math.max(0, shake - dt * 18)
  const K = stage.width / W
  sx.setTransform(K, 0, 0, K, -(cam.x + shx) * K, -(cam.y + shy) * K)
  sx.imageSmoothingEnabled = false
  sx.globalAlpha = 1
  sx.globalCompositeOperation = 'source-over'
  bx.drawImage(floors[theme], 0, 0)
  const T = THEMES[theme]
  bx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 70; i++) {
    const y = FLOOR_TOP + ((i * 37 + clock * 30) % (FLOOR_BOT - FLOOR_TOP))
    const side = i % 2
    const L = edgeAt(y)
    bx.fillStyle = `rgba(${T.rim.join(',')},.5)`
    bx.fillRect(Math.round(side ? WW - L + 2 + (i % 3) : L - 4 - (i % 3)), y, 1, 3)
  }
  bx.globalCompositeOperation = 'source-over'
  if (curGlyph) {
    const g = curGlyph
    bx.globalCompositeOperation = 'lighter'
    bx.globalAlpha = g.a
    bx.strokeStyle = '#ffe9a0'
    bx.lineWidth = 1
    bx.beginPath()
    bx.ellipse(g.x, g.y, g.r, g.r * 0.38, 0, 0, 7)
    bx.stroke()
    bx.beginPath()
    bx.ellipse(g.x, g.y, g.r * 0.7, g.r * 0.27, 0, 0, 7)
    bx.stroke()
    for (let i = 0; i < 8; i++) {
      const a = clock * 2 + (i * Math.PI) / 4
      bx.fillStyle = '#fff6c0'
      bx.fillRect(g.x + Math.cos(a) * g.r * 0.85, g.y + Math.sin(a) * g.r * 0.32, 2, 1)
    }
    bx.globalAlpha = 1
    bx.globalCompositeOperation = 'source-over'
  }
  const ents = [me, foe].sort((a, b) => a.y - b.y)
  for (const e of ents) {
    drawEnt(bx, e, clock)
    const a = anchor(e)
    emitFor(
      e.def,
      ps,
      e.acc,
      e.alpha > 0.5 ? dt : 0,
      a.x - e.def.size / 2,
      a.y - e.def.img.foot,
      e.flip
    )
  }
  for (const f of fxs) {
    bx.save()
    f.draw(bx, f.age / f.life)
    bx.restore()
  }
  if (curProj) {
    bx.save()
    curProj.draw(bx, curProj.x, curProj.y)
    bx.restore()
  }
  if (curOrb) {
    const o = curOrb
    bx.fillStyle = '#12061c'
    bx.beginPath()
    bx.arc(o.x, o.y, o.r, 0, 7)
    bx.fill()
    bx.strokeStyle = '#a04ae8'
    bx.lineWidth = 1
    bx.beginPath()
    bx.arc(o.x, o.y, o.r + 1, 0, 7)
    bx.stroke()
  }
  ps.update(dt)
  ps.draw(bx)
  sx.setTransform(1, 0, 0, 1, 0, 0)
  sx.globalAlpha = 1
  sx.globalCompositeOperation = 'source-over'
  const SW = stage.width,
    SH = stage.height
  if (darken > 0) {
    sx.fillStyle = `rgba(4,2,12,${darken})`
    sx.fillRect(0, 0, SW, SH)
  }
  if (tintA > 0) {
    sx.fillStyle = `rgba(255,120,30,${tintA * 0.22})`
    sx.fillRect(0, 0, SW, SH)
  }
  if (flashScreen > 0) {
    sx.fillStyle = `rgba(255,255,255,${flashScreen * 0.6})`
    sx.fillRect(0, 0, SW, SH)
    flashScreen = Math.max(0, flashScreen - dt * 4)
  }
  const vg = sx.createRadialGradient(SW / 2, SH * 0.6, SH * 0.35, SW / 2, SH * 0.6, SH * 0.95)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(0,0,0,.45)')
  sx.fillStyle = vg
  sx.fillRect(0, 0, SW, SH)
  hud(clock)
  for (const c of cards) drawCard(c, dt)
  for (const L of lineups) drawLineup(L, dt)
}
function resize() {
  const css = stage.getBoundingClientRect().width || 960
  const dpr = window.devicePixelRatio || 1
  const k = Math.max(1, Math.ceil((css * dpr) / W))
  stage.width = W * k
  stage.height = H * k
}
window.addEventListener('resize', resize)
resize()
let last = performance.now()
function loop(now) {
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000))
  last = now
  frame(dt)
  requestAnimationFrame(loop)
}
showBanner('FIGHT!')
requestAnimationFrame(loop)
document.fonts && document.fonts.ready.then(() => {})

/* ---------- Plan tables ---------- */
const PLAN = [
  {
    line: 'สายเพลิง',
    fam: 'กิ้งก่าและมังกร',
    sum: 'เปลี่ยน 3 · คงไว้ 8 (ทำครบแล้วด้านบน)',
    rows: [
      [
        'สมบูรณ์',
        'อัคนีพยัคฆ์ 🐯',
        'อัคนีแผงคอ',
        'เสือโผล่กลางสายกิ้งก่า เปลี่ยนเป็นกิ้งก่าแผงคอไฟ',
      ],
      [
        'ร่างสุดท้าย',
        'ราชาสุริยะ ☀️',
        'ราชันมังกรสุริยะ',
        'ดวงอาทิตย์ไม่ใช่สัตว์ เก็บวงตะวันไว้เป็นออร่าหลังหัวมังกร',
      ],
      [
        'ร่างสุดท้าย',
        'ฟีนิกซ์อมตะ 🦅',
        'มังกรปีกฟีนิกซ์',
        'คงความเป็นฟีนิกซ์ไว้ที่ปีกขนไฟ แต่ตัวยังเป็นมังกร',
      ],
    ],
    keep: 'ไข่เพลิง, ประกายจิ๋ว, ถ่านน้อย, เพลิงจอมซน, ควันกรุ่น, เพลิงนักรบ, ลาวาอ้วน, มังกรเพลิงรบ',
  },
  {
    line: 'สายวารี',
    fam: 'สัตว์ทะเล',
    sum: 'เปลี่ยน 3 · คงไว้ 8',
    rows: [
      [
        'โตเต็มวัย',
        'ปลาดาบน้อย 🐟',
        'ลูกวาฬดาบ',
        'ให้ต่อไปถึงวาฬเกราะได้สมเหตุผล ยังมีจมูกเป็นดาบ',
      ],
      [
        'ร่างสุดท้าย',
        'เจ้าสมุทร 🔱',
        'วาฬราชันตรีศูล',
        'ตรีศูลเป็นอาวุธ เปลี่ยนเป็นวาฬยักษ์ที่มีเขาสามง่าม',
      ],
      [
        'ร่างสุดท้าย',
        'เทพีสายน้ำ 🧜',
        'เลวีอาธานคลื่นคลั่ง',
        'นางเงือกเป็นคน เปลี่ยนเป็นมังกรทะเลขดตัวในน้ำวน ต่อจากมังกรทะเลลึก',
      ],
    ],
    keep: 'ไข่วารี, หยดน้ำ, ฟองจิ๋ว, แมงกะพรุนขี้เซา, ฉลามหนาม, วาฬเกราะ, หมึกขี้เกียจ, มังกรทะเลลึก',
  },
  {
    line: 'สายพฤกษ์',
    fam: 'สัตว์ป่าที่มีพืชงอก',
    sum: 'เปลี่ยน 3 · ปรับ 1 (ทำครบแล้วด้านบน)',
    rows: [
      ['สมบูรณ์', 'พยัคฆ์ไพร 🐅', 'กวางเขาพฤกษา', 'ต่อจากกวางใบไม้ เขาเป็นกิ่งไม้ใหญ่มีดอกไม้'],
      ['สมบูรณ์', 'ช้างพฤกษา 🐘', 'หมาป่าเปลือกไม้', 'ต่อจากหมาป่าไพร มีเกราะเปลือกไม้และเถาวัลย์'],
      [
        'ร่างสุดท้าย',
        'เทพพนาลัย 🌳',
        'เทพพนาลัย (ปรับ)',
        'คงชื่อ วาดเป็นกวางยักษ์ที่แบกป่าทั้งผืนไว้บนหลัง',
      ],
      [
        'ร่างสุดท้าย',
        'เอนท์พิทักษ์ 🌲',
        'ราชาหมาป่าพงไพร',
        'ต้นไม้เดินได้ซ้ำกับร่างแรก เปลี่ยนเป็นหมาป่ายักษ์ขนคอหนา มีเถาวัลย์พันตัว',
      ],
    ],
    keep: 'ไข่พฤกษ์, เมล็ดจิ๋ว, ต้นอ่อน, กวางใบไม้, เห็ดง่วง, หมาป่าไพร, ตอไม้แก่',
  },
  {
    line: 'สายศิลา',
    fam: 'สัตว์เกราะหิน',
    sum: 'เปลี่ยน 4 (ทำครบแล้วด้านบน)',
    rows: [
      ['สมบูรณ์', 'หมีหินผา 🐻', 'เต่าผาหิน', 'ต่อจากเต่าศิลา กระดองเป็นแท่งหินผา'],
      ['สมบูรณ์', 'เม่นแร่เหล็ก 🦔', 'แรดเกราะแร่', 'ต่อจากแรดผา เกราะเป็นแร่เหล็กเงา'],
      [
        'ร่างสุดท้าย',
        'เจ้าธรณี 🏔️',
        'เต่าภูเขา',
        'ภูเขาไม่ใช่สัตว์ ย้ายภูเขาไปไว้บนกระดองเต่ายักษ์',
      ],
      [
        'ร่างสุดท้าย',
        'ไททันคริสตัล 💠',
        'ไททันแรดคริสตัล',
        'คงความเป็นคริสตัล ใส่ในร่างแรดยักษ์ เขาเป็นผลึก',
      ],
    ],
    keep: 'ไข่ศิลา, ก้อนกรวด, ก้อนดินเหนียว, เต่าศิลา, หนอนดินเกียจคร้าน, แรดผา, ก้อนหินขี้เกียจ',
  },
  {
    line: 'สายอสนี',
    fam: 'สัตว์พายุ',
    sum: 'เปลี่ยน 4 (ทำครบแล้วด้านบน)',
    rows: [
      ['สมบูรณ์', 'ม้าอสนี 🦄', 'เหยี่ยวพายุ', 'ต่อจากนกฟ้าผ่า'],
      [
        'โตเต็มวัย',
        'เสือพายุ 🐆',
        'จิ้งจอกพายุ',
        'เปลี่ยนสายเสือเป็นสายจิ้งจอก ให้ต่อไปถึงจิ้งจอกอสนี',
      ],
      ['สมบูรณ์', 'จิ้งจอกอสนี 🦊', 'จิ้งจอกอสนี (คงไว้)', 'ต่อจากจิ้งจอกพายุ สองหางเป็นสายฟ้า'],
      [
        'ร่างสุดท้าย',
        'ราชาอสนี 🌪️',
        'วิหคราชาอสนี',
        'พายุหมุนไม่ใช่สัตว์ เปลี่ยนเป็นนกยักษ์ที่ปีกเป็นเมฆพายุ',
      ],
      [
        'ร่างสุดท้าย',
        'วัชรเทพ 🌀',
        'ราชาจิ้งจอกอสนี',
        'จิ้งจอกยักษ์ห้าหางเป็นสายฟ้า แผงคอเป็นเมฆพายุ',
      ],
    ],
    keep: 'ไข่อสนี, ประกายไฟฟ้า, ลูกเมฆฟ้า, นกฟ้าผ่า, แมวไฟสถิต, เมฆหม่นขี้เกียจ',
  },
  {
    line: 'สายรัศมี',
    fam: 'สัตว์เทพ',
    sum: 'เปลี่ยน 6 (ทำครบแล้วด้านบน)',
    rows: [
      ['โตเต็มวัย', 'นกพิราบทิพย์ 🕊️', 'แกะปีกทิพย์', 'ต่อจากลูกแกะแสง'],
      [
        'โตเต็มวัย',
        'อัศวินรัศมี 🛡️',
        'สิงห์น้อยรัศมี',
        'อัศวินเป็นคนถือโล่ เปลี่ยนเป็นสิงห์ตัวเล็กมีแผงคอเป็นแสง',
      ],
      ['สมบูรณ์', 'เทพธิดารัศมี 👸', 'กิเลนรัศมี', 'สัตว์เทพมีเขาเดียว เกล็ดทอง'],
      ['สมบูรณ์', 'เซราฟปีกขาว 😇', 'ราชสีห์ปีกขาว', 'ต่อจากสิงห์น้อยรัศมี มีปีกขาวหกปีก'],
      [
        'ร่างสุดท้าย',
        'เจ้าแห่งแสงสว่าง 🌞',
        'กิเลนสุริยเทพ',
        'กิเลนยักษ์ มีวงแสงศักดิ์สิทธิ์ซ้อนหลายชั้น',
      ],
      ['ร่างสุดท้าย', 'มหาเทวทูต 👑', 'มหาราชสีห์เทวะ', 'ราชสีห์ยักษ์สวมมงกุฎทอง ปีกแสง'],
    ],
    keep: 'ไข่รัศมี, ประกายแสง, ลูกแกะแสง, ทูตน้อยขี้เซา, ระฆังแตก (ร่างแย่ ทำเป็นวิญญาณระฆังมีตา)',
  },
  {
    line: 'สายรัตติกาล',
    fam: 'ค้างคาวและแมงมุม',
    sum: 'เปลี่ยน 6 (ทำครบแล้วด้านบน)',
    rows: [
      [
        'โตเต็มวัย',
        'อสูรเขี้ยวโลหิต 🧛',
        'ค้างคาวเขี้ยวโลหิต',
        'แวมไพร์เป็นคน เปลี่ยนเป็นค้างคาวเขี้ยวแดง',
      ],
      ['สมบูรณ์', 'ปีศาจนัยน์ตาแดง 👹', 'แมงมุมอสูรตาแดง', 'ต่อจากแมงมุมคำสาป ตาแดงแปดดวง'],
      ['สมบูรณ์', 'ราชันย์ปีศาจ 😈', 'ค้างคาวอสูรราชันย์', 'ต่อจากค้างคาวเขี้ยวโลหิต'],
      ['สมบูรณ์', 'ซอมบี้ขี้เกียจ 🧟', 'หนูซากศพขี้เกียจ', 'ร่างแย่ต่อจากหนูท่อมืด ยังตลก'],
      [
        'ร่างสุดท้าย',
        'จักรพรรดิรัตติกาล 🌚',
        'ราชินีแมงมุมรัตติกาล',
        'แมงมุมยักษ์มีใยเป็นท้องฟ้ากลางคืน',
      ],
      [
        'ร่างสุดท้าย',
        'เจ้าแห่งคำสาป 💀',
        'จักรพรรดิค้างคาวคำสาป',
        'ค้างคาวยักษ์ปีกฉีก มีกะโหลกเป็นเกราะอก',
      ],
    ],
    keep: 'ไข่รัตติกาล, ละอองมืด, ลูกค้างคาว, แมงมุมคำสาป, หนูท่อมืด',
  },
  {
    line: 'สายเงา',
    fam: 'อัศวินเงาและภูตคลุมฮู้ด',
    sum: 'เปลี่ยน 8 (ทำครบแล้วด้านบน)',
    rows: [
      [
        'ร่างเด็ก 2',
        'แมวเงา 🐈',
        'หมวกผีน้อย',
        'เงาจิ๋วที่ไปสวมหมวกเหล็ก แยกได้ทั้งสายอัศวินและสายภูต',
      ],
      [
        'โตเต็มวัย',
        'นินจาเงา 🥷',
        'อัศวินเงา',
        'นินจาเป็นคน เปลี่ยนเป็นชุดเกราะที่มีเงาเป็นตัวข้างใน',
      ],
      [
        'โตเต็มวัย',
        'ผู้ล่าไร้เสียง 🏹',
        'ภูตตะเกียงเงา',
        'นักธนูเป็นคน เปลี่ยนเป็นภูตคลุมฮู้ดถือตะเกียง',
      ],
      ['สมบูรณ์', 'พญางูเงา 🐍', 'อัศวินเงาเกราะทมิฬ', 'ต่อจากอัศวินเงา ถือโล่'],
      ['สมบูรณ์', 'แมงป่องอาถรรพ์ 🦂', 'ภูตโคมวิญญาณ', 'ต่อจากภูตตะเกียงเงา'],
      [
        'ร่างสุดท้าย',
        'เจ้าแห่งเงา 🎭',
        'จอมอัศวินเงา',
        'หน้ากากเป็นสิ่งของ เปลี่ยนเป็นอัศวินหมวกมีเขาถือดาบใหญ่',
      ],
      [
        'ร่างสุดท้าย',
        'ราชันย์ไร้ตัวตน 🌌',
        'เจ้าภูตเงา',
        'กาแล็กซีไม่ใช่สัตว์ เปลี่ยนเป็นภูตยักษ์ถือเคียว',
      ],
      [
        'ร่างผสม',
        'เงาผู้ตื่น 🪞',
        'เงาผู้ตื่น (คงชื่อ)',
        'อัศวินกับภูตรวมร่าง ท่อนล่างเป็นหางควัน',
      ],
    ],
    keep: 'ไข่เงา, เงาจิ๋ว, ผีเงาขี้อาย, ม่านหมอกขี้เกียจ, บอสราชาม่านเงา',
  },
]
const FIRE_INFO = {
  flame_tail: [
    'เพลิงจอมซน',
    'ประชิด · ระยะ 62 · เผาไหม้ 3 วิ แน่นอน',
    'ง้างตัวโดยมีไฟลุกที่ปลายหาง แล้วพุ่งเข้าไปฟาดหางเป็นวงโค้งไฟจากด้านหลังไปด้านหน้า โดนแล้วตัวศัตรูลุกเป็นไฟ',
  ],
  flame_smoke: [
    'ควันกรุ่น',
    'ระเบิดรอบตัว · รัศมี 100 · มองไม่เห็น 3 วิ + เผาไหม้ 60%',
    'ย่อตัวชาร์จ แล้วพ่นควันดำเป็นวงกว้างรอบตัว มีถ่านไฟปนอยู่ จอมืดลงเล็กน้อย ศัตรูในวงมีควันวนรอบหัว',
  ],
  flame_slash: [
    'เพลิงนักรบ',
    'ประชิด · ระยะ 58 · คูลดาวน์สั้น 3 วิ',
    'ง้างสั้นแล้วพุ่งเร็ว ฟันเฉียงทีเดียวเป็นเส้นไฟสามชั้น ทั้งท่าเร็วที่สุดในสายนี้ให้เข้ากับคูลดาวน์สั้น',
  ],
  flame_claw: [
    'อัคนีแผงคอ',
    'ตี 3 ครั้ง · ระยะ 60 · เผาไหม้ 35%',
    'พุ่งเข้าไปตะปบสามครั้ง สลับขึ้นลง แต่ละครั้งทิ้งรอยกรงเล็บไฟสามเส้น ครั้งสุดท้ายแรงสุดและอาจติดคริ',
  ],
  flame_lava: [
    'ลาวาอ้วน',
    'โซน · รัศมี 80 · ระเบิดหลัง 0.8 วิ · เกราะลด 4 วิ',
    'กระทืบพื้น วงเตือนสีแดงกะพริบใต้ศัตรู 0.8 วิ ก้อนลาวาตกลงมาจากฟ้า เงาโตขึ้นก่อนตก ระเบิดแล้วเหลือบ่อลาวาบนพื้น หลบออกจากวงได้ถ้าเดินทัน',
  ],
  flame_breath: [
    'มังกรเพลิงรบ',
    'ลำแสง · ยาว 300 กว้าง 34 · เผาไหม้ 3 วิ',
    'เงยหัวชาร์จไฟที่ปาก แล้วพ่นไฟเป็นกรวยยาวตรงไปข้างหน้าเกือบหนึ่งวินาที ตีเป็นจังหวะ 3 ครั้ง จอสั่นเบาๆ ตลอด',
  ],
  flame_sun: [
    'ราชันมังกรสุริยะ',
    'ระเบิดรอบตัว · รัศมี 125 · พลัง 250 · เผาไหม้ 4 วิ',
    'ท่าไม้ตาย: ลอยตัวขึ้น ดวงอาทิตย์ดวงเล็กก่อตัวเหนือหัว ไฟถูกดูดเข้าไป จอเป็นสีส้ม แล้วระเบิดเป็นคลื่นวงกว้าง จอขาว พื้นไหม้เป็นรอยดำ',
  ],
  flame_phoenix: [
    'มังกรปีกฟีนิกซ์',
    'ติดตัว · ครั้งแรกที่ HP หมด ฟื้นด้วย HP 30%',
    'แทนที่จะล้ม ตัวทรุดลงแล้วมีเสาไฟพุ่งขึ้น ปีกไฟสองข้างกางออก แล้วลุกขึ้นใหม่ ปุ่มทดลองจะลด HP ของเราแล้วให้ศัตรูตีปิดท้าย',
  ],
}
const fireCards = document.getElementById('fire-cards')
for (const [id, [from, meta, desc]] of Object.entries(FIRE_INFO)) {
  const sk = FIRE[id],
    card = document.createElement('div')
  card.className = 'sk'
  card.innerHTML = `<h3><span>${sk.icon}</span>${sk.name}</h3><div class="meta">${meta}</div><div class="hint">ได้จาก: ${from}</div><p>${desc}</p>`
  const b = document.createElement('button')
  b.textContent = 'ลองท่านี้'
  b.addEventListener('click', () => {
    document
      .querySelector('.stage')
      .scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    run(() => useFire(id, me, foe))
  })
  card.append(b)
  fireCards.append(card)
}
const WATER_INFO = {
  tide_sword: [
    'ลูกวาฬดาบ',
    'พุ่งชน · พลัง 165',
    'ถอยตัวเล็งพร้อมจมูกดาบแวววาว แล้วพุ่งทะลุตัวศัตรูไปอีกฝั่งบนสายน้ำ ทิ้งเงาสีฟ้าตามหลัง ชนแล้วน้ำแตกกระจาย',
  ],
  tide_jelly: [
    'แมงกะพรุนขี้เซา',
    'ติดตัว · โดนตีประชิด สวนกลับ 45% · ช้าลง 35%',
    'ใครตีประชิดจะโดนสายฟ้าจากหนวดวิ่งกลับไปช็อต แล้วอาจเดินช้าลง ปุ่มทดลองจะให้ศัตรูเดินมาตีเรา',
  ],
  tide_fang: [
    'ฉลามหนาม',
    'ประชิด · พลัง 230 · ปิดฉากศัตรู HP ต่ำ',
    'ตอนง้าง น้ำถูกดูดเข้าที่ปาก พุ่งเข้าไปแล้วขากรรไกรน้ำบนล่างงับปิดใส่ศัตรู ถ้าศัตรู HP ต่ำจะขึ้น "ปิดฉาก!" และแรงขึ้น',
  ],
  tide_armor: [
    'วาฬเกราะ',
    'ใส่ตัวเอง · โล่ 22% อยู่ 5 วิ + เกราะขึ้น',
    'วงน้ำสามวงลอยขึ้นจากพื้นรอบตัว แล้วกลายเป็นฟองน้ำใสห่อตัว ตอนโดนตีฟองสว่างวาบและบอกว่าดูดดาเมจไปเท่าไหร่',
  ],
  tide_ink: [
    'หมึกขี้เกียจ',
    'ยิง · มองไม่เห็น 3.5 วิ',
    'พองตัวขึ้น แล้วพ่นก้อนหมึกเป็นวิถีโค้ง หมึกหยดตามทาง กระทบแล้วเป็นรอยหมึกดำเปื้อนบนตัวศัตรู',
  ],
  tide_whirl: [
    'มังกรทะเลลึก',
    'โซน · รัศมี 90 · ระเบิดหลัง 0.7 วิ · ช้าลง 3 วิ',
    'น้ำวนหมุนเป็นเกลียวก่อตัวใต้ศัตรู (เป็นวงเตือน) แล้วพุ่งเป็นงวงน้ำโยนศัตรูลอยขึ้น',
  ],
  tide_trident: [
    'ราชาวาฬผลึก',
    'กระจาย 3 ลูก · ช้าลง 50%',
    'เขาผลึกเรืองแสง แล้วยิงหอกน้ำสามเล่มออกจากปลายเขาเป็นรูปพัด เข้าเป้าทีละเล่ม แต่ละเล่มมีน้ำแตก (ชื่อใหม่ เดิมชื่อตรีศูลสมุทร)',
  ],
  tide_eternal: [
    'เลวีอาธานคลื่นคลั่ง',
    'ใส่ตัวเอง · ฟื้น 18% + ล้างสถานะ + ฟื้นต่อเนื่อง 4 วิ',
    'สายน้ำสองเส้นพันเป็นเกลียวลอยขึ้นรอบตัว ล้างสถานะผิดปกติทั้งหมด ฟื้นเลือดก้อนใหญ่ แล้วมีฟองเขียวลอยและฟื้นทุกวินาที',
  ],
}
const waterCards = document.getElementById('water-cards')
for (const [id, [from, meta, desc]] of Object.entries(WATER_INFO)) {
  const sk = WATER[id],
    card = document.createElement('div')
  card.className = 'sk'
  card.innerHTML = `<h3><span>${sk.icon}</span>${sk.name}</h3><div class="meta">${meta}</div><div class="hint">ได้จาก: ${from}</div><p>${desc}</p>`
  const b = document.createElement('button')
  b.textContent = 'ลองท่านี้'
  b.addEventListener('click', () => {
    document
      .querySelector('.stage')
      .scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    run(() => useFire(id, me, foe))
  })
  card.append(b)
  waterCards.append(card)
}
const LEAF_INFO = {
  leaf_antler: [
    'กวางใบไม้',
    'พุ่งชน · พลัง 150 · ติดราก 1.2 วิ',
    'ก้มหัวเล็งเขากิ่งไม้ ใบไม้เรืองแสงที่ปลายเขา แล้ววิ่งพุ่งชน ทิ้งเงาสีเขียวและใบไม้ตามทาง ชนแล้วใบไม้แตกกระจาย รากโผล่จากพื้นพันขาศัตรูไว้',
  ],
  leaf_spore: [
    'เห็ดง่วง',
    'ระเบิดรอบตัว · รัศมี 100 · ใบ้ 2.5 วิ + พิษ 5 วิ',
    'พองตัวจนหมวกเห็ดบาน แล้วปล่อยสปอร์เป็นโดมสีม่วงอ่อนรอบตัว ศัตรูในวงขึ้นป้ายใบ้ (ใช้สกิลไม่ได้) และติดพิษเสียเลือดทุกวินาที',
  ],
  leaf_fang: [
    'หมาป่าไพร',
    'ประชิด · ระยะ 58 · คูลดาวน์ 3.5 วิ · พิษ 5 วิ',
    'ง้างสั้นแล้วพุ่งกัดเร็ว ขากรรไกรหนามสีเขียวงับปิด น้ำพิษกระเด็น ศัตรูมีฟองพิษลอยขึ้นจากตัว ใช้ได้ถี่ที่สุดในสายนี้',
  ],
  leaf_claw: [
    'กวางเขาพฤกษา',
    'ตี 3 ครั้ง · ระยะ 60 · ดูดเลือด 30%',
    'พุ่งเข้าไปฟาดเขาสามครั้งสลับบนล่าง ทุกครั้งมีแสงเขียวไหลจากศัตรูกลับเข้าตัวเราและเลือดขึ้น (ชื่อใหม่ เดิมชื่อกรงเล็บไพร)',
  ],
  leaf_root: [
    'ตอไม้แก่',
    'โซน · รัศมี 85 · ขึ้นหลัง 0.6 วิ · ติดราก 2 วิ',
    'กระทืบพื้น รอยแตกวิ่งใต้ดินไปหาศัตรู วงเตือนสีเขียวกะพริบ แล้วรากหลายเส้นพุ่งขึ้นรอบวงฟาดเข้าหากลาง ใครอยู่ในวงติดรากเดินไม่ได้',
  ],
  leaf_trunk: [
    'หมาป่าเปลือกไม้',
    'ประชิด · ระยะ 66 · พลัง 250 ง้างนาน',
    'เถาวัลย์หนาเหมือนงวงงอกจากหลังแล้วชูขึ้นสูง (ง้างนาน ตามคูลดาวน์ง้าง 12) พุ่งเข้าไปแล้วฟาดลงเต็มแรง จอสั่นแรง ฝุ่นและใบไม้กระจาย ตัวศัตรูยุบ (ชื่อใหม่ เดิมชื่องวงพฤกษา)',
  ],
  leaf_wrath: [
    'เทพพนาลัย',
    'กระจาย 5 ใบ · พิษ 40% ต่อใบ',
    'ใบไม้หมุนเป็นวงรอบตัวตอนชาร์จ แล้วยิงใบมีดห้าใบเป็นรูปพัด ใบหมุนระหว่างบิน เข้าเป้าทีละใบ แต่ละใบมีโอกาสติดพิษ',
  ],
  leaf_ent: [
    'ราชาหมาป่าพงไพร',
    'ติดตัว · ฟื้น 1.2% ทุกวินาที · ดาเมจที่ได้รับ -8%',
    'ตอนโดนตีมีเกราะเปลือกไม้วาบและขึ้น -8% ทุกวินาทีมีใบไม้ร่วงและเลือดขึ้นเล็กน้อย ปุ่มทดลองจะลดเลือดเรา แล้วให้ศัตรูเข้ามาตีสองครั้ง (คงชื่อเดิม "ผู้พิทักษ์ป่า" เข้ากับราชาหมาป่าอยู่แล้ว)',
  ],
}
const EARTH_INFO = {
  earth_shell: [
    'เต่าศิลา',
    'ใส่ตัวเอง · โล่ 25% อยู่ 5 วิ',
    'แผ่นหินลอยขึ้นจากพื้นหมุนรอบตัว แล้วประกบเป็นโล่หิน มีก้อนหินวนรอบตัวตลอดเวลาที่โล่ยังอยู่ ตอนโดนตีบอกว่าโล่ดูดดาเมจไปเท่าไหร่',
  ],
  earth_crawl: [
    'หนอนดินเกียจคร้าน',
    'ประชิด · ระยะ 60 · ช้าลง 2.5 วิ',
    'ยืดตัวขึ้นสูง แล้วล้มตัวทับทั้งตัว ฝุ่นกับดินกระจาย ศัตรูยุบลงแล้วเดินช้าลง',
  ],
  earth_horn: [
    'แรดผา',
    'พุ่งชน · พลัง 190 · มึน 0.8 วิ',
    'ก้มหัวเล็งเขาหิน แล้ววิ่งพุ่งชน ฝุ่นตลบตามหลัง ชนแล้วเศษหินแตกกระจาย ศัตรูกระเด็นและมีดาวหมุนเหนือหัว',
  ],
  earth_paw: [
    'เต่าผาหิน',
    'ประชิด · ระยะ 64 · พลัง 260 ง้างนาน · มึน 1 วิ',
    'ยกตัวขึ้นง้างนาน (ตามค่าง้าง 14) แล้วกระทืบลงเต็มแรง พื้นแตกเป็นแฉก แท่งหินพุ่งขึ้นรอบศัตรู จอสั่นแรง (ชื่อใหม่ เดิมชื่ออุ้งตีนผา)',
  ],
  earth_boulder: [
    'ก้อนหินขี้เกียจ',
    'ติดตัว · ดาเมจที่ได้รับ -12% · ติดสถานะสั้นลง 40% · เดินช้าลง 15%',
    'ผิวเป็นหินแข็ง โดนตีแล้วขึ้น -12% ทุกครั้ง ถ้าโดนมึนหรือติดรากจะหายเร็วกว่าตัวอื่น ปุ่มทดลองจะให้ศัตรูเข้ามาตีสองครั้ง',
  ],
  earth_quill: [
    'แรดเกราะแร่',
    'กระจาย 4 ลูก · เกราะลด 30% ต่อลูก',
    'หนามแร่เหล็กตั้งขึ้นจากเกราะบนหลัง แล้วยิงออกเป็นรูปพัดสี่ลูก ลูกโค้งขึ้นแล้วปักเป้า (ชื่อใหม่ เดิมชื่อขนแร่)',
  ],
  earth_quake: [
    'เต่าภูเขา',
    'ระเบิดรอบตัว · รัศมี 130 · ง้างนานมาก · มึน 0.8 วิ',
    'ท่าไม้ตาย: ยกตัวขึ้นช้าๆ จอมืดลงและสั่นมากขึ้นเรื่อยๆ มีหินร่วงลงมา แล้วกระแทกพื้น แผ่นดินแยกเป็นแฉก แท่งหินพุ่งขึ้นเป็นวงสามชั้นจากตัวออกไป',
  ],
  earth_crystal: [
    'ไททันแรดคริสตัล',
    'ใส่ตัวเอง · เกราะขึ้น + พลังโจมตีขึ้น 6 วิ',
    'ผลึกบุษราคัมเรืองแสงพุ่งขึ้นเป็นวงรอบตัว ประกายทองลอยขึ้น แล้วขึ้นป้ายเกราะขึ้น (เขียว) กับพลังโจมตีขึ้น (ส้ม) ข้างหัว',
  ],
}
const BOLT_INFO = {
  ltn_wing: [
    'นกฟ้าผ่า',
    'ยิง · พลัง 130 · ไฟฟ้าสถิต 3 วิ',
    'ปีกมีประกายไฟวิ่ง แล้วยิงขนนกสายฟ้าเป็นวิถีโค้งไปปักเป้า สายฟ้าแตกกระจาย ศัตรูติดไฟฟ้าสถิต',
  ],
  ltn_cat: [
    'แมวไฟสถิต',
    'ติดตัว · ใครตีประชิด โอกาส 40% ติดไฟฟ้าสถิต 3 วิ',
    'ขนพองขึ้นทันทีที่โดนตี สายฟ้าวิ่งกลับไปหาคนตีแล้วติดไฟฟ้าสถิต ปุ่มทดลองให้ศัตรูเดินมาตี (ในทดลองติดทุกครั้ง)',
  ],
  ltn_claw: [
    'จิ้งจอกพายุ',
    'ตี 4 ครั้ง · ระยะ 60',
    'พุ่งเข้าไปข่วนเร็วสี่ครั้งสลับบนล่าง รอยข่วนเป็นแสงไฟฟ้าสีเหลือง มีประกายทุกครั้ง ครั้งสุดท้ายอาจคริ (ชื่อใหม่ เดิมชื่อเล็บพายุ)',
  ],
  ltn_hoof: [
    'เหยี่ยวพายุ',
    'พุ่งชน · พลัง 160 · เร็วขึ้น 3 วิ',
    'บินขึ้นสูงนิดหนึ่งแล้วโฉบลงพุ่งชน ทิ้งเงาเหลืองและเส้นสายฟ้าตามทาง ชนแล้วตัวเองเร็วขึ้น (ชื่อใหม่ เดิมชื่อกีบอสนี)',
  ],
  ltn_roar: [
    'เมฆหม่นขี้เกียจ',
    'โซน · รัศมี 90 · ฟาดหลัง 0.7 วิ · ไฟฟ้าสถิต 3 วิ',
    'เมฆพายุก่อตัวเหนือศัตรู ฟ้าแลบในเมฆ วงเตือนสีเหลืองกะพริบ จอสั่นขึ้นเรื่อยๆ แล้วฟ้าผ่าลงกลางวงสามสาย ใครอยู่ในวงติดไฟฟ้าสถิต',
  ],
  ltn_tail: [
    'จิ้งจอกอสนี',
    'ใส่ตัวเอง · เร็วขึ้น + คริขึ้น 5 วิ',
    'หางลุกเป็นสายฟ้าแผ่ออก ประกายลอยขึ้นรอบตัว แล้วเร็วขึ้น (มีเงาเหลืองตามหลังตอนเดิน) และคริขึ้น (มีเป้าเล็งเหนือหัว)',
  ],
  ltn_bolt: [
    'วิหคราชาอสนี',
    'ลำแสง · ยาว 320 กว้าง 30 · ง้างนาน · มึน 0.6 วิ',
    'ท่าไม้ตาย: กางปีกขึ้น จอมืดลง สายฟ้าเล็กๆ ถูกดูดเข้าปาก แล้วยิงลำสายฟ้าสามเส้นพันกันเป็นแนวตรง จอแวบขาว ศัตรูที่อยู่ในแนวมึน',
  ],
  ltn_vajra: [
    'ราชาจิ้งจอกอสนี',
    'กระจาย 3 ลูก · ไฟฟ้าสถิต 60% ต่อลูก',
    'หางสะบัดปาลูกบอลสายฟ้าสามลูกเป็นวิถีโค้งต่างกัน เข้าเป้าทีละลูก แต่ละลูกมีโอกาสติดไฟฟ้าสถิต (ชื่อใหม่ เดิมชื่อวัชระผ่าฟ้า)',
  ],
}
const HOLY_INFO = {
  holy_wing: [
    'แกะปีกทิพย์',
    'ใส่ตัวเอง · ฟื้นเลือด 15% + ล้างสถานะ',
    'กางปีก ขนนกขาวร่วงลงรอบตัว วงแสงทองค่อยๆ ลดลงมาครอบตัว มีเสาแสงอ่อนๆ แล้วล้างสถานะผิดปกติทั้งหมดและฟื้นเลือด',
  ],
  holy_lull: [
    'ทูตน้อยขี้เซา',
    'ยิง · พลัง 80 · ใบ้ 2.5 วิ',
    'เป่าลูกแสงง่วงๆ ลอยช้าๆ เป็นคลื่นไปหาเป้า มี Zz ลอยตาม ถึงแล้ววงรัศมีเล็กๆ ตกลงมาบนหัวศัตรู ศัตรูง่วงจนใช้สกิลไม่ได้',
  ],
  holy_blade: [
    'สิงห์น้อยรัศมี',
    'ประชิด · ระยะ 62 · พลัง 170 · โล่ 10% 3 วิ',
    'แสงรวมที่อุ้งเท้า แล้วตะครุบฟันเป็นเสี้ยวแสงทองกว้างหนึ่งครั้ง จากนั้นได้โล่แสงสีทองครอบตัว (ชื่อใหม่ เดิมชื่อดาบรัศมี)',
  ],
  holy_arrow: [
    'กิเลนรัศมี',
    'ยิง · พลัง 160 · ตาพร่า 2 วิ',
    'เขารวมแสง แล้วยิงลูกศรแสงเส้นเดียวเร็วมาก ถึงเป้าแล้วแตกเป็นแฉกแสงแปดทิศ จอแวบ ศัตรูตาพร่า (ตีธรรมดาพลาด 35%) (ชื่อใหม่ เดิมชื่อธนูรัศมี)',
  ],
  holy_bell: [
    'ระฆังแตก',
    'ระเบิดรอบตัว · รัศมี 110 · ใบ้ 1.5 วิ',
    'ตัวสั่นเขย่าระฆังจนดัง "ก้อง~" วงเสียงสีทองสามวงกระจายออกจากตัว ศัตรูที่อยู่ในวงใช้สกิลไม่ได้',
  ],
  holy_seraph: [
    'ราชสีห์ปีกขาว',
    'ติดตัว · เลือดต่ำกว่า 35% ครั้งแรก: โล่ 28% + ล้างสถานะ + คุ้มกันสถานะ 2 วิ',
    'ปุ่มทดลองลดเลือดให้เหลือ 37% แล้วให้ศัตรูเดินมาตี พอเลือดต่ำกว่า 35% ปีกหกปีกเปล่งแสงออก จอแวบ ขนนกร่วง ได้โล่แสงทอง และมีวงแสงทองหมุนรอบเท้าตอนคุ้มกัน',
  ],
  holy_sun: [
    'กิเลนสุริยเทพ',
    'โซน · รัศมี 100 · ลงหลัง 1.6 วิ · พลัง 200 · ตาพร่า 2 วิ',
    'ท่าไม้ตาย: ดวงตะวันเล็กๆ ก่อตัวบนฟ้าเหนือศัตรู วงเตือนสีทองกะพริบเร็วขึ้นเรื่อยๆ จอมืดลง แล้วเสาแสงตะวันกระแทกลงกลางวง จอขาว ใครอยู่ในวงตาพร่า หลบออกจากวงได้ถ้าเดินทัน',
  ],
  holy_judge: [
    'มหาราชสีห์เทวะ',
    'ลำแสง · ยาว 320 กว้าง 30 · พลัง 180 · แรงขึ้น 60% ถ้าเป้าเลือดต่ำกว่า 35%',
    'วงแสงหมุนเหนือมงกุฎ จอมืดลง แล้วปล่อยลำแสงพิพากษาสามชั้น (ทอง ขาวนวล ขาว) เป็นแนวตรง ถ้าเป้าเลือดน้อยจะขึ้น "พิพากษา!" มีเสาแสงลงที่ตัวเป้า',
  ],
}
const DARK_INFO = {
  dark_web: [
    'แมงมุมคำสาป',
    'ยิง · พลัง 90 · ช้าลง 3 วิ + คำสาป 4 วิ',
    'พ่นก้อนใยสีม่วงเหนียวๆ ไปติดเป้า ใยกางออกเป็นใยแมงมุมคลุมตัว ศัตรูเดินช้าลงและฮีลได้น้อยลงครึ่งหนึ่ง',
  ],
  dark_bite: [
    'หนูท่อมืด',
    'ประชิด · ระยะ 58 · พลัง 100 · ลดพลังโจมตี 50%',
    'พุ่งเข้ากัดเร็วๆ ฟันขาวหนีบสองด้าน เมือกเขียวกระเซ็น ศัตรูมีโอกาส 50% ทำดาเมจน้อยลง 20% นาน 3 วิ (มีลูกศรแดงชี้ลงเหนือหัว)',
  ],
  dark_fang: [
    'ค้างคาวเขี้ยวโลหิต',
    'ประชิด · ระยะ 62 · พลัง 160 · ดูดเลือด 50%',
    'โฉบลงกัดคอ เขี้ยวสองซี่ปักลงมีเลือดแดง แล้วสายแสงสีเลือดไหลจากเป้ากลับเข้าตัวค้างคาว ฟื้นเลือดครึ่งหนึ่งของดาเมจ',
  ],
  dark_eye: [
    'แมงมุมอสูรตาแดง',
    'ยิง · พลัง 110 · พลังโจมตีลด + เกราะลด 4 วิ',
    'ตาแดงแปดดวงลืมขึ้นเหนือหัวศัตรูทีละดวง แล้วลำแสงจ้องสีเลือดพุ่งตรงไปที่เป้า ศัตรูทั้งตีเบาลงและเปราะลง',
  ],
  dark_undead: [
    'หนูซากศพขี้เกียจ',
    'ติดตัว · ตีธรรมดาดูดเลือด 15% · ATK +20% เมื่อเลือดต่ำกว่า 50%',
    'ปุ่มทดลองลดเลือดเหลือราวครึ่งแล้วให้เดินไปตี ทุกครั้งที่ตีมี "+ดูดเลือด" ลอยขึ้น พอเลือดต่ำกว่า 50% จอแวบ ขึ้นป้ายโกรธ และมีควันแดงลอยจากตัว',
  ],
  dark_wrath: [
    'ค้างคาวอสูรราชันย์',
    'ระเบิดรอบตัว · รัศมี 110 · พลัง 170 · คำสาป 4 วิ',
    'กางปีกขาดๆ จอมืดลง แล้วคลื่นกระแทกม่วงดำสามวงกระจายออกจากตัว ควันดำพุ่งเป็นแฉก ศัตรูในวงติดคำสาป',
  ],
  dark_end: [
    'ราชินีแมงมุมรัตติกาล',
    'ประชิด · ระยะ 66 · พลัง 280 · เกราะลด 4 วิ',
    'ท่าไม้ตาย: แสงทั้งสนามดับลงเกือบหมด มีละอองมืดถูกดูดเข้าตัว แล้วแมงมุมพุ่งออกจากความมืดกัดสองเขี้ยวลงกลางตัวศัตรู จอแวบขาวแล้วมืดสั้นๆ ศัตรูรับดาเมจหนักและเกราะลด',
  ],
  dark_curse: [
    'จักรพรรดิค้างคาวคำสาป',
    'โซน · รัศมี 90 · ลงหลัง 1.4 วิ · พลัง 110 · คำสาป + ลดพลังโจมตี + พิษ 5 วิ',
    'วงอักขระม่วงหมุนเร็วขึ้นเรื่อยๆ ใต้ศัตรู จอมืดและสั่น แล้วเปลวไฟดำพุ่งขึ้นเป็นแฉกพร้อมวิญญาณลอยขึ้น ใครอยู่ในวงติดคำสาป ตีเบาลง และเสียเลือดจากพิษ หลบออกจากวงได้ถ้าเดินทัน',
  ],
}
const SHADOW_INFO = {
  shd_kunai: [
    'อัศวินเงา',
    'กระจาย · 3 ครั้ง · พลัง 70',
    'ฟันดาบกลางอากาศ แล้วใบมีดเงาสีม่วงสามใบหมุนพุ่งออกเป็นพัด โค้งเข้าหาเป้าทีละใบ โดนครบสามครั้ง (ชื่อใหม่ เดิมชื่อคุไนเงา)',
  ],
  shd_flee: [
    'ผีเงาขี้อาย',
    'ใส่ตัวเอง · หลบเก่งขึ้น + คริขึ้น 4 วิ',
    'หน้าแดง ตัวจางโปร่งแสงแล้วลอยถอยหนี มีเงาม่วงตามหลัง ระหว่างนี้ตีธรรมดาที่มาโดนพลาด 40% และตัวเองคริขึ้น',
  ],
  shd_arrow: [
    'ภูตตะเกียงเงา',
    'ยิง · พลัง 140 · ใบ้ 2 วิ',
    'ตะเกียงสว่างขึ้นช้าๆ แล้วไฟวิญญาณสีม่วงพุ่งออกเป็นสายเงียบๆ ไม่มีจอสั่น โดนแล้วศัตรูใบ้ ใช้สกิลไม่ได้ (ชื่อใหม่ เดิมชื่อศรเงียบ)',
  ],
  shd_snake: [
    'อัศวินเงาเกราะทมิฬ',
    'ประชิด · ระยะ 60 · พลัง 120 · พิษ 2 ชั้น',
    'กระแทกโล่ก่อน แล้วฟันดาบเงาไขว้เป็นรูปกากบาท มีละอองพิษสีม่วงเขียวกระจาย ติดพิษสองชั้น (ชื่อใหม่ เดิมชื่อเขี้ยวเงียบ)',
  ],
  shd_mist: [
    'ม่านหมอกขี้เกียจ',
    'ระเบิดรอบตัว · รัศมี 100 · พลัง 70 · มองไม่เห็น 3.5 วิ',
    'พองตัวขึ้นแล้วพ่นหมอกเทาแผ่ออกเป็นวงกว้าง ใครอยู่ในวงมองไม่เห็น ตีธรรมดาพลาดง่าย',
  ],
  shd_sting: [
    'ภูตโคมวิญญาณ',
    'ติดตัว · ตีธรรมดามีโอกาส 30% ติดพิษ',
    'ปุ่มทดลองให้ตีธรรมดาสี่ครั้ง ครั้งไหนติดพิษจะมีไฟวิญญาณม่วงเกาะตัวศัตรูลอยขึ้น (ชื่อใหม่ เดิมชื่อเหล็กในเงา)',
  ],
  shd_end: [
    'จอมอัศวินเงา',
    'ประชิด · ระยะ 62 · พลัง 180 · แรงสองเท่าถ้าศัตรูเลือดต่ำกว่า 35%',
    'ท่าไม้ตาย: จอมืดลง เงาไหลลงมารวมที่ดาบใหญ่ แล้วฟันลงทีเดียวเป็นวงโค้งม่วงขนาดใหญ่ มีเสาแสงตกลงกลางตัว ถ้าเลือดศัตรูต่ำจะขึ้นคำว่าประหาร',
  ],
  shd_void: [
    'เจ้าภูตเงา',
    'ติดตัว · ค่าหลบ +8 · หลบแล้วตีครั้งถัดไปคริและแรงขึ้น 25%',
    'ปุ่มทดลอง: ศัตรูเข้ามาตี เจ้าภูตละลายเป็นควันหลบไป แล้วสวนกลับด้วยการตีคริ ระหว่างสู้ตีธรรมดาที่มาโดนพลาด 20%',
  ],
}
const shadowCards = document.getElementById('shadow-cards')
for (const [id, [from, meta, desc]] of Object.entries(SHADOW_INFO)) {
  const sk = SHADOW[id],
    card = document.createElement('div')
  card.className = 'sk'
  card.innerHTML = `<h3><span>${sk.icon}</span>${sk.name}</h3><div class="meta">${meta}</div><div class="hint">ได้จาก: ${from}</div><p>${desc}</p>`
  const b = document.createElement('button')
  b.textContent = 'ลองท่านี้'
  b.addEventListener('click', () => {
    document
      .querySelector('.stage')
      .scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    run(() => useFire(id, me, foe))
  })
  card.append(b)
  shadowCards.append(card)
}
const darkCards = document.getElementById('dark-cards')
for (const [id, [from, meta, desc]] of Object.entries(DARK_INFO)) {
  const sk = DARK[id],
    card = document.createElement('div')
  card.className = 'sk'
  card.innerHTML = `<h3><span>${sk.icon}</span>${sk.name}</h3><div class="meta">${meta}</div><div class="hint">ได้จาก: ${from}</div><p>${desc}</p>`
  const b = document.createElement('button')
  b.textContent = 'ลองท่านี้'
  b.addEventListener('click', () => {
    document
      .querySelector('.stage')
      .scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    run(() => useFire(id, me, foe))
  })
  card.append(b)
  darkCards.append(card)
}
const holyCards = document.getElementById('holy-cards')
for (const [id, [from, meta, desc]] of Object.entries(HOLY_INFO)) {
  const sk = HOLY[id],
    card = document.createElement('div')
  card.className = 'sk'
  card.innerHTML = `<h3><span>${sk.icon}</span>${sk.name}</h3><div class="meta">${meta}</div><div class="hint">ได้จาก: ${from}</div><p>${desc}</p>`
  const b = document.createElement('button')
  b.textContent = 'ลองท่านี้'
  b.addEventListener('click', () => {
    document
      .querySelector('.stage')
      .scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    run(() => useFire(id, me, foe))
  })
  card.append(b)
  holyCards.append(card)
}
const boltCards = document.getElementById('bolt-cards')
for (const [id, [from, meta, desc]] of Object.entries(BOLT_INFO)) {
  const sk = BOLT[id],
    card = document.createElement('div')
  card.className = 'sk'
  card.innerHTML = `<h3><span>${sk.icon}</span>${sk.name}</h3><div class="meta">${meta}</div><div class="hint">ได้จาก: ${from}</div><p>${desc}</p>`
  const b = document.createElement('button')
  b.textContent = 'ลองท่านี้'
  b.addEventListener('click', () => {
    document
      .querySelector('.stage')
      .scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    run(() => useFire(id, me, foe))
  })
  card.append(b)
  boltCards.append(card)
}
const earthCards = document.getElementById('earth-cards')
for (const [id, [from, meta, desc]] of Object.entries(EARTH_INFO)) {
  const sk = EARTH[id],
    card = document.createElement('div')
  card.className = 'sk'
  card.innerHTML = `<h3><span>${sk.icon}</span>${sk.name}</h3><div class="meta">${meta}</div><div class="hint">ได้จาก: ${from}</div><p>${desc}</p>`
  const b = document.createElement('button')
  b.textContent = 'ลองท่านี้'
  b.addEventListener('click', () => {
    document
      .querySelector('.stage')
      .scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    run(() => useFire(id, me, foe))
  })
  card.append(b)
  earthCards.append(card)
}
const leafCards = document.getElementById('leaf-cards')
for (const [id, [from, meta, desc]] of Object.entries(LEAF_INFO)) {
  const sk = LEAF[id],
    card = document.createElement('div')
  card.className = 'sk'
  card.innerHTML = `<h3><span>${sk.icon}</span>${sk.name}</h3><div class="meta">${meta}</div><div class="hint">ได้จาก: ${from}</div><p>${desc}</p>`
  const b = document.createElement('button')
  b.textContent = 'ลองท่านี้'
  b.addEventListener('click', () => {
    document
      .querySelector('.stage')
      .scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    run(() => useFire(id, me, foe))
  })
  card.append(b)
  leafCards.append(card)
}
// Section picker: show one element at a time (the battle stays on top, with only that element's skills); remembered in the address (#fire, #water, #leaf, #earth, #plan).
{
  const jump = document.getElementById('jump')
  const ELS = ['fire', 'water', 'leaf', 'earth', 'bolt', 'holy', 'dark', 'shadow'],
    PICK = {
      fire: 'sunking',
      water: 'whaleking',
      leaf: 'forestdeer',
      earth: 'mountturtle',
      bolt: 'thunderking',
      holy: 'sunqilin',
      dark: 'spiderqueen',
      shadow: 'knightlord',
    }
  const apply = (v) => {
    document.querySelectorAll('section[data-group]').forEach((sec) => {
      const g = sec.dataset.group
      sec.hidden = !(v === 'all' || g === 'battle' || g === v)
    })
    document.querySelectorAll('.skgroup').forEach((g) => {
      g.hidden =
        v === 'raid'
          ? g.dataset.el !== 'raid'
          : ELS.includes(v)
            ? g.dataset.el !== v
            : g.dataset.el === 'dark'
    })
    if (v === 'raid' && !RAID_OF[foe.rid] && !busy) setFoe('lavaking')
    if (PICK[v] && me.el !== v && !busy) {
      pickMe.value = PICK[v]
      me = makeEnt(PICK[v], 0)
      showBanner('FIGHT!')
    }
    jump.value = v
  }
  const fromHash = () => {
    const h = location.hash.slice(1)
    return [
      'fire',
      'water',
      'leaf',
      'earth',
      'bolt',
      'holy',
      'dark',
      'shadow',
      'raid',
      'plan',
    ].includes(h)
      ? h
      : 'all'
  }
  jump.addEventListener('change', () => {
    apply(jump.value)
    try {
      history.replaceState(null, '', jump.value === 'all' ? location.pathname : '#' + jump.value)
    } catch (e) {
      location.hash = jump.value === 'all' ? '' : jump.value
    }
    document
      .getElementById('battle-h')
      .scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  })
  window.addEventListener('hashchange', () => apply(fromHash()))
  apply(fromHash())
}
const linesEl = document.getElementById('lines')
for (const p of PLAN) {
  const d = document.createElement('details')
  d.innerHTML = `<summary>${p.line} <span class="sum">ตระกูล: ${p.fam} · ${p.sum}</span></summary>
    <div class="tbl"><table><thead><tr><th>ขั้น</th><th>เดิม</th><th></th><th>เสนอใหม่</th><th>เหตุผล</th></tr></thead><tbody>
    ${p.rows.map((r) => `<tr><td class="st">${r[0]}</td><td>${r[1]}</td><td class="arrow">→</td><td><b>${r[2]}</b></td><td>${r[3]}</td></tr>`).join('')}
    </tbody></table></div><div class="keep-list">คงแนวเดิม วาดใหม่ให้ละเอียด: ${p.keep}</div>`
  linesEl.append(d)
}
linesEl.firstElementChild.open = true
linesEl.insertAdjacentHTML(
  'beforeend',
  `<details><summary>ร่างผสม 21 ตัว และบอส 13 ตัว <span class="sum">ทั้งหมดเป็นอีโมจิสิ่งของหรือธรรมชาติ ต้องออกแบบใหม่ทุกตัว</span></summary>
  <div class="keep-list">ร่างผสมจะผสมตระกูลสัตว์ของทั้งสองสาย เช่น ยักษ์ไอน้ำ (เพลิง+วารี) เป็นมังกรทะเลพ่นไอน้ำร้อน, จ้าวไฟป่า (เพลิง+พฤกษ์) เป็นสิงโตกิ้งก่าแผงคอเป็นไฟป่า, สมดุลแสงมืด (รัศมี+รัตติกาล) เป็นกิเลนปีกค้างคาวครึ่งขาวครึ่งดำ ส่วนร่างผสมสายเดียวกัน (ผู้ตื่น) เป็นร่างสุดท้ายที่ใส่เกราะทองและวงแหวนคู่แบบอวตารสุริยะด้านบน
  <br><br>บอสทุกตัวใช้กรอบ 96 พิกเซลขึ้นไป มีออร่าใต้ตัว และมีอนุภาคตามธาตุตลอดเวลา เช่น เต่ายักษ์วารีมีน้ำตกไหลจากกระดอง จักรกลพายุมีสายฟ้าวิ่งรอบตัว ราชาม่านเงามีร่างโปร่งที่ค่อยๆ หายและกลับมา</div></details>`
)
