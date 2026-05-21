import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ 
            headerShown: false,
            tabBarActiveTintColor: '#354d62' 
        }}>
            <Tabs.Screen name="home" options={{ title: 'Início' }} />
            <Tabs.Screen name="mapa" options={{ title: 'Mapa' }} />
            <Tabs.Screen name="Perfil" options={{ title: 'Perfil' }} />
        </Tabs>
    );
}