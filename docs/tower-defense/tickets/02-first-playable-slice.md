# 02: First playable slice

**What to build:** A "Tower Defense" card on the Games page opens a canvas game. The player summons a gear for run-gold, places it on a tile, a hero fires at an enemy walking the lane, and HQ health drops when an enemy leaks. Shapes only, offline, no backend.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The card appears on the Games page and the route is registered with the existing router and path conventions (lazy-loaded)
- [ ] Summon spends run-gold and puts a random gear on a free tile
- [ ] An enemy walks the lane and a placed gear damages it through `td-sim`
- [ ] HQ health drops on a leak and the run ends at zero
- [ ] Sim logic is pure and covered by Vitest; rendering is not tested
