import { Text, View, StyleSheet } from "react-native";

function PedidoInList({ pedido }) {
  const tables = pedido.table_to_use
    .map(({ table__name_of_the_table }) => table__name_of_the_table)
    .join(", ");

  const order_elements = pedido.items
    .map(({ dish, quantity }) => {
      const order_element = dish.toString() + " (x" + quantity.toString() + ")";
      return order_element;
    })
    .join(", ");

  return (
    <View style={styles.card}>
      <View>
        {pedido.nulled_by_restaurant == true ? (
          <Text style={styles.textBoldError}>ANULADA POR EL RESTAURANTE</Text>
        ) : null}

        {pedido.error_out_of_stock && !pedido.nulled_by_user_error_stock == true ? (
          <Text style={styles.textBoldError}>
            ERROR DE STOCK: NO HAY SUFICIENTE DE ALGUNOS ÍTEMS
          </Text>
        ) : null}
        {pedido.error_out_of_stock && !pedido.nulled_by_user_error_stock == true ? (
          <Text style={styles.textBoldError}>
            Mensaje que se muestra al usuario: {pedido.error_out_of_stock_string}
          </Text>
        ) : null}

        {pedido.nulled_by_user_error_stock ? (
          <>
            <Text style={styles.textBoldError}>ANULADO POR EL USUARIO</Text>
            <Text style={styles.text}>
              Este pedido ha sido anulado por el usuario por un problema de
              stock
            </Text>
          </>
        ) : null}

        {pedido.delivery == true &&
        pedido.take_away == false &&
        pedido.fromtable == false ? (
          <>
            <Text style={styles.textBold}>Entrega a domicilio</Text>
            <Text style={styles.text}>
              Dirección donde entregar:{"\n"}
              {pedido.delivery_address}
            </Text>
            <Text style={styles.text}>
              Creado el {pedido.datetime_paid.slice(0, 10)} a las:{"\n"}
              {pedido.datetime_paid.slice(11, 19)}
            </Text>
            <Text style={styles.text}>
              Se ha provisto el número de teléfono:{"\n"}
              {pedido.phone_number}
            </Text>
          </>
        ) : null}

        {pedido.delivery == false &&
        pedido.take_away == true &&
        pedido.fromtable == false ? (
          <>
            <Text style={styles.textBold}>Recoger en el local</Text>
            <Text style={styles.text}>
              Hora de recogida:{"\n"}
              {pedido.take_away_time.slice(11, 19)} (
              {pedido.take_away_time.slice(0, 10)})
            </Text>
            <Text style={styles.text}>
              Se ha provisto el número de teléfono:{"\n"}
              {pedido.phone_number}
            </Text>
          </>
        ) : null}

        {pedido.delivery == false &&
        pedido.take_away == false &&
        pedido.fromtable == true ? (
          <>
            <Text style={styles.textBold}>Pedido en la mesa</Text>
            <Text style={styles.text}>
              Creado el {pedido.datetime_paid.slice(0, 10)} a las:{"\n"}
              {pedido.datetime_paid.slice(11, 19)}
            </Text>
            <Text style={styles.text}>
              Las mesas elegidas son: {"\n"}
              {tables}
            </Text>
          </>
        ) : null}
        <Text style={styles.text}>
          El pedido es:{"\n"}
          {pedido.items ? order_elements : null}
        </Text>
        <Text style={styles.text}>
          El restaurante está localizado en:{"\n"}
          {pedido.restaurant_address}
        </Text>
      </View>
    </View>
  );
}

export default PedidoInList;

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 350,
    marginTop: 10,
    padding: 15,
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 30,
    alignSelf: "stretch",
    marginHorizontal: 15,
  },
  textBold: {
    color: "white",
    fontSize: 30,
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Function-Regular",
  },
  text: {
    color: "white",
    fontSize: 22,
    fontFamily: "Function-Regular",
  },
  textBoldError: {
    color: "red",
    fontSize: 30,
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
});

//REPASADO Y LIMPIADO
