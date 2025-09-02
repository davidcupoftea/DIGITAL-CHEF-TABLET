import { useState, useEffect, useContext } from "react";
import {
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import * as Device from "expo-device";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL,
  RESERVATIONS_CHOOSE_WINDOW_OR_PATIO,
  RESERVATIONS_ASK_INTOLLERANCIES,
  RESERVATIONS_ASK_CHILDREN,
} from "../services/index.jsx";
import ManuallyTableReservation from "./ManuallyTableReservation.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

function DoReservation() {
  const [reservationName, setReservationName] = useState("");
  const [startedEditingName, setStartedEditingName] = useState(false);
  const [reservationEmail, setReservationEmail] = useState("");
  const [startedEditingEmail, setStartedEditingEmail] = useState(false);
  const [reservationPhone, setReservationPhone] = useState("");
  const [startedEditingPhone, setStartedEditingPhone] = useState(false);
  const [reservationDate, setReservationDate] = useState(new Date());
  const [startedEditingReservationDate, setStartedEditingReservationDate] =
    useState(false);
  const [maximumDate, setMaximumDate] = useState(new Date());
  const [minimumDate, setMinimumDate] = useState(new Date());
  const [reservationDateString, setReservationDateString] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [timePeriod, setTimePeriod] = useState(0);
  const [timePeriodsState, setTimePeriodsState] = useState([]);
  const [numberOfComensals, setNumberOfComensals] = useState("1");
  const [loadedTimePeriods, setLoadedTimePeriods] = useState(false);
  const [ventanaYterraza, setVentanaYterraza] = useState({
    ventana: false,
    terraza: false,
  });
  const [windowPresence, setWindowPresence] = useState(false);
  const [patioPresence, setPatioPresence] = useState(false);
  const [text, setText] = useState("");
  const [children, setChildren] = useState(false);
  const [errorBusyHour, setErrorBusyHour] = useState(null);
  const [chooseTablesManually, setChooseTablesManually] = useState(false);
  const [tablesToChoose, setTablesToChoose] = useState([]);
  const [tablesChosen, setTablesChosen] = useState([]);

  const navigation = useNavigation();
  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const addTable = (pk) => {
    setTablesChosen((prevState) => [...prevState, pk]);
  };

  const removeTable = (pk) => {
    let new_tablesChosen = [...tablesChosen];
    new_tablesChosen = new_tablesChosen.filter((table) => table != pk);
    setTablesChosen(new_tablesChosen);
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
        body: JSON.stringify({ date: reservationDateString }),
      }
    );

    var timePeriods = await jsonData.json();
    setTimePeriod(timePeriods.data[0].id);
    setTimePeriodsState(timePeriods.data);
    setLoadedTimePeriods(true);
  };

  const getThereIsWindowsAndPatio = async (restaurantChosen_pk) => {
    const jsonData = await fetch(
      BASE_URL + "windows-and-patio-dc/" + restaurantChosen_pk + "/",
      {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );
    var windowsAndPatio = await jsonData.json();
    setWindowPresence(windowsAndPatio.window);
    setPatioPresence(windowsAndPatio.patio);
  };

  const renderTimePeriodList = () => {
    if (timePeriodsState != []) {
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
    const assessIfBusyHour = async () => {
      if (reservationDateString != "") {
        if (authTokens != null && authTokens != "null") {
          const restaurantChosen_pk = await getAndSetRestaurant(
            authTokens?.access,
            setRestaurantChosen
          );
          if (reservationDateString && timePeriod) {
            checkBusyHours(restaurantChosen_pk);
          }
        }
      }
    };
    assessIfBusyHour();
  }, [timePeriod, reservationDateString]);

  useEffect(()=>{
    if (reservationDateString != "" && timePeriod != 0) {
    fetchTables()}
  },[timePeriod, reservationDateString])

  useEffect(() => {
    const gettingInfoForReservation = async () => {
      let datenow = new Date();
      let currentDay = String(datenow.getDate()).padStart(2, "0");
      let currentMonth = String(datenow.getMonth() + 1).padStart(2, "0");
      let nextMonth = String(datenow.getMonth() + 2).padStart(2, "0");
      let currentYear = datenow.getFullYear();
      let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
      let maximumDate = `${currentYear}-${nextMonth}-${currentDay}`;
      let currentDateObject = new Date(currentDate);
      let maximumDateObject = new Date(maximumDate);

      setReservationDate(currentDateObject);
      setMinimumDate(currentDateObject);
      setMaximumDate(maximumDateObject);
      setShowPicker(false);
      if (authTokens != null && authTokens != "null") {
        const restaurantChosen_pk = await getAndSetRestaurant(
          authTokens?.access,
          setRestaurantChosen
        );
        getThereIsWindowsAndPatio(restaurantChosen_pk);
      }
    };
    gettingInfoForReservation();
  }, []);

  useEffect(() => {
    const gettingTimePeriods = async () => {
      if (authTokens != null && authTokens != "null") {
        const restaurantChosen_pk = await getAndSetRestaurant(
          authTokens?.access,
          setRestaurantChosen
        );
        if (reservationDateString) {
          getTimePeriods(restaurantChosen_pk);
        }
      }
    };
    gettingTimePeriods();
  }, [reservationDateString]);

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  const onChangePicker = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setReservationDate(currentDate);
      if (Device.osName === "Android" || Platform.OS === "android") {
        let Day = String(currentDate.getDate()).padStart(2, "0");
        let Month = String(currentDate.getMonth() + 1).padStart(2, "0");
        let Year = currentDate.getFullYear();
        toggleDatePicker();
        setReservationDateString(`${Year}-${Month}-${Day}`);
      }
    } else {
      toggleDatePicker();
    }
  };

  const confirmIOSDate = () => {
    let Day = String(reservationDate.getDate()).padStart(2, "0");
    let Month = String(reservationDate.getMonth() + 1).padStart(2, "0");
    let Year = reservationDate.getFullYear();
    setReservationDateString(`$${Year}-${Month}-${Day}`);
    toggleDatePicker();
  };

  const confirmarReservaGuardada = () => {
    Alert.alert(
      "De nuevo, ¿seguro que has revisado la información de reserva?",
      "De nuevo, ¿estás seguro de que todo es correcto?",
      [
        {
          text: "No, déjame cambiarla",
          style: "cancel",
        },
        {
          text: "Sí, lo es",
          onPress: async () => await makeReservation(restaurantChosen.pk),
        },
      ]
    );
  };
  const reservaGuardada = () => {
    if (reservationName.length == 0) {
      Alert.alert("Se necesita un nombre");
      return;
    }
    if (reservationDateString.length == 0) {
      Alert.alert("Se necesita una fecha");
      return;
    }

    if (reservationPhone.length == 0) {
      Alert.alert("Se necesita un teléfono");
      return;
    }
    Alert.alert(
      "¿Has revisado varias veces la información de reserva?",
      "¿Estás seguro de que todo es correcto?",
      [
        {
          text: "No, déjame cambiarla",
          style: "cancel",
        },
        {
          text: "Sí, lo es",
          onPress: () => confirmarReservaGuardada(),
        },
      ]
    );
  };

  const checkBusyHours = async (restaurantChosen_pk) => {
    let Day = String(reservationDate.getDate()).padStart(2, "0");
    let Month = String(reservationDate.getMonth() + 1).padStart(2, "0");
    let Year = String(reservationDate.getFullYear());

    var payload = JSON.stringify({
      date: `${Year}-${Month}-${Day}`,
      time_period: timePeriod,
    });

    const response = await fetch(
      BASE_URL + "check-busy-hours-dc/" + restaurantChosen_pk + "/",
      {
        method: "POST",
        body: payload,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );

    const jsonData = await response.json();
    if (jsonData.status == "ok" && jsonData.able_to_do_reservation == true) {
      setErrorBusyHour(false);
    } else if (
      jsonData.status == "ok" &&
      jsonData.able_to_do_reservation == false
    ) {
      Alert.alert(
        "No vas a poder reservar a esta hora y día",
        "Esta hora y día es un momento de hora punta, no es posible reservar a esta hora y día porque la afluencia en el restaurante será máxima"
      );
      setErrorBusyHour(true);
    }
  };

  function makeReservation(restaurantChosen_pk) {
    var payload = JSON.stringify({
      number_of_comensals: numberOfComensals.toString(),
      name_of_the_reservation: reservationName.toString(),
      email_of_the_reservation: reservationEmail.toString(),
      telephone_number_custom_field: reservationPhone.toString(),
      date_custom_field: reservationDateString.toString(),
      time_period_custom_field: timePeriod,
      near_a_window: ventanaYterraza.ventana,
      in_patio: ventanaYterraza.terraza,
      children: children,
      allergies: text.toString(),
      tables_chosen_by_the_restaurant_owner: chooseTablesManually,
      tables_chosen: tablesChosen,
    });

    fetch(BASE_URL + "reservation-dc/" + restaurantChosen_pk + "/", {
      method: "POST",
      body: payload,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        if (json.hasOwnProperty("description")) {
          Alert.alert('Éxito',`${json.description}`);
        } else if (json.hasOwnProperty("number_of_comensals")) {
          Alert.alert("Parece que la cantidad de comensales no es la correcta");
        } else if (json.hasOwnProperty("non_field_errors")) {
          Alert.alert(
            `Problema haciendo la reserva`,
            `${json.non_field_errors}`
          );
        }
      })
      .catch(function (error) {
        Alert.alert(
          "Ha habido un problema con la operación:",
          `${error.message}`
        );
        throw error;
      })
      .finally(() => {
        navigation.navigate("Reserva");
      });
  }

  const getTables = async () => {
    if (reservationDateString == "" || timePeriod == 0) {
      Alert.alert(
        "Por favor introduce una hora y una fecha para que te sugiramos mesas"
      );
      return;
    } else {
      fetchTables();
    }
  };

  const fetchTables = async () => {
    var payload = JSON.stringify({
      date: reservationDateString,
      time_period: timePeriod,
    });

    const response = await fetch(
      BASE_URL + "tables-and-tables-available/" + restaurantChosen.pk + "/",
      {
        method: "POST",
        body: payload,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );

    const jsonData = await response.json();
    setTablesToChoose([...jsonData.data]);
    setChooseTablesManually(true);
  };

  return (
    <ScrollView>
      <KeyboardAvoidingView style={styles.viewable}>
        {
          <View style={styles.insideviewable}>
            {
              <Text style={styles.text}>
                Estás a punto de hacer una reserva en el restaurant{" "}
                {restaurantChosen.franchise} situado en{" "}
                {restaurantChosen.address}.
              </Text>
            }
            <Text style={styles.text}>Nombre de la reserva</Text>
            <TextInput
              style={styles.textinput}
              placeholder="El nombre de quien reserva"
              placeholderTextColor="white"
              onChangeText={setReservationName}
              onBlur={() => {
                setStartedEditingName(true);
              }}
              value={reservationName}
            />

            {reservationName.length == 0 && startedEditingName == true ? (
              <Text style={styles.texterror}>
                Tienes que rellenar este campo
              </Text>
            ) : null}

            <Text style={styles.text}>Email de quien hace la reserva</Text>
            <TextInput
              style={styles.textinput}
              placeholder="El email de quien reserva"
              placeholderTextColor="white"
              onChangeText={setReservationEmail}
              onBlur={() => {
                setStartedEditingEmail(true);
              }}
              value={reservationEmail}
            />

            {reservationEmail.length == 0 && startedEditingEmail == true ? (
              <Text style={styles.texterror}>
                Tienes que rellenar este campo
              </Text>
            ) : null}
            <Text style={styles.text}>Fecha de reserva </Text>

            <Pressable
              onPress={() => {
                setShowPicker(true);
                setStartedEditingReservationDate(true);
              }}
            >
              <TextInput
                style={styles.textinput}
                placeholder="El día que quieres reservar"
                value={reservationDateString}
                onChangeText={setReservationDate}
                placeholderTextColor="white"
                editable={false}
                onPressIn={toggleDatePicker}
              />
            </Pressable>

            {errorBusyHour ? (
              <Text style={styles.texterror}>
                No vas a poder reservar a esta hora y día porque es hora punta
              </Text>
            ) : null}

            {showPicker == false &&
            reservationDateString.length == 0 &&
            startedEditingReservationDate == true ? (
              <Text style={styles.texterror}>
                Tienes que rellenar este campo
              </Text>
            ) : null}

            {showPicker && (
              <RNDateTimePicker
                mode="date"
                display="spinner"
                value={reservationDate}
                onChange={onChangePicker}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
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
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
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
                    <Text
                      style={styles.buttontextConfirm}
                      onPress={confirmIOSDate}
                    >
                      Confirmar
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            <Text style={styles.text}>Hora de la reserva </Text>

            <Pressable
              onPress={() => {
                if (!reservationDateString) {
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

            {errorBusyHour ? (
              <Text style={styles.texterror}>
                No vas a poder reservar a esta hora y día porque es hora punta
              </Text>
            ) : null}

            <Text style={styles.text}>Número de comensales</Text>

            <View
              style={{
                borderColor: "white",
                borderWidth: 1,
                backgroundColor: '"rgb(107,106,106)"',
                marginBottom: 10,
              }}
            >
              <Picker
                selectedValue={numberOfComensals}
                onValueChange={(itemValue, itemIndex) =>
                  setNumberOfComensals(itemValue)
                }
                style={
                  getPlatform() == "android"
                    ? styles.pickerstyleandroid
                    : styles.pickerstyleios
                }
                itemStyle={{ height: 40, color: "white" }}
                dropdownIconColor="white"
                enabled={true}
              >
                <Picker.Item label="1" value="1" />

                <Picker.Item label="2" value="2" />

                <Picker.Item label="3" value="3" />

                <Picker.Item label="4" value="4" />

                <Picker.Item label="5" value="5" />

                <Picker.Item label="6" value="6" />

                <Picker.Item label="7" value="7" />

                <Picker.Item label="8" value="8" />

                <Picker.Item label="9" value="9" />

                <Picker.Item label="10" value="10" />

                <Picker.Item label="11" value="11" />

                <Picker.Item label="12" value="12" />

                <Picker.Item label="13" value="13" />

                <Picker.Item label="14" value="14" />

                <Picker.Item label="15" value="15" />

                <Picker.Item label="16" value="16" />

                <Picker.Item label="17" value="17" />

                <Picker.Item label="18" value="18" />

                <Picker.Item label="19" value="19" />

                <Picker.Item label="20" value="20" />

                <Picker.Item label="21" value="21" />

                <Picker.Item label="22" value="22" />

                <Picker.Item label="23" value="23" />

                <Picker.Item label="24" value="24" />

                <Picker.Item label="25" value="25" />

                <Picker.Item label="26" value="26" />

                <Picker.Item label="27" value="27" />

                <Picker.Item label="28" value="28" />

                <Picker.Item label="29" value="29" />

                <Picker.Item label="30" value="30" />

                <Picker.Item label="31" value="31" />

                <Picker.Item label="32" value="32" />

                <Picker.Item label="33" value="33" />

                <Picker.Item label="34" value="34" />

                <Picker.Item label="35" value="35" />

                <Picker.Item label="36" value="36" />

                <Picker.Item label="37" value="37" />

                <Picker.Item label="38" value="38" />

                <Picker.Item label="39" value="39" />

                <Picker.Item label="40" value="40" />

                <Picker.Item label="41" value="41" />

                <Picker.Item label="42" value="42" />

                <Picker.Item label="43" value="43" />

                <Picker.Item label="44" value="44" />

                <Picker.Item label="45" value="45" />

                <Picker.Item label="46" value="46" />

                <Picker.Item label="47" value="47" />

                <Picker.Item label="48" value="48" />

                <Picker.Item label="49" value="49" />

                <Picker.Item label="50" value="50" />

                <Picker.Item label="51" value="51" />

                <Picker.Item label="52" value="52" />

                <Picker.Item label="53" value="53" />

                <Picker.Item label="4" value="54" />

                <Picker.Item label="55" value="55" />

                <Picker.Item label="56" value="56" />

                <Picker.Item label="57" value="57" />

                <Picker.Item label="58" value="58" />

                <Picker.Item label="59" value="59" />

                <Picker.Item label="60" value="60" />

                <Picker.Item label="61" value="61" />

                <Picker.Item label="62" value="62" />

                <Picker.Item label="63" value="63" />

                <Picker.Item label="64" value="64" />

                <Picker.Item label="65" value="65" />

                <Picker.Item label="66" value="66" />

                <Picker.Item label="67" value="67" />

                <Picker.Item label="68" value="68" />

                <Picker.Item label="69" value="69" />

                <Picker.Item label="70" value="70" />

                <Picker.Item label="71" value="71" />

                <Picker.Item label="72" value="72" />

                <Picker.Item label="73" value="73" />

                <Picker.Item label="74" value="74" />

                <Picker.Item label="75" value="75" />

                <Picker.Item label="76" value="76" />

                <Picker.Item label="77" value="77" />

                <Picker.Item label="78" value="78" />

                <Picker.Item label="79" value="79" />

                <Picker.Item label="80" value="80" />

                <Picker.Item label="81" value="81" />

                <Picker.Item label="82" value="82" />

                <Picker.Item label="83" value="83" />

                <Picker.Item label="84" value="84" />

                <Picker.Item label="85" value="85" />

                <Picker.Item label="86" value="86" />

                <Picker.Item label="87" value="87" />

                <Picker.Item label="88" value="88" />

                <Picker.Item label="89" value="89" />

                <Picker.Item label="90" value="90" />

                <Picker.Item label="91" value="91" />

                <Picker.Item label="92" value="92" />

                <Picker.Item label="93" value="93" />

                <Picker.Item label="94" value="94" />

                <Picker.Item label="95" value="95" />

                <Picker.Item label="96" value="96" />

                <Picker.Item label="97" value="97" />

                <Picker.Item label="98" value="98" />

                <Picker.Item label="99" value="99" />

                <Picker.Item label="100" value="100" />

                <Picker.Item label="101" value="101" />
              </Picker>
            </View>

            <Text style={styles.text}>Teléfono de contacto</Text>
            <TextInput
              style={styles.textinput}
              keyboardType="numeric"
              maxLength={12}
              placeholder="El teléfono de quien reserva"
              placeholderTextColor="white"
              onChangeText={setReservationPhone}
              value={reservationPhone}
              onBlur={() => {
                setStartedEditingPhone(true);
              }}
            />
            {reservationPhone.length == 0 && startedEditingPhone == true ? (
              <Text style={styles.texterror}>
                Tienes que rellenar este campo
              </Text>
            ) : null}

            {RESERVATIONS_ASK_INTOLLERANCIES ? (
              <>
                <Text style={styles.text}>
                  ¿Alergias?¿Anotaciones? (Opcional)
                </Text>
                <TextInput
                  style={styles.textinputintolerancies}
                  placeholder="Indicanos tus intoleracias y otras particularidades"
                  placeholderTextColor="white"
                  multiline={true}
                  numberOfLines={4}
                  onChangeText={(textToUpdate) => setText(textToUpdate)}
                  value={text}
                />
              </>
            ) : null}

            {windowPresence && RESERVATIONS_CHOOSE_WINDOW_OR_PATIO && !chooseTablesManually? (
              <BouncyCheckbox
                size={25}
                isChecked={ventanaYterraza.ventana}
                fillColor="black"
                unFillColor="#FFFFFF"
                useBuiltInState={false}
                text="Al lado de una ventana"
                iconStyle={{ borderColor: "white" }}
                innerIconStyle={{ borderWidth: 2 }}
                style={{ marginTop: 15 }}
                textStyle={{
                  fontFamily: "Function-Regular",
                  fontSize: 20,
                  color: "white",
                  textDecorationLine: "none",
                }}
                onPress={(ventana) => {
                  setVentanaYterraza({ ventana: !ventana, terraza: false });
                }}
              />
            ) : null}

            {patioPresence && RESERVATIONS_CHOOSE_WINDOW_OR_PATIO && !chooseTablesManually? (
              <BouncyCheckbox
                size={25}
                isChecked={ventanaYterraza.terraza}
                fillColor="black"
                unFillColor="#FFFFFF"
                text="Terraza"
                useBuiltInState={false}
                iconStyle={{ borderColor: "white" }}
                innerIconStyle={{ borderWidth: 2 }}
                style={{ marginTop: 15 }}
                textStyle={{
                  fontFamily: "Function-Regular",
                  fontSize: 20,
                  color: "white",
                  textDecorationLine: "none",
                }}
                onPress={(terraza) => {
                  setVentanaYterraza({ ventana: false, terraza: !terraza });
                }}
              />
            ) : null}

            {RESERVATIONS_ASK_CHILDREN ? (
              <BouncyCheckbox
                size={25}
                isChecked={children}
                fillColor="black"
                unFillColor="#FFFFFF"
                useBuiltInState={false}
                text="Vienen niños menores de 5 años/Matronas"
                iconStyle={{ borderColor: "white" }}
                innerIconStyle={{ borderWidth: 2 }}
                style={{ marginTop: 15 }}
                textStyle={{
                  fontFamily: "Function-Regular",
                  fontSize: 20,
                  color: "white",
                  textDecorationLine: "none",
                }}
                onPress={(children) => {
                  setChildren(!children);
                }}
              />
            ) : null}
            <Text style={styles.textMarginTop}>Mesas</Text>
            <BouncyCheckbox
              size={25}
              isChecked={chooseTablesManually}
              fillColor="black"
              unFillColor="#FFFFFF"
              text="Elegir las mesas manualmente"
              useBuiltInState={false}
              iconStyle={{ borderColor: "white" }}
              innerIconStyle={{ borderWidth: 2 }}
              style={{ marginBottom: 15 }}
              textStyle={{
                fontFamily: "Function-Regular",
                fontSize: 20,
                color: "white",
                textDecorationLine: "none",
              }}
              onPress={(chooseTablesManually) => {
                if (!chooseTablesManually == true) {
                  getTables();
                } else {
                  setTablesToChoose([]);
                  setChooseTablesManually(false);
                }
              }}
            />

            {tablesToChoose && tablesToChoose.length > 0
              ? tablesToChoose.map((table) => (
                  <ManuallyTableReservation
                    key={table.pk}
                    table={table}
                    addTable={addTable}
                    tablesChosen={tablesChosen}
                    removeTable={removeTable}
                  />
                ))
              : null}

            <TouchableOpacity
              onPress={() => reservaGuardada()}
              style={styles.button}
            >
              <Text style={styles.buttontext}>CONFIRMAR RESERVA</Text>
            </TouchableOpacity>
          </View>
        }
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

export default DoReservation;

const styles = StyleSheet.create({
  timeOfReservation: {
    borderColor: "white",
    borderWidth: 1,
    backgroundColor: '"rgb(107,106,106)"',
    marginBottom: 10,
  },
  viewable: {
    padding: 20,
  },
  insideviewable: {
    marginBottom: 20,
  },
  text: {
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  textMarginTop: {
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 10,
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
  textinputintolerancies: {
    padding: 14,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 10,
    textAlignVertical: "top",
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
  }
});

//REPASADO Y LIMPIADO
