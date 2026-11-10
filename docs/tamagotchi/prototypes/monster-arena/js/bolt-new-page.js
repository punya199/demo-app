'use strict'
// Section "สายอสนีโฉมใหม่": the 9 remodelled lightning forms as still drafts beside the current art,
// waiting for the owner's approval before they are cut into parts and animated (sprites/bolt-new.js).
{
  const FORMS = [
    ['tbird', 'นกฟ้าผ่า', 'ร่างโต', 'ปีกฟ้าผ่า: กระพือปีกยิงขนสายฟ้า'],
    ['staticcat', 'แมวไฟสถิต', 'ร่างโต', 'ขนพองช็อต: ขนพองเป็นลูกหนาม ใครตีโดนช็อต'],
    ['stormfox', 'จิ้งจอกพายุ', 'ร่างโต', 'ข่วนสายฟ้า: พุ่งข่วนสามรอย'],
    ['hawk', 'เหยี่ยวพายุ', 'ร่างสมบูรณ์', 'โฉบอสนี: บินสูงแล้วโฉบพุ่ง'],
    ['gloomcloud', 'เมฆหม่นขี้เกียจ', 'ร่างสมบูรณ์', 'ฟ้าคำราม: ฟ้าผ่าลงเป็นแถว'],
    ['boltfox', 'จิ้งจอกอสนี', 'ร่างสมบูรณ์', 'หางอสนี: หางม้วน ตัวลุกเป็นออร่าไฟฟ้า'],
    ['thunderking', 'วิหคราชาอสนี', 'ร่างสูงสุด', 'อสนีบาต: รวมพลังที่จะงอยปาก ยิงลำแสง'],
    ['foxking', 'ราชาจิ้งจอกอสนี', 'ร่างสูงสุด', 'หางปาอสนี: หางห้าหางปาสายฟ้าเป็นพัด'],
    ['bfused', 'อสนีผู้ตื่น', 'ร่างผสม', 'อสนีบาตพันสาย: ลำแสงใหญ่ แตกสาขา'],
  ]
  const box = document.getElementById('boltnew-cards')
  if (box)
    FORMS.forEach(([old, name, stage, skill], i) => {
      const id = 'nb_' + old
      STAGE_OF[id] = STAGE_OF[old]
      const d = document.createElement('div')
      d.className = 'show bolt'
      const cv = document.createElement('canvas')
      cv.width = 104
      cv.height = 104
      cv.setAttribute('aria-label', name + ' แบบใหม่')
      const was = document.createElement('canvas')
      was.width = 104
      was.height = 104
      was.style.opacity = '0.75'
      was.setAttribute('aria-label', name + ' แบบเดิม')
      const pair = document.createElement('div')
      pair.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;align-items:end;gap:4px'
      pair.append(cv, was)
      d.append(pair)
      d.insertAdjacentHTML(
        'beforeend',
        `<h3>${i + 1}. ${name} <span class="chip new">ภาพนิ่ง</span></h3>` +
          `<p class="hint">${stage} · ${skill}</p><p class="hint">รูปขวาจางคือแบบเดิม</p>`
      )
      box.append(d)
      addCard(cv, id, null, 8, true)
      addCard(was, old, null, 8, true)
    })
}
