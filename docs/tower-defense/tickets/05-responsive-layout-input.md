# 05: Responsive layout and input

**What to build:** The game works well on phone and desktop. Under 768px (portrait): lane on top, board on the bottom 60%, bottom tab bar for menus. At 768px and up: lane and board side by side, menus in a left rail. Pointer events only (touch and mouse), keyboard shortcuts on desktop, canvas scaled with a resize observer and DPR capped at 2x, Thai and English strings through simple string tables.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Both layouts render correctly at phone and desktop widths with no horizontal scroll
- [ ] Touch and mouse both place gears; keyboard shortcuts work on desktop
- [ ] The canvas stays sharp and within the DPR cap on resize and rotation
- [ ] All visible text comes from the string tables in Thai and English
