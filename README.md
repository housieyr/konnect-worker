# Konnect Worker (Cloudflare) + Flutter Client

باك-إند مجاني على Cloudflare Workers للتكامل مع Konnect + مثال Flutter.

## المتطلبات
- حساب Cloudflare + **Account ID** + **API Token** (صلاحية: Workers Scripts:Edit و Account:Read)
- حساب Konnect (Sandbox أولًا) للحصول على:
  - **KONNECT_API_KEY** (سر)
  - **KONNECT_WALLET_ID** (معرّف المحفظة)

## أسرار GitHub (Secrets)
اذهب إلى: Repo → Settings → Secrets and variables → Actions → New repository secret  
أضف التالي:
- `CF_ACCOUNT_ID` — من Cloudflare (Account ID)
- `CF_API_TOKEN` — من Cloudflare (API Token فيه صلاحية Workers Scripts:Edit)
- `KONNECT_API_KEY` — من Konnect (Sandbox أو Production)
- `KONNECT_WALLET_ID` — معرّف محفظتك في Konnect
- *(اختياري)* `KONNECT_BASE_OVERRIDE`:
  - Sandbox: `https://api.sandbox.konnect.network/api/v2`
  - Production: `https://api.konnect.network/api/v2`

## النشر
- ادفع (push) إلى `main`.
- سيعمل GitHub Action وينشر Worker.
- ستحصل على رابط مثل:

