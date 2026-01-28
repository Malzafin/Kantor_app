import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RatesScreen from '../screens/RatesScreen';
import WalletScreen from '../screens/WalletScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Logowanie' }} />
                <Stack.Screen name="Rates" component={RatesScreen} options={{ title: 'Kursy walut' }} />
                <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'Portfel' }} />
                <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Kursy archiwalne' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
