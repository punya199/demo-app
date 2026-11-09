'use strict'
// Grandeur by skill tier: the same code as the game's arena/skill-fx/flourish.ts (transpiled by
// gen-flourish; the game's scene.shake / flashScreen / darken are this page's globals). SKILL_INFO is each
// player skill's [src, kind, element] from the backend arena-data.ts, so the tier matches the game's.
const FLOURISH = (() => {
  const skillTierPct = (src) => {
    if (src.startsWith('fused_')) return 160
    const form = src.split('_')[1] ?? ''
    if (form.startsWith('baby2')) return 75
    if (form.startsWith('adult')) return 100
    if (form.startsWith('perfect')) return 120
    if (form.startsWith('ultimate')) return 140
    return 100
  }
  const flourishTierOf = (src, slot) => {
    if (slot !== 'active') return 0
    const pct = skillTierPct(src)
    return pct >= 160 ? 3 : pct >= 140 ? 2 : pct >= 120 ? 1 : 0
  }
  const RANGED = new Set(['shot', 'beam', 'spread', 'zone'])
  const GOLD = ['#ffffff', '#fffad8', '#fff0a0', '#ffd84a', '#c8a030']
  const colsOf = (el) => (el === 'gold' ? GOLD : elCols(el))
  // A rune circle under a point, turning; r grows with k.
  const magicCircle = (x, y, R, cols, ms, spin = 1) =>
    fxs.push({
      age: 0,
      life: ms / 1000,
      draw(c, k) {
        const g = ease(Math.min(1, k * 2.5)),
          fade = k > 0.85 ? (1 - k) / 0.15 : 1,
          r = R * g
        c.globalCompositeOperation = 'lighter'
        c.globalAlpha = 0.8 * fade
        c.strokeStyle = cols[2]
        c.lineWidth = 1
        for (const [rr, w] of [
          [r, 1],
          [r * 0.72, 1],
        ]) {
          c.lineWidth = w
          c.beginPath()
          c.ellipse(x, y, rr, rr * 0.38, 0, 0, 7)
          c.stroke()
        }
        // runes and spokes on the ring
        for (let i = 0; i < 10; i++) {
          const a = clock * 1.6 * spin + (i * Math.PI) / 5
          c.fillStyle = i % 2 ? cols[1] : cols[0]
          c.fillRect(x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86 * 0.38, 2, 1)
        }
        c.globalAlpha = 0.35 * fade
        c.beginPath()
        for (let i = 0; i < 6; i++) {
          const a = -clock * 1.1 * spin + (i * Math.PI * 2) / 3
          const px = x + Math.cos(a) * r * 0.72,
            py = y + Math.sin(a) * r * 0.72 * 0.38
          if (i === 0) c.moveTo(px, py)
          else c.lineTo(px, py)
        }
        c.closePath()
        c.stroke()
      },
    })
  // A vertical column of light rising through the caster (charge) or bursting up (release).
  const lightColumn = (e, w, h, cols, ms, a = 0.6) =>
    fxs.push({
      age: 0,
      life: ms / 1000,
      draw(c, k) {
        const p = anchor(e),
          rise = ease(Math.min(1, k * 3)),
          fade = Math.sin(Math.PI * Math.min(1, k)),
          g = c.createLinearGradient(0, p.y - h * rise, 0, p.y)
        g.addColorStop(0, 'rgba(255,255,255,0)')
        g.addColorStop(0.5, cols[1])
        g.addColorStop(1, cols[3])
        c.globalCompositeOperation = 'lighter'
        c.globalAlpha = a * fade
        c.fillStyle = g
        c.fillRect(p.x - w / 2, p.y - h * rise, w, h * rise)
        c.globalAlpha = 0.9 * fade
        c.fillStyle = cols[0]
        c.fillRect(p.x - 1, p.y - h * rise, 2, h * rise)
      },
    })
  // A shockwave ring on the floor at p.
  const shockwave = (x, y, R, cols, ms, rings = 1) => {
    for (let i = 0; i < rings; i++)
      fxs.push({
        age: -i * 0.08,
        life: ms / 1000,
        draw(c, k) {
          if (k < 0) return
          const r = R * ease(k)
          c.globalCompositeOperation = 'lighter'
          c.globalAlpha = 1 - k
          c.strokeStyle = i % 2 ? cols[3] : cols[1]
          c.lineWidth = 2
          c.beginPath()
          c.ellipse(x, y, r, r * 0.4, 0, 0, 7)
          c.stroke()
        },
      })
  }
  // A flare: a bright cross of light and a burst of sparks at p.
  const flare = (x, y, size, cols, n) => {
    fxs.push({
      age: 0,
      life: 0.35,
      draw(c, k) {
        const s = size * (1 - k * 0.6)
        c.globalCompositeOperation = 'lighter'
        c.globalAlpha = 1 - k
        c.fillStyle = cols[0]
        c.fillRect(x - s, y - 1, s * 2, 2)
        c.fillRect(x - 1, y - s * 0.7, 2, s * 1.4)
        c.fillStyle = cols[1]
        c.beginPath()
        c.arc(x, y, s * 0.35, 0, 7)
        c.fill()
      },
    })
    ps.burst(n, () => {
      const a = Math.random() * Math.PI * 2,
        v = 40 + Math.random() * 80
      return {
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v * 0.6,
        drag: 3,
        life: 0.35 + Math.random() * 0.3,
        size: Math.random() < 0.4 ? 2 : 1,
        cols,
        glow: true,
      }
    })
  }
  // A beam from the caster's mouth to the target's centre (both followed every frame), growing in,
  // holding, then thinning out. Two beams twist round each other for a Fused skill.
  const beam = (att, def, cols, ms, W, twist = 0) =>
    fxs.push({
      age: 0,
      life: ms / 1000,
      draw(c, k) {
        const m = mouthOf(att),
          t = centerOf(def),
          reach = Math.min(1, k * 5),
          thin = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1,
          ang = Math.atan2(t.y - m.y, t.x - m.x),
          L = Math.hypot(t.x - m.x, t.y - m.y) * reach,
          nx = -Math.sin(ang),
          ny = Math.cos(ang),
          wob = twist ? Math.sin(clock * 30 + twist) * 2 : 0
        c.globalCompositeOperation = 'lighter'
        for (const [w, col, a] of [
          [W * 1.8, cols[3], 0.3],
          [W, cols[2], 0.6],
          [W * 0.35, cols[0], 0.95],
        ]) {
          const hw = (w * thin) / 2
          c.globalAlpha = a
          c.fillStyle = col
          c.beginPath()
          c.moveTo(m.x + nx * (hw * 0.4 + wob), m.y + ny * (hw * 0.4 + wob))
          c.lineTo(
            m.x + Math.cos(ang) * L + nx * (hw + wob),
            m.y + Math.sin(ang) * L + ny * (hw + wob)
          )
          c.lineTo(
            m.x + Math.cos(ang) * L - nx * (hw - wob),
            m.y + Math.sin(ang) * L - ny * (hw - wob)
          )
          c.lineTo(m.x - nx * (hw * 0.4 - wob), m.y - ny * (hw * 0.4 - wob))
          c.fill()
        }
        // sparks streaming along it
        if (Math.random() < 0.9 * thin) {
          const q = Math.random()
          ps.add({
            x: m.x + Math.cos(ang) * L * q,
            y: m.y + Math.sin(ang) * L * q,
            vx: Math.cos(ang) * 60 + (Math.random() - 0.5) * 30,
            vy: Math.sin(ang) * 60 + (Math.random() - 0.5) * 30,
            life: 0.3,
            size: 1,
            cols,
            glow: true,
          })
        }
      },
    })
  // The charge part: from the start of the wind-up to the release.
  const charge = (att, f, a, b) => {
    const ms = Math.max(250, f.chargeSec * 1000)
    const p = anchor(att)
    const R = Math.max(18, att.def.size * 0.42) * (att.grow || 1)
    if (f.tier === 1) {
      shockwave(p.x, p.y, R * 0.9, a, ms, 1)
      return
    }
    magicCircle(p.x, p.y, R, a, ms + 350)
    if (f.tier === 3) {
      magicCircle(p.x, p.y, R * 1.35, b, ms + 350, -1)
      void tween(ms, (k) => {
        darken = Math.max(darken, 0.35 * k)
      }).then(() => tween(400, (k) => (darken = 0.35 * (1 - k))))
    }
    lightColumn(att, 10, 70 * (att.grow || 1), a, ms + 200, 0.4)
    // motes drawn into the caster
    void tween(ms, () => {
      if (Math.random() > 0.7) return
      const an = Math.random() * Math.PI * 2,
        r = R * 1.6
      const cols = f.tier === 3 && Math.random() < 0.5 ? b : a
      ps.add({
        x: p.x + Math.cos(an) * r,
        y: p.y - 10 + Math.sin(an) * r * 0.5,
        vx: -Math.cos(an) * r * 2.2,
        vy: -Math.sin(an) * r * 1.1,
        life: 0.4,
        size: 1,
        cols,
        glow: true,
      })
    })
  }
  // The release: a beam, a shockwave or a pillar, by the skill's kind.
  const release = (att, def, f, a, b) => {
    const t = centerOf(def)
    if (f.tier === 1) {
      flare(t.x, t.y, 10, a, 10)
      return
    }
    const big = f.tier === 3
    shake = Math.max(shake, big ? 6 : 3)
    flashScreen = Math.max(flashScreen, big ? 0.35 : 0.2)
    if (f.kind === 'self' || f.kind === 'burst') {
      const p = anchor(att)
      lightColumn(att, big ? 26 : 18, 140, a, 700, 0.7)
      if (big) lightColumn(att, 10, 160, b, 700, 0.6)
      shockwave(p.x, p.y, (big ? 90 : 65) * (att.grow || 1), a, 600, big ? 3 : 2)
      return
    }
    if (RANGED.has(f.kind)) {
      beam(att, def, a, 520, big ? 9 : 7)
      if (big) beam(att, def, b, 520, 5, 3)
      void wait(90).then(() => {
        const tt = centerOf(def)
        flare(tt.x, tt.y, big ? 18 : 13, a, big ? 26 : 16)
        shockwave(def.x, def.y, big ? 55 : 40, big ? b : a, 500, big ? 2 : 1)
      })
      return
    }
    // melee, multi, charge: the blow lands with a shockwave
    flare(t.x, t.y, big ? 18 : 13, a, big ? 24 : 14)
    shockwave(def.x, def.y, big ? 60 : 44, a, 500, big ? 2 : 1)
    if (big) shockwave(def.x, def.y, 75, b, 600, 1)
  }
  // Plays the flourish of one cast: charge from now, release after f.chargeSec.
  const runFlourish = async (att, def, f) => {
    if (!f.tier) return
    const a = colsOf(f.els[0] ?? 'fire')
    const b = colsOf(f.els[1] ?? f.els[0] ?? 'gold')
    charge(att, f, a, b)
    await wait(Math.max(0, f.chargeSec * 1000))
    release(att, def, f, a, b)
  }
  const EL = {
    flame: 'fire',
    tide: 'water',
    leaf: 'leaf',
    earth: 'earth',
    lightning: 'bolt',
    holy: 'holy',
    dark: 'dark',
    shadow: 'shadow',
  }
  const SKILL_INFO = {
    flame_tail: ['flame_adultGood', 'melee', 'fire'],
    flame_smoke: ['flame_adultPoor', 'burst', 'fire'],
    flame_slash: ['flame_adultAlt', 'melee', 'fire'],
    flame_claw: ['flame_perfectGood', 'multi', 'fire'],
    flame_lava: ['flame_perfectPoor', 'zone', 'fire'],
    flame_breath: ['flame_perfectAlt', 'beam', 'fire'],
    flame_sun: ['flame_ultimate', 'burst', 'fire'],
    tide_sword: ['tide_adultGood', 'charge', 'water'],
    tide_fang: ['tide_adultAlt', 'melee', 'water'],
    tide_armor: ['tide_perfectGood', 'self', 'water'],
    tide_ink: ['tide_perfectPoor', 'shot', 'water'],
    tide_whirl: ['tide_perfectAlt', 'zone', 'water'],
    tide_trident: ['tide_ultimate', 'spread', 'water'],
    tide_eternal: ['tide_ultimateAlt', 'self', 'water'],
    leaf_antler: ['leaf_adultGood', 'charge', 'leaf'],
    leaf_spore: ['leaf_adultPoor', 'burst', 'leaf'],
    leaf_fang: ['leaf_adultAlt', 'melee', 'leaf'],
    leaf_claw: ['leaf_perfectGood', 'multi', 'leaf'],
    leaf_root: ['leaf_perfectPoor', 'zone', 'leaf'],
    leaf_trunk: ['leaf_perfectAlt', 'melee', 'leaf'],
    leaf_wrath: ['leaf_ultimate', 'spread', 'leaf'],
    earth_shell: ['earth_adultGood', 'self', 'earth'],
    earth_crawl: ['earth_adultPoor', 'melee', 'earth'],
    earth_horn: ['earth_adultAlt', 'charge', 'earth'],
    earth_paw: ['earth_perfectGood', 'melee', 'earth'],
    earth_quill: ['earth_perfectAlt', 'spread', 'earth'],
    earth_quake: ['earth_ultimate', 'burst', 'earth'],
    earth_crystal: ['earth_ultimateAlt', 'self', 'earth'],
    ltn_wing: ['lightning_adultGood', 'shot', 'bolt'],
    ltn_claw: ['lightning_adultAlt', 'multi', 'bolt'],
    ltn_hoof: ['lightning_perfectGood', 'charge', 'bolt'],
    ltn_roar: ['lightning_perfectPoor', 'zone', 'bolt'],
    ltn_tail: ['lightning_perfectAlt', 'self', 'bolt'],
    ltn_bolt: ['lightning_ultimate', 'beam', 'bolt'],
    ltn_vajra: ['lightning_ultimateAlt', 'spread', 'bolt'],
    holy_wing: ['holy_adultGood', 'self', 'holy'],
    holy_lull: ['holy_adultPoor', 'shot', 'holy'],
    holy_blade: ['holy_adultAlt', 'melee', 'holy'],
    holy_arrow: ['holy_perfectGood', 'shot', 'holy'],
    holy_bell: ['holy_perfectPoor', 'burst', 'holy'],
    holy_sun: ['holy_ultimate', 'zone', 'holy'],
    holy_judge: ['holy_ultimateAlt', 'beam', 'holy'],
    dark_web: ['dark_adultGood', 'shot', 'dark'],
    dark_bite: ['dark_adultPoor', 'melee', 'dark'],
    dark_fang: ['dark_adultAlt', 'melee', 'dark'],
    dark_eye: ['dark_perfectGood', 'shot', 'dark'],
    dark_wrath: ['dark_perfectAlt', 'burst', 'dark'],
    dark_end: ['dark_ultimate', 'melee', 'dark'],
    dark_curse: ['dark_ultimateAlt', 'zone', 'dark'],
    shd_kunai: ['shadow_adultGood', 'spread', 'shadow'],
    shd_flee: ['shadow_adultPoor', 'self', 'shadow'],
    shd_arrow: ['shadow_adultAlt', 'shot', 'shadow'],
    shd_snake: ['shadow_perfectGood', 'melee', 'shadow'],
    shd_mist: ['shadow_perfectPoor', 'burst', 'shadow'],
    shd_end: ['shadow_ultimate', 'melee', 'shadow'],
    n_rally: ['flame_baby2', 'self', 'gold'],
    n_breath: ['tide_baby2', 'self', 'gold'],
    n_whip: ['leaf_baby2', 'melee', 'gold'],
    n_guard: ['earth_baby2', 'self', 'gold'],
    n_tackle: ['lightning_baby2', 'charge', 'gold'],
    n_hawk: ['holy_baby2', 'self', 'gold'],
    n_chomp: ['dark_baby2', 'melee', 'gold'],
    n_rock: ['shadow_baby2', 'shot', 'gold'],
    fz_flame_flame: ['fused_flame_flame', 'burst', 'fire'],
    fz_tide_tide: ['fused_tide_tide', 'spread', 'water'],
    fz_leaf_leaf: ['fused_leaf_leaf', 'spread', 'leaf'],
    fz_earth_earth: ['fused_earth_earth', 'burst', 'earth'],
    fz_lightning_lightning: ['fused_lightning_lightning', 'beam', 'bolt'],
    fz_holy_holy: ['fused_holy_holy', 'zone', 'holy'],
    fz_dark_dark: ['fused_dark_dark', 'melee', 'dark'],
    fz_shadow_shadow: ['fused_shadow_shadow', 'melee', 'shadow'],
    fz_flame_tide: ['fused_flame_tide', 'burst', 'fire'],
    fz_leaf_tide: ['fused_leaf_tide', 'zone', 'leaf'],
    fz_flame_leaf: ['fused_flame_leaf', 'spread', 'fire'],
    fz_earth_flame: ['fused_earth_flame', 'zone', 'fire'],
    fz_flame_lightning: ['fused_flame_lightning', 'beam', 'fire'],
    fz_earth_tide: ['fused_earth_tide', 'shot', 'water'],
    fz_lightning_tide: ['fused_lightning_tide', 'burst', 'water'],
    fz_earth_leaf: ['fused_earth_leaf', 'zone', 'leaf'],
    fz_leaf_lightning: ['fused_leaf_lightning', 'multi', 'leaf'],
    fz_earth_lightning: ['fused_earth_lightning', 'charge', 'earth'],
    fz_dark_holy: ['fused_dark_holy', 'beam', 'holy'],
    fz_dark_shadow: ['fused_dark_shadow', 'burst', 'dark'],
    fz_holy_shadow: ['fused_holy_shadow', 'zone', 'holy'],
  }
  // The flourish of a game skill id, or null below Perfect.
  const of = (id) => {
    const info = SKILL_INFO[id]
    if (!info) return null
    const [src, kind, el] = info
    const tier = flourishTierOf(src, 'active')
    if (!tier) return null
    const els = [el]
    if (tier === 3) {
      const other = src
        .slice('fused_'.length)
        .split('_')
        .map((l) => EL[l])
        .find((e) => e !== el)
      els.push(other || 'gold')
    }
    return { tier, kind, els }
  }
  return { of, charge, release, colsOf }
})()
