import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, ActivityIndicator } from 'react-native';
import { fetchRatesForDate } from '../api/rates';

type RateItem = { pair: string; buy: number; sell: number; date: string };

export default function HistoryScreen() {
    const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<RateItem[]>([]);

    const onFetch = async () => {
        // prosty walidator daty YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return Alert.alert('Błąd', 'Podaj datę w formacie YYYY-MM-DD.');
        }
        setLoading(true);
        try {
            const data = await fetchRatesForDate(dateStr);
            if (!data.length) {
                Alert.alert('Uwaga', 'Brak danych NBP dla tej daty (np. weekend/święto).');
            }
            setRows(data);
        } catch {
            Alert.alert('Błąd', 'Nie udało się pobrać kursów dla tej daty.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Kursy archiwalne</Text>

            <Text style={{ marginBottom: 6 }}>Data (YYYY-MM-DD):</Text>
            <TextInput
                value={dateStr}
                onChangeText={setDateStr}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 }}
            />
            <Button title="Pobierz" onPress={onFetch} />

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 24 }}>
                    <ActivityIndicator />
                    <Text>Ładowanie…</Text>
                </View>
            ) : (
                <FlatList
                    style={{ marginTop: 16 }}
                    data={rows}
                    keyExtractor={(it) => it.pair}
                    renderItem={({ item }) => (
                        <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
                            <Text style={{ fontWeight: '700' }}>{item.pair}</Text>
                            <Text>Kupno: {item.buy}  |  Sprzedaż: {item.sell}</Text>
                            <Text style={{ color: '#666' }}>Data: {item.date}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{ color: '#666', marginTop: 12 }}>Brak danych.</Text>}
                />
            )}
        </View>
    );
}
