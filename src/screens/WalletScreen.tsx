import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TextInput, Button, ScrollView, ActivityIndicator } from 'react-native';
import { fetchCurrentRates } from '../api/rates';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF'] as const;
type Currency = typeof CURRENCIES[number];
type RateRow = { pair: string; buy: number; sell: number; date: string };

function round2(n: number) { return Math.round(n * 100) / 100; }
function round4(n: number) { return Math.round(n * 10000) / 10000; }
function parseAmount(s: string) {
    const a = parseFloat(s.replace(',', '.'));
    return Number.isFinite(a) ? a : NaN;
}

type TxKind = 'TOPUP' | 'BUY' | 'SELL';
type Tx = {
    id: string;
    kind: TxKind;
    currency?: Currency;
    qty?: number;
    plnChange: number; // + dla wpływu, - dla wypływu
    rate?: number;     // użyty kurs (SELL/BUY)
    timestamp: string;
};

export default function WalletScreen() {
    // portfel
    const [pln, setPln] = useState(0);
    const [balances, setBalances] = useState<Record<Currency, number>>({ USD: 0, EUR: 0, GBP: 0, CHF: 0 });

    // kursy NBP
    const [rates, setRates] = useState<RateRow[]>([]);
    const [ratesDate, setRatesDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // formularze
    const [selected, setSelected] = useState<Currency>('USD');
    const [amountStr, setAmountStr] = useState('');
    const [topupStr, setTopupStr] = useState('');


    const [txs, setTxs] = useState<Tx[]>([]);
    const pushTx = (tx: Tx) => setTxs(prev => [tx, ...prev].slice(0, 50));

    useEffect(() => {
        (async () => {
            try {
                const arr = await fetchCurrentRates(); // [{ pair:"USD/PLN", buy, sell, date }, ...]
                setRates(arr);
                setRatesDate(arr[0]?.date ?? null);
            } catch {
                Alert.alert('Błąd', 'Nie udało się pobrać kursów z NBP.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const getSelectedRate = () => rates.find(r => r.pair.startsWith(`${selected}/`));

    const onTopup = () => {
        const val = parseAmount(topupStr);
        if (isNaN(val) || val <= 0) return Alert.alert('Błąd', 'Podaj poprawną kwotę (> 0).');
        setPln(p => round2(p + val));
        setTopupStr('');
        pushTx({
            id: `${Date.now()}-${Math.random()}`,
            kind: 'TOPUP',
            plnChange: round2(val),
            timestamp: new Date().toISOString(),
        });
        Alert.alert('Sukces', `Zasilono konto o ${val.toFixed(2)} PLN (symulacja).`);
    };

    const onBuy = () => {
        const qtyRaw = parseAmount(amountStr);
        const rate = getSelectedRate();
        if (!rate) return Alert.alert('Błąd', 'Brak kursu dla wybranej waluty.');
        if (isNaN(qtyRaw) || qtyRaw <= 0) return Alert.alert('Błąd', 'Podaj poprawną ilość (> 0).');

        const qty = round4(qtyRaw);
        const costPln = round2(qty * rate.sell);
        if (round2(pln) < costPln) return Alert.alert('Błąd', 'Za mało PLN na koncie.');

        setPln(p => round2(p - costPln));
        setBalances(b => ({ ...b, [selected]: round4(b[selected] + qty) }));
        setAmountStr('');
        pushTx({
            id: `${Date.now()}-${Math.random()}`,
            kind: 'BUY',
            currency: selected,
            qty,
            plnChange: -costPln,
            rate: rate.sell,
            timestamp: new Date().toISOString(),
        });
        Alert.alert('Sukces', `Kupiono ${qty.toFixed(4)} ${selected} za ${costPln.toFixed(2)} PLN.`);
    };

    const onSell = () => {
        const qtyRaw = parseAmount(amountStr);
        const rate = getSelectedRate();
        if (!rate) return Alert.alert('Błąd', 'Brak kursu dla wybranej waluty.');
        if (isNaN(qtyRaw) || qtyRaw <= 0) return Alert.alert('Błąd', 'Podaj poprawną ilość (> 0).');

        const qty = round4(qtyRaw);
        if (round4(balances[selected]) < qty) return Alert.alert('Błąd', `Za mało ${selected} w portfelu.`);

        const recvPln = round2(qty * rate.buy);
        setPln(p => round2(p + recvPln));
        setBalances(b => ({ ...b, [selected]: round4(b[selected] - qty) }));
        setAmountStr('');
        pushTx({
            id: `${Date.now()}-${Math.random()}`,
            kind: 'SELL',
            currency: selected,
            qty,
            plnChange: recvPln,
            rate: rate.buy,
            timestamp: new Date().toISOString(),
        });
        Alert.alert('Sukces', `Sprzedano ${qty.toFixed(4)} ${selected} za ${recvPln.toFixed(2)} PLN.`);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator />
                <Text>Ładowanie kursów…</Text>
            </View>
        );
    }

    const selRate = getSelectedRate();

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Portfel</Text>

            {/* Saldo PLN */}
            <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16 }}>Saldo PLN:</Text>
                <Text style={{ fontSize: 28, fontWeight: '700' }}>{pln.toFixed(2)} PLN</Text>
            </View>

            {/* Posiadane waluty */}
            <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, marginBottom: 8 }}>Posiadane waluty:</Text>
                {CURRENCIES.map(code => (
                    <View key={code} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#eee' }}>
                        <Text style={{ width: 50 }}>{code}</Text>
                        <Text style={{ marginLeft: 12 }}>{balances[code].toFixed(4)}</Text>
                    </View>
                ))}
            </View>

            {/* Zasil konto */}
            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6 }}>Zasil konto </Text>
                <TextInput
                    placeholder="Kwota w PLN (np. 100)"
                    value={topupStr}
                    onChangeText={setTopupStr}
                    keyboardType="numeric"
                    style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 }}
                />
                <Button title="Zasil" onPress={onTopup} />
            </View>

            {/* Operacje walutowe */}
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Operacje walutowe</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {CURRENCIES.map(code => (
                    <View key={code} style={{ marginRight: 8, marginBottom: 8, width: 90 }}>
                        <Button title={code + (selected === code ? ' ✓' : '')} onPress={() => setSelected(code)} />
                    </View>
                ))}
            </View>

            {/* Bieżący kurs */}
            {selRate ? (
                <Text style={{ marginBottom: 8 }}>
                    Kurs {selected}/PLN — Kupno: {selRate.buy} | Sprzedaż: {selRate.sell} {ratesDate ? `(data: ${ratesDate})` : ''}
                </Text>
            ) : (
                <Text style={{ color: '#d00', marginBottom: 8 }}>Brak kursu dla {selected}</Text>
            )}

            {/* Ilość waluty */}
            <TextInput
                placeholder="Ilość waluty (np. 10)"
                value={amountStr}
                onChangeText={setAmountStr}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 }}
            />

            {/* Akcje */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <Button title="Kup" onPress={onBuy} />
                </View>
                <View style={{ flex: 1 }}>
                    <Button title="Sprzedaj" onPress={onSell} />
                </View>
            </View>

            {/* Historia */}
            <View style={{ marginTop: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Historia (ostatnie 50)</Text>
                {txs.length === 0 ? (
                    <Text style={{ color: '#666' }}>Brak transakcji.</Text>
                ) : (
                    txs.map(t => (
                        <View key={t.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
                            <Text style={{ fontWeight: '600' }}>
                                {t.kind === 'TOPUP' && 'Zasilenie'}
                                {t.kind === 'BUY' && `Kup ${t.currency}`}
                                {t.kind === 'SELL' && `Sprzedaj ${t.currency}`}
                            </Text>
                            <Text>
                                {t.kind === 'TOPUP'
                                    ? `+${t.plnChange.toFixed(2)} PLN`
                                    : `${(t.kind === 'BUY' ? '-' : '+')}${Math.abs(t.plnChange).toFixed(2)} PLN  @ ${t.rate?.toFixed(4)}`}
                            </Text>
                            {t.qty ? <Text style={{ color: '#666' }}>Ilość: {t.qty.toFixed(4)} {t.currency}</Text> : null}
                            <Text style={{ color: '#666' }}>{new Date(t.timestamp).toLocaleString()}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}
