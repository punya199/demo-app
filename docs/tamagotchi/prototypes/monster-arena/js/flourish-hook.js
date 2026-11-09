'use strict'
// Plays FLOURISH (flourish.js) around every skill used on this page, like the game does along a replay.
// The game knows each cast's wind-up and release from the server; here the charge starts with the skill
// and the release fires at the first of: the skill's castPose release, its first hit, or its end.
{
  const castPose0 = castPose
  castPose = (att, ...rest) => {
    const p = castPose0(att, ...rest)
    const release0 = p.release
    p.release = (...args) => {
      if (att.onFlourishRelease) att.onFlourishRelease()
      return release0(...args)
    }
    return p
  }
  const damage0 = damage
  damage = (def, amount, opts = {}) => {
    const from = opts.from || other(def)
    if (from && from.onFlourishRelease) from.onFlourishRelease()
    return damage0(def, amount, opts)
  }
  const useFire0 = useFire
  useFire = async (id, att, def) => {
    const f = FLOURISH.of(id)
    if (!f) return useFire0(id, att, def)
    const full = { ...f, chargeSec: 0.7 },
      a = FLOURISH.colsOf(f.els[0]),
      b = FLOURISH.colsOf(f.els[1] || f.els[0])
    FLOURISH.charge(att, full, a, b)
    let fired = false
    att.onFlourishRelease = () => {
      if (fired) return
      fired = true
      att.onFlourishRelease = null
      FLOURISH.release(att, def, full, a, b)
    }
    try {
      await useFire0(id, att, def)
    } finally {
      if (att.onFlourishRelease) att.onFlourishRelease()
    }
  }
}
