import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { homeMotoristaStyles as styles } from '../constants/homeMotoristaStyles';

type Props = {
    statusConfirmado: string;
    onRegistrar: (status: string) => void;
};

export function SeletorPresenca({ statusConfirmado, onRegistrar }: Props) {
    if (statusConfirmado) {
        return (
            <View style={[styles.cardList, { alignItems: 'center', padding: 30 }]}>
                <Ionicons name="checkmark-circle" size={48} color="#2563eb" />
                <Text style={[styles.nameText, { fontSize: 20, marginVertical: 10 }]}>Confirmado!</Text>
                <Text style={styles.subText}>Opção: {statusConfirmado}</Text>
                <TouchableOpacity onPress={() => onRegistrar('LIMPAR')} style={{ marginTop: 15, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: 'bold' }}>Alterar decisão</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {['IDA', 'VOLTA', 'AMBOS', 'NAO_VOU'].map((s) => (
                <TouchableOpacity key={s} style={[styles.btnMotorista, { backgroundColor: '#2563eb' }]} onPress={() => onRegistrar(s)}>
                    <Text style={styles.btnText}>{s.replace('_', ' ')}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}