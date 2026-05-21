import React, { useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";

// Importe seus componentes personalizados aqui (certifique-se dos caminhos)
import Title from "../components/Title";
import Input from "../components/Input";
import { Button } from "../components/Buttonn";

const Login = () => {
    const router = useRouter();
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");

    const handleLogin = async () => {
        if (!cpf || !senha) {
            Alert.alert("Atenção", "Preencha CPF e senha.");
            return;
        }

        try {
            // URL ATUALIZADA DO SEU TÚNEL
            const response = await fetch('https://poor-rings-dress.loca.lt/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf, senha }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Salvando dados para a sessão
                await AsyncStorage.setItem('userId', data.id.toString());
                await AsyncStorage.setItem('userTipo', data.tipo);
                await AsyncStorage.setItem('userName', data.nome);

                // REDIRECIONAMENTO CORRETO PARA O GRUPO DE ABAS
                router.replace("/(tabs)/home");
            } else {
                Alert.alert("Erro", "CPF ou senha incorretos.");
            }
        } catch (error) {
            Alert.alert("Erro", "Não foi possível conectar ao servidor.");
        }
    };

    return (
        <KeyboardAvoidingView style={styles.keyboardavoiding} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.container}>
                    <Image style={styles.logo} source={require("@/assets/images/logo.png")} />
                    <View style={styles.containerCor}>
                        <Title style={styles.login} text=" Login " />
                        
                        <Input placeholder="CPF" value={cpf} onChangeText={setCpf} keyboardType="numeric" />
                        
                        <Input style={styles.senha} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry autoCapitalize="none" />
                        
                        <Button style={styles.button} title="Entrar" onPress={handleLogin} />

                        <View style={styles.textRow}>
                            <Text style={styles.text}>Não tem conta?</Text>
                            <TouchableOpacity onPress={() => router.push({ pathname: '/signup', params: { tipo: 'PASSAGEIRO' } })}>
                                <Text style={styles.buttonText}>Cadastrar Aluno</Text>
                            </TouchableOpacity>
                            <Text style={styles.text}> ou </Text>
                            <TouchableOpacity onPress={() => router.push({ pathname: '/signup', params: { tipo: 'MOTORISTA' } })}>
                                <Text style={styles.buttonText}>Motorista</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50, backgroundColor: "#ffffff", alignItems: "center" },
    logo: { width: 200, height: 200, marginTop: 80, marginBottom: 20 },
    keyboardavoiding: { flex: 1 },
    scroll: { width: "100%", backgroundColor: "#9aafc2", borderTopLeftRadius: 40, borderTopRightRadius: 40 },
    scrollContent: { flexGrow: 1 },
    containerCor: { flex: 1, alignItems: "center", width: "100%", backgroundColor: "#9AAFC2", borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, minHeight: 500 },
    login: { marginBottom: 40 },
    senha: { marginVertical: 20 },
    button: { width: 250 },
    textRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 40, marginBottom: 50 },
    text: { color: "#F0F9FF", fontFamily: "Lato", fontSize: 14 },
    buttonText: { color: "#354d62", fontFamily: "Lato", fontSize: 14, fontWeight: "bold", marginLeft: 5 },
});

export default Login;