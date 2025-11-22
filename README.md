# WeBe Estimate

This repo contains the Firebase Studio generated starter for the WeBe Estimate UI. The project uses Next.js (App Router), Tailwind CSS, and the Firebase web SDKs.

## Local Development
- `npm install`
- Copy `.env.example` to `.env.local` and paste your Firebase web config as the JSON string for `NEXT_PUBLIC_FIREBASE_CONFIG`
- Provide the WeBe integration values:
	- `NEXT_PUBLIC_WEBE_APP_ORIGIN` (e.g. `https://app.webe.ws`)
	- `NEXT_PUBLIC_WEBE_API_BASE_URL` (same as origin unless overridden)
	- Optional `NEXT_PUBLIC_ALLOW_ANON_FALLBACK=true` when testing the estimator outside of the main app
- `npm run dev`

The Firebase app boots automatically if `NEXT_PUBLIC_FIREBASE_CONFIG` is present. If you prefer to hardcode values for quick prototyping, you can temporarily edit `src/firebase/config.ts`, but avoid committing secrets.

## Firebase Project Linking
- Ensure the Firebase CLI is available. If global installs are locked down, run `npm install --save-dev firebase-tools` (already in package.json) and use `npx firebase <command>`
- Log in once locally: `npx firebase login`
- Point the repo at the Studio project `studio-4082797513-9a323`: `npx firebase use studio-4082797513-9a323`
- Run `npx firebase projects:list` to verify the alias and access

Additional Firebase products (Hosting, Auth, Storage rules) can be configured later via Firebase Console or `firebase init`. For App Hosting, the runtime will inject the config automatically, so keep the environment variable fallback for local runs.

## GitHub

The repository is already linked to GitHub at `https://github.com/MarlinGF/WeBe-Estimate`. Push your changes with the usual Git workflow:

```bash
git add .
git commit -m "Describe the change"
git push origin main
```

## Next Steps
- Flesh out the core estimate flows under `src/app/(app)`
- Confirm which Firebase products are required (Auth, Firestore, Storage)
- Coordinate with the main WeBe project on deployment (subdomain vs. integrated route)
- Hook UI actions (e.g. “Message customer”) to the new helpers in `src/lib/webe-api.ts`
