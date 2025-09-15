# Midjourney Clone

A Next.js application that replicates the core functionality of Midjourney. It integrates with OpenAI, Sora and Cloudinary to generate and manage AI images. The project also uses PayPal subscriptions and Clerk for authentication.

## Requirements

- Node.js 18 or newer
- PostgreSQL database
- Redis server (optional but recommended)
- Accounts for OpenAI, Cloudinary, PayPal and Clerk

## Environment variables

All configuration is handled through environment variables. Copy `.env.example` to `.env` and update the values for your environment.

## Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000` by default.

## Production

Build the application with:

```bash
npm run build
```

Then start it with `npm start` or your preferred process manager.

