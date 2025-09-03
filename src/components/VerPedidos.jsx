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
  Image,
  ActivityIndicator,
} from "react-native";
import * as Device from "expo-device";
import { Picker } from "@react-native-picker/picker";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { BASE_URL } from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";
import ManuallyTableReservationForOrders from "./ManuallyTableReservationForOrders.jsx";
import OrderInList from "./OrderInList.jsx";

const Pedidos = () => {
  const addTable = (pk) => {
    setTablesChosen((prevState) => [...prevState, pk]);
  };

  const removeTable = (pk) => {
    let new_tablesChosen = [...tablesChosen];
    new_tablesChosen = new_tablesChosen.filter((table) => table != pk);
    setTablesChosen(new_tablesChosen);
  };

  const [orders, setOrders] = useState([]);
  const [tablesVisible, setTablesVisible] = useState(false);
  const [tables, setTables] = useState([]);
  const [tablesChosen, setTablesChosen] = useState([]);
  const [alltables, setAllTables] = useState(true);

  const [prepared, setPrepared] = useState(true);

  const [orderDateString, setOrderDateString] = useState("");
  const [orderDate, setOrderDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [startedEditingOrderDate, setStartedEditingOrderDate] = useState(false);
  const [timePeriod, setTimePeriod] = useState(0);
  const [timePeriodsState, setTimePeriodsState] = useState([]);
  const [loadedTimePeriods, setLoadedTimePeriods] = useState(false);
  const [allorders, setAllOrders] = useState(true);
  const [delivery, setDelivery] = useState(false);
  const [takeAway, setTakeAway] = useState(false);
  const [fromTable, setFromTable] = useState(false);
  const [indiferentDelivery, setIndiferentDelivery] = useState(true);
  const [nulledByRestaurant, setNulledByRestaurant] = useState(false);
  const [nulledByUser, setNulledByUser] = useState(false);
  const [notNulled, setNotNulled] = useState(false);
  const [indiferentNull, setIndiferentNull] = useState(true);
  const [arrival, setArrival] = useState(false);
  const [notArrival, setNotArrival] = useState(false);
  const [pending, setPending] = useState(true);
  const [indiferentState, setIndiferentState] = useState(false);
  const [paid, setPaid] = useState(false);
  const [notPaid, setNotPaid] = useState(false);
  const [indiferentPayment, setIndiferentPayment] = useState(true);

  const [restaurantConfirmed, setRestaurantConfirmed] = useState(false);
  const [restaurantNotConfirmed, setRestaurantNotConfirmed] = useState(false);
  const [indiferentConfirmation, setIndiferentConfirmation] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

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

  const renderTimePeriodList = () => {
    if (timePeriodsState.length > 0) {
      return timePeriodsState.map((timePeriodElement, index) => {
        return (
          <Picker.Item
            label={timePeriodElement.time_period_field}
            value={timePeriodElement.id}
            key={index}
          />
        );
      });
    }
  };

  useEffect(() => {
    if (tablesChosen.length > 0) {
      setAllTables(false);
    } else {
      setAllTables(true);
    }
  }, [tablesChosen]);

  useEffect(() => {
    const gettingInfoForReservation = async () => {
      setShowPicker(false);
      if (authTokens != null && authTokens != "null") {
        const restaurantChosen_pk = await getAndSetRestaurant(
          authTokens?.access,
          setRestaurantChosen
        );
        if (orderDateString) {
          getTimePeriods(restaurantChosen_pk);
        }
      }
    };
    gettingInfoForReservation();
  }, [orderDateString]);

  const getTimePeriods = async (restaurantChosen_pk) => {
    const jsonData = await fetch(
      BASE_URL + "time-periods-dc/" + restaurantChosen_pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ date: orderDateString }),
      }
    );
    var res_json = await jsonData.json();
    var timePeriods = res_json.data;
    setTimePeriod(timePeriods[0].id);
    setTimePeriodsState(timePeriods);
    setLoadedTimePeriods(true);
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

  const fetchTables = async () => {
    const response = await fetch(
      BASE_URL + "get-tables/" + restaurantChosen.pk + "/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );

    const jsonData = await response.json();
    setTables([...jsonData.tables]);
  };

  useEffect(() => {
    if (!allorders && indiferentDelivery) {
      setDelivery(true);
      setTakeAway(false);
      setFromTable(false);
      setIndiferentDelivery(false);
    }
  }, [allorders]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (
        (orderDateString && timePeriod) ||
        (orderDateString && !timePeriod && allorders)
      )
        fetchOrders();
    });
    return unsubscribe;
  }, [isFocused, restaurantChosen.pk]);

  const fetchOrders = async () => {
    if (!orderDateString) {
      Alert.alert("Ups", "Por favor pon una fecha");
      return;
    }
    if (orderDateString && !timePeriod && !allorders) {
      Alert.alert(
        "Ups",
        "Por favor pon una hora o elige ver todas las reservas de ese día"
      );
      return;
    }
    setLoading(true);
    setLoaded(false);
    const res = await fetch(
      BASE_URL + "orders-dc/" + restaurantChosen.pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({
          date: orderDateString,
          time_period: timePeriod,
          allorders: allorders,
          delivery: delivery,
          take_away: takeAway,
          from_table: fromTable,
          indiferent_delivery: indiferentDelivery,
          //SEPARATOR
          paid: paid,
          not_paid: notPaid,
          indiferent_payment: indiferentPayment,
          //confirmation,
          restaurant_confirmed: restaurantConfirmed,
          restaurant_not_confirmed: restaurantNotConfirmed,
          indiferent_confirmation: indiferentConfirmation,
          //tables
          tables_chosen: tablesChosen,
          alltables: alltables,
          //inulled
          nulled_by_restaurant: nulledByRestaurant,
          not_nulled: notNulled,
          nulled_by_user: nulledByUser,
          indiferent_null: indiferentNull,
          //estado del pedido
          arrival: arrival,
          not_arrival: notArrival,
          pending: pending,
          indiferent_state: indiferentState,
          //prepared or not
          prepared: prepared,
        }),
      }
    );
    var jsonData = await res.json();
    if (jsonData.status == "ok") {
      setOrders(jsonData.data);
      setLoading(false);
      setLoaded(true);
    } else if (jsonData.status == "nook") {
      Alert.alert("Error", jsonData.message);
    }
  };

  //const screenWidth = Dimensions.get("window").width; // ancho de pantalla
  const cardsPerRow = 3; // cuántas tarjetas por fila
  //const gap = screenWidth * 0.019; // espacio entre tarjetas
  const [containerWidth, setContainerWidth] = useState(0);
  const [gapWidth, setGapWidth] = useState(0);
  //const cardWidth = (screenWidth - gap * (cardsPerRow - 1)) / cardsPerRow;

  useEffect(() => {
    setGapWidth(containerWidth * 0.02);
  }, [containerWidth]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.textsmall}>
          Estás viendo los pedidos del restaurante {restaurantChosen.franchise}{" "}
          localizado en {restaurantChosen.address}
        </Text>

        <Text style={styles.text}>Fecha de pedido</Text>

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

        <Text style={styles.text}>Hora del pedido</Text>

        <Pressable
          onPress={() => {
            if (!orderDateString) {
              Alert.alert(
                "Ups",
                "Primero elige una fecha para ver las horas de reserva"
              );
            }
          }}
        >
          <View style={styles.timeOfReservation}>
            <Picker
              selectedValue={timePeriod}
              onValueChange={(itemValue, itemIndex) => {
                setTimePeriod(itemValue);
              }}
              style={
                getPlatform() == "android"
                  ? styles.pickerstyleandroid
                  : styles.pickerstyleios
              }
              dropdownIconColor="white"
              itemStyle={{ height: 40, color: "white" }}
            >
              {loadedTimePeriods ? renderTimePeriodList() : null}
            </Picker>
          </View>
        </Pressable>

        <BouncyCheckbox
          size={25}
          isChecked={allorders}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Todas los pedidos de ese día independientemente de la hora"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(allorders) => {
            setAllOrders(!allorders);
          }}
        />
        <Text style={styles.text}>Otros ajustes</Text>
        <BouncyCheckbox
          size={25}
          isChecked={delivery}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Pedido que se envía"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(delivery) => {
            setDelivery(true);
            setTakeAway(false);
            setFromTable(false);
            setIndiferentDelivery(false);

            if (!delivery == true) {
              setPaid(true);
              setNotPaid(false);
              setIndiferentPayment(false);

              setRestaurantConfirmed(false);
              setRestaurantNotConfirmed(true);
              setIndiferentConfirmation(false);

              Alert.alert(
                "Atención",
                "Se ha seleccionado delivery=true, así que hemos cambiado pagado a true y Confirmado/creado por el restaurante a false también, para que puedas ver solo los pedidos a enviar ya pagados solamente. Si quieres ver las creadas por el restaurante, pon Pagado=false (eventualmente será verdadero) y Confirmado/CreadoPorElRestaurante=true"
              );
            }
          }}
        />
        <BouncyCheckbox
          size={25}
          isChecked={takeAway}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Para recoger en tienda"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(takeAway) => {
            setTakeAway(true);
            setDelivery(false);
            setFromTable(false);
            setIndiferentDelivery(false);

            if (!takeAway == true) {
              setPaid(true);
              setNotPaid(false);
              setIndiferentPayment(false);

              setRestaurantConfirmed(false);
              setRestaurantNotConfirmed(true);
              setIndiferentConfirmation(false);

              Alert.alert(
                "Atención",
                "Se ha seleccionado takeAway=true, así que hemos cambiado pagado a true y Confirmado/creado por el restaurante a false también, para que puedas ver solo los pedidos a recoger ya pagados solamente. Si quieres ver las creadas/confirmadas por el restaurante, pon Pagado=false (eventualmente será true) y Confirmado/CreadoPorElRestaurante=true"
              );
            }
          }}
        />
        <BouncyCheckbox
          size={25}
          isChecked={fromTable}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Desde la mesa"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(fromTable) => {
            setDelivery(false);
            setTakeAway(false);
            setFromTable(true);
            setIndiferentDelivery(false);

            if (!fromTable == true) {
              fetchTables();
              setPaid(false);
              setNotPaid(true);
              setIndiferentPayment(false);
              Alert.alert(
                "Atención",
                "Se ha seleccionado fromTable=true, así que ahora depende de seleccionar si ver los creados/confirmados por el restaurante o no o si está pagado o no"
              );
            }
          }}
        />

        {allorders ? (
          <BouncyCheckbox
            size={25}
            isChecked={indiferentDelivery}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Forma de entrega indiferente"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              fontSize: 20,
              color: "white",
              textDecorationLine: "none",
            }}
            onPress={(indiferentDelivery) => {
              setDelivery(false);
              setTakeAway(false);
              setFromTable(false);
              if (allorders) {
                setIndiferentDelivery(true);
              } else {
                setIndiferentDelivery(!indiferentDelivery);
              }
            }}
          />
        ) : null}

        <Text style={styles.text}>Estado del pedido (pagado o no)</Text>
        <BouncyCheckbox
          size={25}
          isChecked={paid}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Pagado"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(paid) => {
            setPaid(true);
            setNotPaid(false);
            setIndiferentPayment(false);
          }}
        />
        <BouncyCheckbox
          size={25}
          isChecked={notPaid}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="No pagado"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(notPaid) => {
            setPaid(false);
            setNotPaid(true);
            setIndiferentPayment(false);
          }}
        />
        <BouncyCheckbox
          size={25}
          isChecked={indiferentPayment}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Estado indiferente"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(indiferentPayment) => {
            setPaid(false);
            setNotPaid(false);
            setIndiferentPayment(true);
          }}
        />

        <Text style={styles.text}>
          Estado del pedido (confirmado/creado por el restaurante o no)
        </Text>
        <BouncyCheckbox
          size={25}
          isChecked={restaurantConfirmed}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Pedido confirmado/creado por el restaurante"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(restaurantConfirmed) => {
            setRestaurantConfirmed(true);
            setRestaurantNotConfirmed(false);
            setIndiferentConfirmation(false);
          }}
        />
        <BouncyCheckbox
          size={25}
          isChecked={restaurantNotConfirmed}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Pedido no confirmado/creado por el restaurante"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(restaurantNotConfirmed) => {
            setRestaurantConfirmed(false);
            setRestaurantNotConfirmed(true);
            setIndiferentConfirmation(false);
          }}
        />
        <BouncyCheckbox
          size={25}
          isChecked={indiferentConfirmation}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Estado indiferente"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(indiferentConfirmation) => {
            setRestaurantConfirmed(false);
            setRestaurantNotConfirmed(false);
            setIndiferentConfirmation(true);
          }}
        />
        {fromTable ? (
          <TouchableOpacity
            onPress={() => {
              setTablesVisible(!tablesVisible);
            }}
          >
            <Text style={styles.textTables}>
              Mesas{" "}
              <Image
                style={{ height: 12, width: 20 }}
                source={
                  tablesVisible
                    ? require("../../assets/arrow-up-white.png")
                    : require("../../assets/arrow-down-white.png")
                }
              />
            </Text>
          </TouchableOpacity>
        ) : null}

        {fromTable && tablesVisible && tables.length > 0
          ? tables.map((table) => (
              <ManuallyTableReservationForOrders
                key={table.id}
                table={table}
                addTable={addTable}
                tablesChosen={tablesChosen}
                removeTable={removeTable}
              />
            ))
          : null}

        {fromTable && tablesVisible ? (
          <BouncyCheckbox
            size={25}
            isChecked={alltables}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Buscar pedidos de todas las mesas"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              fontSize: 20,
              color: "white",
              textDecorationLine: "none",
            }}
            onPress={(allTables) => {
              setAllTables(!allTables);
            }}
          />
        ) : null}

        <Text style={styles.text}>Estado del pedido (nulo o no)</Text>
        <BouncyCheckbox
          size={25}
          isChecked={nulledByRestaurant}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Anulada por el restaurante"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(nulledByRestaurant) => {
            setNulledByRestaurant(true);
            setIndiferentNull(false);
            setNulledByUser(false);
            setNotNulled(false);
          }}
        />

        <BouncyCheckbox
          size={25}
          isChecked={nulledByUser}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Anulado por el usuario"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(nulledByUser) => {
            setNulledByRestaurant(false);
            setIndiferentNull(false);
            setNulledByUser(true);
            setNotNulled(false);
          }}
        />

        <BouncyCheckbox
          size={25}
          isChecked={notNulled}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="No anulada"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(notNulled) => {
            setNulledByRestaurant(false);
            setIndiferentNull(false);
            setNulledByUser(false);
            setNotNulled(true);
          }}
        />

        <BouncyCheckbox
          size={25}
          isChecked={indiferentNull}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Nulidad indiferente"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(indiferentNull) => {
            setNulledByRestaurant(false);
            setIndiferentNull(true);
            setNulledByUser(false);
            setNotNulled(false);
          }}
        />
        <Text style={styles.text}>Estado del pedido</Text>
        <BouncyCheckbox
          size={25}
          isChecked={arrival}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Ha llegado"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(arrival) => {
            setArrival(true);
            setNotArrival(false);
            setPending(false);
            setIndiferentState(false);
          }}
        />
        <BouncyCheckbox
          size={25}
          isChecked={notArrival}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="No ha llegado"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(notArrival) => {
            setArrival(false);
            setNotArrival(true);
            setPending(false);
            setIndiferentState(false);
          }}
        />
        <BouncyCheckbox
          size={25}
          isChecked={pending}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Pedido no resuelto"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(pending) => {
            setPending(true);
            setArrival(false);
            setNotArrival(false);
            setIndiferentState(false);
          }}
        />
        <BouncyCheckbox
          size={25}
          isChecked={indiferentState}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Estado indiferente"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(indiferentState) => {
            setPending(false);
            setArrival(false);
            setNotArrival(false);
            setIndiferentState(true);
          }}
        />

        <Text style={styles.text}>Otros ajustes</Text>
        <BouncyCheckbox
          size={25}
          isChecked={prepared}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Mostrar sólo los que están pagados o confirmados/creados por el restaurante o usuario"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(prepared) => {
            setPrepared(!prepared);
          }}
        />

        <TouchableOpacity
          style={styles.search}
          onPress={() => {
            fetchOrders();
          }}
        >
          <Text style={styles.reservationtext}>Buscar pedidos</Text>
        </TouchableOpacity>

        <Text style={styles.text}>Resultados</Text>

        {!loaded && !loading ? (
          <Text style={styles.textsmall}>
            Dale a buscar para ver algún resultado
          </Text>
        ) : null}

        {!loaded && loading ? <ActivityIndicator size="large" /> : null}

        <View
          style={{
            flexDirection: "row", // Poner elementos en fila
            flexWrap: "wrap", // Permitir que se vayan a la siguiente fila
            justifyContent: "flex-start", // Puedes usar 'space-between' si quieres separación
            width: "100%",
            //gap: gapWidth,
          }}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setContainerWidth(width);
          }}
        >
          {loaded && !loading && orders.length != 0
            ? orders.map((order, index) => {
                //const cardWidth = (containerWidth - gapWidth * (cardsPerRow - 1)) / cardsPerRow;
                const isLastInRow = (index + 1) % cardsPerRow === 0;
                return (
                  <View
                    key={index}
                    style={{
                      //width: cardWidth, // o un valor fijo como 150
                      flexBasis: `33.33%`,
                      flexGrow: 0,
                      marginBottom: 10, // separación vertical entre filas
                      paddingRight: isLastInRow ? 0 : gapWidth,
                    }}
                  >
                    <OrderInList key={order.pk} pedido={order}></OrderInList>
                  </View>
                );
              })
            : null}
        </View>

        {loaded && !loading && orders.length == 0 ? (
          <Text style={styles.textsmall}>
            No hay resultados que coinciden con tu búsqueda
          </Text>
        ) : null}
      </ScrollView>
      <TouchableOpacity
        style={styles.reservation}
        onPress={() => {
          navigation.navigate("Elegir Entrega");
        }}
      >
        <Text style={styles.reservationtext}>Crear pedido</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Pedidos;

const styles = StyleSheet.create({
  timeOfReservation: {
    borderColor: "white",
    borderWidth: 1,
    backgroundColor: "rgb(107,106,106)",
    marginBottom: 10,
  },
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
  reservation: {
    backgroundColor: "white",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 40,
    marginTop: 15,
  },
  search: {
    backgroundColor: "white",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    marginTop: 15,
  },
  reservationtext: {
    color: "black",
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Function-Regular",
  },
  text: {
    marginTop: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  textTables: {
    marginTop: 20,
    color: "white",
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  pickerstyleios: {
    color: "white",
    height: 40,
  },
  pickerstyleandroid: {
    color: "white",
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

//REPASADO Y LIMPIADO
