import React, { useState } from "react";
import { KeyboardAvoidingView, View, StyleSheet, ScrollView, Platform } from "react-native";
import Title from "../components/Title";
import Input from "../components/Input";
import DriverCard from "../components/DriverCard";

const SelectDriver = () => {
    const [codigo, setCodigo] = useState('');
    const [mostrarCard, setMostrarCard] = useState(false);

    const handleBusca = () => {
        if (codigo.trim() !== '') {
            setMostrarCard(true);
        } else {
            setMostrarCard(false); 
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View style={styles.container}>
                    
                    <Title style={styles.title} text="Procurar seu motorista" />
                    
                    <Input style={styles.busca}
                        placeholder="Código do motorista" 
                        value={codigo}
                        onChangeText={setCodigo}
                        keyboardType="numeric"
                        onSubmitEditing={handleBusca} 
                    />
                 
                    {mostrarCard && (
                        <View style={styles.card}>
                           <DriverCard />
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f9ff",
        padding: 20, 
    },
    title: {
        marginTop: 40,
        marginBottom: 30,
        color:"9aafc2",
        textShadowColor:"#59748c90",
        textShadowOffset:{width: 1, height: 1},
        textShadowRadius:1,
    },
    busca:{
        marginBottom:20,
    },
    card:{
        marginTop:20
    }
    
});

export default SelectDriver;