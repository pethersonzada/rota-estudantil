import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { homeMotoristaStyles as styles } from '../constants/homeMotoristaStyles';

type Props = {
    viagemAtiva: boolean;
    todosResponderam: boolean;
    onIniciarRota: (sentido: string) => void;
};

export function BotoesAcaoMotorista({ viagemAtiva, todosResponderam, onIniciarRota }: Props) {
    return (
        <View style={styles.actionContainer}>
            <Text style={styles.sectionTitle}>{viagemAtiva ? "Acessar Mapa" : "Iniciar Trajeto"}</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                    style={[
                        styles.btnMotorista,
                        { backgroundColor: viagemAtiva ? '#94a3b8' : (todosResponderam ? '#0ea5e9' : '#f59e0b') }
                    ]}
                    onPress={() => onIniciarRota('IDA')}
                    disabled={viagemAtiva}
                >
                    <Ionicons name={viagemAtiva ? "lock-closed" : "arrow-up"} size={20} color="#fff" />
                    <Text style={styles.btnText}>IDA</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.btnMotorista,
                        { backgroundColor: viagemAtiva ? '#94a3b8' : (todosResponderam ? '#6366f1' : '#f59e0b') }
                    ]}
                    onPress={() => onIniciarRota('VOLTA')}
                    disabled={viagemAtiva}
                >
                    <Ionicons name={viagemAtiva ? "lock-closed" : "arrow-down"} size={20} color="#fff" />
                    <Text style={styles.btnText}>VOLTA</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}