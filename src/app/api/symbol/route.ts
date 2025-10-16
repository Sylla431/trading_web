import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')?.toUpperCase()
  const market = (searchParams.get('market') || 'spot').toLowerCase()

  if (!symbol) {
    return NextResponse.json({ error: 'Paramètre symbol requis' }, { status: 400 })
  }

  try {
    const isFutures = market === 'futures'
    const baseUrl = isFutures
      ? 'https://fapi.binance.com/fapi/v1/exchangeInfo'
      : 'https://api.binance.com/api/v3/exchangeInfo'
    const url = `${baseUrl}?symbol=${encodeURIComponent(symbol)}`

    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream indisponible' }, { status: 502 })
    }
    const data = await res.json()
    const info = data?.symbols?.[0]
    if (!info) {
      return NextResponse.json({ error: 'Symbole introuvable' }, { status: 404 })
    }

    const lotFilter = Array.isArray(info.filters)
      ? info.filters.find((f: any) => f.filterType === 'LOT_SIZE')
      : undefined
    const priceFilter = Array.isArray(info.filters)
      ? info.filters.find((f: any) => f.filterType === 'PRICE_FILTER')
      : undefined

    const minQty = lotFilter?.minQty ? Number(lotFilter.minQty) : undefined
    const maxQty = lotFilter?.maxQty ? Number(lotFilter.maxQty) : undefined
    const stepSize = lotFilter?.stepSize ? Number(lotFilter.stepSize) : undefined
    const tickSize = priceFilter?.tickSize ? Number(priceFilter.tickSize) : undefined

    return NextResponse.json({
      provider: 'binance',
      market: isFutures ? 'futures' : 'spot',
      symbol: info.symbol,
      base: info.baseAsset,
      quote: info.quoteAsset,
      status: info.status,
      minQty,
      maxQty,
      stepSize,
      tickSize,
      // Hypothèses pour crypto
      type: 'crypto',
      contractSize: 1,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


