import { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

function ReservationInList({ reservacion }) {
  
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
                A email de: {reservacion.email__user__email}
              </Text>
              <Text style={styles.textBold}>
                A la fecha de: {reservacion.date}
              </Text>
              <Text style={styles.textBold}>
                Número de comensales: {reservacion.number_of_comensals}
              </Text>
              <Text style={styles.textBold}>
                A la hora de: {reservacion.time_period.time_period_field}
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
              <Text style={styles.textBold}>
                En el restaurante localizado en: {reservacion.address}
              </Text>
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
  reservationblue: {
    backgroundColor: "blue",
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
