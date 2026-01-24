import React from 'react';
import { View, Text, Button } from 'react-native';

// Ekran kursów walut
export default function RatesScreen({ navigation }: any) {
    return (
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', gap:12, padding:16 }}>
            <Text style={{ fontSize:22, fontWeight:'700' }}>Kursy</Text>
            <Button title="Przejdź do Portfela" onPress={() => navigation.navigate('Wallet')} />
        </View>
    );
}
