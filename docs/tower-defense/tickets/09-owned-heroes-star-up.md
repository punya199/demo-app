# 09: Owned heroes in battle and star-ups

**What to build:** The summon pool in battle is made of the heroes the player owns. Spending shards raises a hero's star level, which unlocks stronger skills. The server's replay uses the same owned-hero snapshot taken at battle start.

**Blocked by:** 07, 08

**Status:** ready-for-agent

- [ ] A battle's summon pool matches the player's owned heroes, snapshotted at start
- [ ] Star-up spends shards, raises the level and unlocks the stronger skill
- [ ] The replay uses the snapshot, so a mid-battle change cannot affect the result
- [ ] Star-up with too few shards is rejected
