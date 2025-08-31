export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors() });

    // 1) إنشاء الدفعة: تُستدعى من تطبيق Flutter
    if (url.pathname === '/api/konnect/create-payment' && request.method === 'POST') {
      try {
        const b = await request.json();
        if (!b.amountTnd || !b.orderId) {
          return json({ error: 'amountTnd and orderId are required' }, 400);
        }

        // TND -> millimes (مثال: 10.500 TND => 10500)
        const amount = Math.round(Number(b.amountTnd) * 1000);

        const payload = {
          receiverWalletId: env.KONNECT_WALLET_ID,
          token: 'TND',
          amount,
          type: 'immediate',
          description: `Order #${b.orderId}`,
          acceptedPaymentMethods: ['bank_card', 'wallet', 'e-DINAR'],
          lifespan: 20,                // بالدقائق
          checkoutForm: true,
          addPaymentFeesToAmount: false,
          firstName: b.firstName,
          lastName: b.lastName,
          phoneNumber: b.phoneNumber,
          email: b.email,
          orderId: b.orderId,
          webhook: `${url.origin}/api/konnect/webhook`,
          theme: 'light'
        };

        const r = await fetch(`${env.KONNECT_BASE}/payments/init-payment`, {
          method: 'POST',
          headers: { 'x-api-key': env.KONNECT_API_KEY, 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!r.ok) {
          const errText = await r.text();
          return json({ error: 'konnect_init_failed', details: errText }, 500);
        }

        const data = await r.json();
        // لاحقًا: ممكن تخزّن (orderId ↔ paymentRef) في D1/KV
        return json({ payUrl: data.payUrl, paymentRef: data.paymentRef });
      } catch (e) {
        return json({ error: 'bad_request' }, 400);
      }
    }

    // 2) Webhook: Konnect تناديه بعد محاولة الدفع ?payment_ref=...
    if (url.pathname === '/api/konnect/webhook' && request.method === 'GET') {
      const ref = url.searchParams.get('payment_ref');
      if (!ref) return new Response('Missing payment_ref', { status: 400, headers: cors() });

      // بإمكانك هنا تعمل تحقق إضافي وتحدّث قاعدة بياناتك
      return new Response('OK', { status: 200, headers: cors() });
    }

    // 3) الاستعلام عن حالة الدفع (Polling) للاستخدام داخل التطبيق
    if (url.pathname.startsWith('/api/konnect/payments/') && request.method === 'GET') {
      const ref = url.pathname.split('/').pop();
      const r = await fetch(`${env.KONNECT_BASE}/payments/${ref}`, {
        headers: { 'x-api-key': env.KONNECT_API_KEY }
      });
      if (!r.ok) {
        const errText = await r.text();
        return json({ error: 'konnect_status_failed', details: errText }, 500);
      }
      const data = await r.json();
      return json({ status: data?.payment?.status || 'pending' });
    }

    return new Response('Not found', { status: 404, headers: cors() });
  }
};

function cors() {
  return {
    'access-control-allow-origin': '*', // في الإنتاج بدّلها إلى نطاقك
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'content-type': 'application/json'
  };
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: cors() });
}

