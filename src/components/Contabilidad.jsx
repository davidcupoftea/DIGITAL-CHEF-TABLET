import { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Device from "expo-device";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL,
} from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";
import Decimal from 'decimal.js';

const Pedidos = () => {

  const [orderDateString, setOrderDateString] = useState("");
  const [orderDate, setOrderDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [startedEditingOrderDate, setStartedEditingOrderDate] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const [ pagosFronTables, setPagosFromTables] = useState('0')
  const [ pagosOrders, setPagosOrders] = useState('0')
  const [ facturasSinPedido, setFacturasSinPedido ] = useState('0')
  const [ facturationOrders, setFacturationOrders ] = useState('0')
  const [ facturationFromTables, setFacturationFromTables] = useState('0')

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


  useEffect(() => {
      if (
        orderDateString
      ){
        fetchOrders();
      }
  }, [orderDateString]);


  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (orderDateString){
      fetchOrders();
      }
    })
    return unsubscribe

  },[isFocused])

  const fetchOrders = async () => {
    const restaurantChosen_pk = await getAndSetRestaurant(
    authTokens?.access,
    setRestaurantChosen
  );
    const res = await fetch(
      BASE_URL + "get-facturation/" + restaurantChosen_pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({
          date: orderDateString,
        }),
      }
    );
    var jsonData = await res.json();
    if (jsonData.status == 'ok'){
    setFacturationFromTables(jsonData.tickets.mesa)
    setFacturationOrders(jsonData.tickets.delivery_takeaway)
    setFacturasSinPedido(jsonData.tickets.sin_pedido)
    setPagosFromTables(jsonData.pedidos.mesa)
    setPagosOrders(jsonData.pedidos.delivery_takeaway)
    setLoading(false);
    setLoaded(true);
    }
    else if (jsonData.status == 'nook') {
      Alert.alert('Error', jsonData.message)
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
          <Text style={styles.textsmall}>
            Estás viendo los pedidos del restaurante{" "}
            {restaurantChosen.franchise} localizado en{" "}
            {restaurantChosen.address}
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
            placeholder="Fecha del pedido"
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

        <Text style={styles.text}>Resultados</Text>

        {!loaded && !loading ? (
          <Text style={styles.textsmall}>
            Introduce una fecha para ver las facturaciones y los pagos
          </Text>
        ) : null}

        {!loaded && loading ? <ActivityIndicator size="large" /> : null}

        {loaded && !loading ? 
        <View>
              <Text style={styles.textsmall}>Pagos de pedidos desde la mesa:{' '}{pagosFronTables}</Text>
              <Text style={styles.textsmall}>Pagos de pedidos de take away o delivery:{' '}{pagosOrders}</Text>
              <Text style={styles.textsmall}>Facturación desde la mesa:{' '}{(new Decimal(facturasSinPedido).plus(facturationFromTables)).toFixed(2).toString()}</Text>
              <Text style={styles.textsmall}>Facturación de pedidos de take away o delivery:{' '}{facturationOrders}</Text>
        </View>
          : null}

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
