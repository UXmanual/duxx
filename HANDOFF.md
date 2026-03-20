# Duxx Handoff

## Assistant Identity

- Call the coding agent `지코`.
- When starting a work response, begin with `지코입니다.`
- When a requested task is actually finished, end the final response with `작업이 완료되었습니다.`

## Deployment Rules

- If the user says `배포해`, `배포해줘`, or similar:
  - Always bump the version in `package.json`
  - Run build verification
  - Deploy with Vercel
  - Do **not** commit or push
- If the user says `최종배포해`, `최종 배포해`, or similar:
  - Always bump the version in `package.json`
  - Run build verification
  - Commit
  - Push to `main`
  - Deploy with Vercel

## Deployment Output Format

- Always include:
  - deployed version
  - deployment URL
  - production URL
  - whether `commit/push` was performed

## Current Production State

- Production URL: `https://duxx.vercel.app`
- Latest final deployed version: `50.4`
- Latest final deployed commit: `5626a00`
- Latest final deploy message: `Refine transit sheet and loading states`

## Git Branch

- Primary branch: `main`

## Current Product Notes

- Seoul Station subway UI uses `src/components/Sidebar.jsx`
- Flower market sheet is an independent component:
  - `src/components/FlowerMarketSheet.jsx`
- Flower market destination name is unified as:
  - `양재동 화훼공판장`
- TMAP connection for flower market uses mobile deep link search

## UX Rules Already Agreed

- Subway bottom sheet should open at `90%` height on mobile
- Changing weekday/saturday/holiday tabs should not reset subway sheet height
- Desktop subway hour tabs support drag scrolling
- Quick deploys still require version bumps
- Final deploys require version bump + commit + push + deploy

## Recommended Workflow On Another PC

1. Pull latest `main`
2. Open this `HANDOFF.md`
3. Follow the deployment rules above
4. Check `package.json` version before and after work

## Important Reminder

- Quick deploy does not mean unfinished versioning
- Version bump is mandatory whenever a user-visible change is deployed
- Avoid parallel `commit/push/deploy` ordering mistakes; run them sequentially
