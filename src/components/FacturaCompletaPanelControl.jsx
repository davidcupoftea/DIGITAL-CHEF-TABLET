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
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { PrinterContext } from "./PrintersContextProvider.jsx";
import { BASE_URL } from "../services/index.jsx";
import { useNavigation } from "@react-navigation/native";

import { FacturadosContext} from "./ConceptosFacturadosProvider.jsx";

import { imprimirFacturaCompletaPanelControl, soloImprimir, getNumeroInstalacion } from "../services/printerFunctions.jsx";
import Decimal from "decimal.js";

const FacturaCompleta = ({ route }) => {

  const [errorMessage, setErrorMessage] = useState("");

  const [elementsChosen, setElementsChosen] = useState([]);
  const [conceptosChosen, setConceptosChosen] = useState([]);

  const [elementosDelPedido, setElementosDelPedido] = useState([]);
  const [conceptosElegidos, setConceptosElegidos] = useState([]);
  const [total, setTotal] = useState([]);

  const [ticketIdentifierPk, setTicketIdentifierPk] = useState(null);
  const [ticketIdentifier, setTicketIdentifier] = useState(null);

  const [loading, setLoading] = useState(true);

  const [disabledEditing, setDisabledEditing] = useState(false);

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const { conceptosFacturadosObject, añadirConceptosFacturados, limpiarConceptosFacturados } = useContext(FacturadosContext);
  const [conceptosFacturados, setConceptosFacturados] = conceptosFacturadosObject;

  const { selectedPrinters, setSelectedPrinters } = useContext(PrinterContext);

  const [razonSocial, setRazonSocial] = useState(null);
  const [domicilioFiscal, setDomicilioFiscal] = useState(null);
  const [nif, setNif] = useState(null);

  const navigation = useNavigation();

  const getInfoForTicketOrProformaControlPanel = async (
    elementsChosen,
    conceptosChosen,
    ticket = false,
    restaurantChosen
  ) => {

    const numero_instalacion = await getNumeroInstalacion()
    const res = await fetch(
      BASE_URL + "get-info-ticket-o-proforma/" + restaurantChosen.pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({
          elements_chosen: elementsChosen,
          conceptos_chosen: conceptosChosen,
          ticket: ticket,
          numero_instalacion: numero_instalacion
        }),
      }
    );
    var jsonData2 = await res.json();

    if (jsonData2.status == "nook") {
      Alert.alert("Error", jsonData2.message);
      setErrorMessage(jsonData2.message);
      setLoading(false);
      return;
    }

    setElementosDelPedido(jsonData2.order_elements);
    setConceptosElegidos(jsonData2.concepts);
    setTotal(new Decimal(jsonData2.total.toString()).toFixed(2));
    setTicketIdentifierPk(null);
    setTicketIdentifier(null);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {

      if ((route.params?.elementsChosen != null)|| (route.params?.conceptosChosen != null)){
      getInfoForTicketOrProformaControlPanel(
        route.params.elementsChosen,
        route.params.conceptosChosen,
        false,
        restaurantChosen
      );
      setElementsChosen(route.params.elementsChosen);
      setConceptosChosen(route.params.conceptosChosen);
      navigation.setParams({
      elementsChosen: null,
      conceptosChosen: null,
    });
    }
    });

    return unsubscribe;
  }, [route.params?.elementsChosen, route.params?.conceptosChosen]);

  const crearFacturaEImprimir = async (añadirConceptosFacturados) => {
    setDisabledEditing(true);

    if (razonSocial == null) {
      Alert.alert(
        "Error",
        "¡Tienes que poner al menos un nombre o razón social!"
      );
      setDisabledEditing(false);
      return;
    }
    if (domicilioFiscal == null) {
      Alert.alert("Error", "¡Tienes que poner al menos un domicilio!");
      setDisabledEditing(false);
      return;
    }
    if (nif == null) {
      Alert.alert("Error", "¡Tienes que poner al menos un NIF/CIF!");
      setDisabledEditing(false);
      return;
    }

    if (elementsChosen.length == 0 && conceptosChosen.length == 0){
      Alert.alert('Error', "¡Tiene que haber al menos un elemento o concepto");
      setDisabledEditing(false);
      return
    }

    const result = await imprimirFacturaCompletaPanelControl(
      elementsChosen,
      conceptosChosen,
      selectedPrinters,
      restaurantChosen,
      authTokens?.access,
      razonSocial,
      domicilioFiscal,
      nif,
      setDisabledEditing,
      añadirConceptosFacturados
    );

    if (result.status == 'nook'){
      return
    }

    setTicketIdentifierPk(result["ticket_identifier_pk"]);
    setTicketIdentifier(result["ticket_identifier"]);

    setDisabledEditing(false);
  };


  const order_elements =
    Array.isArray(elementosDelPedido) && elementosDelPedido.length > 0
      ? elementosDelPedido
          .map(
            ({
              dish_price,
              dish_name,
              quantity,
              price_corrected,
              new_price_corrected,
            }) => {
              const unitPrice =
                price_corrected && new_price_corrected != null
                  ? new Decimal(new_price_corrected)
                  : new Decimal(dish_price);
              const totalPrice = unitPrice.mul(quantity).toFixed(2);
              return `${dish_name} (x${quantity}) - ${totalPrice}€`;
            }
          )
          .join("\n")
      : "No hay ítems seleccionados";

  const conceptos_elegidos =
    Array.isArray(conceptosElegidos) && conceptosElegidos.length > 0
      ? conceptosElegidos
          .map(({ description, price }) => {
            const priceDecimal = new Decimal(price).toFixed(2);
            return `${description} - ${priceDecimal}€`;
          })
          .join("\n")
      : "No hay conceptos extra";

  return (
    <>
      {!loading ? (
        <ScrollView>
          <View style={styles.card}>
            {errorMessage != "" ? (
              <Text style={styles.text}>{errorMessage}</Text>
            ) : null}

            {order_elements && errorMessage == "" ? (
              <Text style={styles.text}>
                Los elementos de la factura son:{"\n"}
                {order_elements}
              </Text>
            ) : null}

            {conceptos_elegidos && errorMessage == "" ? (
              <Text style={styles.text}>
                Los conceptos extra de la factura son:{"\n"}
                {conceptos_elegidos}
              </Text>
            ) : null}

            {total && errorMessage == "" ? (
              <Text style={styles.text}>
                El total es:{"\n"}
                {total} €
              </Text>
            ) : null}

            {errorMessage == "" && ticketIdentifierPk == null ? (
              <>
                <Text style={styles.text}>
                  Nombre y apellidos/Razón social:
                </Text>
                <TextInput
                  style={styles.textinput}
                  multiline={true}
                  numberOfLines={2}
                  onChangeText={setRazonSocial}
                  value={razonSocial}
                ></TextInput>

                <Text style={styles.text}>Domicilio fiscal:</Text>
                <TextInput
                  style={styles.textinput}
                  multiline={true}
                  numberOfLines={2}
                  onChangeText={setDomicilioFiscal}
                  value={domicilioFiscal}
                ></TextInput>

                <Text style={styles.text}>NIF (o CIF):</Text>
                <TextInput
                  style={styles.textinput}
                  multiline={true}
                  numberOfLines={2}
                  onChangeText={setNif}
                  value={nif}
                ></TextInput>

                {disabledEditing ? <ActivityIndicator size="large" /> : null}

                {!ticketIdentifierPk ? (
                  <TouchableOpacity
                    disabled={disabledEditing}
                    style={styles.reservationgreen}
                    onPress={() => {
                      crearFacturaEImprimir(añadirConceptosFacturados);
                    }}
                  >
                    <Text style={styles.reservationtextblack}>
                      Crear e imprimir factura
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : null}

            {ticketIdentifierPk != null ? (
              <>
                <Text style={styles.text}>
                  Nombre y apellidos/Razón social: {razonSocial}
                </Text>
                <Text style={styles.text}>
                  Domicilio fiscal: {domicilioFiscal}
                </Text>
                <Text style={styles.text}>NIF/CIF: {nif}</Text>
                {ticketIdentifier? (
                  <Text style={styles.text}>
                    Se ha creado la factura con identificador: {ticketIdentifier}
                  </Text>
                ) : null}
              </>
            ) : null}

            {ticketIdentifierPk ? (
              <TouchableOpacity
                style={styles.reservationgreen}
                onPress={() => {
                  soloImprimir(ticketIdentifierPk, restaurantChosen, authTokens?.access, selectedPrinters);
                }}
              >
                <Text style={styles.reservationtextblack}>
                  Imprimir factura
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
    marginTop: 10,
    padding: 15,
    backgroundColor: "rgb(107,106,106)",
    borderColor: "white",
    borderRadius: 30,
  },
  text: {
    color: "white",
    fontSize: 22,
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

//REPASADO Y LIMPIADA
