import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
    );
}