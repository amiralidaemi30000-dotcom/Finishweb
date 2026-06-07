# Professor AI — Business Research Evaluator

A website that grades business research papers as a strict, world-class business
school professor would. Upload a paper (PDF or pasted text, **English or
Finnish**) and get a 0–100 grade with a full breakdown, listed weaknesses, and
rewritten versions of the weakest sections.

## Live site

Once GitHub Pages is enabled for this repo, the site is published at:

```
https://amiralidaemi30000-dotcom.github.io/finishweb/
```

Deployment is automated by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds and publishes the static site on every push to the default branch.

> **First-time setup:** In the repo's **Settings → Pages**, set the source to
> **GitHub Actions** (the workflow also attempts to enable this automatically on
> its first run). After the first successful workflow run, the URL above goes live.

## How it works

- **Single static page** (`index.html`) with embedded CSS and JS — no build step.
- Calls the **Claude API** (`claude-sonnet-4-6`) directly from the browser using
  structured JSON output, so the grade breakdown, problems, strengths, and
  rewrites render reliably.
- Grading weights: Structure & Organization 20% · Argument Quality 25% ·
  Research Methodology 25% · Citations & Sources 15% · Originality 15%.
- Dark academic design — deep navy and gold, serif typography, an animated
  score ring and count-up counter.

## Using it

1. Open the site.
2. Paste your **Anthropic API key** (`sk-ant-…`) — it is stored only in your
   browser's `localStorage` and sent directly to Anthropic, nowhere else.
3. Paste your paper or upload a PDF.
4. Click **Evaluate Paper**.

## A note on the API key

Because this is a purely static site (no backend), each visitor brings their own
Anthropic API key, entered in the browser. If you later want a public site where
the key is hidden from users, that requires a small server-side proxy (a backend
that holds the key and forwards requests) — happy to add that on request.

## Running locally

It's a single file — just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```
