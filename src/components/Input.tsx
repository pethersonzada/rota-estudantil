import React, {useState} from "react";
import { TextInput, StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
type InputProps={
    placeholder:string;
    value:string;
    onChangeText:(text:string)=>void;
    secureTextEntry?:boolean;
    style?:any;
    keyboardType?:"default"|"email-address"|"numeric"|"phone-pad";
    autoCapitalize?:"none"|"sentences"|"words"|"characters";
    onSubmitEditing?:()=>void;
    maxLength?:number;
    
};
const Input=({placeholder, value, onChangeText, secureTextEntry, keyboardType,autoCapitalize,onSubmitEditing, style, maxLength}: InputProps)=>{

    const [escondido, setEscondido] = useState(secureTextEntry);

    return (
        

                    <View style={[styles.container, style]}>
                        <TextInput
                            style={styles.input}
                            placeholder={placeholder} placeholderTextColor={"#59748c60"}
                            value={value} 
                            onChangeText={onChangeText}
                            secureTextEntry={escondido}
                            keyboardType={keyboardType}
                            autoCapitalize={autoCapitalize}
                            onSubmitEditing={onSubmitEditing}
                            maxLength={maxLength}
                            

                        />
                        {secureTextEntry !== undefined && (
                            <TouchableOpacity 
                                style={styles.iconContainer} 
                                onPress={() => setEscondido(!escondido)}
                            >
                                <Ionicons 
                                    name={escondido ? "eye-off" : "eye"} 
                                    size={24} 
                                    color="#59748c" 
                                />
                            </TouchableOpacity>
                        )}
                    </View>
        
    );
};

const styles=StyleSheet.create({

    container:{
        width: "100%",
        height: 50,
        backgroundColor:"#f0f9ff",
        borderRadius:15,
        paddingHorizontal:10,
        justifyContent:"center",
        overflow:"hidden",
        flexDirection: "row",
        alignItems: "center",
        borderWidth:1,
        borderColor:"#354c6270"      
    },
    input:{
        flex:1,
        fontFamily:"Lato",
        padding:10,
        fontSize:16,
        color:"#59748c", 
    },
    iconContainer:{
        paddingRight:10,
        justifyContent:"center",
        alignItems:"flex-end",
    }
});

export default Input;