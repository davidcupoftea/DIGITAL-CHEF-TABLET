import { useState, useEffect,useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL
} from "../services/index.jsx";
import { useNavigation } from "@react-navigation/native";

const Pedidos = () => {

  const navigation = useNavigation();

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState(null)
  const [texto, setTexto] = useState(null)

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

    var fetchDeclaracionResponsable = async (restaurantPk) => {
      const res = await fetch(
        BASE_URL + "declaracion-responsable/",
        {
          method: "GET",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens?.access),
          },
        }
      );
      const jsonData2 = await res.json();
      if (jsonData2.status == "nook") {
        Alert.alert("Error", jsonData2.message);
      } else {
        setTitle(jsonData2.title)
        setTexto(jsonData2.texto)
        setLoading(false);
      }
    };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      fetchDeclaracionResponsable();
    });
    return unsubscribe;
  }, [navigation]);




  return (
    <View style={styles.container}>
      <ScrollView>
        {loading? <ActivityIndicator size="large"/>:<>
        <Text style={styles.text}>{title}</Text>
        <Text style={styles.text}>{texto}</Text>
        </>}
      </ScrollView>
    </View>
  );
};

export default Pedidos;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
    margin: 15,
  },
  text: {
    marginTop: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 20,
    fontFamily: "Function-Regular",
  }
});

//REPASADO Y LIMPIO
