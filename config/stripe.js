/*
  Stripe — the only file that holds payment keys.

  Leave both values empty and every site runs in demo mode:
  the pay screen says "Demo checkout · no charge" and no money moves.

  To take real payments, fill both lines (see README, "Connect Stripe"):
    publishableKey  pk_test_… while testing, then the client's pk_live_…
    endpoint        URL of the small server route that creates a PaymentIntent
                    and answers { "clientSecret": "pi_…_secret_…" }
*/
window.STRIPE_CONFIG = {
  publishableKey: "",
  endpoint: ""
};
