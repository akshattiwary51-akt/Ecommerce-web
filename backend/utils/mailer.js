/**
 * Mailer utility — wraps nodemailer.
 * Works with any SMTP provider (Gmail, Outlook, Mailtrap, SendGrid SMTP, etc.)
 * Falls back silently when SMTP_USER / SMTP_PASS are not set so the app
 * still works without email configured.
 */

const nodemailer = require('nodemailer')

// ── Transport (lazy — only created once, on first use) ────────────────────────
let _transport = null

function getTransport () {
  if (_transport) return _transport

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[mailer] SMTP_USER/SMTP_PASS not set — emails disabled')
    return null
  }

  _transport = nodemailer.createTransport({
    host:   SMTP_HOST  || 'smtp.gmail.com',
    port:   parseInt(SMTP_PORT || '587'),
    secure: parseInt(SMTP_PORT || '587') === 465,
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  })

  return _transport
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${(+n).toFixed(2)}`

function orderRows (items) {
  return items.map((i) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">
        ${i.name} × ${i.quantity}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right">
        ${fmt(i.unitPrice * i.quantity)}
      </td>
    </tr>`).join('')
}

// ── Templates ─────────────────────────────────────────────────────────────────

function orderConfirmationHtml (user, order) {
  const shortId = order._id.toString().slice(-6).toUpperCase()
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmed — ShopEase</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="600" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr>
          <td style="background:#2563eb;padding:32px 40px">
            <h1 style="margin:0;color:#fff;font-size:24px">ShopEase</h1>
            <p  style="margin:6px 0 0;color:#bfdbfe;font-size:14px">Your order is confirmed 🎉</p>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:32px 40px">
          <p style="margin:0 0 8px;color:#374151">Hi <strong>${user.name}</strong>,</p>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px">
            Thanks for shopping with us! We've received your order and will start processing it shortly.
          </p>

          <!-- Order meta -->
          <table width="100%" style="background:#f8fafc;border-radius:8px;margin-bottom:24px">
            <tr>
              <td style="padding:16px 20px">
                <span style="color:#6b7280;font-size:12px;text-transform:uppercase">Order ID</span><br>
                <strong style="color:#111827">#${shortId}</strong>
              </td>
              <td style="padding:16px 20px">
                <span style="color:#6b7280;font-size:12px;text-transform:uppercase">Date</span><br>
                <strong style="color:#111827">${new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</strong>
              </td>
              <td style="padding:16px 20px">
                <span style="color:#6b7280;font-size:12px;text-transform:uppercase">Payment</span><br>
                <strong style="color:#111827;text-transform:capitalize">${order.paymentMethod}</strong>
              </td>
            </tr>
          </table>

          <!-- Items -->
          <table width="100%" style="border-collapse:collapse;margin-bottom:24px">
            <thead>
              <tr style="background:#f1f5f9">
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase">Item</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${orderRows(order.items)}
            </tbody>
          </table>

          <!-- Totals -->
          <table width="100%" style="margin-bottom:32px">
            <tr>
              <td style="padding:4px 0;color:#6b7280;font-size:14px">Subtotal</td>
              <td style="padding:4px 0;text-align:right;font-size:14px">${fmt(order.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;font-size:14px">Tax (18%)</td>
              <td style="padding:4px 0;text-align:right;font-size:14px">${fmt(order.tax)}</td>
            </tr>
            ${order.discount > 0 ? `
            <tr>
              <td style="padding:4px 0;color:#16a34a;font-size:14px">Discount${order.couponCode ? ` (${order.couponCode})` : ''}</td>
              <td style="padding:4px 0;text-align:right;color:#16a34a;font-size:14px">−${fmt(order.discount)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:12px 0 4px;font-weight:700;font-size:16px;border-top:2px solid #e5e7eb">Total</td>
              <td style="padding:12px 0 4px;text-align:right;font-weight:700;font-size:16px;border-top:2px solid #e5e7eb">${fmt(order.total)}</td>
            </tr>
          </table>

          <!-- Delivery address -->
          <div style="background:#f0fdf4;border-radius:8px;padding:16px 20px;margin-bottom:32px">
            <p style="margin:0 0 6px;font-weight:600;color:#166534;font-size:13px">📦 DELIVERY ADDRESS</p>
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.6">
              ${order.address.line1}${order.address.line2 ? ', ' + order.address.line2 : ''}<br>
              ${order.address.city}, ${order.address.state} ${order.address.postalCode}<br>
              ${order.address.country}
            </p>
          </div>

          <a href="${process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173'}/orders/${order._id}"
             style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600">
            View Order Status →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;color:#9ca3af;font-size:12px">
            © ShopEase · Questions? Reply to this email.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Public API ────────────────────────────────────────────────────────────────

async function sendOrderConfirmation (user, order) {
  const transport = getTransport()
  if (!transport) return   // silently skip when email not configured

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  const shortId = order._id.toString().slice(-6).toUpperCase()

  await transport.sendMail({
    from:    `"ShopEase" <${from}>`,
    to:      user.email,
    subject: `Order #${shortId} confirmed — ShopEase`,
    html:    orderConfirmationHtml(user, order),
  })
}

async function sendShippingUpdate (user, order) {
  const transport = getTransport()
  if (!transport) return

  const from    = process.env.SMTP_FROM || process.env.SMTP_USER
  const shortId = order._id.toString().slice(-6).toUpperCase()

  await transport.sendMail({
    from,
    to:      user.email,
    subject: `Your order #${shortId} has been shipped — ShopEase`,
    html: `<p>Hi ${user.name}, your order <strong>#${shortId}</strong> is on its way!</p>
           <p><a href="${process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173'}/orders/${order._id}">Track your order →</a></p>`,
  })
}

module.exports = { sendOrderConfirmation, sendShippingUpdate }
