# MoroccoPath Mobile

React Native (Expo) companion app for the MoroccoPath Laravel API.

## Requirements

- Node 22 LTS (`mise install node@22`) — Node 26 breaks Expo tooling
- The Laravel backend running locally

## Setup

```bash
mise exec node@22 -- npm install
```

Start the Laravel API on all interfaces (so your phone can reach it):

```bash
cd ../MoroccoPath && php artisan serve --host=0.0.0.0 --port=8000
```

Then run the app and scan the QR with **Expo Go**:

```bash
mise exec node@22 -- npx expo start
```

The API base URL is auto-detected from the Expo dev server host
(emulator → `10.0.2.2`, physical device → your PC's LAN IP).
Override `MANUAL_BASE` in `src/api/client.ts` for production builds.

## Auth flow

Register an account on the web app, then log in from the app
(`POST /api/v1/auth/token`). The token is persisted in AsyncStorage;
log out revokes it (`DELETE /api/v1/auth/token`).

## Verify before pushing changes

```bash
npx tsc --noEmit
npx expo export --platform android
```
