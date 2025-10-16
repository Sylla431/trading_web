import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { symbol, name, type, base_currency, quote_currency, pip_value, contract_size, min_lot_size, max_lot_size } = body || {}

    if (!symbol || !name || !type) {
      return NextResponse.json({ error: 'symbol, name, type requis' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('instruments')
      .upsert({
        symbol,
        name,
        type,
        base_currency,
        quote_currency,
        pip_value,
        contract_size,
        min_lot_size,
        max_lot_size,
        is_active: true,
      }, { onConflict: 'symbol' })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, instrument: data })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


