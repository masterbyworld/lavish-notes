import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// TEMP diagnostic: proves whether the configured token is a valid Storefront
// token by running a token-REQUIRED query (products). Delete after debugging.
export async function GET() {
  const token = (process.env.NEXT_PUBLIC_LAVISH_Notes_STOREFRONT_ACCESS_TOKEN || '').trim()
  const domainRaw = (process.env.Lavish_Notes_Checkout || '').trim()
  const host =
    domainRaw.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase().endsWith('.myshopify.com')
      ? domainRaw.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
      : 'lavish-notes.myshopify.com'

  const result: Record<string, unknown> = {
    tokenPresent: !!token,
    tokenLength: token.length,
    tokenPrefix: token.slice(0, 4),
    tokenSuffix: token.slice(-4),
    domainEnvRaw: domainRaw,
    resolvedHost: host,
  }

  if (!token) {
    result.conclusion = 'NO TOKEN in process.env at runtime — env not loaded into this process.'
    return NextResponse.json(result)
  }

  // Token-REQUIRED query. If the token is valid this returns 200 with a product;
  // if invalid Shopify returns 401 UNAUTHORIZED.
  const res = await fetch(`https://${host}/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({
      query: `{ products(first: 1) { edges { node { title } } } }`,
    }),
    cache: 'no-store',
  })

  result.httpStatus = res.status
  result.body = (await res.text()).slice(0, 400)
  result.conclusion =
    res.status === 200
      ? 'TOKEN VALID — Storefront API accepted it. Checkout will work after redeploy.'
      : `TOKEN REJECTED (${res.status}) — this token is not a valid Storefront API token for this store.`
  return NextResponse.json(result)
}
