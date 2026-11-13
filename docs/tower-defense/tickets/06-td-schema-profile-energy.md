# 06: `td` schema, profile and energy

**What to build:** Backend repo. A migration creates the Postgres schema `td` (never `public`) with the player profile entity. The profile endpoint returns balances and energy. Energy has a cap of 60, regenerates 1 per 6 minutes lazily from a timestamp (no cron), and a stage costs 6. The game shows the player's energy.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The migration creates the `td` schema and entity tables, and can be reverted
- [ ] Entities link to the user by id only, with no cross-schema foreign key
- [ ] The profile endpoint is JWT-guarded, validated and rate-limited per user
- [ ] Energy regen is correct after an arbitrary offline gap (integration test)
- [ ] The frontend shows live energy; no PII beyond the user id is stored
