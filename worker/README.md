# Hidden-key backend (Cloudflare Worker)

This makes Professor AI work **without visitors needing their own API key** —
your Anthropic key lives on the server, hidden from everyone.

It's free. The whole setup takes about 5 minutes, all in the Cloudflare
dashboard — no command line needed.

---

## Step 1 — Create a free Cloudflare account

1. Go to **https://dash.cloudflare.com/sign-up** and sign up (free).
2. After logging in, in the left sidebar click **Workers & Pages**.

## Step 2 — Create the Worker

1. Click **Create application** → **Create Worker**.
2. Give it a name, e.g. **`professor-ai`**.
3. Click **Deploy** (it deploys a placeholder — that's fine).
4. Click **Edit code**.
5. Delete everything in the editor, then **copy–paste the entire contents
   of [`professor-ai-worker.js`](./professor-ai-worker.js)** into it.
6. Click **Deploy** (top right).

## Step 3 — Add your API key as a secret

1. Go back to the Worker's page → **Settings** → **Variables and Secrets**
   (older dashboards call it *Settings → Variables*).
2. Click **Add** → choose type **Secret**.
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key, `sk-ant-...`
3. Click **Save / Deploy**.

> 🔒 Put your key **only here**, in Cloudflare — never in chat or in the code.
> You get a key at https://console.anthropic.com → *API Keys*.

## Step 4 — Copy the Worker URL

On the Worker's page you'll see its address, something like:

```
https://professor-ai.YOURNAME.workers.dev
```

**Copy that URL and send it to me.** I'll plug it into the website and push —
after that, the live site needs no key from anyone.

---

## How it stays safe

- The key is a Cloudflare **secret** — not in the website, not in this repo.
- The Worker only accepts requests from your live site (origin lock).
- It only allows the `claude-sonnet-4-6` model and caps `max_tokens`, so the
  key can't be abused for huge/expensive requests.

If you ever expect heavy public traffic, tell me and I can tighten this further
(e.g. pin the grading prompt server-side, or add rate limiting).
