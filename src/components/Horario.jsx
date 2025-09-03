import { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { BASE_URL, WARNING_NOT_SCROLLABLE} from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

function Horario() {
  const navigation = useNavigation();

  const [hoursOfEveryDay, setHoursOfEveryDay] = useState([]);
  const [timePeriods, setTimePeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notAbleToFetch, setNotAbleToFetch] = useState(false);

  const { authTokensObject, findIsPhoneVerified, phoneVerifiedObject } =
    useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const [selected, setSelected] = useState({});
  const keyFor = (dayId, tpId) => `${dayId}:${tpId}`;

 
// Función genérica para mostrar confirmación
const confirmAction = (message, onConfirm) => {
  Alert.alert(
    "Confirmar",
    message,
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí", onPress: onConfirm },
    ]
  );
};

// Función para añadir un time_period a un día en el backend
const addTimePeriodBackend = async (dayId, tpId) => {
  try {
    const res = await fetch(`${BASE_URL}add-time-period/${dayId}/${tpId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authTokens.access}`,
      },
    });
    const json = await res.json();
    return json.status === "ok";
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Hubo un problema con la conexión");
    return false;
  }
};

// Función para eliminar un time_period de un día en el backend
const removeTimePeriodBackend = async (dayId, tpId) => {
  try {
    const res = await fetch(`${BASE_URL}remove-time-period/${dayId}/${tpId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authTokens.access}`,
      },
    });
    const json = await res.json();
    return json.status === "ok";
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Hubo un problema con la conexión");
    return false;
  }
};

// ---- FUNCIONES PRINCIPALES ----

// Añadir periodo a un día con confirmación
const addOneTimePeriodToDay = (dayId, tpId) => {
  confirmAction("¿Quieres añadir este periodo a este día?", async () => {
    const success = await addTimePeriodBackend(dayId, tpId);
    if (success) {
      Alert.alert('Se ha añadido a este día este periodo de tiempo')
      setSelected(prev => ({ ...prev, [keyFor(dayId, tpId)]: true }));
    }
  });
};

// Eliminar periodo de un día con confirmación
const removeOneTimePeriodToDay = (dayId, tpId) => {
  confirmAction("¿Quieres eliminar este periodo de este día?", async () => {
    const success = await removeTimePeriodBackend(dayId, tpId);
    Alert.alert('Se ha eliminado de este día este periodo de tiempo')
    if (success) {
      setSelected(prev => {
        const next = { ...prev };
        delete next[keyFor(dayId, tpId)];
        return next;
      });
    }
  });
};

// Función que gestiona el toggle de selección
const togglePeriod = (dayId, tpId) => {
  if (selected[keyFor(dayId, tpId)]) {
    removeOneTimePeriodToDay(dayId, tpId);
  } else {
    addOneTimePeriodToDay(dayId, tpId);
  }
};


  var fetchTimePeriods = async (restaurantPk) => {
    const res = await fetch(
      BASE_URL + "time-periods-to-change/" + restaurantPk.toString() + "/",
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
      setNotAbleToFetch(true);
      Alert.alert("Error", jsonData2.message);
    } else {
      // Ordenar antes de guardar en el estado
      setTimePeriods(jsonData2.data);
      //console.log("Time periods are", jsonData2.data);
      setLoading(false);
    }
  };

  var fetchHoursOfEveryDay = async (restaurantPk) => {
    const res = await fetch(
      BASE_URL + "hours-of-every-day/" + restaurantPk.toString() + "/",
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
      setNotAbleToFetch(true);
      Alert.alert("Error", jsonData2.message);
    } else {
      const dayOrder = {
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
        SUNDAY: 7,
      };

      // Ordenar antes de guardar en el estado
      const sorted = [...jsonData2.data].sort(
        (a, b) => dayOrder[a.day] - dayOrder[b.day]
      );
      setHoursOfEveryDay(sorted);
      //console.log("jsonData2.data is", jsonData2.data);
      let initialSelected = {};
      sorted.forEach((day) => {
        day.time_period.forEach((tp) => {
          const k = keyFor(day.id, tp.id);
          initialSelected[k] = true;
        });
      });
      setSelected(initialSelected);
      setLoading(false);
    }
  };

  const editHourOfEveryDay = () => {
    navigation.navigate("Editar horas");
  };

  const cerrarUnDia = () => {
    navigation.navigate("Cerrar un día");
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      fetchHoursOfEveryDay(restaurantChosen_pk);
      fetchTimePeriods(restaurantChosen_pk);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
            {WARNING_NOT_SCROLLABLE ? (
              <Text style={styles.textsmall}>
                Estás viendo el horario del restaurante {restaurantChosen.franchise}{" "}
                localizado en {restaurantChosen.address}
              </Text>
            ) : null}
      <ScrollView>
              {!WARNING_NOT_SCROLLABLE ? (
                <Text style={styles.textsmall}>
                  Estás viendo el horario del restaurante {restaurantChosen.franchise}{" "}
                  localizado en {restaurantChosen.address}
                </Text>
              ) : null}
        <View>
          {notAbleToFetch ? (
            <Text style={styles.text}>No puedes acceder a estos datos</Text>
          ) : loading ? (
            <ActivityIndicator size={33} />
          ) : !loading && hoursOfEveryDay.length == 0 ? (
            <Text style={styles.pointstext}>
              {" "}
              No hay días y periodos establecidos aún
            </Text>
          ) : (
            hoursOfEveryDay.map((hourOfEveryDay) => (
              <>
                <View key={hourOfEveryDay.id}>
                  {hourOfEveryDay.day == "MONDAY" ? (
                    <Text style={styles.text}> LUNES</Text>
                  ) : null}
                  {hourOfEveryDay.day == "TUESDAY" ? (
                    <Text style={styles.text}> MARTES</Text>
                  ) : null}
                  {hourOfEveryDay.day == "WEDNESDAY" ? (
                    <Text style={styles.text}> MIÉRCOLES</Text>
                  ) : null}
                  {hourOfEveryDay.day == "THURSDAY" ? (
                    <Text style={styles.text}> JUEVES</Text>
                  ) : null}
                  {hourOfEveryDay.day == "FRIDAY" ? (
                    <Text style={styles.text}> VIERNES</Text>
                  ) : null}
                  {hourOfEveryDay.day == "SATURDAY" ? (
                    <Text style={styles.text}> SÁBADO</Text>
                  ) : null}
                  {hourOfEveryDay.day == "SUNDAY" ? (
                    <Text style={styles.text}> DOMINGO</Text>
                  ) : null}
                </View>
                <View>
                  {timePeriods.map((tp) => {
                    const isSelected =
                      !!selected[keyFor(hourOfEveryDay.id, tp.id)];
                    return (
                      <TouchableOpacity
                        key={`${hourOfEveryDay.id}-${tp.id}`}
                        style={[
                          styles.time_period,
                          isSelected ? styles.selected : styles.not_selected,
                        ]}
                        onPress={() => togglePeriod(hourOfEveryDay.id, tp.id)}
                      >
                        <Text style={styles.text}>
                          {tp.time_period_field}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ))
          )}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.applesign} onPress={editHourOfEveryDay}>
        <Text style={styles.applesigntext}>Editar un periodo de tiempo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googlesign} onPress={cerrarUnDia}>
        <Text style={styles.googlesigntext}>Cerrar un día</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
  },
  googlesign: {
    backgroundColor: "white",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    margin: 15,
  },
  pointstext: {
    color: "white",
    textAlign: "center",
    marginBottom: 15,
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  googlesigntext: {
    color: "black",
    textAlign: "center",
    fontSize: 25,
    fontFamily: "Function-Regular",
  },
  applesigntext: {
    color: "white",
    textAlign: "center",
    fontSize: 25,
    fontFamily: "Function-Regular",
  },
  applesign: {
    backgroundColor: "rgb(107,106,106)",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    marginLeft: 15,
    marginRight: 15,
    marginTop: 15,
  },
  text: {
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 22,
  },
    textsmall: {
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 18,
    margin: 5,
  },
  selected: {
    backgroundColor: "gray",
    borderColor: "green",
    borderWidth: 4,
  },
  not_selected: {
    backgroundColor: "gray",
    borderColor: "white",
  },
  time_period: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
});

export default Horario;

//LIMPIADO Y REVISADO
