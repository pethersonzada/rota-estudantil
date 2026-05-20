import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from "react-native";
import { DriverInfoCard } from "../components/DriverInfoCard";
import { RouteInfoCard } from "../components/RouterInfoCard";
import { Button } from "../components/Buttonn";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const Perfil = () => {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    const carregarDadosPerfil = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@dados_motorista");
        if (jsonValue != null) {
          setDados(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.log("Erro ao carregar perfil do motorista", e);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosPerfil();
  }, []);

  if (loading) {
    return (
      <View style={[styles.mainWrapper, styles.center]}>
        <ActivityIndicator size="large" color="#354c62" />
      </View>
    );
  }

  if (!dados) {
    return (
      <View style={[styles.mainWrapper, styles.center]}>
        <Text>Nenhum perfil de motorista encontrado.</Text>
      </View>
    );
  }

  const { nome, veiculo, detalhes_servico } = dados;

  return (
  
    <View style={styles.mainWrapper}>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerImagesContainer}>
          <Image
            source={{ uri: veiculo?.foto || "https://via.placeholder.com/600x400" }}
            style={styles.vanBackground}
            resizeMode="cover"
          />
          
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: detalhes_servico?.fotoPerfil || "https://via.placeholder.com/150" }}
              style={styles.driverAvatar}
            />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.driverName}>Olá! Sou o {nome || ""}</Text>
          
          <Text style={styles.bioText}>
            {detalhes_servico?.bio || "Sem apresentação cadastrada no momento."}
          </Text>
          <DriverInfoCard dados={dados} />
          <RouteInfoCard dados={dados} />
        </View>

      </ScrollView>

     
      <View style={styles.fixedFooter}>
        <Button 
          title="Escolher este Motorista" 
          style={styles.Button}
          onPress={() => router.push("/home")}
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
 
  mainWrapper: {
    flex: 1,
    backgroundColor: "#f0f9ff",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, 
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerImagesContainer: {
    width: "100%",
    height: 260, 
    position: "relative",
    backgroundColor: "#9aafc2",
  },
  vanBackground: {
    width: "100%",
    height: 220,
  },
  avatarWrapper: {
    position: "absolute",
    bottom: 0, 
    left: 25,  
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#f0f9ff", 
    overflow: "hidden",
  },
  driverAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  driverName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#354c62",
    marginBottom: 10,
  },
  bioText: {
    fontSize: 15,
    color: "#354c62",
    lineHeight: 22,
    textAlign: "left",
  },
  fixedFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 25,
    borderTopLeftRadius:15,
    borderTopRightRadius:15,
    paddingTop: 15,
    paddingBottom: 30,
    alignItems: "center",
  },
  Button: {
    width: "100%",
    height: 60,
    backgroundColor:"#15a334"
  },
});

export default Perfil;