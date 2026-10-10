const pool = require("../db/pool.js");
const AppError = require("../lib/AppError.js");
const paystackService = require("./paystackService.js");
const billingService = require("./billingService.js");
const auditService = require("./auditService.js");

const listPlans = async () => {
  const { rows } = await pool.query(
    "SELECT id, name, price_cents, interval, features, is_active FROM subscription_plans WHERE deleted_at IS NULL ORDER BY price_cents ASC",
  );
  return rows;
};

// The Paystack plan is created first — if that fails, we never write a row
// pointing at a plan code that doesn't exist.
const createPlan = async ({ name, priceCents, interval, description, features }, actorUserId) => {
  const paystackPlan = await paystackService.createPlan({ name, amount: priceCents, interval, description });
  const { rows } = await pool.query(
    `INSERT INTO subscription_plans (name, price_cents, interval, paystack_plan_code, features)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, name, price_cents, interval, features, is_active`,
    [name, priceCents, interval, paystackPlan.plan_code, JSON.stringify(features || [])],
  );
  await auditService.log({ actorUserId, action: "plan.created", entityType: "subscription_plan", entityId: rows[0].id });
  return rows[0];
};

// Partial update — only the fields the admin actually changed are sent.
// Name/price/interval/description are mirrored to Paystack so the two never
// drift apart; isActive is an app-only flag (Paystack has no such concept).
const updatePlan = async (planId, updates, actorUserId) => {
  const { rows: existingRows } = await pool.query(
    "SELECT * FROM subscription_plans WHERE id = $1 AND deleted_at IS NULL",
    [planId],
  );
  const existing = existingRows[0];
  if (!existing) throw new AppError("Plan not found.", 404);

  const name = updates.name ?? existing.name;
  const priceCents = updates.priceCents ?? existing.price_cents;
  const interval = updates.interval ?? existing.interval;
  const features = updates.features ?? existing.features;
  const isActive = updates.isActive ?? existing.is_active;

  const paystackFieldsChanged =
    updates.name !== undefined ||
    updates.priceCents !== undefined ||
    updates.interval !== undefined ||
    updates.description !== undefined;
  if (paystackFieldsChanged && existing.paystack_plan_code) {
    await paystackService.updatePlan(existing.paystack_plan_code, {
      name,
      amount: priceCents,
      interval,
      description: updates.description,
    });
  }

  const { rows } = await pool.query(
    `UPDATE subscription_plans SET name = $1, price_cents = $2, interval = $3, features = $4, is_active = $5
     WHERE id = $6 RETURNING id, name, price_cents, interval, features, is_active`,
    [name, priceCents, interval, JSON.stringify(features), isActive, planId],
  );
  await auditService.log({ actorUserId, action: "plan.updated", entityType: "subscription_plan", entityId: planId });
  return rows[0];
};

const getActiveSubscription = async (memberId) => {
  const { rows } = await pool.query(
    `SELECT s.*, p.name AS plan_name FROM subscriptions s
     JOIN subscription_plans p ON p.id = s.plan_id
     WHERE s.member_id = $1 AND s.ended_at IS NULL
     ORDER BY s.started_at DESC LIMIT 1`,
    [memberId],
  );
  return rows[0] || null;
};

const initializeCheckout = async (memberId, planId) => {
  const { rows: planRows } = await pool.query(
    "SELECT paystack_plan_code FROM subscription_plans WHERE id = $1 AND is_active = TRUE",
    [planId],
  );
  if (!planRows[0]) throw new AppError("Plan not found.", 404);

  const { rows: memberRows } = await pool.query(
    `SELECT u.email FROM members m JOIN users u ON u.id = m.user_id WHERE m.id = $1`,
    [memberId],
  );
  if (!memberRows[0]) throw new AppError("Member not found.", 404);

  const result = await paystackService.initializeCheckout({
    email: memberRows[0].email,
    planCode: planRows[0].paystack_plan_code,
  });
  return { authorizationUrl: result.authorization_url, reference: result.reference };
};

// Upgrade = close the old subscription and start checkout on the new plan.
// No proration, no refund — effective immediately on next successful payment.
const upgrade = async (memberId, newPlanId) => {
  const current = await getActiveSubscription(memberId);
  if (current?.paystack_subscription_code) {
    await paystackService
      .disableSubscription({ subscriptionCode: current.paystack_subscription_code, emailToken: current.paystack_email_token })
      .catch((err) => console.error("Paystack disable failed during upgrade:", err));
    await pool.query("UPDATE subscriptions SET ended_at = now() WHERE id = $1", [current.id]);
  }
  return initializeCheckout(memberId, newPlanId);
};

// Cancel = disable auto-renew; access is kept until current_period_end.
const cancel = async (memberId) => {
  const current = await getActiveSubscription(memberId);
  if (!current) throw new AppError("No active subscription found.", 404);

  if (current.paystack_subscription_code) {
    await paystackService.disableSubscription({
      subscriptionCode: current.paystack_subscription_code,
      emailToken: current.paystack_email_token,
    });
  }
  await pool.query("UPDATE subscriptions SET ended_at = COALESCE(current_period_end, now()) WHERE id = $1", [
    current.id,
  ]);
};

// Webhook events are matched to our rows by their Paystack code, whose
// unique constraint makes a re-delivered event a plain re-update, not a
// duplicate — we always return 200 to Paystack regardless.
const handleWebhookEvent = async (event) => {
  const { event: type, data } = event;

  if (type === "subscription.create" || type === "charge.success") {
    const email = data.customer?.email;
    if (!email) return;
    const { rows: memberRows } = await pool.query(
      `SELECT m.id FROM members m JOIN users u ON u.id = m.user_id WHERE u.email = $1`,
      [email],
    );
    const memberId = memberRows[0]?.id;
    if (!memberId) return;

    const { rows: planRows } = await pool.query(
      "SELECT id FROM subscription_plans WHERE paystack_plan_code = $1",
      [data.plan?.plan_code || data.plan_object?.plan_code],
    );
    const planId = planRows[0]?.id;
    if (!planId) return;

    await pool.query(
      `INSERT INTO subscriptions (member_id, plan_id, paystack_customer_code, paystack_subscription_code, paystack_email_token, status, current_period_end)
       VALUES ($1, $2, $3, $4, $5, 'active', $6)
       ON CONFLICT DO NOTHING`,
      [
        memberId,
        planId,
        data.customer?.customer_code,
        data.subscription_code || null,
        data.email_token || null,
        data.next_payment_date || null,
      ],
    );
    return;
  }

  if (type === "invoice.create" || type === "invoice.update") {
    const { rows: subRows } = await pool.query(
      "SELECT id FROM subscriptions WHERE paystack_subscription_code = $1",
      [data.subscription?.subscription_code],
    );
    const subscriptionId = subRows[0]?.id;
    if (!subscriptionId) return;

    const status = data.status === "success" ? "success" : data.status === "failed" ? "failed" : "pending";
    await pool.query(
      `INSERT INTO invoices (subscription_id, paystack_invoice_code, amount_cents, status, paid_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (paystack_invoice_code)
       DO UPDATE SET status = $4, paid_at = $5, attempt_count = invoices.attempt_count + 1`,
      [subscriptionId, data.invoice_code, data.amount, status, status === "success" ? new Date() : null],
    );

    if (status === "success") {
      await pool.query(
        "UPDATE subscriptions SET status = 'active', past_due_since = NULL, current_period_end = $1 WHERE id = $2",
        [data.period_end || null, subscriptionId],
      );
    } else if (status === "failed") {
      await billingService.startGracePeriod(subscriptionId);
    }
    return;
  }

  if (type === "subscription.disable") {
    await pool.query(
      "UPDATE subscriptions SET status = 'cancelled', ended_at = now() WHERE paystack_subscription_code = $1",
      [data.subscription_code],
    );
  }
};

module.exports = {
  listPlans,
  createPlan,
  updatePlan,
  getActiveSubscription,
  initializeCheckout,
  upgrade,
  cancel,
  handleWebhookEvent,
};
