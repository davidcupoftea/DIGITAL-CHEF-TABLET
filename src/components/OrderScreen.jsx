import { useContext, useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { PrinterContext } from "./PrintersContextProvider.jsx";
import { BASE_URL } from "../services/index.jsx";
import { useNavigation } from "@react-navigation/native";
import ManuallyTableReservationForOrdersEditing from "./ManuallyTableReservationForOrdersEditing.jsx";
import {
  imprimirTicket,
  imprimirProforma,
} from "../services/printerFunctions.jsx"; //ESTO DESCOMENTAR PARA LA VERSIÓN CON IMPRESORA
import {
PRINTING_FEATURE
} from "../services/index.jsx";

const PedidoScreen = ({ route }) => {

  const [disabledButton, setDisabledButton] = useState(false)

  const [nulled, setNulled] = useState(null);
  const [arrival, setArrival] = useState(null);
  const [paid, setPaid] = useState(null);
  const [pricePaid, setPricePaid] = useState("");
  const [datetimePaid, setDatetimePaid] = useState("");
  const [annotationByRestaurant, setAnnotationByRestaurant] = useState("");
  const [fromTable, setFromTable] = useState(null);
  const [tablesVisible, setTablesVisible] = useState(false);
  const [tablesToUse, setTablesToUse] = useState([]);
  const [orderElements, setOrderElements] = useState([]);
  const [confirmedByRestaurant, setConfirmedByRestaurant] = useState("");

  const [tables, setTables] = useState([]);
  const [tablesChosen, setTablesChosen] = useState([]);
  const [tablesAsigned, setTablesAsigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState({});

  const [disabledEditing, setDisabledEditing] = useState(false);

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const navigation = useNavigation();

  const { selectedPrinters, setSelectedPrinters } = useContext(PrinterContext); //ESTO DESCOMENTAR PARA VERSION CON IMPRESORA

  const addTable = (pk) => {
    setTablesChosen((prevState) => [...prevState, pk]);
  };

  // useEffect(() => {
  // }, [tablesAsigned]);

  // useEffect(() => {
  // }, [tablesToUse]);

  // useEffect(() => {
  // }, [tablesChosen]);

  const removeTable = (pk) => {
    let new_tablesChosen = [...tablesChosen];
    new_tablesChosen = new_tablesChosen.filter((table) => table != pk);
    setTablesChosen(new_tablesChosen);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const editOrder = async (pk) => {
    setDisabledEditing(true);
    const response = await fetch(
      BASE_URL +
        "edit-order/" +
        restaurantChosen.pk.toString() +
        "/" +
        pk +
        "/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({
          annotation: annotationByRestaurant,
          tables: tablesChosen,
        }),
      }
    );

    const jsonData = await response.json();
    if (jsonData.status == "ok") {
      Alert.alert("Éxito", "Se ha actualizado el pedido");
      setTablesAsigned(tablesChosen);
      setTablesChosen([]);
      setDisabledEditing(false);
    } else if (jsonData.status == "nook") {
      Alert.alert("Error", jsonData.message);
      setDisabledEditing(false);
    }
  };

  const fetchTables = async () => {
    const response = await fetch(
      BASE_URL + "get-tables/" + restaurantChosen.pk + "/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );

    const jsonData = await response.json();
    setTables([...jsonData.tables]);
  };


  const tables_to_use = tablesToUse
    .map(({ table__name_of_the_table }) => table__name_of_the_table)
    .join(", ");

  const order_elements = orderElements
    .map(({ dish, quantity }) => {
      const order_element = dish.toString() + " (x" + quantity.toString() + ")";
      return order_element;
    })
    .join(", ");

  //ESTO DE AQUI ABAJO DESCOMENTAR PARA LA VERSION CON IMPRESORA

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

  //ESTO DE AQUI ARRIBA DESCOMENTAR PARA LA VERSION CON IMPRESORA

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
            //onPress: () => chooseTicketOrInvoice(pk, paid), //DESCOMENTAR PARA LA VERSION CON IMPRESORA
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

  useEffect(() => {
    getPedido();
  }, []);

  const getPedido = async () => {
    const res = await fetch(
      BASE_URL +
        "orders-dc/" +
        restaurantChosen.pk +
        "/" +
        route.params.eventId.toString() +
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
      setPedido(data.data);
      setArrival(data.data.arrival);
      setNulled(data.data.nulled_by_restaurant);
      setPricePaid(data.data.price_paid);
      setDatetimePaid(data.data.datetime_paid);
      setLoading(false);
      setOrderElements(data.data.items);
      setAnnotationByRestaurant(data.data.annotation_by_restaurant);
      setPaid(data.data.paid);
      setFromTable(data.data.fromtable);
      setTablesToUse(data.data.table_to_use);
      let tables_asigned = [];
      data.data.table_to_use.map((table) => {
        tables_asigned.push(table.table__pk);
      });
      setTablesAsigned(tables_asigned);
      setConfirmedByRestaurant(data.data.confirmed_by_restaurant);
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
    setDisabledButton(false)
    //ESTO DE AQUI ARRIBA DESCOMENTAR PARA VERSIÓN CON IMPRESORA
  };

  const confirmarAnulacion = (pk) => {
    Alert.alert(
      "Vas a anular este pedido",
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
      "DE NUEVO: Vas a anular este pedido",
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

  const ticketOFacturaPagoNoEntrega = async (pk) => {
    Alert.alert(
      "Vas a marcar este pedido como resuelto",
      "Vas a marcar este pedido como pagado pero no entregado. ¿Quieres imprimir un ticket o una factura?",
      [
        {
          text: "Imprime factura completa",
          onPress: () =>
            navigation.navigate("Factura Completa", { eventId: pk }),
        },
        {
          text: "Imprime ticket",
          onPress: () => pagoNoEntrega(pk),
        },
      ]
    );
  };

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
          text: "Sí, quiero confirmar",
          onPress: () => ticketOFacturaPagoNoEntrega(pk),
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
    <>
      {!loading ? (
        <ScrollView>
          <View style={styles.card}>
            {nulled == true ? (
              <Text style={styles.textBoldError}>
                ANULADA POR EL RESTAURANTE
              </Text>
            ) : null}
            {arrival == true ? (
              <Text style={styles.textBoldSuccess}>ENTREGADO</Text>
            ) : null}
            {paid ? (
              <Text style={styles.textBoldSuccess}>PAGADO </Text>
            ) : (
              <Text style={styles.textBoldError}>NO PAGADO </Text>
            )}
            {pedido.created_by_restaurant ? (
              <Text style={styles.textBoldError}>
                Creado por el restaurante{" "}
              </Text>
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
                      {datetimePaid.slice(11, 19)}
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
                  {pedido.take_away_time.slice(11, 19)} (
                  {pedido.take_away_time.slice(0, 10)})
                </Text>
                {paid ? (
                  <>
                    <Text style={styles.text}>
                      Pagado el {datetimePaid.slice(0, 10)} a las:{"\n"}
                      {datetimePaid.slice(11, 19)}
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
                  {tables_to_use}
                </Text>
                {paid ? (
                  <>
                    <Text style={styles.text}>
                      Pagado el {datetimePaid.slice(0, 10)} a las:{"\n"}
                      {datetimePaid.slice(11, 19)}
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
            <Text style={styles.text}>
              El pedido es:{"\n"}
              {pedido.items ? order_elements : null}
            </Text>
            <Text style={styles.text}>
              Creado a la hora de:{"\n"}
              {pedido.created.slice(11, 19)}
            </Text>
            {pedido.annotation_by_user ? (
              <Text style={styles.text}>
                Anotación del usuario:{"\n"}
                {pedido.annotation_by_user}
              </Text>
            ) : null}
            <Text style={styles.text}>
              Anotaciones por parte del restaurante:
            </Text>
            <TextInput
              style={styles.textinput}
              multiline={true}
              numberOfLines={4}
              onChangeText={setAnnotationByRestaurant}
              value={annotationByRestaurant}
            ></TextInput>

            {fromTable ? (
              <TouchableOpacity
                onPress={() => {
                  setTablesVisible(!tablesVisible);
                }}
              >
                <Text style={styles.textTable}>
                  Mesas{" "}
                  <Image
                    style={{ height: 12, width: 20 }}
                    source={
                      tablesVisible
                        ? require("../../assets/arrow-up-white.png")
                        : require("../../assets/arrow-down-white.png")
                    }
                  />
                </Text>
              </TouchableOpacity>
            ) : null}

            {fromTable && tablesVisible && tables.length > 0
              ? tables.map((table) => (
                  <ManuallyTableReservationForOrdersEditing
                    key={table.id}
                    table={table}
                    addTable={addTable}
                    tablesChosen={tablesChosen}
                    removeTable={removeTable}
                    tablesOfItsReservation={tablesAsigned}
                  />
                ))
              : null}

            <Text style={styles.textAddress}>
              El restaurante está localizado en:{"\n"}
              {pedido.restaurant_address}
            </Text>
            {pedido.fromtable &&
            (confirmedByRestaurant || paid ||pedido.confirmed_by_user) &&
            arrival == null &&
            !nulled ? (
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
            {(pedido.take_away || pedido.delivery) &&
            arrival == null &&
            !nulled &&
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

            {pedido.fromtable &&
            (confirmedByRestaurant || paid ||pedido.confirmed_by_user) &&
            arrival == null &&
            !nulled ? (
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

            {(pedido.take_away || pedido.delivery) &&
            arrival == null &&
            !nulled &&
            (pedido.created_by_restaurant) &&
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

            <TouchableOpacity
            disabled={disabledButton}
              style={styles.reservationyellow}
              onPress={() => {
                imprimirProforma(selectedPrinters, restaurantChosen, pedido);
              }}
            >
              <Text style={styles.reservationtextblack}>Imprimir proforma</Text>
            </TouchableOpacity>

            <TouchableOpacity
            disabled={disabledButton}
              style={styles.reservationyellow}
              onPress={() => {
                imprimirTicket(
                  selectedPrinters,
                  restaurantChosen,
                  pedido,
                  authTokens?.access
                );
              }}
            >
              <Text style={styles.reservationtextblack}>Imprimir ticket</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reservationyellow}
              onPress={() => {
                navigation.navigate("Factura Completa", { eventId: pedido.pk });
              }}
            >
              <Text style={styles.reservationtextblack}>Imprimir factura</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={disabledEditing}
              style={styles.reservationyellow}
              onPress={() => {
                editOrder(route.params.eventId);
              }}
            >
              <Text style={styles.reservationtextblack}>
                {pedido.fromtable
                  ? "Guardar mesas y anotación (confirmación)"
                  : "Guardar anotación"}
              </Text>
            </TouchableOpacity>

            {(pedido.take_away || pedido.delivery ||pedido.fromtable) &&
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

            {pedido.fromtable &&
            (confirmedByRestaurant || paid||pedido.confirmed_by_user) &&
            arrival == null &&
            !nulled ? (
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

            {(pedido.take_away || pedido.delivery) &&
            arrival == null &&
            !nulled &&
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
          </View>
        </ScrollView>
      ) : null}
    </>
  );
};

export default PedidoScreen;

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 350,
    marginTop: 10,
    padding: 15,
    backgroundColor: "rgb(107,106,106)",
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
  textAddress: {
    color: "white",
    fontSize: 22,
    fontFamily: "Function-Regular",
    marginTop: 20,
    marginBottom: 20,
  },
  textTable: {
    color: "white",
    fontSize: 22,
    fontFamily: "Function-Regular",
    textAlign: "center",
    marginTop: 10,
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
  reservationgreen: {
    backgroundColor: "green",
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
  reservationyellow: {
    backgroundColor: "yellow",
    padding: 8,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 40,
    marginTop: 10,
  },
  reservationtextblack: {
    color: "black",
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Function-Regular",
  },
  reservationtextwhite: {
    color: "white",
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Function-Regular",
  },
  textinput: {
    padding: 4,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 10,
  },
});

//REPASADO Y LIMPIADO INCLUIDO STYLES
