import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { MaskService } from 'react-native-masked-text';
import Input from "./Input";
import Title from "./Title";
import { Picker } from '@react-native-picker/picker';

export const AddressCard = ({ onDataChange }: any) => {
    const [cep, setCep] = useState("");
    const [logradouro, setLogradouro] = useState("");
    const [numero, setNumero] = useState("");
    const [complemento, setComplemento] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [uf, setUf] = useState('');
    useEffect(() => {
        onDataChange({
            cep, logradouro, numero, complemento, bairro, cidade, uf
        });
    }, [cep, logradouro, numero, complemento, bairro, cidade, uf]);
    
    const listaUFs = [
        { label: 'UF', value: '' },
        { label: 'AC', value: 'AC' },
        { label: 'AL', value: 'AL' },
        { label: 'AP', value: 'AP' },
        { label: 'AM', value: 'AM' },
        { label: 'BA', value: 'BA' },
        { label: 'CE', value: 'CE' },
        { label: 'DF', value: 'DF' },
        { label: 'ES', value: 'ES' },
        { label: 'GO', value: 'GO' },
        { label: 'MA', value: 'MA' },
        { label: 'MT', value: 'MT' },
        { label: 'MS', value: 'MS' },
        { label: 'MG', value: 'MG' },
        { label: 'PA', value: 'PA' },
        { label: 'PB', value: 'PB' },
        { label: 'PR', value: 'PR' },
        { label: 'PE', value: 'PE' },
        { label: 'PI', value: 'PI' },
        { label: 'RJ', value: 'RJ' },
        { label: 'RN', value: 'RN' },
        { label: 'RS', value: 'RS' },
        { label: 'RO', value: 'RO' },
        { label: 'RR', value: 'RR' },
        { label: 'SC', value: 'SC' },
        { label: 'SP', value: 'SP'}
    ]
    const handleAddressValidation = () => {
        
        if (!cep.trim() || !logradouro.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !uf) {
            Alert.alert("Erro", "Por favor, preencha todos os campos do endereço.");
            return;
        }

        if (cep.length < 9) {
            Alert.alert("Erro", "O CEP digitado está incompleto.");
            return;
        }

       
        const cepNumeros = cep.replace(/\D/g, '');

        const enderecoFinal = {
            cep: cepNumeros,
            logradouro: logradouro.trim(),
            numero: numero.trim(),
            complemento: complemento.trim(),
            bairro: bairro.trim(),
            cidade: cidade.trim(),
            uf: uf,
        };

        console.log("Endereço formatado:", enderecoFinal);
        Alert.alert("Sucesso", "Endereço validado!");
         
    };
    return (
        <View style={styles.container}>
            <Title style={styles.mainTitle} text="Endereço" />


            <Title style={styles.subtitle} text="Cep" />
            <Input 
                placeholder="00000-000" 
                value={cep} 
                onChangeText={(text) => {
                    const masked = MaskService.toMask('zip-code', text);
                    setCep(masked);
                }}
                keyboardType="numeric"
                maxLength={9}
            />


            <Title style={styles.subtitle} text="Logradouro" />
            <Input 
                placeholder="Ex: Rua das flores" 
                value={logradouro} 
                onChangeText={setLogradouro}
                keyboardType="default"
                autoCapitalize="sentences"
                maxLength={50}

            />

            <View style={styles.row}>
                <View style={{ width: "30%" }}>
                    <Title style={styles.subtitlerow1} text="Número" />
                    <Input 
                        placeholder="Ex: 12" 
                        value={numero} 
                        onChangeText={setNumero} 
                        keyboardType="default"

                    />
                </View>
                <View style={{ width: "65%" }}>
                    <Title style={styles.subtitlerow1} text="Complemento" />
                    <Input 
                        placeholder="Ex: casa, bloco..." 
                        value={complemento} 
                        onChangeText={setComplemento} 
                        keyboardType="default"
                        autoCapitalize="sentences"
                        maxLength={50}
                    />
                </View>
            </View>

            <Title style={styles.subtitle} text="Bairro" />
            <Input 
                placeholder="Ex: Centro" 
                value={bairro} 
                onChangeText={setBairro}
                keyboardType="default"
                autoCapitalize="words"
            />


            <View style={styles.row}>
                <View style={{ width: "70%" }}>
                    <Title style={styles.subtitlerow2} text="Cidade" />
                    <Input 
                        placeholder="Ex: Caruaru" 
                        value={cidade} 
                        onChangeText={setCidade}
                        keyboardType="default"
                        autoCapitalize="words" 
                    />
                </View>
                <View style={{ width: "25%" }}>
                    <Title style={styles.subtitlerow2} text="UF" />
                    
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={uf}
                            onValueChange={(itemValue) => setUf(itemValue)}
                            style={styles.picker}
                            dropdownIconColor="#9aafc2"
                        >
                            {listaUFs.map((item) => (
                                <Picker.Item 
                                    key={item.value} 
                                    label={item.label} 
                                    value={item.value} 
                                    color="#000"
                                    style={styles.pickerfont}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "95%",
        backgroundColor: "#9AAFC2",
        borderRadius: 15,
        padding: 20,
        gap: 10,
        marginTop: 20,
    },
    mainTitle: {
        fontSize: 30,
        color: "#F0f9ff",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 20,
        color: "#f0f9ff",
        textAlign: "left",
        padding:5,
        marginBottom: -8,
    },
    subtitlerow1:{
        fontSize: 20,
        color: "#f0f9ff",
        width: "100%",
        paddingHorizontal:8,
        textAlign: "left",
        marginBottom:8
    },
    subtitlerow2:{
        fontSize: 20,
        color: "#f0f9ff",
        width: "100%",
        paddingHorizontal:10,
        textAlign: "left",
        marginBottom:8
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 5,
    },
    pickerContainer: {
        backgroundColor: "#F0f9ff",
        borderRadius: 15,   
        height: 50,
        justifyContent: "center",
        marginBottom:5,
        borderWidth:1,
        borderColor:"#354c6270",
        
        
        
    },
    picker: {
        width: "100%",
        height: "100%",
        color: "#59748c",
    },
    pickerfont:{
        fontSize:14,
    }
});