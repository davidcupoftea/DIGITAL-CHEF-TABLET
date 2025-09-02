import { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert
} from "react-native";
import * as Device from "expo-device";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {
  BASE_URL
} from "../services/index.jsx";

const Pedidos = () => {
  const [orderDateString, setOrderDateString] = useState("");
  const [orderDate, setOrderDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [startedEditingOrderDate, setStartedEditingOrderDate] = useState(false);

  const [confirmation, setConfirmation] = useState(false)

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const cerrarDia = async () => {
  if (!confirmation) {
    Alert.alert("Debes marcar la casilla de confirmación para cerrar el día.");
    return;
  }

  if (!orderDateString) {
    Alert.alert("Debes seleccionar una fecha antes de cerrar el día.");
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}cerrar-restaurante/${restaurantChosen.pk}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authTokens.access}`,
        },
        body: JSON.stringify({
          date: orderDateString, // formato: "YYYY-MM-DD"
        }),
      }
    );

    const data = await response.json();

    if (data.status == 'ok') {
      alert("El día se ha cerrado correctamente ✅");
      setConfirmation(false);
    } else {
      alert(
        `Error al cerrar el día: ${data.message || "Intenta de nuevo más tarde"}`
      );
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Error de conexión con el servidor ❌");
  }
};

  const onChangePicker = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setOrderDate(currentDate);
      if (Device.osName === "Android" || Platform.OS === "android") {
        let Day = String(currentDate.getDate()).padStart(2, "0");
        let Month = String(currentDate.getMonth() + 1).padStart(2, "0");
        let Year = currentDate.getFullYear();
        toggleDatePicker();
        setOrderDateString(`${Year}-${Month}-${Day}`);
      }
    } else {
      toggleDatePicker();
    }
  };

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
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
          Estás a punto de cerrar un día en el restaurante{" "}
          {restaurantChosen.franchise} localizado en {restaurantChosen.address}
        </Text>

        <Text style={styles.text}>Fecha</Text>

        <Pressable
          onPress={() => {
            setShowPicker(true);
            setStartedEditingOrderDate(true);
          }}
        >
          <TextInput
            style={styles.textinput}
            placeholder="Fecha a cerrar"
            value={orderDateString}
            onChangeText={setOrderDate}
            placeholderTextColor="white"
            editable={false}
            onPressIn={toggleDatePicker}
          />
        </Pressable>

        {showPicker == false &&
        orderDateString.length == 0 &&
        startedEditingOrderDate == true ? (
          <Text style={styles.texterror}>Tienes que rellenar este campo</Text>
        ) : null}

        {showPicker && (
          <RNDateTimePicker
            mode="date"
            display="spinner"
            value={orderDate}
            onChange={onChangePicker}
            dateFormat="day month year"
            style={styles.datePicker}
            textColor="white"
          />
        )}

        {showPicker &&
          (Device.osName === "iOS" ||
            Device.osName === "iPadOS" ||
            Platform.OS === "ios") && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <TouchableOpacity style={styles.button}>
                <Text
                  style={styles.buttontextCancel}
                  onPress={toggleDatePicker}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttontextConfirm} onPress={confirmIOSDate}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          )}

        <BouncyCheckbox
          size={25}
          isChecked={confirmation}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Marca este checkbox para cerrar ese día"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(confirmation) => {
            setConfirmation(!confirmation);
          }}
        />

          <TouchableOpacity
              onPress={() => cerrarDia()}
              style={styles.button}
            >
              <Text style={styles.buttontext}>CERRAR ESTE DÍA EN CONCRETO</Text>
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
