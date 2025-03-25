npm run build

cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
cp script/entry.js .next/standalone/entry.js
cp package-lock.json .next/standalone/package-lock.json

cd .next/standalone
npx freestyle deploy --web entry.js --domain chat.freestyle.sh
