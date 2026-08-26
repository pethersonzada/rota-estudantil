import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import HomeMotorista from '../home-motorista';
import HomePassageiro from '../home-passageiro';

export default function HomeTab() {
    const [tipo, setTipo] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem('userTipo').then(res => {
            setTipo(res || 'PASSAGEIRO');
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return tipo === 'MOTORISTA' ? <HomeMotorista /> : <HomePassageiro />;
}