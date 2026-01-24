import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, Button } from 'react-native';
import { fetchCurrentRates, type RateItem } from '../api/rates';

export default function RatesScreen({ navigation }: any) {
    const [data, setData] = useState<RateItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const rows = await fetchCurrentRates();
                setData(rows);
            } catch {
                Alert.alert('Błąd', 'Nie udało się pobrać kursów z NBP.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
                <ActivityIndicator />
                <Text>Ładowanie kursów…</Text>
            </View>
        );
    }

    return (
        <View style={{ flex:1, padding:16 }}>
            <FlatList
                data={data}
                keyExtractor={(it) => it.pair}
                renderItem={({ item }) => (
                    <View style={{ paddingVertical:12, borderBottomWidth:1, borderColor:'#eee' }}>
                        <Text style={{ fontWeight:'700' }}>{item.pair}</Text>
                        <Text>Kupno: {item.buy}  |  Sprzedaż: {item.sell}</Text>
                        <Text style={{ color:'#666' }}>Data: {item.date}</Text>
                    </View>
                )}
                ListFooterComponent={
                    <View style={{ flex:1, justifyContent:'center', alignItems:'center', gap:12, padding:16}}>
                        <Button
                            title="Przejdź do Portfela"
                            onPress={() => navigation.navigate('Wallet')}
                        />
                    </View>
                }
            />
        </View>
    );
}
