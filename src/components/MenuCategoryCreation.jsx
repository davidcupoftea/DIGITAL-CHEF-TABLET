import { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert
} from "react-native";
import * as Device from "expo-device";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { BASE_URL } from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

const Pedidos = () => {
  const [nombreCategoria, setNombreCategoria] = useState(null);

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const getPlatform = () => {
    if (Device.osName === "Android" || Platform.OS === "android") {
      return "android";
    } else if (
      Device.osName === "iOS" ||
      Device.osName === "iPadOS" ||
      Platform.OS === "ios"
    ) {
      return "ios";
    }
  };

  var createMenuCategory = async () => {
    const restaurant_pk = await getAndSetRestaurant(
      authTokens?.access,
      setRestaurantChosen
    );
    const res = await fetch(
      BASE_URL + "crear-categoria-menu/" + restaurant_pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ menu_category_name: nombreCategoria }),
      }
    );
    const jsonData2 = await res.json();
    if (jsonData2.status == "nook") {
      Alert.alert("Error", jsonData2.message);
    } else {
      Alert.alert("Éxito", "La categoría se ha creado");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.textsmall}>
          Estás a punto de crear una categoría en el menú del restaurante{" "}
          {restaurantChosen.franchise} localizado en {restaurantChosen.address}
        </Text>

        <Text style={styles.text}>Nombre de la categoría:</Text>
        <TextInput
          style={styles.textinput}
          onChangeText={setNombreCategoria}
          value={nombreCategoria}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            createMenuCategory();
          }}
        >
          <Text style={styles.buttontext}>Crear categoria</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Pedidos;

const styles = StyleSheet.create({
  textsmall: {
    color: "white",
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
  },
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
  },
  textinput: {
    padding: 14,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    borderColor: "white",
    backgroundColor: "white",
    borderWidth: 1,
    marginTop: 30,
  },
  buttontext: {
    padding: 20,
    color: "black",
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 26,
  }
});

//REPASADO Y LIMPIO
