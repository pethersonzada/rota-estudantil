import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import HomeMotorista from '../../components/HomeMotorista';
import HomePassageiro from '../../components/HomePassageiro';

export default function Home() {
    const [tipo, setTipo] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('userTipo').then(res => setTipo(res || 'PASSAGEIRO'));
    }, []);

    if (!tipo) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return tipo === 'MOTORISTA' ? <HomeMotorista /> : <HomePassageiro />;
}