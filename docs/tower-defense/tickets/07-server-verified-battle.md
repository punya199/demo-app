# 07: Server-verified battle result

**What to build:** Playing a stage now goes through the server. Starting a battle spends energy and returns a seed and a single-use, expiring battle id. On finish the client sends the input log; the server replays it with `td-sim`, enforces a tick cap, ignores any client-reported damage or rewards, and pays coins through the append-only currency ledger.

**Blocked by:** 04, 06

**Status:** ready-for-agent

- [ ] Start spends energy and returns `{battleId, seed}`; ids are single-use and expire
- [ ] Finish replays server-side and pays coins only for the replayed result
- [ ] A forged or tampered finish request is rejected (integration test)
- [ ] A replay over the tick cap, a reused id and an expired id are all rejected
- [ ] Balances are derived from ledger rows; the frontend is wired to the flow
