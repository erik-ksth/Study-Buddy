<h1 align="center"><img height="40px" src="https://study-buddy.vercel.app/resources/img/lamp.svg"/> Study-Buddy</h1>
<h3 align="center">A web app to boost your productivity!</h3>

<p align="center">
  <br/><b>This web app includes:<b><br/>
  <br/>⏰ Pomodoro Timer<br/>
  <br/>🗒️ To-Do-List<br/>
  <br/>🎵 Different kinds of ambient sounds and musics<br/>
  <br/>💬 Inspriational quotes by famouse people, plus your own<br/>
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

Adding quotes: use the "+" button under the quote card in the app itself, or edit `app/src/data/quotes.json` directly.
