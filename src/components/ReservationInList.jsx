import { useContext, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL} from "../services/index.jsx";

function ReservationInList({ reservacion, fetchReservations }) {
  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;
  
  const navigation = useNavigation();
  const [visible, setVisible] = useState(true);

  const createMesas = (mesas) => {
    var str = "";
    for (i = 0; i < mesas.length; i++) {
      if (i + 1 != mesas.length) {
        str += mesas[i].table__name_of_the_table + ",";
      } else {
        str += mesas[i].table__name_of_the_table;
      }
    }
    return str;
  };

  const confirmarLlegada = (pk) => {
    Alert.alert(
      "Vas a confirmar la ausencia",
      "¿Estás seguro de que quieres confirmarla?",
      [
        {
          text: "No, no quiero confirmarla",
          style: "cancel",
        },
        {
          text: "Sí, quiero confirmar",
          onPress: () => confirmarConfirmarLlegada(pk),
        },
      ]
    );
  };
  const confirmarConfirmarLlegada = async (pk) => {
    const res = await fetch(
      BASE_URL +
        "confirm-arrival-by-restaurant/" +
        restaurantChosen.pk +
        "/" +
        pk.toString() +
        "/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );
    const data = await res.json();
    if (data.status == "ok") {
      Alert.alert("La llegada de la reserva se ha confirmado correctamente");
      fetchReservations();
    } else {
      Alert.alert("Ha habido un error", "Vuelve a intentarlo más adelante");
    }
  };

 

  const confirmarAusencia = (pk) => {
    Alert.alert(
      "Vas a confirmar la ausencia",
      "¿Estás seguro de que quieres confirmarla?",
      [
        {
          text: "No, no quiero confirmarla",
          style: "cancel",
        },
        {
          text: "Sí, quiero confirmar",
          onPress: () => confirmarConfirmarAusencia(pk),
        },
      ]
    );
  };
  const confirmarConfirmarAusencia = async (pk) => {
    const res = await fetch(
      BASE_URL +
        "confirm-absence-by-restaurant/" +
        restaurantChosen.pk +
        "/" +
        pk.toString() +
        "/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );
    const data = await res.json();
    if (data.status == "ok") {
      Alert.alert("La ausencia de la reserva se ha confirmado correctamente");
      fetchReservations();
    } else {
      Alert.alert("Ha habido un error", "Vuelve a intentarlo más adelante");
    }
  };

  const confirmarAnularReserva = (pk) => {
    Alert.alert(
      "DE NUEVO: VAS A ANULAR LA RESERVA",
      "¿Estás seguro de que quieres anular la reserva?",
      [
        {
          text: "No, no quiero anularla",
          style: "cancel",
        },
        {
          text: "Sí, quiero anularla",
          onPress: () => nullByRestaurant(pk),
        },
      ]
    );
  };

  const anularReserva = (pk) => {
    Alert.alert(
      "Vas a anular la reserva",
      "¿Estás seguro de que quieres anularla?",
      [
        {
          text: "No, no quiero anularla",
          style: "cancel",
        },
        {
          text: "Sí, quiero anularla",
          onPress: () => confirmarAnularReserva(pk),
        },
      ]
    );
  };
  const nullByRestaurant = async (pk) => {
    const res = await fetch(
      BASE_URL +
        "null-reservation-by-restaurant/" +
        restaurantChosen.pk +
        "/" +
        pk.toString() +
        "/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );
    const data = await res.json();
    if (data.status == "ok") {
      Alert.alert("La reserva se ha anulado correctamente");
      fetchReservations();
    } else {
      Alert.alert("Ha habido un error", "Vuelve a intentarlo más adelante");
    }
  };
  return (
    <>
      {visible ? (
        <View style={styles.card}>
              {reservacion.nulled_by_restaurant == true ? (
                <Text style={styles.textBoldError}>
                  ANULADA POR EL RESTAURANTE
                </Text>
              ) : null}
              {reservacion.nulled_by_user == true ? (
                <Text style={styles.textBoldError}>ANULADA POR EL USUARIO</Text>
              ) : null}
              {reservacion.arrival == true ? (
                <Text style={styles.textBoldGreen}>HA LLEGADO</Text>
              ) : null}
              {reservacion.arrival == false ? (
                <Text style={styles.textBoldError}>NO HA LLEGADO</Text>
              ) : null}
              <Text style={styles.textBold}>
                A nombre de: {reservacion.name_of_the_reservation}
              </Text>
              <Text style={styles.textBold}>
                A la fecha de: {reservacion.date}
              </Text>
              <Text style={styles.textBold}>
                Número de comensales: {reservacion.number_of_comensals}
              </Text>
              <Text style={styles.textBold}>
                A la hora de: {reservacion.time_period}
              </Text>
              <Text style={styles.textBold}>
                Se ha reservado desde el email: {reservacion.email__user__email}
              </Text>
              <Text style={styles.textBold}>
                Se ha provisto el número de teléfono:{" "}
                {reservacion.telephone_number}
              </Text>
              
              {reservacion.near_a_window ? <Text style={styles.textBold}>Preferencia ventana</Text> : null}
              
              {reservacion.in_patio ? <Text style={styles.textBold}>Preferencia terraza</Text> : null}
              
              <Text style={styles.textBold}>
                {reservacion.children ? "Vienen niños" : "No vienen niños"}
              </Text>
              <Text style={styles.textBold}>
                Alergias:{" "}
                {reservacion.allergies != "" && reservacion.allergies != null
                  ? reservacion.allergies
                  : "No se han especificado alergias o anotaciones"}
              </Text>
              <Text style={styles.textBold}>
                Información: {reservacion.description}
              </Text>
              <Text style={styles.textBold}>
                Anotación del restaurante: {reservacion.restaurant_annotation}
              </Text>
              <Text style={styles.textBold}>
                Mesas: {createMesas(reservacion.tables)}
              </Text>
              <Text style={styles.textBold}>
                Añadido a través del restaurante: {reservacion.added_through_restaurant.toString()}
              </Text>
              <Text style={styles.textBold}>
                Mesas añadidas manualmente: {reservacion.tables_chosen_by_the_restaurant_owner.toString()}
              </Text>
              {reservacion.added_through_restaurant?<Text style={styles.textBold}>Anotado por: {reservacion.created_by}</Text>:null}
              <Text style={styles.textBold}>
                En el restaurante localizado en: {reservacion.address}
              </Text>        
              {reservacion.arrival != false && reservacion.arrival != true ?(<TouchableOpacity
                style={styles.reservationgreen}
                onPress={() => {
                  confirmarLlegada(reservacion.id);
                }}
              >
                <Text style={styles.reservationtextwhite}>
                  Confirmar llegada
                </Text>
              </TouchableOpacity>): null}
              {reservacion.arrival != false && reservacion.arrival != true ?(<TouchableOpacity
                style={styles.reservationorange}
                onPress={() => {
                  confirmarAusencia(reservacion.id);
                }}
              >
                <Text style={styles.reservationtextwhite}>
                  Confirmar ausencia
                </Text>
              </TouchableOpacity>):null}
              <TouchableOpacity
                style={styles.reservationblue}
                onPress={() => {
                  navigation.navigate('Editar reserva', {eventId: reservacion.id})
                }}
              >
                <Text style={styles.reservationtextwhite}>
                  Editar datos de la reserva
                </Text>
              </TouchableOpacity>
              {reservacion.arrival != false && reservacion.arrival != true && reservacion.nulled_by_restaurant == false &&
              reservacion.nulled_by_user == false ? (
                <TouchableOpacity
                  style={styles.reservationred}
                  onPress={() => {
                    anularReserva(reservacion.id);
                  }}
                >
                  <Text style={styles.reservationtextwhite}>Anular</Text>
                </TouchableOpacity>
              ) : null}
        </View>
      ) : null}
    </>
  );
}

export default ReservationInList;

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 80,
    marginTop: 10,
    padding: 15,
    backgroundColor: "rgb(107,106,106)",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 30,
    alignSelf: "stretch",
  },
 textBold: {
    color: "white",
    fontSize: 25,
    fontFamily: "Function-Regular",
    marginTop: 10,
    marginBottom: 10,
  },
  textBoldGreen: {
    color: '#C7F6C7',
    fontSize: 25,
    fontFamily: "Function-Regular",
    marginTop: 10,
    marginBottom: 10,
  },
  textBoldError: {
    color: "red",
    fontSize: 25,
    fontFamily: "Function-Regular",
  },
  reservationgreen: {
    backgroundColor: "green",
    padding: 8,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 40,
    marginTop: 10,
  },
  reservationorange: {
    backgroundColor: "orange",
    padding: 8,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 40,
    marginTop: 10,
  },
  reservationblue: {
    backgroundColor: "blue",
    padding: 8,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 40,
    marginTop: 10,
  },
  reservationred: {
    backgroundColor: "red",
    padding: 8,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 40,
    marginTop: 10,
  },
  reservationtextwhite: {
    color: "white",
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Function-Regular",
  },
});

//REPASADO Y LIMPIADO
