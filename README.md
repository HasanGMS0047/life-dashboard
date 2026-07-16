# Life Dashboard

A personal life-tracking app with journal, mood, learning, habits, goals, memory gallery, and replay views.

## Local development

```bash
npm install
npx prisma db push
npx prisma generate
npm run dev
```

## Vercel deployment

This app is ready to deploy to Vercel with a real Postgres database.

### Environment variables

Set these in Vercel:

```bash
NEXTAUTH_SECRET=replace-with-a-strong-random-string
NEXTAUTH_URL=https://your-app-name.vercel.app
DATABASE_URL=postgresql://user:password@host:5432/dbname
DIRECT_DATABASE_URL=postgresql://user:password@host:5432/dbname
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Deploy steps

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables above.
4. Deploy.
5. After deployment, run Prisma against the production database:

```bash
npx prisma db push
npx prisma generate
```

### Switching to Supabase later

The app is already structured so the database can change without reworking the app logic. When you move to Supabase, update the database connection values in Vercel and rerun Prisma:

```bash
npx prisma db push
npx prisma generate
```

The app code itself does not need a rewrite for that change.
