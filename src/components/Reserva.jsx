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
import ReservationInList from "./ReservationInList.jsx";
import * as Device from "expo-device";
import { Picker } from "@react-native-picker/picker";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useIsFocused} from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL
} from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

function Reserva() {
  const [reservaciones, setReservaciones] = useState([]);
  const [reservationDateString, setReservationDateString] = useState("");
  const [reservationDate, setReservationDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [startedEditingReservationDate, setStartedEditingReservationDate] =
    useState(false);
  const [timePeriod, setTimePeriod] = useState(0);
  const [timePeriodsState, setTimePeriodsState] = useState([]);
  const [loadedTimePeriods, setLoadedTimePeriods] = useState(false);
  const [allreservations, setAllReservations] = useState(true);
  const [window, setWindow] = useState(false);
  const [patio, setPatio] = useState(false);
  const [sala, setSala] = useState(false);
  const [indiferentLocation, setIndiferentLocation] = useState(true);
  const [nulledByRestaurant, setNulledByRestaurant] = useState(false);
  const [nulledByUser, setNulledByUser] = useState(false);
  const [notNulled, setNotNulled] = useState(false);
  const [indiferentNull, setIndiferentNull] = useState(true);
  const [arrival, setArrival] = useState(false);
  const [notArrival, setNotArrival] = useState(false);
  const [pending, setPending] = useState(true);
  const [indiferentState, setIndiferentState] = useState(false);
  const [collisions, setCollisionas] = useState(false)
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

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
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


  const getCollisions = async (restaurantChosen_pk) => {
    const jsonData = await fetch(
        BASE_URL + "get-collisions/" + restaurantChosen_pk + "/",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens?.access),
          },
          body: JSON.stringify({ date: reservationDateString, time_period: timePeriod, allreservations: allreservations }),
        }
      );
      const res_json = await jsonData.json();
      setCollisionas(res_json.found_collisions)

  }

  useEffect(()=>{
    if(isFocused){
        if (reservationDateString != '' && timePeriod != 0){
        getCollisions(restaurantChosen.pk)
        }
    }
  },[isFocused])

  useEffect(() =>{
    if (reservationDateString != '' && timePeriod != 0){
    getCollisions(restaurantChosen.pk)
  }
  },[reservationDateString, timePeriod, allreservations, navigation])

  useEffect(() => {
    const gettingInfoForReservation = async () => {
      setShowPicker(false);
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
    gettingInfoForReservation();
  }, [reservationDateString]);

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

      useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async ()=>{ 
            if ((reservationDateString && timePeriod) ||(reservationDateString && !timePeriod && allreservations))
            fetchReservations();   
            })
        return unsubscribe;

    }, [isFocused, restaurantChosen.pk])

  const fetchReservations = async () => {
    if (!reservationDateString) {
      Alert.alert("Ups", "Por favor pon una fecha");
      return;
    }
    if (reservationDateString && !timePeriod && !allreservations) {
      Alert.alert(
        "Ups",
        "Por favor pon una hora o elige ver todas las reservas de ese día"
      );
      return;
    }
    setLoading(true);
    setLoaded(false);
    const res = await fetch(
      BASE_URL + "reservations-dc/" + restaurantChosen.pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({
          date: reservationDateString,
          time_period: timePeriod,
          allreservations: allreservations,
          window: window,
          patio: patio,
          sala: sala,
          indiferent_location: indiferentLocation,
          nulled_by_user: nulledByUser,
          nulled_by_restaurant: nulledByRestaurant,
          not_nulled: notNulled,
          indiferent_null: indiferentNull,
          arrival: arrival,
          not_arrival: notArrival,
          pending: pending,
          indiferent_state: indiferentState,
        }),
      }
    );
    var jsonData = await res.json();
    if (jsonData.status == 'ok'){
    setReservaciones(jsonData.data);
    setLoading(false);
    setLoaded(true);
    } else if (jsonData.status == 'nook'){
      Alert.alert('Error', jsonData.message)
    }
  };

  const cardsPerRow = 3;
  const [containerWidth, setContainerWidth] = useState(0);
  const [gapWidth, setGapWidth] = useState(0);

  useEffect(() => {
    setGapWidth(containerWidth * 0.02);
  }, [containerWidth]);

  return (
    <View style={styles.container}>
      <ScrollView>
        
          <Text style={styles.textsmall}>
            Estás viendo las reservas del restaurante{" "}
            {restaurantChosen.franchise} localizado en{" "}
            {restaurantChosen.address}
          </Text>
        

        {collisions ? <View style={styles.collisions}><TouchableOpacity onPress={()=>{navigation.navigate('Colisiones',{date: reservationDateString, time_period: timePeriod, allreservations: allreservations})}}><Text style={styles.textcollisions}>Parece que con los parámetros dados hay mesas que comparten reserva. Pulsa <Text style={styles.underline}>aquí</Text> para solucionarlo</Text></TouchableOpacity></View>:null}


        
          <Text style={styles.text}>Fecha de reserva </Text>

          <Pressable
            onPress={() => {
              setShowPicker(true);
              setStartedEditingReservationDate(true);
            }}
          >
            <TextInput
              style={styles.textinput}
              placeholder="Fecha de la reserva"
              value={reservationDateString}
              onChangeText={setReservationDate}
              placeholderTextColor="white"
              editable={false}
              onPressIn={toggleDatePicker}
            />
          </Pressable>

          {showPicker == false &&
          reservationDateString.length == 0 &&
          startedEditingReservationDate == true ? (
            <Text style={styles.texterror}>Tienes que rellenar este campo</Text>
          ) : null}

          {showPicker && (
            <RNDateTimePicker
              mode="date"
              display="spinner"
              value={reservationDate}
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

          <BouncyCheckbox
            size={25}
            isChecked={allreservations}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Todas las reservas de ese día independientemente de la hora"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              fontSize: 20,
              color: "white",
              textDecorationLine: "none",
            }}
            onPress={(allreservations) => {
              setAllReservations(!allreservations);
            }}
          />
          <Text style={styles.text}>Otros ajustes</Text>
          <BouncyCheckbox
            size={25}
            isChecked={window}
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
            onPress={(window) => {
              setWindow(!window);
              setPatio(false);
              setSala(false);
              setIndiferentLocation(false);
            }}
          />
          <BouncyCheckbox
            size={25}
            isChecked={patio}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="En la terraza"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              fontSize: 20,
              color: "white",
              textDecorationLine: "none",
            }}
            onPress={(patio) => {
              setPatio(!patio);
              setWindow(false);
              setSala(false);
              setIndiferentLocation(false);
            }}
          />
          <BouncyCheckbox
            size={25}
            isChecked={sala}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Sala"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              fontSize: 20,
              color: "white",
              textDecorationLine: "none",
            }}
            onPress={(sala) => {
              setPatio(false);
              setWindow(false);
              setSala(!sala);
              setIndiferentLocation(false);
            }}
          />

          <BouncyCheckbox
            size={25}
            isChecked={indiferentLocation}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Ubicación indiferente"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              fontSize: 20,
              color: "white",
              textDecorationLine: "none",
            }}
            onPress={(indiferentLocation) => {
              setPatio(false);
              setWindow(false);
              setSala(false);
              setIndiferentLocation(!indiferentLocation);
            }}
          />

          <Text style={styles.text}>Estado de la reserva (nula o no)</Text>
          <BouncyCheckbox
            size={25}
            isChecked={nulledByUser}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Anulada por el usuario"
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
              setNulledByUser(!nulledByUser);
              setNulledByRestaurant(false);
              setIndiferentNull(false);
              setNotNulled(false);
            }}
          />
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
              setNulledByRestaurant(!nulledByRestaurant);
              setNulledByUser(false);
              setIndiferentNull(false);
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
              setNulledByUser(false);
              setIndiferentNull(false);
              setNotNulled(!notNulled);
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
              setNulledByUser(false);
              setNulledByRestaurant(false);
              setIndiferentNull(!indiferentNull);
              setNotNulled(false);
            }}
          />
          <Text style={styles.text}>Estado de la reserva</Text>
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
              setArrival(!arrival);
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
            text="No ha llegado (y no llegará ya)"
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
              setNotArrival(!notArrival);
              setArrival(false);
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
            text="Reserva no resuelta"
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
              setPending(!pending);
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
              setIndiferentState(!indiferentState);
            }}
          />

          <TouchableOpacity
            style={styles.search}
            onPress={() => {
              fetchReservations();
            }}
          >
            <Text style={styles.reservationtext}>Buscar reservas</Text>
          </TouchableOpacity>

          <Text style={styles.text}>Resultados</Text>

          {!loaded && !loading ? (
            <Text style={styles.textsmall}>
              Dale a buscar para ver algún resultado
            </Text>
          ) : null}

          {!loaded && loading ? <ActivityIndicator size="large" /> : null}

          {loaded && !loading && reservaciones.length != 0
            ? reservaciones.map((reservacion) => (
                <ReservationInList
                  key={reservacion.id}
                  reservacion={reservacion}
                  fetchReservations={fetchReservations}
                ></ReservationInList>
              ))
            : null}

          {loaded && !loading && reservaciones.length == 0 ? (
            <Text style={styles.textsmall}>
              No hay resultados que coinciden con tu búsqueda
            </Text>
          ) : null}
        
      </ScrollView>
      <TouchableOpacity
        style={styles.reservation}
        onPress={() => {
          navigation.navigate("Hacer reserva");
        }}
      >
        <Text style={styles.reservationtext}>Crear reserva</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Reserva;

const styles = StyleSheet.create({
  timeOfReservation: {
    borderColor: "white",
    borderWidth: 1,
    backgroundColor: "rgb(107,106,106)",
    marginBottom: 10,
  },
  underline:{
    textDecorationLine: 'underline',
  },
  collisions: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 10,
    marginTop: 10,
  },
  textcollisions: {
    textAlign: 'center',
    color: 'red',
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
