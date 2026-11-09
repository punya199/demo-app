# Farm effects are server-side timer multipliers; the Farm is only a view

Furniture stretches the four Care timers (hungry, weak, poop, sick) by multiplying the stage minutes inside the backend care engine, for all of a player's monsters, including while they are offline and including monsters out on an expedition. The browser never computes a stat: the Farm room only draws what the server state already says each monster is doing. We rejected a client-simulated room and per-monster coverage maths because a client-side effect would be skipped offline and would diverge from battle stats, which are derived from the same hearts.

Furniture tier 1 is bought with coins; tiers 2 and 3 are guaranteed (no dice, no pity) upgrades made through the existing craft queue, which holds one job per player and no longer offers a coin skip for any craft.
