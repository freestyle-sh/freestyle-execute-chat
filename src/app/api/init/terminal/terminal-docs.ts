export const terminalDocs = `import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const product = await client.product.list();

  console.log(product.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const product = await client.product.get('prd_XXXXXXXXXXXXXXXXXXXXXXXXX');

  console.log(product.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const response = await client.profile.me();

  console.log(response.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const profile = await client.profile.update({ email: 'john@example.com', name: 'John Doe' });

  console.log(profile.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const address = await client.address.list();

  console.log(address.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const address = await client.address.get('shp_XXXXXXXXXXXXXXXXXXXXXXXXX');

  console.log(address.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const address = await client.address.create({
    city: 'Anytown',
    country: 'US',
    name: 'John Doe',
    street1: '123 Main St',
    zip: '12345',
  });

  console.log(address.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const address = await client.address.delete('shp_XXXXXXXXXXXXXXXXXXXXXXXXX');

  console.log(address.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const card = await client.card.list();

  console.log(card.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const card = await client.card.get('crd_XXXXXXXXXXXXXXXXXXXXXXXXX');

  console.log(card.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const card = await client.card.create({ token: 'tok_1N3T00LkdIwHu7ixt44h1F8k' });

  console.log(card.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const response = await client.card.collect();

  console.log(response.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const card = await client.card.delete('crd_XXXXXXXXXXXXXXXXXXXXXXXXX');

  console.log(card.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const cart = await client.cart.get();

  console.log(cart.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const response = await client.cart.setItem({
    productVariantID: 'var_XXXXXXXXXXXXXXXXXXXXXXXXX',
    quantity: 2,
  });

  console.log(response.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const response = await client.cart.setAddress({ addressID: 'shp_XXXXXXXXXXXXXXXXXXXXXXXXX' });

  console.log(response.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const response = await client.cart.setCard({ cardID: 'crd_XXXXXXXXXXXXXXXXXXXXXXXXX' });

  console.log(response.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const response = await client.cart.convert();

  console.log(response.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const response = await client.cart.clear();

  console.log(response.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const order = await client.order.list();

  console.log(order.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const order = await client.order.get('ord_XXXXXXXXXXXXXXXXXXXXXXXXX');

  console.log(order.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const order = await client.order.create({
    addressID: 'shp_XXXXXXXXXXXXXXXXXXXXXXXXX',
    cardID: 'crd_XXXXXXXXXXXXXXXXXXXXXXXXX',
    variants: { var_XXXXXXXXXXXXXXXXXXXXXXXXX: 1 },
  });

  console.log(order.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const subscription = await client.subscription.list();

  console.log(subscription.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const subscription = await client.subscription.get('sub_XXXXXXXXXXXXXXXXXXXXXXXXX');

  console.log(subscription.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const subscription = await client.subscription.create({
    id: 'sub_XXXXXXXXXXXXXXXXXXXXXXXXX',
    addressID: 'shp_XXXXXXXXXXXXXXXXXXXXXXXXX',
    cardID: 'crd_XXXXXXXXXXXXXXXXXXXXXXXXX',
    productVariantID: 'var_XXXXXXXXXXXXXXXXXXXXXXXXX',
    quantity: 1,
  });

  console.log(subscription.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const subscription = await client.subscription.delete('sub_XXXXXXXXXXXXXXXXXXXXXXXXX');

  console.log(subscription.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const token = await client.token.list();

  console.log(token.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const token = await client.token.get('pat_XXXXXXXXXXXXXXXXXXXXXXXXX');

  console.log(token.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const token = await client.token.create();

  console.log(token.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const token = await client.token.delete('pat_XXXXXXXXXXXXXXXXXXXXXXXXX');

  console.log(token.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const app = await client.app.list();

  console.log(app.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const app = await client.app.get('cli_XXXXXXXXXXXXXXXXXXXXXXXXX');

  console.log(app.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const app = await client.app.create({ name: 'Example App', redirectURI: 'https://example.com/callback' });

  console.log(app.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const app = await client.app.delete('cli_XXXXXXXXXXXXXXXXXXXXXXXXX');

  console.log(app.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const response = await client.view.init();

  console.log(response.data);
}

main();

==================================================
import Terminal from '@terminaldotshop/sdk';

const client = new Terminal({
  bearerToken: process.env['TERMINAL_BEARER_TOKEN'], // This is the default and can be omitted
});

async function main() {
  const email = await client.email.create({ email: 'john@example.com' });

  console.log(email.data);
}

main();

==================================================
`;
export default terminalDocs;
