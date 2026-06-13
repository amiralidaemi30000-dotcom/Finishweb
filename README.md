<div align="center">

# HAMIK · هامیک

**A private, beautiful messenger for the global Iranian community.**
Built with real fire — in Finland, for every Iranian.

</div>

---

HAMIK is a real-time chat app: dark, glassmorphic, fully RTL, bilingual (فارسی + English),
mobile-first. It runs on a live Supabase backend with Postgres Row-Level Security, realtime
subscriptions, and email/password auth.

## ✨ Features

- **Real auth** — email + password via Supabase Auth.
- **Live chat** — messages stream in over Supabase Realtime, no refresh.
- **Chat list** — your conversations, newest first, with live previews.
- **Start a conversation** — search people by name/username and message them.
- **Profile** — edit display name, username, and bio.
- **RTL-first** — Persian (Vazirmatn) and English (Inter), correct bidi everywhere.
- **Optimistic sending** — bubbles appear instantly, reconcile on save.
- **Security** — every table is guarded by RLS; clients only ever see their own data.

## 🎨 Design — "Persian Lapis Gold" (v3)

Lapis lazuli and real gold — the blue of the Shah Mosque in Isfahan, the Sheikh Lotfollah tiles,
on deepest midnight. Technology, classic, and massive at once.

| | |
|---|---|
| Base | `#080B14` deepest midnight |
| Lapis | `#1A3A6B` Persian mosque blue |
| Royal glow | `#2952A3` |
| Gold | `#D4AF37` real gold |
| Text | `#F0EBE1` warm pearl |
| Encryption | `#1DB954` trust green |
| Alerts | `#7B1C1C` crimson |

A faint **eight-pointed-star (Khatam) mosaic** runs wall-to-wall at ~5% — infinite depth, like
standing inside an Iranian mosque. Lapis glass cards with barely-gold borders, gold unread badges,
a permanent gold-lock encryption indicator on every chat, and a mosque-ceiling hero generated with
Higgsfield.

**Bubbles:** sent are lapis with a slow **gold candlelight sweep** along the top edge; received are
near-invisible pearl frosted glass.

**Motion (Framer Motion, interaction only):** an app-open **splash where هامیک writes itself** in
gold calligraphy; bubbles bloom on send with a **gold ripple** from the send button; received
messages slide in from the left; a chat **unfolds like a letter** on open; page transitions
fade+scale; **breathing** gold typing dots driven by **live Supabase broadcast** (real presence,
not faked); skeleton shimmer (right→left) instead of spinners.

## 🧱 Stack

- **React 18** + **Vite** + **React Router**
- **Tailwind CSS** (custom glass utilities + brand tokens)
- **Framer Motion** for transitions
- **Supabase** — Postgres, Auth, Realtime, RLS
- **lucide-react** icons

## 🗄️ Data model

```
profiles( id → auth.users, username, display_name, avatar_url, bio, last_seen )
conversations( id, is_group, title, created_by, updated_at )
conversation_participants( conversation_id, user_id )
messages( id, conversation_id, sender_id, content, created_at )
```

Helpers: `is_conversation_participant()` (SECURITY DEFINER, avoids RLS recursion),
`get_or_create_direct_conversation()` RPC, auto-profile-on-signup trigger,
`updated_at` bump on new message. Realtime enabled on `messages` + `conversations`.

## 🚀 Run it

```bash
npm install
npm run dev
```

The app ships with working public Supabase credentials baked in, so it runs with **zero setup**.
To point at your own project, copy `.env.example` → `.env` and edit the values.

```bash
npm run build      # production build
npm run preview    # serve the build
```

## 👋 Try it instantly

Sign up with any email, or log in with a seeded demo account:

| Email | Password |
|---|---|
| `darya@hamik.app` | `hamik1234` |
| `arash@hamik.app` | `hamik1234` |
| `sara@hamik.app`  | `hamik1234` |

> Open two browser windows, log in as two different users, and watch messages appear live.

## 🔐 Note on email confirmation

New sign-ups work immediately if "Confirm email" is **off** in your Supabase Auth settings
(Dashboard → Authentication → Providers → Email). The seeded demo accounts above are
pre-confirmed, so they always log in. The login screen handles both cases gracefully.

---

<div align="center">
Made with ❤️ for the Iranian diaspora.
</div>
