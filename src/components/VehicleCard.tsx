import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Text } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { MaskService } from 'react-native-masked-text';
import Input from "./Input";
import Title from "./Title";

export const VehicleCard = ({ onDataChange }: any) => {
    const [placa, setPlaca] = useState("");
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [ano, setAno] = useState("");
    const [capacidade, setCapacidade] = useState("");
    const [foto, setFoto] = useState<string | null>(null);

    const [nomeEmpresa, setNomeEmpresa] = useState("");
    const [origem, setOrigem] = useState("");
    const [destino, setDestino] = useState("");
    const [horarioSaida, setHorarioSaida] = useState("");
    const [horarioRetorno, setHorarioRetorno] = useState("");
    const [mensalidade, setMensalidade] = useState("");

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Precisamos de permissão para acessar suas fotos!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setFoto(result.assets[0].uri);
        }
    };

    useEffect(() => {
        onDataChange({
            placa, marca, modelo, ano, capacidade, foto,
            nomeEmpresa, origem, destino, horarioSaida, horarioRetorno, mensalidade
        });
    }, [placa, marca, modelo, ano, capacidade, foto, nomeEmpresa, origem, destino, horarioSaida, horarioRetorno, mensalidade]);

    return (
        <View style={styles.container}>
            
            <View style={styles.section}>
                <Title style={styles.title} text="Informação da Van" />
                
                <TouchableOpacity style={styles.fotoContainer} onPress={pickImage}>
                    {foto ? (
                        <Image source={{ uri: foto }} style={styles.fotoPreview} />
                    ) : (
                        <Text style={styles.fotoPlaceholder}>Clique para adicionar foto da Van</Text>
                    )}
                </TouchableOpacity>

                <Title style={styles.subtitle} text="Nome da Empresa/Van" />
                <Input 
                    placeholder="Ex: Sweet ride of mine" 
                    value={nomeEmpresa} 
                    onChangeText={setNomeEmpresa} 
                    maxLength={20}
                />

                <Title style={styles.subtitle} text="Marca" />
                <Input placeholder="Ex: Mercedes-benz" value={marca} onChangeText={setMarca} maxLength={20} />

                <Title style={styles.subtitle} text="Modelo" />
                <Input placeholder="Ex: Sprinter" value={modelo} onChangeText={setModelo} maxLength={20} />

                <View style={styles.row}>
                    <View style={{ width: "48%" }}>
                        <Title style={styles.subtitleSmall} text="Placa" />
                        <Input 
                            placeholder="ABC-1234" 
                            value={placa} 
                            onChangeText={(text) => {
                                
                                const masked = MaskService.toMask('custom', text.toUpperCase(), { mask: 'AAA-9*99' });
                                setPlaca(masked);
                            }}
                            maxLength={8} 
                        />
                    </View>
                    <View style={{ width: "48%" }}>
                        <Title style={styles.subtitleSmall} text="Capacidade" />
                        <Input 
                            placeholder="Ex: 20" 
                            value={capacidade} 
                            onChangeText={(text) => setCapacidade(text.replace(/\D/g, ''))} 
                            keyboardType="numeric"
                            maxLength={3}
                        />
                    </View>
                </View>
            </View>

            

            <View style={styles.section}>
                <Title style={styles.title} text="Informação da Rota" />

                <Title style={styles.subtitle} text="Sai de (Origem)" />
                <Input placeholder="Ex: Recife" value={origem} onChangeText={setOrigem} maxLength={32}/>

                <Title style={styles.subtitle} text="Vai para (Destino)" />
                <Input placeholder="Ex: Uninassau Caruaru" value={destino} onChangeText={setDestino} maxLength={52} />

                <View style={styles.row}>
                    <View style={{ width: "48%" }}>
                        <Title style={styles.subtitleSmall} text="Horário Saída" />
                        <Input 
                            placeholder="00:00" 
                            value={horarioSaida} 
                            onChangeText={(text) => {
                                const masked = MaskService.toMask('datetime', text, { format: 'HH:mm' });
                                setHorarioSaida(masked);
                            }}
                            keyboardType="numeric"
                            maxLength={5}
                        />
                    </View>
                    <View style={{ width: "48%" }}>
                        <Title style={styles.subtitleSmall} text="Horário Retorno" />
                        <Input 
                            placeholder="00:00" 
                            value={horarioRetorno} 
                            onChangeText={(text) => {
                                const masked = MaskService.toMask('datetime', text, { format: 'HH:mm' });
                                setHorarioRetorno(masked);
                            }}
                            keyboardType="numeric"
                            maxLength={5}
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={{ width: "48%" }}>
                        <Title style={styles.subtitleSmall} text="Ano" />
                        <Input 
                            placeholder="2020" 
                            value={ano} 
                            onChangeText={(text) => setAno(text.replace(/\D/g, ''))} 
                            keyboardType="numeric" 
                            maxLength={4} 
                        />
                    </View>
                    <View style={{ width: "48%" }}>
                        <Title style={styles.subtitleSmall} text="Mensalidade (R$)" />
                        <Input 
                            placeholder="R$ 0,00" 
                            value={mensalidade} 
                            onChangeText={(text) => {
                                const masked = MaskService.toMask('money', text, {
                                    precision: 2,
                                    separator: ',',
                                    delimiter: '.',
                                    unit: 'R$ ',
                                    suffixUnit: ''
                                });
                                setMensalidade(masked);
                            }}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width:"95%",
        backgroundColor:"#9aafc2",
        borderRadius:20,
        padding:15,
        marginTop:20,
    },
    section:{
        marginBottom:5
    },
    title:{
        fontSize:30,
        textAlign:"center",
        marginTop:10,
        marginBottom:20,
        color:"#f0f9ff"
    },
    fotoContainer:{
        width:"100%",
        height:150,
        backgroundColor:"#7a8f9f",
        borderRadius:15,
        justifyContent:"center",
        alignItems:"center",
        marginBottom:15,
        borderWidth:1,
        borderColor:"#f0f9ff",
        borderStyle:"dashed"
    },
    fotoPreview:{
        width:"100%",
        height:"100%",
        borderRadius:15
    },
    fotoPlaceholder:{
        color:"#f0f9ff",
        fontSize:14,
        fontWeight:"bold"
    },
    subtitle:{
        fontSize:20,
        color:"#f0f9ff",
        marginBottom:5,
        textAlign:"left",
        paddingHorizontal:5,
        paddingVertical:8
    },
    subtitleSmall:{
        fontSize:16,
        color:"#f0f9ff",
        marginBottom:5,
        textAlign:"left",
        paddingHorizontal:5,
    },
    row:{
        flexDirection:"row",
        justifyContent:"space-between",
        marginTop:5,
        marginBottom:10
    }
});