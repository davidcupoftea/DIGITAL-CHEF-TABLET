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
import OrderElementInList from "./OrderElementInList.jsx";
import ConceptoExtraInList from "./ConceptoExtraInList.jsx";
//import { soloImprimirFacturaAsociada} from "../services/printerFunctions.jsx";
import { soloImprimirFacturaAsociada, getNumeroInstalacion} from "../services/printerFunctions.jsx";
import Decimal from "decimal.js";

const FacturaRectificativa = ({ route }) => {
  const [orderElements, setOrderElements] = useState([]);
  const [conceptosExtra, setConceptosExtra] = useState([]);
  const [numeroSerieFactura, setNumeroSerieFactura] = useState(null);

  const [totalAmount, setTotalAmount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [facturaPk, setFacturaPk] = useState(null);
  const [descripcionCambio, setDescripcionCambio] = useState(null);

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const { selectedPrinters, setSelectedPrinters } = useContext(PrinterContext);

  const [selectedDishPks, setSelectedDishPks] = useState([]);
  const [selectedConceptosExtra, setSelectedConceptosExtra] = useState([]);

  const [razonSocial, setRazonSocial] = useState(null);
  const [domicilioFiscal, setDomicilioFiscal] = useState(null);
  const [nif, setNif] = useState(null);

  const [simplificada, setSimplificada] = useState(false);
  const [disabledEditing, setDisabledEditing] = useState(false);




  useEffect(() => {
    const sumaElements = calcularSuma(orderElements, selectedDishPks);
    const sumaConceptos = calcularSumaConceptos(
      conceptosExtra,
      selectedConceptosExtra
    );

    const sumaTotal = sumaElements.plus(sumaConceptos);
    setTotalAmount(sumaTotal);
  }, [selectedDishPks, selectedConceptosExtra]);

  const calcularSumaConceptos = (order_elements, selected_pks) => {
    return order_elements.reduce((total, element) => {
      if (!selected_pks.includes(element.id)) {
        return total;
      }

      precio = new Decimal(element.price);

      if (precio) {
        const cantidad = new Decimal(element.quantity || 1);
        return total.plus(precio.times(cantidad));
      }

      return total;
    }, new Decimal(0));
  };

  const calcularSuma = (order_elements, selected_pks) => {
    return order_elements.reduce((total, element) => {
      if (!selected_pks.includes(element.dish_pk)) {
        return total;
      }

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
    setSimplificada(jsonData.ticket_identifier.simplificada);
    if (jsonData.ticket_identifier.simplificada == false) {
      setDomicilioFiscal(jsonData.ticket_identifier.domicilio_fiscal);
      setRazonSocial(jsonData.ticket_identifier.nombre_o_razon_social);
      setNif(jsonData.ticket_identifier.nif);
    }
    setOrderElements(jsonData.ticket_identifier.order_elements);
    setSelectedDishPks(
      jsonData.ticket_identifier.order_elements.map((e) => e.dish_pk)
    );
    setConceptosExtra(jsonData.ticket_identifier.conceptos_extra);
    setSelectedConceptosExtra(
      jsonData.ticket_identifier.conceptos_extra.map((e) => e.id)
    );
    setNumeroSerieFactura(jsonData.ticket_identifier.ticket_identifier);
    setLoading(false);
    setFacturaPk(jsonData.ticket_identifier.id);
  };

  useEffect(() => {
    fetchTicketData(route.params.eventId);
  }, []);

  const toggleDishPk = (dish_pk, isSelected) => {
    setSelectedDishPks((prev) => {
      if (isSelected) {
        return [...prev, dish_pk];
      } else {
        return prev.filter((pk) => pk !== dish_pk);
      }
    });
  };

  const toggleConceptoPk = (concepto_pk, isSelected) => {
    setSelectedConceptosExtra((prev) => {
      if (isSelected) {
        return [...prev, concepto_pk]; 
      } else {
        return prev.filter((pk) => pk !== concepto_pk);
      }
    });
  };

  const rectificarFactura = async () => {
    setDisabledEditing(true);

    if (selectedDishPks.length == 0 && selectedConceptosExtra.length == 0) {
      Alert.alert(
        "Error",
        "No puedes rectificar una factura con una nueva factura sin elementos. Añade al menos uno."
      );
      setDisabledEditing(false);
      return;
    }
    if (!descripcionCambio) {
      Alert.alert("Error", "Tienes que describir el cambio");
      setDisabledEditing(false);
      return;
    }

    const numero_instalacion = await getNumeroInstalacion()
    const res = await fetch(
      BASE_URL + "rectificar-factura/" + facturaPk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({
          order_elements: selectedDishPks,
          conceptos_extra: selectedConceptosExtra,
          nif: nif,
          razon_social: razonSocial,
          domicilio_fiscal: domicilioFiscal,
          descripcion_cambio: descripcionCambio,
          simplificada: simplificada,
          numero_instalacion: numero_instalacion,
        }),
      }
    );
    var jsonData = await res.json();
    if (jsonData.status == "nook") {
      Alert.alert("Ups", jsonData.message);
      setDisabledEditing(false);
    } else if (jsonData.status == "ok") {
      setNumeroSerieFactura(jsonData.numero_serie);
      setFacturaPk(jsonData.pk);
      setNif(jsonData.nif);
      setRazonSocial(jsonData.razon_social);
      setDomicilioFiscal(jsonData.domicilio);
      setDisabledEditing(false);
      setConceptosExtra(jsonData.conceptos_extra);
      setOrderElements(jsonData.order_elements);
      setDescripcionCambio(null);
          setSelectedDishPks(
      jsonData.order_elements.map((e) => e.dish_pk)
    );
    setSelectedConceptosExtra(
      jsonData.conceptos_extra.map((e) => e.id)
    );
    }
  };

  return (
    <>
      {!loading ? (
        <ScrollView>
          <View style={styles.card}>
            <Text style={styles.text}>
              Número serie factura a rectificar:{"\n"}
              {numeroSerieFactura}
            </Text>
            <Text style={styles.text}>Elementos del pedido:</Text>
            {orderElements.length > 0 ? (
              orderElements.map((order_element, index) => (
                <OrderElementInList
                  key={order_element.dish_pk}
                  order_element={order_element}
                  isInitiallySelected={selectedDishPks.includes(
                    order_element.dish_pk
                  )}
                  onToggleSelect={(isSelected) => {
                    toggleDishPk(order_element.dish_pk, isSelected);
                  }}
                  functional={true}
                />
              ))
            ) : (
              <Text style={styles.text}>No hay platos</Text>
            )}
            <Text style={styles.textMarginTop}>Conceptos del pedido:</Text>
            {conceptosExtra.length > 0 ? (
              conceptosExtra.map((concepto_extra, index) => (
                <ConceptoExtraInList
                  key={index}
                  order_element={concepto_extra}
                  isInitiallySelected={selectedConceptosExtra.includes(
                    concepto_extra.id
                  )}
                  onToggleSelect={(isSelected) => {
                    toggleConceptoPk(concepto_extra.id, isSelected);
                  }}
                  functional={true}
                />
              ))
            ) : (
              <Text style={styles.text}>No hay conceptos</Text>
            )}
            <Text style={styles.textMarginTop}>
              Total: {totalAmount.toFixed(2)} €
            </Text>

            {!simplificada ? (
              <>
                <Text style={styles.textMarginTop}>
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
              </>
            ) : null}

            <Text style={styles.textMarginTop}>Descripción del cambio:</Text>
            <TextInput
              style={styles.textinput}
              multiline={true}
              numberOfLines={4}
              onChangeText={setDescripcionCambio}
              value={descripcionCambio}
            ></TextInput>

            {disabledEditing ? <ActivityIndicator size="large" /> : null}

            <TouchableOpacity
              disabled={disabledEditing}
              style={styles.reservationgreen}
              onPress={() => {
                rectificarFactura();
              }}
            >
              <Text style={styles.reservationtextblack}>
                Rectificar
              </Text>
            </TouchableOpacity>

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
              <Text style={styles.textbutton}>
                Imprimir factura
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ActivityIndicator size="large" />
      )}
    </>
  );
};

export default FacturaRectificativa;

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
