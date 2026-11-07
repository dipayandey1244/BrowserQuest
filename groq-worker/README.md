# Secure Groq advisors for BrowserQuest

The main GitHub Pages game runs with scripted advisors until a backend is deployed.

1. **Revoke the API key that was shared in chat** and create a new one in the [Groq Console](https://console.groq.com/keys).
2. Create a Cloudflare Worker and paste the code from `worker.js`. Deploy it to obtain an HTTPS Worker URL.
3. In Cloudflare Worker settings, add an encrypted **secret** named `GROQ_API_KEY` containing the replacement key. Do not add it to GitHub or to browser JavaScript.
4. Edit `../agent-config.js` and set `window.BROWSERQUEST_AGENT_ENDPOINT` to your Worker URL.
5. Commit the configuration and reload the game. The advisors will call the Worker, and if the API fails they will fall back to scripted advice.

The Worker accepts requests only from the GitHub Pages origin via an origin check and CORS. **Origin checking is not authentication or abuse prevention**: before opening the endpoint to the public, configure Cloudflare WAF rate limits, Turnstile verification, and Groq usage budgets. Client-provided world state is untrusted and used only as narrative context. The deterministic game engine remains authoritative for consequences.

No Groq key is stored in this repository.
