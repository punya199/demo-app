# 15: Sweep

**What to build:** A stage cleared with 3 stars can be swept: the player claims its rewards without replaying, at the normal energy cost, entirely server-side.

**Blocked by:** 11

**Status:** ready-for-agent

- [ ] Sweep is available only on 3-star stages
- [ ] It spends the stage's energy and pays the stage's rewards through the ledger
- [ ] Sweep on a stage below 3 stars or with too little energy is rejected
- [ ] Repeated and concurrent sweeps are handled safely
