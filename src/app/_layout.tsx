import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from "expo-font";

export default function Layout() {
    const [fontsLoaded] = useFonts({
        DMSansBold: require("../../assets/fonts/DMSans-Bold.ttf"),
        Lato: require("../../assets/fonts/Lato-Regular.ttf"),
    });
    if (!fontsLoaded) {
        return null;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#354c62',
                    borderTopWidth: 0,
                    height: 70,
                    paddingBottom: 10,
                },
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: '#9aafc2',
                tabBarLabelStyle: {
                    fontFamily: 'Lato',
                    fontSize: 12,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="confirmacao"
                options={{
                    title: 'Passageiros',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="mapa"
                options={{
                    title: 'Rota',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Perfil"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen name="index" options={{ href: null }} />
            <Tabs.Screen name="loginn" options={{ href: null }} />
            <Tabs.Screen name="signup" options={{ href: null }} />
            <Tabs.Screen name="SelectDriver" options={{ href: null }} />
        </Tabs>
    );
}