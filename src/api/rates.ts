export type RateItem = { pair: string; buy: number; sell: number; date: string };

// Tymczasowo: NBP
const NBP_URL = 'https://api.nbp.pl/api/exchangerates/tables/A?format=json';


const MARGIN_BUY = 0.99;   // kupno = mid * 0.99
const MARGIN_SELL = 1.01;  // sprzedaż = mid * 1.01

export async function fetchCurrentRates(): Promise<RateItem[]> {
    const res = await fetch(NBP_URL);
    if (!res.ok) throw new Error('NBP error ' + res.status);

    const json = await res.json();
    const table = json[0];

    const mapped: RateItem[] = table.rates.map((r: any) => ({
        pair: `${r.code}/PLN`,
        buy: +(r.mid * MARGIN_BUY).toFixed(4),
        sell: +(r.mid * MARGIN_SELL).toFixed(4),
        date: table.effectiveDate,
    }));


    const keep = new Set(['USD', 'EUR', 'GBP', 'CHF']);
    return mapped.filter(x => keep.has(x.pair.split('/')[0]));
}

export async function fetchRatesForDate(ymd: string): Promise<RateItem[]> {
    const res = await fetch(`https://api.nbp.pl/api/exchangerates/tables/A/${ymd}?format=json`);
    if (!res.ok) throw new Error('NBP error ' + res.status);

    const json = await res.json();
    const table = json[0];

    const mapped: RateItem[] = table.rates.map((r: any) => ({
        pair: `${r.code}/PLN`,
        buy: +(r.mid * MARGIN_BUY).toFixed(4),
        sell: +(r.mid * MARGIN_SELL).toFixed(4),
        date: table.effectiveDate,
    }));

    const keep = new Set(['USD', 'EUR', 'GBP', 'CHF']);
    return mapped.filter(x => keep.has(x.pair.split('/')[0]));
}