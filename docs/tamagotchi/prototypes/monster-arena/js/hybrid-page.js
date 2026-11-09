'use strict'
// Section "ร่างผสมข้ามธาตุ": the 13 cross-line fused forms as animated cards (stand, walk, attack, skill),
// approved by the owner 2026-11-09. Every card has the same canvas so all draw at one pixel scale. They are
// also in the arena pickers (our monster and the foe), under their own group.
{
  const EL_NAME = {
    fire: 'เพลิง',
    water: 'วารี',
    leaf: 'พฤกษ์',
    earth: 'ศิลา',
    bolt: 'อสนี',
    holy: 'รัศมี',
    dark: 'รัตติกาล',
    shadow: 'เงา',
  }
  const groups = [pickMe, pickFoe].map((sel) => {
    const g = document.createElement('optgroup')
    g.label = 'ร่างผสมข้ามธาตุ'
    sel.append(g)
    return g
  })
  for (const [id, name, els] of HYBRIDS) {
    ROSTER[id] = { sprite: id, name, el: els[0], hp: 1270 }
    for (const g of groups) g.append(new Option(name, id))
  }
  // Their own skills (skills/hybrid.js): the button puts that form in our slot, then it casts.
  const row = document.getElementById('hybrid-skills')
  if (row)
    for (const [id, sk] of Object.entries(HYBRID)) {
      const b = document.createElement('button')
      b.className = 'el'
      b.textContent = `${sk.icon} ${ROSTER[sk.hy].name} · ${sk.name}`
      b.addEventListener('click', () =>
        run(async () => {
          if (me.rid !== sk.hy) {
            pickMe.value = sk.hy
            me = makeEnt(sk.hy, 0)
            await wait(500)
          }
          await useFire(id, me, foe)
        })
      )
      row.append(b)
    }
  const box = document.getElementById('hybrid-cards')
  if (box)
    HYBRIDS.forEach(([id, name, els, animal], i) => {
      STAGE_OF[id] = 'fused'
      const d = document.createElement('div')
      d.className = 'show fused ' + els[0]
      const cv = document.createElement('canvas')
      cv.width = 104
      cv.height = 104
      cv.setAttribute('aria-label', name)
      const act = document.createElement('div')
      act.className = 'act'
      d.append(cv, act)
      d.insertAdjacentHTML(
        'beforeend',
        `<span class="rank" style="--c:#d08aff">ร่างผสม <b>★★★★★</b></span>` +
          `<h3>${i + 1}. ${name} <span class="chip new">ขยับแล้ว</span></h3>` +
          `<p class="hint">${EL_NAME[els[0]]} + ${EL_NAME[els[1]]} · ${animal}</p>`
      )
      box.append(d)
      addCard(cv, id, act)
    })
}
