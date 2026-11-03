// The real photos behind the photo levels, shown when one is won. Kept out of
// photo-levels.ts so the tray generator (run in Node) never imports an image.

import cat from './photos/cat.jpg'

/** Photo and the part of it (x, y, w, h in photo pixels) the level's picture was made from. */
export const PHOTO_ASSETS: Record<string, { src: string; crop: number[] }> = {
  แมวง่วงนอน: { src: cat, crop: [0, 426, 1500, 1313] },
}
