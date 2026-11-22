// Exercises src/lib/currency.ts directly (no .mjs port).
// Run: node --experimental-strip-types --test scripts/check-currency.mjs
// fetchGeoPricing is not exercised: it fetches /api/geo.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  PRICING,
  countryFromHeaders,
  currencyForCountry,
  getChargeForRequest,
  getPricingForCountry,
  toSmallestUnit,
} from '../src/lib/currency.ts'

// Minor units from the decimal spelling of a major price. 9.99 -> 999.
// This does not multiply by 100, so a binary product of 998.999... cannot pass.
function minorUnits(amount) {
  const text = String(amount)
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text)
  assert.ok(match, `price ${text} is not a 0-2 decimal major amount`)
  return Number(match[1] + (match[2] ?? '').padEnd(2, '0'))
}

// INR is a whole number with no decimal point. USD always has 2 decimal places.
// The digits come from PRICING, so a price change does not require an edit here.
function displayFor(currency, amount) {
  const symbol = PRICING[currency].symbol
  const text = String(amount)
  if (currency === 'INR') {
    assert.match(text, /^\d+$/, `INR price ${text} is not a whole number`)
    return symbol + text
  }
  assert.equal(currency, 'USD')
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text)
  assert.ok(match, `USD price ${text} is not a 0-2 decimal amount`)
  return `${symbol}${match[1]}.${(match[2] ?? '').padEnd(2, '0')}`
}

// The fallback for a missing or empty country is deliberately not asserted here.
// QA flagged geo-fail -> INR for non-Indian visitors as a bug, so this check must
// not lock it in. Only explicit country codes are covered.
test('currencyForCountry: India is INR, other countries are USD', () => {
  assert.equal(currencyForCountry('IN'), 'INR')
  assert.equal(currencyForCountry('in'), 'INR')
  for (const country of ['US', 'GB', 'DE']) {
    assert.equal(currencyForCountry(country), 'USD', country)
  }
})

test('getPricingForCountry matches PRICING and formats INR without decimals, USD with 2', () => {
  assert.deepEqual(getPricingForCountry('in'), getPricingForCountry('IN'))
  assert.deepEqual(getPricingForCountry('GB'), getPricingForCountry('US'))
  assert.deepEqual(getPricingForCountry('DE'), getPricingForCountry('US'))

  for (const country of ['IN', 'in', 'US', 'GB', 'DE']) {
    const pricing = getPricingForCountry(country)
    const currency = currencyForCountry(country)
    const table = PRICING[currency]
    assert.equal(pricing.currency, currency, String(country))
    assert.equal(pricing.symbol, table.symbol, String(country))
    assert.equal(pricing.singlePrice, table.single, String(country))
    assert.equal(pricing.bundlePrice, table.bundle, String(country))
    assert.equal(pricing.singleDisplay, displayFor(currency, table.single), String(country))
    assert.equal(pricing.bundleDisplay, displayFor(currency, table.bundle), String(country))

    const singleBody = pricing.singleDisplay.slice(pricing.symbol.length)
    const bundleBody = pricing.bundleDisplay.slice(pricing.symbol.length)
    if (currency === 'INR') {
      assert.match(singleBody, /^\d+$/, pricing.singleDisplay)
      assert.match(bundleBody, /^\d+$/, pricing.bundleDisplay)
    } else {
      assert.match(singleBody, /^\d+\.\d{2}$/, pricing.singleDisplay)
      assert.match(bundleBody, /^\d+\.\d{2}$/, pricing.bundleDisplay)
    }
  }
})

test('toSmallestUnit rounds every PRICING value to integer minor units', () => {
  for (const [currency, table] of Object.entries(PRICING)) {
    for (const amount of [table.single, table.bundle]) {
      const minor = toSmallestUnit(amount, currency)
      const expected = minorUnits(amount)
      const product = amount * 100
      const detail = Number.isInteger(product)
        ? `${currency} ${amount}`
        : `${currency} ${amount} must be ${expected} minor units, not the raw product ${product}`
      assert.equal(Number.isInteger(minor), true, detail)
      assert.equal(minor, expected, detail)
    }
  }
})

function headersFor(country) {
  if (country == null) return new Headers()
  return new Headers({ 'x-vercel-ip-country': country })
}

test('getChargeForRequest charges the displayed major price for the request country', () => {
  const cases = [
    ['IN', 'IN'],
    ['US', 'US'],
  ]
  const singleDocTypes = ['privacy', 'tos', 'cookie', 'disclaimer', 'eula']

  for (const [header, country] of cases) {
    const headers = headersFor(header)
    const pricing = getPricingForCountry(country)
    const bundle = getChargeForRequest(headers, 'bundle')

    for (const docType of ['bundle', ...singleDocTypes]) {
      const charge = getChargeForRequest(headers, docType)
      assert.equal(charge.currency, pricing.currency, `${header} ${docType}`)
      assert.deepEqual(charge.pricing, pricing, `${header} ${docType}`)

      const display = docType === 'bundle' ? charge.pricing.bundleDisplay : charge.pricing.singleDisplay
      assert.equal(display.startsWith(charge.pricing.symbol), true, display)
      const displayedMajor = Number(display.slice(charge.pricing.symbol.length))
      const tableMajor = docType === 'bundle' ? PRICING[charge.currency].bundle : PRICING[charge.currency].single
      assert.equal(displayedMajor, tableMajor, `${header} ${docType}`)
      assert.equal(charge.amount, toSmallestUnit(displayedMajor), `${header} ${docType}`)
      assert.equal(Number.isInteger(charge.amount), true, `${header} ${docType}`)
    }

    for (const docType of singleDocTypes) {
      const single = getChargeForRequest(headers, docType)
      assert.equal(single.amount, toSmallestUnit(pricing.singlePrice), `${header} ${docType}`)
      assert.equal(bundle.amount, toSmallestUnit(pricing.bundlePrice), `${header} bundle`)
      if (pricing.singlePrice !== pricing.bundlePrice) {
        assert.notEqual(single.amount, bundle.amount, `${header} ${docType}`)
      }
    }
  }
})

test('countryFromHeaders returns null when the header is absent', () => {
  assert.equal(countryFromHeaders(new Headers()), null)
  assert.equal(countryFromHeaders(new Headers({ accept: 'application/json' })), null)
})

test('countryFromHeaders returns x-vercel-ip-country when it is present', () => {
  assert.equal(countryFromHeaders(new Headers({ 'x-vercel-ip-country': 'IN' })), 'IN')
  assert.equal(countryFromHeaders(new Headers({ 'x-vercel-ip-country': 'US' })), 'US')
})
