import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('userId').then(id => {
            setIsLoggedIn(!!id);
        });
    }, []);

    if (isLoggedIn === null) return <View style={{flex: 1, justifyContent: 'center'}}><ActivityIndicator size="large" /></View>;

    // Redireciona para o grupo de abas se logado, ou pro login se não
    return isLoggedIn ? <Redirect href="/(tabs)/home" /> : <Redirect href="/loginn" />;
}