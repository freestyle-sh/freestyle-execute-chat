import stripe from "@/lib/stripe";

export async function POST() {
  // if (request.headers.get("Authorization") !== "SuperSecretPassword") {
  //   return new Response("Nope.", { status: 401 });
  // }

  await stripe.billing.meters.create({
    event_name: "INPUT_TOKENS",
    display_name: "Input Tokens",
    default_aggregation: {
      formula: "sum",
    },
  });

  await stripe.billing.meters.create({
    event_name: "OUTPUT_TOKENS",
    display_name: "Output Tokens",
    default_aggregation: {
      formula: "sum",
    },
  });

  return new Response("Initialized", { status: 200 });
}
