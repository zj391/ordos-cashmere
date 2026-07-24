/**
 * /api/inquiry — POST handler for all inquiry forms (raw / yarn / garment / cart).
 *
 * Stubs: logs payload, returns 200 with confirmation. To wire up email/CRM,
 * replace the console.log with Resend/SendGrid/HubSpot call.
 *
 * Accepts: { type, name, company, country, email, phone, delivery_date, quantity, message, attachments?, locale, cart_items? }
 */
export const prerender = false;

export async function POST({ request }) {
  let body = {};
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Honeypot check
  if (body.website) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Basic validation
  const required = ['name', 'company', 'email'];
  const missing = required.filter((k) => !body[k] || String(body[k]).trim() === '');
  if (missing.length > 0) {
    return new Response(JSON.stringify({ ok: false, error: `Missing required fields: ${missing.join(', ')}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Structured log so Vercel function logs show every inquiry (replace with email/CRM later)
  console.log('[inquiry]', JSON.stringify({
    type: body.type,
    locale: body.locale,
    name: body.name,
    company: body.company,
    email: body.email,
    country: body.country,
    phone: body.phone,
    delivery_date: body.delivery_date,
    quantity: body.quantity,
    cart_items: body.cart_items ? `${body.cart_items.length} items` : undefined,
    attachment_count: Array.isArray(body.attachments) ? body.attachments.length : 0,
    message_preview: typeof body.message === 'string' ? body.message.slice(0, 200) : undefined,
    at: new Date().toISOString(),
  }));

  return new Response(JSON.stringify({ ok: true, received_at: new Date().toISOString() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}