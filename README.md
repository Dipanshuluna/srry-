# 100 Ways to Say Sorry

A small, music-reactive apology wheel inspired by the attached reference video. One hundred apologies orbit a quiet center where each phrase appears in turn. Upload a song to make the halo react to its frequencies; the wheel also has a gentle demo animation when no song is loaded.

## Run locally

Requirements: Node.js 18 or newer.

```sh
npm install
npm run dev
```

Open the local URL Vite prints in the terminal. Audio files are selected and processed locally in the browser; they are not uploaded to a server.

## Build for production

```sh
npm run build
npm run preview
```

The production output is in `dist/`.

## Deploy to GitHub Pages

Push to the `main` branch to trigger the included GitHub Actions deployment. The site is configured for the repository path `/srry-/` and will be published at `https://dipanshuluna.github.io/srry-/` when the Pages workflow completes. If Pages is not enabled for the repository yet, open **Settings → Pages** and choose **GitHub Actions** as the build and deployment source.

The app is static and needs no environment variables or backend. Vercel also works with `npm run build` and `dist` as the output directory.

## Controls

- Choose a song to load a browser-supported audio file, then use the play button.
- Adjust volume and the glow sensitivity from the player and footer.
- Edit the displayed title and recipient line with **EDIT**.
- Toggle ambience or the optional center note in the footer.
- Press **Space** to play or pause and **F** to enter or exit fullscreen.

The visualizer uses Canvas and the Web Audio API. The supplied reference video showed the Python/Turtle source for the circular text wheel; this implementation recreates the wheel in a responsive browser canvas and adds audio-reactive radial accents.
