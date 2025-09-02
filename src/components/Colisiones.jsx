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
import CollisionInList from "./CollisionInList.jsx";
import * as Device from "expo-device";
import { Picker } from "@react-native-picker/picker";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useIsFocused} from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL,
} from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

const Colisiones = (variable) => {
  const [collisions, setCollisions] = useState([]);
  const [reservationDateString, setReservationDateString] = useState(variable.route.params.date);
  const [reservationDate, setReservationDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [startedEditingReservationDate, setStartedEditingReservationDate] =
    useState(false);
  const [timePeriod, setTimePeriod] = useState(variable.route.params.time_period);
  const [timePeriodsState, setTimePeriodsState] = useState([]);
  const [loadedTimePeriods, setLoadedTimePeriods] = useState(false);
  const [allreservations, setAllReservations] = useState(variable.route.params.allreservations);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const navigation = useNavigation();
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
    setLoading(true)
    setLoaded(false)
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
      setCollisions(res_json.collisions)
      setLoading(false)
      setLoaded(true)

  }

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
    //setTimePeriod(timePeriods[0].id); //ESTO NO SE SI DEBERÍA DEJARLO O QUITARLO, COMENTARIO HECHO EL 20 DE AGOSTO DE 2025
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



  return (
    <View style={styles.container}>
      <ScrollView>
          <Text style={styles.textsmall}>
            Estás viendo las colisiones de las reservas del restaurante{" "}
            {restaurantChosen.franchise} localizado en{" "}
            {restaurantChosen.address}
          </Text>


        
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


          <Text style={styles.text}>Resultados</Text>

          {!loaded && !loading ? (
            <Text style={styles.textsmall}>
              Para ver algún resultado hay que poner hora y fecha, o fecha y tickar en el checkbox para elegir todas las horas
            </Text>
          ) : null}

          {!loaded && loading ? <ActivityIndicator size="large" /> : null}

          {loaded && !loading && collisions.length != 0
            ? collisions.map((collision, index) => (
                <CollisionInList
                  key={index}
                  collision={collision}
                ></CollisionInList>
              ))
            : null}

          {loaded && !loading && collisions.length == 0 ? (
            <Text style={styles.textsmall}>
              No hay colisiones para esta fecha y horas
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

export default Colisiones;

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

//REPASADO Y LIMPIO
