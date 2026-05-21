import { Stack } from 'expo-router';

export default function RootLayout() {
    // O Stack na raiz apenas provê a base. Não liste as telas aqui.
    return <Stack screenOptions={{ headerShown: false }} />;
}