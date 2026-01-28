import React, { useState } from 'react';
import {View, Text, Alert, TextInput, Button, ScrollView} from 'react-native';

type Balances = Record<string, number>;

// Ekran portfela i historii
export default function WalletScreen() {

    //stan lokalny
    const [pln, setPln] = useState<number>(0);
    const [balances] = useState<Balances>( {USD: 0, EUR: 0, GBP: 0, CHF: 0 });

    //formularz zasilania
    const [topup, setTopup] = useState<string>("");

    const handleTopUp = () => {
        const amount = parseFloat(topup.replace(',', ','));
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Błąd', 'Podaj poprawną kwotę większą od zera.');
            return;
        }
        setPln(prev => +(prev + amount).toFixed(2));
        setTopup("");
        Alert.alert('Sukces', 'Konto zostało zasilone');
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Portfel</Text>

            {/* Saldo PLN */}
            <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16 }}>Saldo PLN:</Text>
                <Text style={{ fontSize: 28, fontWeight: '700' }}>{pln.toFixed(2)} PLN</Text>
            </View>

            {/* posiadane waluty */}
            <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, marginBottom: 8 }}>Posiadane waluty:</Text>
                {Object.entries(balances).map(([code, amt]) => (
                    <View key={code} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#eee' }}>
                        <Text>{code}</Text>
                        <Text>{amt.toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            {/* zasilanie konta */}
            <View style={{ marginTop: 8, gap: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>Zasil konto (symulacja)</Text>
                <TextInput
                    placeholder="Kwota w PLN (np. 100)"
                    value={topup}
                    onChangeText={setTopup}
                    keyboardType="numeric"
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                    }}
                />
                <View style={{ flex:1, justifyContent:'center', alignItems:'center', gap:12, padding:16 }}>
                    <Button title="Zasil" onPress={handleTopUp} />
                </View>

            </View>

            {/*kup sprzedaj*/}
            <View style={{ marginTop: 24 }}>
                <Text style={{ color: '#666' }}>
                    ...
                </Text>
            </View>
        </ScrollView>
    );
}