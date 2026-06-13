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

## 🎨 Design — "with soul" (v2)

A distinctly **Persian** palette — warm, not cold.

| | |
|---|---|
| Background | `#0D0A0E` deep warm Persian night |
| Primary | `#C9792A` saffron (زعفران) |
| Secondary | `#8B1A4A` deep rose (رنگ گل) |
| Text | `#F5EFE6` warm cream |
| Encryption | `#2ECC71` trust green (security indicators only) |
| Premium | `#F0B429` gold (rare moments) |

Glassmorphism cards, saffron→rose gradients, a green end-to-end-encryption lock at the top of
every chat, gold-shimmer wordmark, rotating saffron ring on online avatars, and a faint Persian
geometric backdrop. Hero + icon generated with Higgsfield.

**Motion system** (Framer Motion — interaction only, ~30% of moments): page slide+fade,
sent bubbles scale-bounce, received bubbles slide in from the left, button press scale-down,
spring-physics list items, an unlock→lock intro on opening a chat, and a breathing typing
indicator driven by **live Supabase broadcast** (real "is typing" presence, not faked).

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
