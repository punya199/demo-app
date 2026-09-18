# Voting feature (frontend)

> Draft spec — pending publish to GitHub Issues in `punya199/demo-app` (labels: `ready-for-agent`). Depends on the backend spec at `demo-app-backend/.scratch/voting-feature/SPEC.md` (entities, API contract, permission enum, dedupe/tally logic all decided there — this spec covers only this repo's UI/routing/permission-mirror work).

## Problem Statement

Once the backend can store polls and votes, there's no way for a user of this app to actually create a poll, share it, vote on one, or see results — the feature needs a UI surface end to end, including a public (unauthenticated) voting page, since polls can be shared outside the app.

## Solution

Add a permission-gated "Voting" section to the app: a "My polls" list + create-poll flow for logged-in users with the `VOTING` permission, and a separate public voting page reachable only via a poll's shared link, usable without logging in.

## User Stories

1. As a permissioned user, I want a "Voting" item in the app's navigation, so that I can find the feature without knowing a direct URL.
2. As a logged-in user without the `VOTING` permission, I want the "Voting" menu item hidden, so that the navigation only shows features I can actually use (matching how `house-rent` already behaves).
3. As a permissioned user, I want a "My polls" page listing polls I created or voted on, so that I have a way back into a poll without keeping its link.
4. As a permissioned user, I want a "Create poll" flow where I set a title, description, poll type (single/multiple/ranking), options list, optional max-selections (for multiple-choice), and optional closing date, so that I can configure my poll fully at creation time.
5. As a poll creator, I want the shareable public link surfaced immediately after creating a poll (and findable again from "My polls"), so that I can send it out right away.
6. As a poll creator, I want to close my poll manually from "My polls", so that I can end voting early.
7. As a poll creator, I want to edit my poll's title/description after votes exist, but not its options, so that the UI reflects the backend's locking rule rather than silently allowing an edit that will be rejected.
8. As an anonymous visitor with a poll link, I want to load a public voting page that works without logging in, so that the link works for people outside the app.
9. As a single-choice voter, I want a radio-button style selection UI, so that the interaction makes "pick one" obvious.
10. As a multiple-choice voter, I want a checkbox-style selection UI that stops me selecting past the configured maximum (if any), so that I get feedback before submitting an invalid vote.
11. As a ranked-choice voter, I want a drag-or-button-based reordering UI covering all options, so that I can express a full preference order.
12. As any voter, I want to see a confirmation that my vote was recorded, and be able to come back and change it before the poll closes, so that the "editable vote" behavior is visible, not just backend-permitted.
13. As any voter, I want results hidden until I've voted, then shown automatically after I submit, so that I'm not anchored by others' choices first.
14. As any voter who has already voted, I want the results view to refresh periodically without a manual reload, so that the "live" tally is visible while I'm on the page.
15. As any voter, I want results shown only as aggregate counts/scores, never as a list of who voted for what.
16. As a developer maintaining this codebase, I want the `VOTING` value added to this repo's hand-duplicated `EnumPermissionFeatureName` copy (`src/services/permission/permission.params.ts`), so that `usePermissionRouteAllow` can gate the menu item consistently with the backend's permission check.

## Implementation Decisions

**Routing**: new path constant(s) in `src/config/app-paths.ts` (e.g. `appPath.voting()`, `appPath.votingCreate()`, `appPath.votingDetail(:id)`) via `generatePath`; lazy-loaded route components registered in `src/App.tsx`'s router tree, following the existing pattern for every other feature.

**Public voting route**: a separate path (e.g. `/vote/:slug`) that is **not** wrapped in `<Authorize>` — this is the one route in the app allowed to render without a login check, since it must work for anonymous visitors. It should still work for a logged-in user visiting the same link (their vote is then tied to their account per the backend's identity resolution).

**Navigation**: new "Voting" item added to `src/layouts/Navbar.tsx`'s menu items array, gated with `usePermissionRouteAllow(EnumPermissionFeatureName.VOTING, { requiredRead: true })`, matching the existing `house-rent` menu-item pattern (`menuHouseRentAllowed`).

**Feature directory**: self-contained under `src/pages/voting/` (or `src/pages/project/voting/`, matching sibling features), with its own components, store (if any local UI state is needed — e.g. in-progress ranking order before submit), and query hooks — no direct `apiClient` calls from components, per existing convention.

**Data fetching**: TanStack Query hooks in a `voting-service.tsx`/`voting.query.ts` file, following the `house-rent-service.tsx`/`user.query.ts` pattern. The results view uses `refetchInterval` while mounted (e.g. every few seconds) to approximate "live" results — no websocket client needed.

**Permission enum mirror**: `VOTING` added to `EnumPermissionFeatureName` in `src/services/permission/permission.params.ts`, kept in sync by hand with the backend's enum (no shared package exists between the repos) — this must land in the same change as the backend migration or the two repos' permission checks disagree.

## Testing Decisions

Existing convention here is pure-function/logic tests (`helper.test.ts`, `ledger-calculations.test.ts`) plus one existing precedent for a component test (`LoadingSpin.test.tsx`) — component testing isn't a strong existing norm in this repo.

- Any client-side pure logic this feature introduces (e.g. client-side validation of "selections don't exceed maxSelections" before submit, or ranking-order helpers) gets a direct Vitest unit test, same shape as `ledger-calculations.test.ts` — test the function, not the component wrapping it.
- No new component/page tests are added as part of this spec, consistent with how every other feature page (`house-rent`, `bill`, `paojiao-ledger` pages) currently ships without them.

## Out of Scope

- Real-time push (websocket/SSE) — polling refetch only.
- Poll discovery/browse UI (listing all public polls) — link-only access plus "My polls".
- Any UI for viewing individual voter responses — aggregate results only, matches backend.
- Rich option content (images, formatting) — plain text labels only.
- A shared frontend/backend package for `EnumPermissionFeatureName` — out of scope for this feature, stays hand-duplicated as today.

## Further Notes

The public voting page is a new kind of route for this app (first one that must render correctly for a fully-unauthenticated visitor) — worth a deliberate pass checking it doesn't accidentally pull in anything from the authenticated shell (e.g. `RootLayout`'s auth-dependent chrome) that assumes a logged-in user exists.
