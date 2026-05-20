import React, { useState } from "react";
import { View, Text, StyleSheet, Image ,ScrollView, TouchableOpacity,KeyboardAvoidingView, Platform, Alert} from "react-native";
import Title from "../components/Title";
import Input from "../components/Input";
import {Button} from "../components/Buttonn";
import {SocialButton} from "../components/SocialButton";
import {useRouter} from "expo-router";

const Login=()=>{

    const router=useRouter();

    const[email, setemail]=useState("");
    const[senha, setsenha]=useState("");

    const handleLogin=async()=>{
 
        const userEmail=email.trim();
        const userSenha=senha;
        
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            Alert.alert("Erro", "O e-mail digitado não é válido.");
            return;
        }

        if (!userEmail||!userSenha) {
            alert("Tem que preencher e-mail e senha.");
            return;
        }

        const data={
            email: userEmail,
            senha: userSenha,
        };

        console.log("Dados pro back: ", data);
        router.push("/home");
    };

    return(
        <KeyboardAvoidingView style={styles.keyboardavoiding} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.container}>

                    <Image style={styles.logo} source={require("@/assets/images/logo.png")}/>

                    
                    <View style={styles.containerCor}>

                        <Title style={styles.login} text=" Login "/>

                        <Input placeholder={"E-mail"} value={email} onChangeText={(text)=>setemail(text)} keyboardType="email-address"/>

                        <Input style={styles.senha} placeholder={"Senha"} value={senha} onChangeText={(text)=>setsenha(text)} keyboardType="default" secureTextEntry={true} autoCapitalize="none"/>

                        <Button style={styles.button}title="Entrar" onPress={handleLogin}/>

                        <View style={styles.separatorContainer}>
                            <View style={styles.line} />
                            <Text style={styles.separatorText}>Ou</Text>
                            <View style={styles.line} />
                        </View>

                        <View style={styles.socialRow}>
                            <SocialButton 
                                title="Entrar com Google" 
                                icon={require('@/assets/images/google-icon.png')}
                                onPress={() => console.log('Google')}
                            />
                            
                            <SocialButton 
                                title="Entrar com Facebook" 
                                icon={require('@/assets/images/facebook-icon.png')}
                                onPress={() => console.log('Facebook')}
                            />
                        </View>

                        <View style={styles.textRow}>
                            <Text style={styles.text}>não tem conta ainda?</Text>
                            <TouchableOpacity onPress={() => router.push('/signup')}>
                                <Text style={styles.buttonText}>Cadastre-se</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                    
                </View>        
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles=StyleSheet.create({

    container:{
        flex:1,
        paddingTop:50,
        backgroundColor:"#ffffff",
        alignItems:"center"
    },
    logo:{
        width:200,
        height:200,
        marginTop:80,
        marginBottom:20
    },
    keyboardavoiding:{
        flex:1
    },
    scroll:{
        width:"100%",
        backgroundColor:"#9aafc2",
        borderTopLeftRadius:40,
        borderTopRightRadius:40
    },
    scrollContent:{
        flexGrow:1,
    },
    containerCor:{
        flex:1,
        alignItems:"center",
        width:"100%",
        backgroundColor:"#9AAFC2",
        borderTopLeftRadius:40,
        borderTopRightRadius:40,
        padding:30,
        minHeight:500,
    },
    login:{
        marginBottom:40
    },
    senha:{ 
        marginVertical:20,
    },
    button:{
        width:250,
    },
    separatorContainer:{
        flexDirection:"row",
        alignItems:"center",
        marginVertical:30,
        width:"100%",
        paddingHorizontal:20,
    },
    line:{
        flex:1,
        height:1,
        backgroundColor:"#F0F9FF",
    },
    separatorText:{
        marginHorizontal:15,
        color:"#F0F9FF",
        fontFamily:"Lato",
        fontSize:18,
    },
    socialRow:{
        flexDirection:"row",
        justifyContent:"space-between",
        width:"100%",
        marginTop:10,
        paddingHorizontal:8
    },
    textRow:{
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        marginTop:40,
        marginBottom:50,
    },
    text:{
        color:"#F0F9FF",
        fontFamily:"Lato",
        fontSize:14,
    },
    buttonText:{
        color:"#354d62",
        fontFamily:"Lato",
        fontSize:14,
        fontWeight:"bold",
        marginLeft:5,
    },
});

export default Login