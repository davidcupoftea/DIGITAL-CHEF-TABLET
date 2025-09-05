import { useContext, useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { PrinterContext } from "./PrintersContextProvider.jsx";
import { BASE_URL } from "../services/index.jsx";
import { useNavigation } from "@react-navigation/native";
import { imprimirFacturaCompleta } from "../services/printerFunctions.jsx";

const FacturaCompleta = ({ route }) => {
  const [nulled, setNulled] = useState(null);
  const [arrival, setArrival] = useState(null);
  const [paid, setPaid] = useState(null);
  const [pricePaid, setPricePaid] = useState("");
  const [datetimePaid, setDatetimePaid] = useState("");
  const [tablesToUse, setTablesToUse] = useState([]);
  const [orderElements, setOrderElements] = useState([]);
  const [orderElementsFactura, setOrderElementsFactura] = useState([]);
  const [facturaPk, setFacturaPk] = useState(null);
  const [numSerieFactura, setNumSerieFactura] = useState(null);
  const [notEditable, setNotEditable] = useState(false)
  const [alreadyResolved, setAlreadyResolved] = useState(false)
  const [alreadyInvoice, setAlreadyInvoice] = useState(null)

  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState({});

  const [disabledEditing, setDisabledEditing] = useState(false);

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const { selectedPrinters, setSelectedPrinters } = useContext(PrinterContext);

  const [razonSocial, setRazonSocial] = useState(null);
  const [domicilioFiscal, setDomicilioFiscal] = useState(null);
  const [nif, setNif] = useState(null);

  const navigation = useNavigation();

  const fetchTicketData = async (order_pk) => {
    const res = await fetch(BASE_URL + "get-invoice-data/" + order_pk + "/", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
    });
    var jsonData = await res.json();
    if (jsonData.domicilio_fiscal != null && jsonData.domicilio_fiscal != ""){
    setDomicilioFiscal(jsonData.domicilio_fiscal);
    }
    if (jsonData.nombre != null && jsonData.nombre != ""){
    setRazonSocial(jsonData.nombre);
    }
    if (jsonData.nif != null && jsonData.nif != ""){
    setNif(jsonData.nif);
    }
    setFacturaPk(jsonData.factura_pk);
    if (jsonData.ticket_identifier != null && jsonData.ticket_identifier != ""){
    setNotEditable(true)
    setNumSerieFactura(jsonData.ticket_identifier);
    }
    setOrderElementsFactura(jsonData.order_elements);

    if (jsonData.arrival != null){
      setAlreadyResolved(true)
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchTicketData(route.params.eventId);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchTicketData(route.params.eventId);
  }, []);

  const claimArrival = async (pk, paid) => {
    setDisabledEditing(true);

    if (razonSocial == null || razonSocial == "") {
      Alert.alert(
        "Error",
        "¡Tienes que poner al menos un nombre o razón social!"
      );
      setDisabledEditing(false);
      return;
    }
    if (domicilioFiscal == null || domicilioFiscal == "") {
      Alert.alert("Error", "¡Tienes que poner al menos un domicilio!");
      setDisabledEditing(false);
      return;
    }
    if (nif == null || nif == "") {
      Alert.alert("Error", "¡Tienes que poner al menos un NIF/CIF!");
      setDisabledEditing(false);
      return;
    }

      if (paid) {
      var resultPrinting = await imprimirFacturaCompleta(
        selectedPrinters,
        restaurantChosen,
        pedido,
        authTokens?.access,
        razonSocial,
        domicilioFiscal,
        nif
      );
    }

    if (resultPrinting.status == 'ok'){
      setNotEditable(true)


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
    if (data.message == "already_determined") {
      Alert.alert(
        "Atención",
        "Este pedido ya está resuelto, se ha creado la factura en el servidor, y debería haberse imprimido. Si quieres cambiar o rectificar el tipo de factura, hazlo desde Facturas"
      );
      setDisabledEditing(false)
    } else if (data.status == "ok" && data.paid) {
      setArrival(true);
      setPricePaid(data.price_paid);
      setDatetimePaid(data.datetime_paid);
      setPaid(true);
      setDisabledEditing(false);
    } else if (data.status == "ok" && !data.paid) {
      setPaid(false);
      setArrival(true);
      setDisabledEditing(false);
    }
  }
  else {
    setDisabledEditing(false)
  }

    // if (data.status == "ok" && paid) {
    //   await imprimirFacturaCompleta(
    //     selectedPrinters,
    //     restaurantChosen,
    //     pedido,
    //     authTokens?.access,
    //     razonSocial,
    //     domicilioFiscal,
    //     nif
    //   );
    // }

    await fetchTicketData(pk);
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

  const order_elements_factura = Array.isArray(orderElementsFactura)
    ? orderElementsFactura
        .map(({ dish, quantity }) => `${dish} (x${quantity})`)
        .join(", ")
    : "";

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
      setPaid(data.data.paid);
      setTablesToUse(data.data.table_to_use);
      setAlreadyInvoice(data.data.already_invoice)
    }
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
              El restaurante está localizado en:{"\n"}
              {pedido.restaurant_address}
            </Text>

            <Text style={styles.text}>
              Numero serie factura:{"\n"}
              {numSerieFactura}
            </Text>

            {order_elements_factura ? (
              <Text style={styles.text}>
                Los elementos de la factura son:{"\n"}
                {order_elements_factura}
              </Text>
            ) : null}

            <Text style={styles.text}>Nombre y apellidos/Razón social:</Text>
            {notEditable? 
            <Text style={styles.text}>{razonSocial}</Text>:
            (<TextInput
              style={styles.textinput}
              multiline={true}
              numberOfLines={2}
              onChangeText={setRazonSocial}
              value={razonSocial}
            ></TextInput>)}

            <Text style={styles.text}>Domicilio fiscal:</Text>
            {notEditable? 
            (<Text style={styles.text}>{domicilioFiscal}</Text>):(
            <TextInput
              style={styles.textinput}
              multiline={true}
              numberOfLines={2}
              onChangeText={setDomicilioFiscal}
              value={domicilioFiscal}
            ></TextInput>)}

            <Text style={styles.text}>NIF (o CIF):</Text>
            {notEditable? 
            <Text style={styles.text}>{nif}</Text>:
            <TextInput
              style={styles.textinput}
              multiline={true}
              numberOfLines={2}
              onChangeText={setNif}
              value={nif}
            ></TextInput>}

            {alreadyInvoice != null?<Text style={styles.text}>Ya hay una factura F2 o R5 asociada: {alreadyInvoice}</Text>:null}

            {disabledEditing ? <ActivityIndicator size="large" /> : null}

            {alreadyResolved ?null:<TouchableOpacity
              disabled={disabledEditing}
              style={styles.reservationgreen}
              onPress={() => {
                claimArrival(route.params.eventId, true);
              }}
            >
              <Text style={styles.reservationtextblack}>
                Imprimir factura completa y marcar como entregado
              </Text>
            </TouchableOpacity>}

            <TouchableOpacity
              disabled={disabledEditing}
              style={styles.reservationyellow}
              onPress={async () => {
                setDisabledEditing(true);

                if (razonSocial == null || razonSocial == "") {
                  Alert.alert(
                    "Error",
                    "¡Tienes que poner al menos un nombre o razón social!"
                  );
                  setDisabledEditing(false);
                  return;
                }
                if (domicilioFiscal == null|| domicilioFiscal == "") {
                  Alert.alert(
                    "Error",
                    "¡Tienes que poner al menos un domicilio!"
                  );
                  setDisabledEditing(false);
                  return;
                }
                if (nif == null || nif == "") {
                  Alert.alert(
                    "Error",
                    "¡Tienes que poner al menos un NIF/CIF!"
                  );
                  setDisabledEditing(false);
                  return;
                }

                const result = await imprimirFacturaCompleta(
                  selectedPrinters,
                  restaurantChosen,
                  pedido,
                  authTokens?.access,
                  razonSocial,
                  domicilioFiscal,
                  nif
                );

                if (result.status == 'ok'){
                  setNotEditable(true)
                }

                setDisabledEditing(false)
              }}
            >
              <Text style={styles.reservationtextblack}>
                Solo imprimir factura completa
              </Text>
            </TouchableOpacity>

            {facturaPk != null ? (
              <TouchableOpacity
                disabled={disabledEditing}
                style={styles.reservationgreen}
                onPress={() => {
                  navigation.navigate("Factura Rectificativa", {
                    eventId: facturaPk,
                  });
                }}
              >
                <Text style={styles.reservationtextblack}>
                  Rectificar factura
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      ) : null}
    </>
  );
};

export default FacturaCompleta;

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
  reservationtextblack: {
    color: "black",
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

//REPASADO Y LIMPIADO
