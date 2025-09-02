import { Text, View, StyleSheet } from "react-native";
import ReservationInListSimplified from "./ReservationInListSimplified.jsx";

function ReservationInList({ collision }) {

  return (
    <>
        <View style={styles.card}>
            <Text> El {collision.date} a las {collision.time_period} la mesa '{collision.table}' está ocupada por {collision.reservations.length} reservas. Esas reservas se muestran a continuación:</Text>
            {collision.reservations.map((reservacion) => (
                <ReservationInListSimplified
                  key={reservacion.id}
                  reservacion={reservacion}
                ></ReservationInListSimplified>
            )) }
        </View>
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
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 30,
    alignSelf: "stretch",
  }
});
//REPASADO Y LIMPIO