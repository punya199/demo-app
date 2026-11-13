# 08: Gacha, heroes and gems

**What to build:** Twelve heroes (3 roles, 4 each; Common, Rare, Epic, Legendary) and one standard banner. A pull costs 150 gems, a 10-pull 1,350, with 1 free pull per day. Rates: Common 60%, Rare 30%, Epic 8%, Legendary 2%, with a Legendary guaranteed within 50 pulls. Rates are shown in-game. Rolls are server-side, seeded and logged. Duplicates convert to shards.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] Single and 10-pull spend gems through the ledger and grant heroes
- [ ] The daily free pull is claimable once per day
- [ ] Pity guarantees a Legendary within 50 pulls and persists across sessions
- [ ] Duplicate pulls become shards
- [ ] Rates are displayed, and every pull is logged with its seed
- [ ] Insufficient gems and concurrent pulls are rejected safely
