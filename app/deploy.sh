pnpm run build

cp -r public .next/standalone/app/public
cp -r .next/static .next/standalone/app/.next/static
# cp package-lock.json .next/standalone/package-lock.json
cp ../pnpm-lock.yaml .next/standalone/app/pnpm-lock.yaml
cp .env.production .next/standalone/app/.env.production
cp .env .next/standalone/app/.env

# cd .next/standalone/app

bun run deploy.ts
# npx freestyle deploy --web server.js --domain chat.freestyle.sh
