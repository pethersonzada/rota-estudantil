import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { View, StatusBar } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function TabsGlobais() {
    const insets = useSafeAreaInsets();
    
    return (
        <View style={{ flex: 1, paddingTop: insets.top }}>
            <Tabs screenOptions={{ 
                headerShown: false,
                tabBarActiveTintColor: '#2563eb',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e2e8f0',
                    height: 65 + insets.bottom, 
                    paddingBottom: 5 + insets.bottom
                }
            }}>
                <Tabs.Screen name="home" options={{ title: 'Início', tabBarIcon: ({color, size}) => <Ionicons name="home" size={size} color={color} /> }} />
                <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({color, size}) => <Ionicons name="person" size={size} color={color} /> }} />
            </Tabs>
        </View>
    );
}

export default function TabLayout() {
    return (
        <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <TabsGlobais />
        </SafeAreaProvider>
    );
}