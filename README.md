# Photo Contest CMS

The admin panel for a photo-contest community platform. The site owner uses it to manage contest events and past events, weekly top-ten lists, activity and call-outs, user-submitted images, notifications, and the ChatGPT prompts used for AI photo feedback. It talks to [photo-contest-api](https://github.com/anwarzonash-eng/photo-contest-api).

## Tech stack

- Next.js 14 (Pages Router), React 18, TypeScript
- TanStack Query, Axios, Formik + Yup
- `crypto-js` for client-side payload encryption, `js-cookie` for sessions

## Getting started

Requirements: Node.js 18+ and a running instance of photo-contest-api.

```bash
git clone https://github.com/anwarzonash-eng/photo-contest-cms.git
cd photo-contest-cms
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL and your own keys
npm run dev                  # http://localhost:3000
```

Production: `npm run build && npm start` (port 3030).

## Configuration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of photo-contest-api |
| `NEXT_PUBLIC_SECRET_KEY`, `NEXT_PUBLIC_SECRET_KEY_FOR_FRONTEND` | Keys for client-side payload encryption; they are visible in the browser, so do not treat them as secret |

## Project structure

```
src/
  components/   layout and forms
  services/     API clients
  schemas/      Yup validation schemas
  utils/        encryption and helpers
```

## Roadmap

See [ROADMAP.md](ROADMAP.md).

## License

[MIT](LICENSE)
