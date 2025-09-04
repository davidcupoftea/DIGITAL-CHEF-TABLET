import { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { BASE_URL } from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";


function Recompensas() {
  const navigation = useNavigation();

  const [hoursOfEveryDay, setHoursOfEveryDay] = useState([]);
  const [timePeriods, setTimePeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notAbleToFetch, setNotAbleToFetch] = useState(false);
  const [editedPeriods, setEditedPeriods] = useState({});

  const { authTokensObject, findIsPhoneVerified, phoneVerifiedObject } =
    useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;


 
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


// ---- FUNCIONES PRINCIPALES ----

// Añadir periodo a un día con confirmación
// const editTimePeriodToDay = (dayId, tpId) => {
//   confirmAction("¿Quieres editar este periodo a este día?", async () => {
//     const success = await editPeriodBackend(tpId, timePeriodField);
//     if (success) {
//       Alert.alert('Se ha añadido a este día este periodo de tiempo')
//       setSelected(prev => ({ ...prev, [keyFor(dayId, tpId)]: true }));
//     }
//   });
// };

const saveTimePeriod = async (tpId) => {
  const newValue = editedPeriods[tpId];
  try {
    const res = await fetch(`${BASE_URL}edit-time-period/${tpId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authTokens?.access}`,
      },
      body: JSON.stringify({ time_period_field: newValue }),
    });
    const json = await res.json();
    if (json.status === "ok") {
      Alert.alert("Éxito", "Periodo actualizado correctamente");
      // Actualiza la lista local para reflejar el cambio
      setTimePeriods((prev) =>
        prev.map((tp) => (tp.id === tpId ? { ...tp, time_period_field: newValue } : tp))
      );
    } else {
      Alert.alert("Error", json.message || "No se pudo actualizar");
    }
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Hubo un problema con la conexión");
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
      //.log("Time periods are", jsonData2.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      fetchTimePeriods(restaurantChosen_pk);
    });
    return unsubscribe;
  }, [navigation]);

  const cardsPerRow = 3;
  const [containerWidth, setContainerWidth] = useState(0);
  const [gapWidth, setGapWidth] = useState(0);

    useEffect(() => {
    setGapWidth(containerWidth * 0.02);
  }, [containerWidth]);


  return (
    <View style={styles.container}>
      <ScrollView>
        <View>
          <Text style={styles.textpadding}>Pon hora de inicio con minutos separados con dos puntos y sepárala mediante guión con la hora de finalización con minutos. Si la hora final es las 00:00 utiliza 23:59. Se cambiará la hora de las reservas acordemente, por lo que no conviene jugar con estos datos. Si alguna de las horas es menos de las 10, pon un cero delante. Por ejemplo: no 9:00 sino 09:00.</Text>
          {notAbleToFetch ? (
            <Text style={styles.text}>No puedes acceder a estos datos</Text>
          ) : loading ? (
            <ActivityIndicator size={33} />
          ) : !loading && timePeriods.length == 0 ? (
            <Text style={styles.pointstext}>
              {" "}
              No hay días y periodos establecidos aún
            </Text>
          ) : (
                        <View
                          style={styles.containerthreecolumns}
                          onLayout={(event) => {
                            const { width } = event.nativeEvent.layout;
                            setContainerWidth(width);
                          }}
                        >
            {timePeriods.map((tp, index) => {
            const isLastInRow = (index + 1) % cardsPerRow === 0;
            return(
            <View key={tp.id} style={styles.card}>
              <Text style={styles.text}>{tp.time_period_field}</Text>
              <Text style={styles.text}>Nuevo valor:</Text>
              <TextInput
                style={styles.input}
                value={editedPeriods[tp.id]}
                onChangeText={(text) =>
                  setEditedPeriods((prev) => ({ ...prev, [tp.id]: text }))
                }
              />
              <TouchableOpacity
                style={styles.button}
                onPress={() => saveTimePeriod(tp.id)}
              >
                <Text style={styles.textbutton}>Guardar</Text>
              </TouchableOpacity>
            </View>
          )})}
          </View>
          )}
        </View>
      </ScrollView>
              <TouchableOpacity
                style={styles.buttonbottom}
                onPress={() => navigation.navigate('Crear hora')}
              >
                <Text style={styles.textbutton}>Crear hora</Text>
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
  pointstext: {
    color: "white",
    textAlign: "center",
    marginBottom: 15,
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  text: {
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 22,
  },
    textpadding: {
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 22,
    padding: 15,
  },
  card: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 150,
    marginTop: 10,
    padding: 15,
    backgroundColor: "rgb(107,106,106)",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 30,
    marginHorizontal: 15,
  },
  button: {
    marginTop: 20,
    padding: 6,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
  },
    buttonbottom: {
    margin: 15,
    padding: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
  },
  textbutton: {
    fontSize: 25,
    color: "black",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
    input: {
  backgroundColor: "rgb(107,106,106)",  // gris de tu proyecto
  color: "white",                       // texto en blanco para contraste
  borderWidth: 1,                       
  borderColor: "white",                 // borde fino blanco
  borderRadius: 10,                     // bordes redondeados
  padding: 10,                          // espacio interno cómodo
  marginTop: 10,
  fontSize: 18,
  fontFamily: "Function-Regular", 
  },
  containerthreecolumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
});

export default Recompensas;

//LIMPIADO Y REVISADO
