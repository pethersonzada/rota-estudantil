import React from "react";
import {Text, StyleSheet} from "react-native";

type TitleProps={
    text:string;
    style?: any;
}

const Title = ({text, style}: TitleProps)=>{
    return <Text style={[styles.title, style]}>{text}</Text>
};

const styles=StyleSheet.create({
    title:{
        fontFamily:"DMSansBold",
        fontSize:40,
        color:"#f0f9ff",
        textShadowColor:"#59748c",
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius:5,
        textAlign:"center", 
        width: "100%", 
    },
});

export default Title;