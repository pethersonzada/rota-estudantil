import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { loginStyles as styles } from '../constants/loginStyles';

type Props = {
    cpf: string;
    setCpf: (v: string) => void;
    senha: string;
    setSenha: (v: string) => void;
    loading: boolean;
    onLogin: () => void;
};

export function FormLogin({ cpf, setCpf, senha, setSenha, loading, onLogin }: Props) {
    return (
        <View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>CPF</Text>
                <TextInputMask 
                    type={'cpf'}
                    style={styles.input} 
                    placeholder="000.000.000-00"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={cpf}
                    onChangeText={setCpf}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    value={senha}
                    onChangeText={setSenha}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
            </TouchableOpacity>
        </View>
    );
}