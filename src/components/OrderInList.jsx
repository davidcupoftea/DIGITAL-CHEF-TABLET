import { useContext, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { PrinterContext } from "./PrintersContextProvider.jsx";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL, PRINTING_FEATURE } from "../services/index.jsx";
import {
  imprimirTicket,
} from "../services/printerFunctions.jsx";

function PedidoInList({ pedido }) {

  const [disabledButton, setDisabledButton] = useState(false)

  const [nulled, setNulled] = useState(pedido.nulled_by_restaurant);
  const [arrival, setArrival] = useState(pedido.arrival);
  const [paid, setPaid] = useState(pedido.paid);
  const [pricePaid, setPricePaid] = useState(pedido.price_paid);
  const [datetimePaid, setDatetimePaid] = useState(pedido.datetime_paid);
  const [confirmedByRestaurant, setConfirmedByRestaurant] = useState(
    pedido.confirmed_by_restaurant
  );
  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const { selectedPrinters, setSelectedPrinters } = useContext(PrinterContext);

  const navigation = useNavigation();

  const tables = pedido.table_to_use
    .map(({ table__name_of_the_table }) => table__name_of_the_table)
    .join(", ");

  const chooseTicketOrInvoice = (pk, paid) => {
    Alert.alert(
      "¿Ticket o factura?",
      "¿Quieres imprimir un ticket (factura simplificada) o una factura?",
      [
        {
          text: "Imprime un ticket",
          onPress: () => claimArrival(pk, paid),
        },
        {
          text: "Imprime una factura",
          onPress: () =>
            navigation.navigate("Factura Completa", { eventId: pk }),
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  const confirmarArrival = (pk, paid) => {
    if (paid) {
      Alert.alert(
        "Vas a dejar explícito que este pedido ya está resuelto",
        "Vas a dejar explícito que este pedido ya está resuelto y pagado. ¿Estás seguro de que ya ha sido entregado?",
        [
          {
            text: "No, aún no",
            style: "cancel",
          },
          {
            text: "Sí, quiero confirmar que está resuelto",

            onPress: () => {
              if (!PRINTING_FEATURE) {
                claimArrival(pk, paid);
              } else {
                chooseTicketOrInvoice(pk, paid);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Vas a dejar explícito que este pedido ya está resuelto",
        "Vas a dejar explícito que este pedido ya está resuelto y no pagado. ¿Estás seguro de que ya ha sido entregado?",
        [
          {
            text: "No, aún no",
            style: "cancel",
          },
          {
            text: "Sí, quiero confirmar que está resuelto",
            onPress: () => claimArrival(pk, paid),
          },
        ]
      );
    }
  };

  const claimArrival = async (pk, paid) => {
    setDisabledButton(true)


    const res = await fetch(
      BASE_URL +
        "claim-order-arrival-dc/" +
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
        body: JSON.stringify({ paid: paid }),
      }
    );
    const data = await res.json();
    if (data.message == "control_panel") {
      Alert.alert(
        "Ups",
        "Uno de los elementos de este pedido ya se ha anulado o facturado desde el panel de control. Manéjalo allí o crea una nueva factura desde allí."
      );
    } else if (data.message == "already_determined") {
      Alert.alert("Este pedido ya está resuelto");
    } else if (data.message == "unable") {
      Alert.alert("Este pedido solo se puede anular por un error de stock");
    } else if (data.status == "ok" && data.paid) {
      setArrival(true);
      setPricePaid(data.price_paid);
      setDatetimePaid(data.datetime_paid);
      setPaid(true);
    } else if (data.status == "ok" && !data.paid) {
      setPaid(false);
      setArrival(true);
    }
    //ESTO DE AQUI ABAJO DESCOMENTAR PARA VERSIÓN CON IMPRESORA
    if (paid && data.status == "ok") {
      if (PRINTING_FEATURE) {
        await imprimirTicket(
          selectedPrinters,
          restaurantChosen,
          pedido,
          authTokens?.access
        );
      }
    }
    disabledButton(false)
    //ESTO DE AQUI ARRIBA DESCOMENTAR PARA VERSIÓN CON IMPRESORA
  };

  const confirmarAnulacion = (pk) => {
    Alert.alert(
      "Vas a anular este pedido. Si está pagado se devolverá el dinero.",
      "¿Estás seguro de que quieres anularlo?",
      [
        {
          text: "No, no quiero anularlo",
          style: "cancel",
        },
        {
          text: "Sí, quiero confirmar que lo anulo",
          onPress: () => confirmarConfirmarAnulacion(pk),
        },
      ]
    );
  };

  const confirmarConfirmarAnulacion = (pk) => {
    Alert.alert(
      "DE NUEVO: Vas a anular este pedido. Si está pagado se devolverá el dinero.",
      "¿Estás seguro de que quieres anularlo?",
      [
        {
          text: "No, no quiero anularlo",
          style: "cancel",
        },
        {
          text: "Sí, quiero confirmar",
          onPress: () => nullOrderFromDigitalChef(pk),
        },
      ]
    );
  };

  const nullOrderFromDigitalChef = async (pk) => {
    setDisabledButton(true)
    const res = await fetch(
      BASE_URL +
        "null-order-dc/" +
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
    if (data.message == "control_panel") {
      Alert.alert(
        "Ups",
        "Uno de los elementos de este pedido ya se ha anulado o facturado desde el panel de control. Manéjalo allí o crea una nueva factura desde allí."
      );
    } else if (data.message == "unable2") {
      Alert.alert("Este pedido ya está anulado");
    } else if (data.message == "already_determined") {
      Alert.alert("Este pedido ya está resuelto");
    } else if (data.status == "ok") {
      setNulled(true);
      setArrival(false);
    }
    setDisabledButton(false)
  };

  // const ticketOFacturaPagoNoEntrega = async (pk) => {
  //   Alert.alert(
  //     "Vas a marcar este pedido como resuelto",
  //     "Vas a marcar este pedido como pagado pero no entregado. Elige 'Imprime ticket' para continuar.",
  //     [
  //       {
  //         text: "Imprime factura completa",
  //         onPress:  () =>
  //           navigation.navigate("Factura Completa", { eventId: pk }),
  //       },
  //       {
  //         text: "Imprime ticket",
  //         onPress: () => pagoNoEntrega(pk),
  //       },
  //     ]
  //   );
  // };

  const confirmarPagoNoEntrega = async (pk) => {
    Alert.alert(
      "Vas a marcar este pedido como resuelto",
      "Vas a marcar este pedido como pagado pero no entregado. ¿Estás seguro de esto?",
      [
        {
          text: "No, déjame marcarlo resuelto de otro modo",
          style: "cancel",
        },
        {
          text: "Sí, quiero confirmar e imprimir ticket",
          onPress: () => pagoNoEntrega(pk),
        },
      ]
    );
  };

  const pagoNoEntrega = async (pk) => {
    setDisabledButton(true)
    const res = await fetch(
      BASE_URL +
        "claim-order-payment-not-arrival-dc/" +
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
    if (data.message == "control_panel") {
      Alert.alert(
        "Ups",
        "Uno de los elementos de este pedido ya se ha anulado o facturado desde el panel de control. Manéjalo allí o crea una nueva factura desde allí."
      );
    } else if (data.message == "already_determined") {
      Alert.alert("Este pedido ya está resuelto");
    } else if (data.message == "unable") {
      Alert.alert("Este pedido solo se puede anular por un error de stock");
    } else if (data.status == "ok") {
      setArrival(false);
      setDatetimePaid(data.datetime_paid);
      setPaid(true);
    }
    if (data.status == "ok") {
      if (PRINTING_FEATURE) {
        await imprimirTicket(
          selectedPrinters,
          restaurantChosen,
          pedido,
          authTokens?.access
        );
      }
    }
    setDisabledButton(false)
  };

  return (
    <View style={styles.card}>
      <View>
        {nulled == true ? (
          <Text style={styles.textBoldError}>ANULADA POR EL RESTAURANTE</Text>
        ) : null}
        {arrival == true ? (
          <Text style={styles.textBoldSuccess}>ENTREGADO</Text>
        ) : arrival == false ? (
          <Text style={styles.textBoldError}>NO HA PODIDO SER ENTREGADO</Text>
        ) : null}
        {paid ? (
          <Text style={styles.textBoldSuccess}>PAGADO </Text>
        ) : (
          <Text style={styles.textBoldError}>NO PAGADO </Text>
        )}
        {pedido.created_by_restaurant ? (
          <Text style={styles.textBoldError}>Creado por el restaurante </Text>
        ) : null}

        {pedido.error_out_of_stock &&
        !pedido.nulled_by_user_error_stock == true ? (
          <Text style={styles.textBoldError}>
            ERROR DE STOCK: NO HAY SUFICIENTE DE ALGUNOS ÍTEMS
          </Text>
        ) : null}
        {pedido.error_out_of_stock &&
        !pedido.nulled_by_user_error_stock == true ? (
          <>
            <Text style={styles.textCentered}>
              Mensaje que se muestra al usuario:{" "}
            </Text>
            <Text style={styles.textBoldError}>
              {pedido.error_out_of_stock_string}
            </Text>
            <Text style={styles.textCentered}>
              Puedes anular el pedido antes que el usuario y el precio se
              reembolsará.
            </Text>
          </>
        ) : null}

        {pedido.nulled_by_user_error_stock ? (
          <>
            <Text style={styles.textBoldError}>ANULADO POR EL USUARIO</Text>
            <Text style={styles.textCentered}>
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
            <Text style={styles.text}>Email: {pedido.user_email}</Text>
            <Text style={styles.text}>
              Dirección donde entregar:{"\n"}
              {pedido.delivery_address}
            </Text>
            {paid ? (
              <>
                <Text style={styles.text}>
                  Pagado el {datetimePaid.slice(0, 10)} a las:{"\n"}
                  {datetimePaid.slice(11, 16)}
                </Text>
                <Text style={styles.text}>
                  Importe a pagar (o pagado): {pricePaid} €
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.text}>Aún no pagado</Text>
                <Text style={styles.text}>
                  Importe a pagar (o pagado): {pricePaid} €
                </Text>
              </>
            )}
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
            <Text style={styles.text}>Email: {pedido.user_email}</Text>
            <Text style={styles.text}>
              Hora de recogida:{"\n"}
              {pedido.take_away_time.slice(11, 16)} (
              {pedido.take_away_time.slice(0, 10)})
            </Text>
            {paid ? (
              <>
                <Text style={styles.text}>
                  Pagado el {datetimePaid.slice(0, 10)} a las:{"\n"}
                  {datetimePaid.slice(11, 16)}
                </Text>
                <Text style={styles.text}>
                  Importe a pagar (o pagado): {pricePaid} €
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.text}>Aún no pagado</Text>
                <Text style={styles.text}>
                  Importe a pagar (o pagado): {pricePaid} €
                </Text>
              </>
            )}
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
            <Text style={styles.text}>Email: {pedido.user_email}</Text>
            <Text style={styles.text}>
              Las mesas elegidas son: {"\n"}
              {tables}
            </Text>
            {paid ? (
              <>
                <Text style={styles.text}>
                  Pagado el {datetimePaid.slice(0, 10)} a las:{"\n"}
                  {datetimePaid.slice(11, 16)}
                </Text>
                <Text style={styles.text}>
                  Importe a pagar (o pagado): {pricePaid} €
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.text}>Aún no pagado</Text>
                <Text style={styles.text}>
                  Importe a pagar (o pagado): {pricePaid} €
                </Text>
              </>
            )}
          </>
        ) : null}
        <Text style={styles.textSinMarginBottom}>
          El pedido es:
          </Text>
          {/* {pedido.items ? order_elements : null} */}
          {pedido.items.map(
            (
              { dish, quantity, facturado, nulled, refunded, cleared, id },
              index
            ) => {
              let estado = "";
              let estadoStyle = styles.estadoVacio;

              if (pedido.fromtable && nulled && refunded) {
                estado = "ANULADO Y DESEMBOLSADO";
                estadoStyle = styles.estadoAnuladoYDesembolsado;
              } else if (pedido.fromtable && nulled) {
                estado = "ANULADO";
                estadoStyle = styles.estadoAnulado;
              } else if (pedido.fromtable && facturado) {
                estado = "FACTURADO (PAGADO)";
                estadoStyle = styles.estadoFacturado;
              } else if (pedido.fromtable && cleared) {
                estado = "LIMPIADO";
                estadoStyle = styles.estadoLimpiado;
              }

              //console.log('Pedido es', pedido)

              return (
                <View key={index}>
                <Text  style={styles.text2}>
                  -{dish.toString()} (x{quantity}){pedido.fromtable == true || pedido.fromtable == 'true'?' [ID:' + id +']':null}{" "}
                  {estado !== "" && <Text style={estadoStyle}>[{estado}]</Text>}
                </Text>
                </View>
              );
            }
          )}
        <Text style={styles.text}>
          Creado a la hora de:{"\n"}
          {pedido.created.slice(11, 16)}
        </Text>
        {pedido.annotation_by_user ? (
          <Text style={styles.text}>
            Anotación del usuario:{"\n"}
            {pedido.annotation_by_user}
          </Text>
        ) : null}
        {pedido.annotation_by_restaurant ? (
          <Text style={styles.text}>
            Anotación del restaurante:{"\n"}
            {pedido.annotation_by_restaurant}
          </Text>
        ) : null}
        <Text style={styles.text}>
          El restaurante está localizado en:{"\n"}
          {pedido.restaurant_address}
        </Text>
        <Text style={styles.text}>
          Pedido anotado por:{"\n"}
          {pedido.created_by}
        </Text>
        {!pedido.manage_in_control_panel &&
        pedido.fromtable &&
        (confirmedByRestaurant || paid ||pedido.confirmed_by_user) && //FALTA PONER AQUI SI ES CONFIRMADO POR EL USUARIO?
        arrival == null &&
        !nulled &&
        !pedido.error_out_of_stock &&
        !pedido.nulled_by_user_error_stock ? (
          <TouchableOpacity
            disabled={disabledButton}
            style={styles.reservationgreen}
            onPress={() => {
              confirmarArrival(pedido.pk, true);
            }}
          >
            <Text style={styles.reservationtextwhite}>
              {paid ? "Confirmar entrega" : "Confirmar entrega y el pago"}
            </Text>
          </TouchableOpacity>
        ) : null}
        {!pedido.manage_in_control_panel &&
        (pedido.take_away || pedido.delivery) &&
        arrival == null &&
        !nulled &&
        !pedido.nulled_by_user_error_stock &&
        !pedido.error_out_of_stock &&
        ((pedido.created_by_restaurant && !paid) ||
          (!pedido.created_by_restaurant && paid)) ? (
          <TouchableOpacity
          disabled={disabledButton}
            style={styles.reservationgreen}
            onPress={() => {
              confirmarArrival(pedido.pk, true);
            }}
          >
            <Text style={styles.reservationtextwhite}>
              {paid ? "Confirmar entrega" : "Confirmar entrega y el pago"}
            </Text>
          </TouchableOpacity>
        ) : null}

        {!pedido.manage_in_control_panel &&
        pedido.fromtable &&
        (confirmedByRestaurant || pedido.confirmed_by_user )&& //AQUI LO DE CONFIRMADO POR EL USUARIO
        arrival == null &&
        !nulled &&
        !pedido.error_out_of_stock &&
        !pedido.nulled_by_user_error_stock ? (
          <TouchableOpacity
          disabled={disabledButton}
            style={styles.reservationred}
            onPress={() => {
              confirmarArrival(pedido.pk, false);
            }}
          >
            <Text style={styles.reservationtextwhite}>
              Confirmar entrega, no pago :(
            </Text>
          </TouchableOpacity>
        ) : null}

        {!pedido.manage_in_control_panel &&
        (pedido.take_away || pedido.delivery) &&
        arrival == null &&
        !nulled &&
        !pedido.error_out_of_stock &&
        !pedido.nulled_by_user_error_stock &&
        pedido.created_by_restaurant &&
        !paid ? (
          <TouchableOpacity
            disabled={disabledButton}
            style={styles.reservationred}
            onPress={() => {
              confirmarArrival(pedido.pk, false);
            }}
          >
            <Text style={styles.reservationtextwhite}>
              Confirmar entrega, no pago :(
            </Text>
          </TouchableOpacity>
        ) : null}


        {!pedido.manage_in_control_panel &&
        (paid ||
          pedido.created_by_restaurant ||
          confirmedByRestaurant ||
          pedido.confirmed_by_user) && //AQUI PONER CONFIRMADO POR EL RESTAURANTE?
        !nulled &&
        !pedido.error_out_of_stock &&
        !pedido.nulled_by_user_error_stock ? (
          <TouchableOpacity
            disabled={disabledButton}
            style={styles.reservationyellow}
            onPress={() => {
              navigation.navigate("Pedido en Detalle", { eventId: pedido.pk });
            }}
          >
            <Text style={styles.reservationtextblack}>
              {pedido.fromtable
                ? "Editar/Imprimir/Mesas y confirmar"
                : "Editar/Imprimir"}
            </Text>
          </TouchableOpacity>
        ) : null}

        {!pedido.manage_in_control_panel &&
        (pedido.take_away || pedido.delivery) &&
        arrival == null &&
        !nulled &&
        !pedido.nulled_by_user_error_stock &&
        !pedido.error_out_of_stock &&
        ((pedido.created_by_restaurant && !paid) || //ESTO TAMBIEN PODRÍA ESTAR COMENTADO
          (!pedido.created_by_restaurant && paid)) ? (
          <TouchableOpacity
            disabled={disabledButton}
            style={styles.reservationred}
            onPress={() => {
              confirmarPagoNoEntrega(pedido.pk);
            }}
          >
            <Text style={styles.reservationtextwhite}>
              Confirmar pago, no entrega :(
            </Text>
          </TouchableOpacity>
        ) : null}

        {!pedido.manage_in_control_panel &&
        pedido.fromtable &&
        (paid || confirmedByRestaurant || pedido.confirmed_by_user) && //EL CONFIRMED BY RESTAURANT PODRÍA ESTAR COMENTADO
        arrival == null &&
        !nulled &&
        !pedido.nulled_by_user_error_stock &&
        !pedido.error_out_of_stock ? (
          <TouchableOpacity
          disabled={disabledButton}
            style={styles.reservationred}
            onPress={() => {
              confirmarPagoNoEntrega(pedido.pk);
            }}
          >
            <Text style={styles.reservationtextwhite}>
              Confirmar pago, no entrega :(
            </Text>
          </TouchableOpacity>
        ) : null}

        {!pedido.manage_in_control_panel &&
        pedido.fromtable &&
        (confirmedByRestaurant || paid || pedido.confirmed_by_user) && //AQUI FALTA SI CONFIRMADO POR EL USUARIO A LO MEJOR, O NO, NO SE
        arrival == null &&
        !nulled &&
        !pedido.nulled_by_user_error_stock ? (
          <TouchableOpacity
          disabled={disabledButton}
            style={styles.reservationblue}
            onPress={() => {
              confirmarAnulacion(pedido.pk);
            }}
          >
            <Text style={styles.reservationtextwhite}>Anular</Text>
          </TouchableOpacity>
        ) : null}

        {!pedido.manage_in_control_panel &&
        (pedido.take_away || pedido.delivery) &&
        arrival == null &&
        !nulled &&
        !pedido.nulled_by_user_error_stock &&
        ((pedido.created_by_restaurant && !paid) ||
          (!pedido.created_by_restaurant && paid)) ? (
          <TouchableOpacity
          disabled={disabledButton}
            style={styles.reservationblue}
            onPress={() => {
              confirmarAnulacion(pedido.pk);
            }}
          >
            <Text style={styles.reservationtextwhite}>Anular</Text>
          </TouchableOpacity>
        ) : null}

        {pedido.manage_in_control_panel ? (
          <TouchableOpacity
            style={styles.reservationclearblue}
            onPress={() => {}}
          >
            <Text style={styles.reservationtextwhitesmall}>
              Este pedido solo puede manejarse desde el panel de control o desde
              facturas. Hay elementos anulados o facturados desde el panel de control, o se han hecho demasiadas facturas (se ha facturado una F1 desde una F2 después de hacer una rectificativa).
            </Text>
          </TouchableOpacity>
        ) : null}
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
    backgroundColor: "rgb(107,106,106)",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 30,
    alignSelf: "stretch",
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
    marginBottom: 10,
  },
  textSinMarginBottom: {
    color: "white",
    fontSize: 22,
    fontFamily: "Function-Regular",
  },
  text2: {
    color: "white",
    fontSize: 20,
    marginBottom: 4,
    fontFamily: "Function-Regular",
  },
  textCentered: {
    color: "white",
    fontSize: 22,
    fontFamily: "Function-Regular",
    marginBottom: 10,
    textAlign: "center",
  },
  textBoldError: {
    color: "red",
    fontSize: 30,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  textBoldSuccess: {
    color: "#C7F6C7",
    fontSize: 30,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  reservationblue: {
    backgroundColor: "blue",
    padding: 8,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 40,
    marginTop: 10,
  },
  reservationclearblue: {
    backgroundColor: "#ADD8E6",
    padding: 8,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 40,
    marginTop: 10,
  },
  reservationgreen: {
    backgroundColor: "green",
    padding: 8,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 40,
    marginTop: 10,
  },
  reservationyellow: {
    backgroundColor: "yellow",
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
    reservationtextwhitesmall: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  reservationtextblack: {
    color: "black",
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Function-Regular",
  },
  estadoAnulado: {
    color: "orange",
  },
  estadoAnuladoYDesembolsado: {
    color: "red",
  },
  estadoFacturado: {
    color: "#C7F6C7",
  },
  estadoLimpiado: {
    color: "yellow",
  },
});

//REPASADO  Y LIMPIADO
