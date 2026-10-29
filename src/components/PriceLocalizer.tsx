'use client'
import { useEffect } from 'react'
import { PRICE, fetchGeoPricing } from '@/lib/currency'

/**
 * Static/SEO copy is rendered with the canonical USD strings from PRICE
 * (derived from PRICING). After load, this swaps them for the visitor's price
 * as computed by the server (/api/geo) -- the same source checkout charges.
 * Elements marked [data-fixed-price] are left alone (e.g. "₹849 in India or
 * $9.99 elsewhere").
 */
export function PriceLocalizer() {
  useEffect(() => {
    let cancelled = false
    fetchGeoPricing().then((p) => {
      if (cancelled || (p.singleDisplay === PRICE.single && p.bundleDisplay === PRICE.bundle)) return
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const nodes: Text[] = []
      while (walker.nextNode()) nodes.push(walker.currentNode as Text)
      for (const n of nodes) {
        const v = n.nodeValue
        if (!v || (!v.includes(PRICE.single) && !v.includes(PRICE.bundle))) continue
        if (n.parentElement?.closest('[data-fixed-price], script, style')) continue
        n.nodeValue = v.split(PRICE.bundle).join(p.bundleDisplay).split(PRICE.single).join(p.singleDisplay)
      }
    })
    return () => { cancelled = true }
  }, [])
  return null
}
