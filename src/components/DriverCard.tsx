import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from './Buttonn';
import { router } from "expo-router";
const DriverCard = () => {
    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState<any>(null);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@dados_motorista');
                if (jsonValue != null) {
                    setDados(JSON.parse(jsonValue));
                }
            } catch (e) {
                console.log("Erro ao ler dados", e);
            } finally {
                setLoading(false);
            }
        };
        carregarDados();
    }, []);

    if (loading) {
        return <ActivityIndicator size="small" color="#ffffff" style={{ marginTop: 20 }} />;
    }

    if (!dados||!dados.veiculo) return null;

    const { veiculo } = dados;

    return (
        <View style={styles.card}>
            
            <View style={styles.leftColumn}>
                <Image 
                    source={{ uri: veiculo.foto || 'https://via.placeholder.com/150' }} 
                    style={styles.vanImage}
                />
                <Text style={styles.vanTitle}>{veiculo.nomeEmpresa || ""}</Text>
                
                

                <View style={styles.priceContainer}>
                    <Text style={styles.labelMensalidade}>Mensalidade</Text>
                    <Text style={styles.priceText}>{veiculo.mensalidade || "R$ 0,00"}</Text>
                </View>
            </View>

            <View style={styles.rightColumn}>
                
                
                <View style={styles.sectionTitleRow}>
                    <MaterialCommunityIcons name="car-side" size={18} color="#ffffff" />
                    <Text style={styles.sectionTitle}>Veículo</Text>
                </View>
                <Text style={styles.infoText}><Text style={styles.bold}>Marca:</Text> {veiculo.marca}</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>Modelo:</Text> {veiculo.modelo}</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>Placa:</Text> {veiculo.placa}</Text>

                
                <View style={styles.sectionTitleRow}>
                    <Ionicons name="location-sharp" size={16} color="#ffffff" />
                    <Text style={styles.sectionTitle}>Rota</Text>
                </View>
                <Text style={styles.infoText}><Text style={styles.bold}>Sai de:</Text> {veiculo.origem}</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>Vai para:</Text> {veiculo.destino}</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>Saída Cidade:</Text> {veiculo.horarioSaida}</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>Saída Facul:</Text> {veiculo.horarioRetorno}</Text>

                <Button style={styles.button} textStyle={styles.textbutton}title="Ver perfil/Escolher motorista" onPress={()=>router.push("/Perfil")}/>

                
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#98adbd', 
        borderRadius: 15,
        padding: 10,
        flexDirection: 'row',
        width: '100%',
        
    },
    leftColumn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop:-10
    },
    rightColumn: {
        flex: 1.5,
        paddingLeft: 12,

    },
    vanImage: {
        width: 140,
        height: 100,
        borderRadius: 5,
        marginBottom: 5,
    },
    vanTitle: {
        color: '#f0f9ff',
        fontWeight: 'bold',
        fontSize: 16,
        width:"100%",
        textAlign: 'center',
        marginBottom: 2,
    },
    
    priceContainer: {
        alignItems: 'center',
        marginTop:20
    },
    labelMensalidade: {
        color: '#f0f9ff',
        fontSize: 15,
        fontWeight:"bold"
    },
    priceText: {
        color: '#f0f9ff',
        fontSize: 19,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    infoText: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 1,
    },
    bold: {
        fontWeight: 'bold',
    },
    button:{
        marginTop:5,
        width:200,
        height:40,
        padding:1
        
    },
    textbutton:{
        fontSize:12,
        

    }
    
    
});

export default DriverCard;