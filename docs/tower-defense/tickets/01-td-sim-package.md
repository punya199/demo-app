# 01: `td-sim` package and distribution

**What to build:** A private, pure-TypeScript `td-sim` package (no DOM, no Nest imports) with a seeded RNG and a fixed-timestep tick loop, installed and importable from both the frontend and the backend repos. Settle how it is distributed (private npm, git dependency or submodule) and record the decision.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] The distribution method is chosen and written down with the reason
- [ ] Both repos install the package and import it in a smoke test
- [ ] The same seed and inputs give a byte-identical result in both repos
- [ ] One golden-replay test runs in the package's own CI
- [ ] The package has no DOM or Nest imports (enforced by lint or tsconfig)
