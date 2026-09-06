<h1 align="center"><img height="40px" src="https://study-buddy.vercel.app/resources/img/lamp.svg"/> Study-Buddy</h1>
<h3 align="center">A web app to boost your productivity!</h3>

<p align="center">
  <br/><b>This web app includes:<b><br/>
  <br/>⏰ Pomodoro Timer<br/>
  <br/>🗒️ To-Do-List<br/>
  <br/>🎵 Different kinds of ambient sounds and musics<br/>
  <br/>💬 Inspirational quotes supplied by ZenQuotes<br/>
  <br/>🎨 Multiple color themes<br/>
</p>

<h4 align="center">If you need concentration while working or studying, check it out: https://study-buddy.vercel.app/</h4>

## Development

The app lives in [`app/`](app/) — a Vite + React project (the previous plain HTML/CSS/JS version is preserved under [`Study Buddy/`](Study%20Buddy/) until it's fully retired).

```bash
cd app
npm install
npm run dev
```

Adding new music: drop an mp3 into the matching `app/public/music/<genre>/` folder and rerun `npm run dev` or `npm run build` (or `npm run generate:music` directly) — the playlist manifest regenerates automatically from whatever files are on disk.

Quotes are loaded through the serverless `app/api/quotes.js` proxy, which fetches them from ZenQuotes and caches the upstream response at the edge.

### Accounts and cloud sync

Study apps and the Sakura theme unlock after sign-in. Guest timer and to-do data stays local; after sign-in, Study Buddy safely combines that work with the account. Account work syncs through Supabase and the guest workspace is restored on sign-out.

1. Create a Supabase project and run [`supabase/migrations/20260906000000_account_sync.sql`](supabase/migrations/20260906000000_account_sync.sql) in its SQL editor (or with `supabase db push`).
2. In Supabase Auth, enable Google sign-in and add local and deployed app URLs to the redirect allow list.
3. Copy `app/.env.example` to `app/.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

Only the browser-safe publishable key belongs in Vite environment variables. Never expose a Supabase service-role key in the frontend.

### Notifications

The React app includes a local notification inbox for product announcements and completed timer sessions. Users can opt into desktop alerts and independently control timer inbox updates and completion sounds. The app only asks for browser permission after the user enables desktop alerts.

To publish an announcement with the next deployment, add an entry to `app/src/data/notifications.js` with a unique `id`, title, message, and ISO `publishedAt` date. A new ID makes the announcement unread for each user; keeping an existing ID preserves their read state.
