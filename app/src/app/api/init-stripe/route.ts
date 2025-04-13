import stripe from "@/lib/stripe";

export async function POST() {
  // if (request.headers.get("Authorization") !== "SuperSecretPassword") {
  //   return new Response("Nope.", { status: 401 });
  // }
  const inputMeter = await stripe.billing.meters.create({
    event_name: "INPUT_TOKENS",
    display_name: "Input Tokens",

    default_aggregation: {
      formula: "sum",
    },
  });

  const outputMeter = await stripe.billing.meters.create({
    event_name: "OUTPUT_TOKENS",
    display_name: "Output Tokens",

    default_aggregation: {
      formula: "sum",
    },
  });

  const inputTokensProduct = await stripe.products.create({
    name: "Input Tokens",
    type: "service",
  });

  const outputTokensProduct = await stripe.products.create({
    name: "Output Tokens",
    type: "service",
  });

  await stripe.prices.create({
    unit_amount_decimal: "0.000006",
    currency: "usd",
    nickname: "Input Tokens Price",
    product: inputTokensProduct.id,
    recurring: {
      interval: "month",
      meter: inputMeter.id,
    },
  });

  await stripe.prices.create({
    unit_amount_decimal: "0.000030",
    currency: "usd",
    nickname: "Output Tokens Price",
    product: outputTokensProduct.id,
    recurring: {
      interval: "month",
      meter: outputMeter.id,
    },
  });

  return new Response("Initialized", { status: 200 });
}
