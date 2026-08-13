# X-Tracker

X-Tracker is a cross-platform expense app for personal finances and shared trips. The web client is built with Ionic Angular and the API is built with ASP.NET Core and Entity Framework Core.

## Project layout

```text
client/   Ionic Angular web and Capacitor client
Server/   ASP.NET Core API and EF Core migrations
```

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- .NET SDK 10+
- Xcode 16+ for iOS builds
- Android Studio and an Android SDK for Android builds

Global Angular and Ionic CLIs are optional. The project uses local CLI packages through npm scripts and npx.

## Configure the API

Development uses `client/src/environments/environment.ts` and expects the API at:

```text
https://localhost:7043/api
```

Production uses `/api` from `client/src/environments/environment.prod.ts`. Deploy the client behind the same host or configure a reverse proxy to forward `/api` to ASP.NET.

## Run locally

Start the API in one terminal:

```bash
cd Server
dotnet restore
dotnet run
```

Start the Ionic client in another:

```bash
cd client
npm ci
npm start
```

Open http://localhost:8100. If the local HTTPS certificate is not trusted:

```bash
dotnet dev-certs https --trust
```

To test on an iPhone, do not use `localhost`: it means the iPhone itself. Serve the client from an HTTPS URL reachable by the phone (a deployed URL or HTTPS tunnel), and configure Google OAuth with that URL. The sign-in flow returns to the exact browser URL that initiated it.

## Web commands

```bash
cd client
npm start
npm run build
npm run build:development
npm run lint
npm test -- --watch=false --browsers=ChromeHeadless
```

The production build is written to `client/www` and is an installable PWA. It needs HTTPS in production (or `localhost` while developing) for the offline service worker to run.

## Install the PWA

Deploy the contents of `client/www` behind HTTPS, with `/api` routed to the ASP.NET API. Then open the site in a browser:

- **iPhone / iPad:** Safari → Share → **Add to Home Screen**.
- **Android:** Chrome → menu → **Install app** (or **Add to Home screen**).
- **Desktop:** Chrome or Edge → Install icon in the address bar.

The first visit downloads the app shell. Later visits can open the interface without a network connection; actions and account data still require the API, and are never stored in the service-worker cache. API routes are excluded from PWA navigation handling, which is required for OAuth sign-in redirects. Deploy every update with the generated `ngsw.json` file so installed apps receive the new version.

Google sign-in requires the public **HTTPS** app URL to be configured in Google Cloud OAuth. The web client and `/api` must use the same host so the secure `XTracker.Auth` session cookie is sent to `/api/auth/me` after Google redirects back. The Google callback (`/signin-google`) and all `/api` routes intentionally bypass the PWA service worker.

## iOS and Android

Capacitor is configured with the app identity `com.xtracker.app`. Native platform folders are generated locally because Xcode and Android Studio add machine-specific files.

Install the native packages once:

```bash
cd client
npm install @capacitor/ios@8.5.0 @capacitor/android@8.5.0
```

Create the native projects once:

```bash
npx cap add ios
npx cap add android
```

Build and synchronize web assets:

```bash
npm run cap:sync
```

Open or run the native projects:

```bash
npm run cap:open:ios
npm run cap:open:android
npx cap run ios
npx cap run android
```

After changing Angular code, run `npm run cap:sync` before testing in Xcode or Android Studio.

## Production checklist

1. Configure the production API URL or reverse proxy `/api`.
2. Configure Google OAuth callback URLs for the deployed web and mobile flows.
3. Run EF migrations against the production database.
4. Verify mobile viewport, dark mode, invite links, and offline-safe loading states.
5. Build and test both native projects from clean environments before release.

## Verification

```bash
cd Server && dotnet build --no-restore
cd ../client && npx tsc -p tsconfig.app.json --noEmit
```

The Angular CLI production builder may require a workstation with sufficient native memory. The direct TypeScript command provides fast compiler diagnostics for CI.
