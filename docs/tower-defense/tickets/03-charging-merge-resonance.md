# 03: Charging, adjacency, merge and Resonance

**What to build:** The real board rules. The board has an energy source on an edge and a few -2 tiles. A gear fires only once charged through an edge-link to the source, directly or via a chain of adjacent gears; more touching sides means faster charge and higher output. Two identical gears merge into level n+1. Adjacent matching gears grant crit chance (Resonance).

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Unlinked gears never charge; linked gears charge faster with more touching sides
- [ ] A -2 tile measurably lowers a gear's output
- [ ] Merging two identical gears yields n+1, and is always at least as strong as the two parts
- [ ] Adjacent matching gears raise crit chance
- [ ] Golden-replay tests cover each rule; all numbers come from the single config file
