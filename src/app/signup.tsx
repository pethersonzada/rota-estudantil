import React, { useState } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import Title from "../components/Title";
import { Button } from "../components/Buttonn";
import { SegmentedControl } from "../components/segmentedcontrol";
import { SingUpCard } from "../components/SingUpCard";
import { AddressCard } from "../components/AddressCard";
import { VehicleCard } from "../components/VehicleCard";
import { DriverProfileCard } from "../components/DriverProfileCard";
import { FeatureSelector } from "../components/FeatureSelector";
import { router } from "expo-router";

const SingUp = () => {
    const [dadosPessoais, setDadosPessoais] = useState<any>({});
    const [dadosEndereco, setDadosEndereco] = useState<any>({});
    const [dadosVeiculo, setDadosVeiculo] = useState<any>({});
    const [dadosPerfilMotorista, setDadosPerfilMotorista] = useState<any>({});
    const [comodidades, setComodidades] = useState<string[]>([]); 
    const [tipo, setTipo] = useState("Passageiro");

    const handleSignUp = async () => {
        const pessoais = dadosPessoais || {};
        const endereco = dadosEndereco || {};
        const veiculoData = dadosVeiculo || {};
        const perfilMotorista = dadosPerfilMotorista || {};

        const { nome, email, senha, confirmarSenha, dataNasc, telefone } = pessoais;
        const { cep, logradouro, numero, bairro, uf } = endereco;
        const cidadeNome = endereco.cidade || endereco.city;

        
        if (!nome || !nome.trim() || 
            !email || !email.trim() || 
            !senha || !confirmarSenha || 
            !dataNasc || !telefone) {
            Alert.alert("Erro", "Preencha todas as Informações Pessoais.");
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.includes("@") || !emailRegex.test(email.trim())) {
            Alert.alert("Erro", "Por favor, insira um e-mail válido (ex: nome@email.com).");
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert("Erro", "As senhas não coincidem.");
            return;
        }

        if (senha.length < 8) {
            Alert.alert("Erro", "A senha deve ter no mínimo 8 caracteres.");
            return;
        }


        if (!cep || !cep.trim() || 
            !logradouro || !logradouro.trim() || 
            !numero || !numero.trim() || 
            !bairro || !bairro.trim() || 
            !cidadeNome || !cidadeNome.trim() || 
            !uf) {
            Alert.alert("Erro", "Preencha todos os campos do Endereço.");
            return;
        }

        if (cep.replace(/\D/g, '').length < 8) {
            Alert.alert("Erro", "O CEP está incompleto.");
            return;
        }


        if (tipo === "Motorista") {
            const { 
                placa, marca, modelo, ano, capacidade,
                nomeEmpresa, origem, destino, horarioSaida, horarioRetorno, mensalidade 
            } = veiculoData;

            const {
                bio, tempoExperiencia, tempoTolerancia, instituicoes, mesesPagantes
            } = perfilMotorista;

            if (!placa || !placa.trim() || 
                !marca || !marca.trim() || 
                !modelo || !modelo.trim() ||
                !ano || !ano.trim() ||
                !capacidade || !capacidade.trim()) {
                Alert.alert("Erro", "Preencha todas as informações do veículo (Placa, Marca, Modelo, Ano e Capacidade).");
                return;
            }

            if (!nomeEmpresa || !nomeEmpresa.trim() ||
                !origem || !origem.trim() ||
                !destino || !destino.trim() ||
                !horarioSaida || !horarioSaida.trim() ||
                !horarioRetorno || !horarioRetorno.trim() ||
                !mensalidade || !mensalidade.trim()) {
                Alert.alert("Erro", "Preencha todas as informações da rota da Van.");
                return;
            }

            if (!bio || !bio.trim() ||
                !tempoExperiencia || !tempoExperiencia.trim() ||
                !tempoTolerancia || !tempoTolerancia.trim() ||
                !instituicoes || !instituicoes.trim() ||
                !mesesPagantes || !mesesPagantes.trim()) {
                Alert.alert("Erro", "Preencha todas as informações adicionais do perfil (Bio, Experiência, Tolerância, Instituições e Meses cobrados).");
                return;
            }
        }

        const usuarioFinal = {
            tipo_usuario: tipo,
            nome: nome.trim(),
            email: email.toLowerCase().trim(),
            senha: senha,
            data_nascimento: dataNasc.trim(),
            telefone: telefone.replace(/\D/g, ''),
            endereco: {
                cep: cep.replace(/\D/g, ''),
                logradouro: logradouro.trim(),
                numero: numero.trim(),
                complemento: endereco.complemento?.trim() || "",
                bairro: bairro.trim(),
                cidade: cidadeNome.trim(),
                uf: uf
            },
            veiculo: tipo === "Motorista" ? veiculoData : null,
            detalhes_servico: tipo === "Motorista" ? perfilMotorista : null,
            comodidades: tipo === "Motorista" ? comodidades : null,
            data_cadastro: new Date().toISOString()
        };

        try {
            
            const storageKey = tipo === "Motorista" ? '@dados_motorista' : '@dados_passageiro';
            await AsyncStorage.setItem(storageKey, JSON.stringify(usuarioFinal));
            console.log(`CADASTRO DE ${tipo.toUpperCase()} SALVO LOCALMENTE:`, usuarioFinal);
            
            
            const rotaDestino = tipo === "Motorista" ? "/home" : "/SelectDriver";

            Alert.alert("Sucesso", "Cadastro realizado com sucesso!", [
                { text: "OK", onPress: () => router.push(rotaDestino) }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Não foi possível salvar os dados do cadastro.");
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.keyboardavoiding} 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView keyboardShouldPersistTaps="handled">
                <View style={styles.container}>
                    <Title style={styles.title} text=" Cadastro " />
                    <Title style={styles.subTitle} text=" Quem é você na van? " />
                    
                    <SegmentedControl 
                        opcoes={["Passageiro", "Motorista"]} 
                        selecionado={tipo} 
                        onChange={setTipo} 
                    />

                    <SingUpCard onDataChange={setDadosPessoais} />
                    <AddressCard onDataChange={setDadosEndereco} />

                    {tipo === "Motorista" && (
                        <>
                            <VehicleCard onDataChange={setDadosVeiculo} />
                            <DriverProfileCard onDataChange={setDadosPerfilMotorista} />
                            <FeatureSelector onDataChange={setComodidades} /> 
                        </>
                    )}

                    <Button 
                        style={styles.button} 
                        title="Finalizar cadastro" 
                        onPress={handleSignUp} 
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardavoiding: {
        flex: 1
    },
    container: {
        flex: 1,
        backgroundColor: "#f0f9ff",
        alignItems: "center",
        paddingBottom: 30
    },
    title: {
        marginTop: 80,
        color: "#9aafc2",
        textShadowColor: "#354c6290",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    subTitle: {
        marginVertical: 15,
        fontSize: 24,
        color: "#9aafc2",
        textShadowColor: "#354c6290",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    button: {
        marginTop: 20,
        width: 380,
        marginBottom: 50
    }
});

export default SingUp;