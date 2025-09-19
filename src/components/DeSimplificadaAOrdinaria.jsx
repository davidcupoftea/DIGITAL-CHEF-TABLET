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
import { soloImprimirFacturaAsociada, getNumeroInstalacion} from "../services/printerFunctions.jsx";
import Decimal from "decimal.js";

const FacturaCompleta = ({ route }) => {
  const [orderElements, setOrderElements] = useState([]);
  const [conceptosExtra, setConceptosExtra] = useState([]);
  const [numeroSerieFactura, setNumeroSerieFactura] = useState(null);
  const [converted, setConverted] = useState(false)

  const [totalAmount, setTotalAmount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [facturaPk, setFacturaPk] = useState(null);

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;


  const { selectedPrinters, setSelectedPrinters } = useContext(PrinterContext);

  const [razonSocial, setRazonSocial] = useState(null);
  const [domicilioFiscal, setDomicilioFiscal] = useState(null);
  const [nif, setNif] = useState(null);

  const [disabledEditing, setDisabledEditing] = useState(false);
  const [disabledConversion, setDisabledConversion] = useState(false);

  useEffect(() => {
    const sumaElements = calcularSuma(orderElements);
    const sumaConceptos = calcularSumaConceptos(conceptosExtra);

    const sumaTotal = sumaElements.plus(sumaConceptos);
    setTotalAmount(sumaTotal);
  }, [orderElements, conceptosExtra]);

  const calcularSumaConceptos = (order_elements) => {
    return order_elements.reduce((total, element) => {
      precio = new Decimal(element.price);

      if (precio) {
        const cantidad = new Decimal(element.quantity || 1);
        return total.plus(precio.times(cantidad));
      }

      return total;
    }, new Decimal(0));
  };

  const calcularSuma = (order_elements) => {
    return order_elements.reduce((total, element) => {
      let precio = null;

      if (
        element.price_corrected === true &&
        element.new_price_corrected != null
      ) {
        precio = new Decimal(element.new_price_corrected);
      } else if (
        element.price_corrected === false &&
        element.new_price_corrected === null
      ) {
        precio = new Decimal(element.dish_price);
      }

      if (precio) {
        const cantidad = new Decimal(element.quantity || 1);
        return total.plus(precio.times(cantidad));
      }

      return total;
    }, new Decimal(0));
  };

  const fetchTicketData = async (factura_pk) => {
    const res = await fetch(
      BASE_URL + "get-invoice-data-by-invoice-pk/" + factura_pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );
    var jsonData = await res.json();
    setOrderElements(jsonData.ticket_identifier.order_elements);
    setConceptosExtra(jsonData.ticket_identifier.conceptos_extra);
    setNumeroSerieFactura(jsonData.ticket_identifier.ticket_identifier);
    setLoading(false);
    setFacturaPk(factura_pk);
    setConverted(false)
  };

  useEffect(() => {
    fetchTicketData(route.params.eventId);
  }, []);

  // const order_elements_string =
  //   orderElements.length > 0
  //     ? orderElements
  //         .map(({ dish, quantity, dish_price }) => {
  //           const order_element =
  //             dish.toString() +
  //             " (x" +
  //             quantity.toString() +
  //             ") [" +
  //             dish_price.toString() +
  //             " €]";
  //           return order_element;
  //         })
  //         .join(", ")
  //     : "No hay platos";

const order_elements_string =
  orderElements.length > 0
    ? orderElements
        .map(({ dish, quantity, dish_price, price_corrected, new_price_corrected, dish_pk }) => {
          const priceToShow =
            price_corrected && new_price_corrected
              ? new_price_corrected
              : dish_price;

          return `${dish} (x${quantity}) [${priceToShow} €] (id: ${dish_pk})`;
        })
        .join(", ")
    : "No hay platos";

  const conceptos_string =
    conceptosExtra.length > 0
      ? conceptosExtra
          .map(({ description, price }) => {
            const order_element =
              description.toString() + " [" + price.toString() + "€]";
            return order_element;
          })
          .join(", ")
      : "No hay conceptos";

  const convertirFacturaACompleta = async () => {
    setDisabledEditing(true);

    const numero_instalacion = await getNumeroInstalacion()

    const res = await fetch(
      BASE_URL + "convertir-factura-a-completa/" + facturaPk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({
          nif: nif,
          razon_social: razonSocial,
          domicilio_fiscal: domicilioFiscal,
          numero_instalacion: numero_instalacion,
        }),
      }
    );
    var jsonData = await res.json();
    if (jsonData.status == "nook") {
      Alert.alert("Ups", jsonData.message);
      setDisabledEditing(false);
    } else if (jsonData.status == "ok") {
      setNumeroSerieFactura(jsonData.ticket_identifier);
      setNif(jsonData.nif);
      setRazonSocial(jsonData.nombre);
      setDomicilioFiscal(jsonData.domicilio_fiscal);
      setDisabledEditing(false);
      setDisabledConversion(true);
      setConverted(true)
    }
  };

  return (
    <>
      {!loading ? (
        <ScrollView>
          <View style={styles.card}>
            <Text style={styles.text}>
              {!converted? 'Número serie factura a rectificar:': 'Número serie factura actualizada:'}{"\n"} 
              {numeroSerieFactura}
            </Text>
            <Text style={styles.text}>
              Elementos del pedido:{"\n"}
              {order_elements_string}
            </Text>

            <Text style={styles.textMarginTop}>
              Conceptos del pedido:{"\n"}
              {conceptos_string}
            </Text>

            <Text style={styles.textMarginTop}>
              Total: {totalAmount.toFixed(2)} €
            </Text>

            <Text style={styles.textMarginTop}>
              Nombre y apellidos/Razón social:
            </Text>
            {!converted?<TextInput
              style={styles.textinput}
              multiline={true}
              numberOfLines={2}
              onChangeText={setRazonSocial}
              value={razonSocial}
            ></TextInput>:
            <Text style={styles.text}>
              {razonSocial}
            </Text>
            } 

            <Text style={styles.text}>Domicilio fiscal:</Text>
            {!converted?<TextInput
              style={styles.textinput}
              multiline={true}
              numberOfLines={2}
              onChangeText={setDomicilioFiscal}
              value={domicilioFiscal}
            ></TextInput>:
            <Text style={styles.text}>
              {domicilioFiscal}
            </Text>}

            <Text style={styles.text}>NIF (o CIF):</Text>
            {!converted?<TextInput
              style={styles.textinput}
              multiline={true}
              numberOfLines={2}
              onChangeText={setNif}
              value={nif}
            ></TextInput>:
            <Text style={styles.text}>{nif}</Text>
            }

            {disabledEditing ? <ActivityIndicator size="large" /> : null}

            {!disabledConversion ? (
              <TouchableOpacity
                disabled={disabledEditing}
                style={styles.reservationgreen}
                onPress={() => {
                  convertirFacturaACompleta();
                }}
              >
                <Text style={styles.reservationtextblack}>
                  Convertir simplificada a ordinaria
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.buttonblue}
              onPress={() => {
                soloImprimirFacturaAsociada(
                  facturaPk,
                  restaurantChosen,
                  authTokens?.access,
                  selectedPrinters
                );
              }}
            >
              <Text style={styles.textbutton}>Imprimir factura</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ActivityIndicator size="large" />
      )}
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
  text: {
    color: "white",
    fontSize: 22,
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  textMarginTop: {
    color: "white",
    fontSize: 22,
    fontFamily: "Function-Regular",
    marginBottom: 10,
    marginTop: 30,
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
    buttonblue: {
    backgroundColor: "blue",
    padding: 8,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 40,
    marginTop: 10,
  },
    textbutton: {
    fontSize: 25,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
});

//REPASADO Y LIMPIADO
