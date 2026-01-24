import React from 'react';
import { View, Text, Button } from 'react-native';

// Ekran logowania/rejestracji
export default function LoginScreen({ navigation }: any) {
    return (
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', gap:12, padding:16 }}>
            <Text style={{ fontSize:22, fontWeight:'700' }}>Logowanie</Text>
            <Button title="Zaloguj" onPress={() => navigation.replace('Rates')} />
        </View>
    );
}
