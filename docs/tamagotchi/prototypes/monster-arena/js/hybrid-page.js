'use strict'
// Section "ร่างผสมข้ามธาตุ": the 13 cross-line fused forms as still cards (one idle frame, no particles)
// until the owner approves the pictures. Every card has the same canvas so all draw at one pixel scale.
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
          `<h3>${i + 1}. ${name} <span class="chip new">ภาพนิ่ง</span></h3>` +
          `<p class="hint">${EL_NAME[els[0]]} + ${EL_NAME[els[1]]} · ${animal}</p>`
      )
      box.append(d)
      addCard(cv, id, act, 8, true)
    })
}
