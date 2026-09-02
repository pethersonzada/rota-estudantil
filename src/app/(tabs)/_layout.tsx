import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    
    return (
        <Tabs screenOptions={{ 
            headerShown: false,
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#94a3b8',
            tabBarStyle: {
                backgroundColor: '#ffffff',
                borderTopWidth: 1,
                borderTopColor: '#e2e8f0',
                height: 60 + (insets.bottom > 0 ? insets.bottom : 10), 
                paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                paddingTop: 8,
            }
        }}>
            <Tabs.Screen 
                name="home" 
                options={{ 
                    title: 'Início', 
                    tabBarIcon: ({color, size}) => <Ionicons name="home" size={size} color={color} /> 
                }} 
            />
            <Tabs.Screen 
                name="perfil" 
                options={{ 
                    title: 'Perfil', 
                    tabBarIcon: ({color, size}) => <Ionicons name="person" size={size} color={color} /> 
                }} 
            />
        </Tabs>
    );
}