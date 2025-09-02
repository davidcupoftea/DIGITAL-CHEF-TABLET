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
import {
  BASE_URL
} from "../services/index.jsx";

const Pedidos = () => {

  const [timePeriod, setTimePeriod] = useState("")

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const crearHora = async () => {
  if (!timePeriod) {
    Alert.alert("Debes poner un periodo de tiempo en el formato HH:MM-HH:MM.");
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}crear-hora/${restaurantChosen.pk}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authTokens.access}`,
        },
        body: JSON.stringify({
          time_period: timePeriod, // formato: "YYYY-MM-DD"
        }),
      }
    );

    const data = await response.json();

    if (data.status == 'ok') {
      Alert.alert("El período de tiempo se ha creado correctamente ✅");
    } else {
      Alert.alert(
        "Error", `Error al crear el periodo de tiempo: ${data.message || "Intenta de nuevo más tarde"}`
      );
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Error de conexión con el servidor ❌:");
  }
};


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

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.textsmall}>
          Estás a punto de crear un periodo de tiempo en el restaurante{" "}
          {restaurantChosen.franchise} localizado en {restaurantChosen.address}
        </Text>
        
        <Text style={styles.text}>Periodo a crear:</Text>

              <TextInput
                style={styles.textinput}
                onChangeText={setTimePeriod}
                value={timePeriod}
              />

          <TouchableOpacity
              onPress={() => crearHora()}
              style={styles.button}
            >
              <Text style={styles.buttontext}>CREAR ESTE PERIODO DE TIEMPO</Text>
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
  texterror: {
    color: "red",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
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
  },
  datePicker: {
    backgroundColor: "black",
  },
  buttontextCancel: {
    padding: 5,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
  buttontextConfirm: {
    padding: 5,
    color: "green",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
});

//REPASADO Y LIMPIO
