import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ 
            headerShown: false,
            tabBarActiveTintColor: '#2563eb', // Azul vibrante para contraste no branco
            tabBarInactiveTintColor: '#94a3b8',
            tabBarStyle: {
                backgroundColor: '#ffffff', // Fundo Branco puro
                borderTopWidth: 1,
                borderTopColor: '#e2e8f0', // Linha sutil para separar
                height: 65,
                paddingBottom: 5
            }
        }}>
            <Tabs.Screen name="home" options={{ title: 'Início', tabBarIcon: ({color, size}) => <Ionicons name="home" size={size} color={color} /> }} />
            <Tabs.Screen name="Perfil" options={{ title: 'Perfil', tabBarIcon: ({color, size}) => <Ionicons name="person" size={size} color={color} /> }} />
        </Tabs>
    );
}