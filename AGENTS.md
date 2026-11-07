# BrowserQuest AI — Engineering Guide

## Product goal
Create a mobile-first playable BrowserQuest variant with Groq-powered conversational NPCs. Preserve the original game assets and license notices.

## Existing architecture
- `client/`: HTML5 browser game.
- `server/`: legacy multiplayer/WebSocket game server.
- `shared/js/`: shared game logic.
- `bin/build.sh`: historical production client build.
- Root `package.json`: legacy Node dependencies; do not assume modern Node compatibility.

## Delivery principles
1. First establish a working reproducible local game and mobile controls; do not introduce Groq until the game loop works.
2. Keep player movement, combat, inventory, and quest rewards authoritative in the game server. LLMs only propose dialogue and allowed quest intents.
3. Never expose `GROQ_API_KEY` in frontend code, static assets, commits, or GitHub Pages.
4. Route LLM requests through a backend endpoint with input validation, per-player rate limits, timeouts, output validation, and a deterministic fallback.
5. Keep prompts small: NPC persona, compact player state, and bounded conversation history.
6. Measure response latency, token usage, failures, and NPC dialogue quality.
7. Keep MPL-2.0 code and CC-BY-SA 3.0 content attribution/licensing intact.

## Milestones
- M0: Audit repository and confirm development/build commands on supported runtime; document blockers.
- M1: Mobile browser demo with touch controls, responsive viewport, and a reachable game server.
- M2: One Groq-backed NPC using a server-side API proxy, with language selection (English/Hindi/Bengali).
- M3: NPC memory and constrained quest suggestions; no arbitrary game-state mutation.
- M4: Evaluation dashboard: latency, response quality, hallucinated actions, and cost.
- M5: Deploy client and persistent multiplayer server separately; test on Safari iOS.

## First task
Inspect the game startup path, client WebSocket configuration, and server runtime compatibility. Report findings and a minimal implementation plan before broad changes.
