export interface ExchangeRateResult {
  rate: number
  isFallback: boolean
}

/**
 * Exchange rate utility using official Norges Bank API
 * Source: https://www.norges-bank.no/tema/Statistikk/apne-data/
 */

export async function getExchangeRate(from: string, to: string = 'NOK'): Promise<ExchangeRateResult> {
  // If requesting NOK to NOK, rate is always 1
  if (from === to) return { rate: 1.0, isFallback: false };

  // Note: Norges Bank API provides rates AS 1 UNIT of foreign currency IN NOK.
  // URL format: https://data.norges-bank.no/api/data/EXR/B.[CURRENCY].NOK.SP?lastNObservations=1&format=sdmx-json

  try {
    const url = `https://data.norges-bank.no/api/data/EXR/B.${from}.NOK.SP?lastNObservations=1&format=sdmx-json`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Norges Bank API returned ${response.status}`);
    }

    const json = await response.json();

    // Norges Bank SDMX-JSON structure:
    // data.dataSets[0].series contains the data.
    const dataSets = json.data?.dataSets;
    if (!dataSets || !dataSets[0]) {
      throw new Error('Invalid data structure from Norges Bank');
    }

    const series = dataSets[0].series;
    if (!series) throw new Error('No series data found');

    const seriesKey = Object.keys(series)[0];
    const observations = series[seriesKey]?.observations;
    if (!observations) throw new Error('No observations found');

    const obsKey = Object.keys(observations)[0];
    const obsValue = observations[obsKey][0];

    let rateValue = parseFloat(obsValue);

    if (isNaN(rateValue)) throw new Error('Invalid rate value from Norges Bank');

    // Norges Bank quotes JPY, SEK, and DKK per 100 units.
    // We adjust to get the rate for 1 unit.
    if (['JPY', 'SEK', 'DKK'].includes(from)) {
      rateValue = rateValue / 100;
    }

    return { rate: rateValue, isFallback: false };
  } catch (error) {
    console.error('Error fetching Norges Bank exchange rate:', error);

    // Fallback static rates as of Jan 2026 (approximate Norwegian "Market" rates)
    // These are used only if the Central Bank API is unreachable.
    const fallbacks: Record<string, number> = {
      'USD': 10.65,
      'EUR': 11.45,
      'GBP': 13.80,
      'SEK': 1.01,
      'DKK': 1.53,
      'CHF': 12.10,
      'JPY': 0.072,
      'CAD': 7.80,
      'NOK': 1.0
    };
    return { rate: fallbacks[from] || 1.0, isFallback: true };
  }
}

/**
 * Currencies supported by Norges Bank (subset of most common)
 */
export const SUPPORTED_CURRENCIES = [
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
];
