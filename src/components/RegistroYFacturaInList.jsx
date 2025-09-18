import { useState, memo, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { BASE_URL } from "../services/index.jsx";

const NewsInList = ({ registro, fetchFacturas }) => {
  let { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const [anulada, setAnulada] = useState(
    registro.ticket_identifier?.anulada ?? false
  );

  const navigation = useNavigation();

  const askBeforeNullingAgain = (factura_id, fetchFacturas) => {
    Alert.alert(
      "DE NUEVO:¿Seguro que quieres anularlo?",
      "DE NUEVO:¿Estás seguro de que quieres anular esta factura? Esto sólo se debería hacer en ocasiones muy excepcionales",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Sí",
          onPress: async () => await nullFactura(factura_id, fetchFacturas),
        },
      ]
    );
  };

  const askBeforeNulling = (factura_id, fetchFacturas) => {
    Alert.alert(
      "¿Seguro que quieres anularlo?",
      "¿Estás seguro de que quieres anular esta factura? Esto sólo se debería hacer en ocasiones muy excepcionales",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Sí",
          onPress: async () =>
            await askBeforeNullingAgain(factura_id, fetchFacturas),
        },
      ]
    );
  };
  const nullFactura = async (factura_id, fetchFacturas) => {
    Alert.alert("Anulando...", "La factura seleccionada se está anulando");
    const res = await fetch(
      BASE_URL + "null-invoice/" + restaurantChosen.pk + "/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ factura: factura_id }),
      }
    );

    var jsonData2 = await res.json();
    if (jsonData2.status == "ok") {
      Alert.alert("Factura anulada con éxito", jsonData2.message);
      setAnulada(true);
      fetchFacturas(restaurantChosen.pk);
    } else if (jsonData2.status == "nook") {
      Alert.alert('Problema', jsonData2.message);
      fetchFacturas(restaurantChosen.pk);
    }
  };

  return (
    <>
      <View
        style={
          registro.tipo_operacion == "Anulacion" ? styles.cardred : styles.card
        }
      >
        <View style={styles.insidecard}>
          <View>
            <Text style={styles.text}>REGISTRO</Text>
          </View>
          <View>
            <Text
              style={
                registro.tipo_operacion == "Anulacion"
                  ? styles.textred
                  : styles.textgreen
              }
            >
              Tipo operación:{"\n"}
              {registro.tipo_operacion}
            </Text>
          </View>
          {registro.ticket_identifier ? (
            <View>
              <Text style={styles.textunderlined}>
                Identificador de la factura asociada:{"\n"}
                {registro.ticket_identifier
                  ? registro.ticket_identifier.ticket_identifier
                  : null}
              </Text>
            </View>
          ) : null}
          <View>
            <Text style={styles.textunderlined}>
              Numero serie factura:{"\n"}
              {registro.numero_serie_factura}
            </Text>
          </View>
          <View>
            <Text style={styles.textunderlined}>
              Creado a las:{"\n"}
              {registro.created.toString()}
            </Text>
          </View>
          <View>
            <Text style={styles.text}>
              Restaurante:{"\n"}
              {registro.restaurant.franchise}, en {registro.restaurant.address},{" "}
              {registro.restaurant.localidad}
            </Text>
          </View>
          <View>
            <Text style={styles.text}>
              Primer registro:{"\n"}
              {registro.primer_registro.toString()}
            </Text>
          </View>
          <View>
            <Text
              style={
                registro.estado_registro != "Correcto"
                  ? styles.textunderlinedred
                  : styles.text
              }
            >
              Estado registro:{"\n"}
              {registro.estado_registro}
            </Text>
          </View>
          <View>
            <Text
              style={
                registro.estado_registro != "Correcto"
                  ? styles.textunderlinedred
                  : styles.text
              }
            >
              Codigo error registro:{"\n"}
              {registro.codigo_error_registro
                ? registro.codigo_error_registro
                : "No hay código de error"}
            </Text>
          </View>
          <View>
            <Text
              style={
                registro.estado_registro != "Correcto"
                  ? styles.textunderlinedred
                  : styles.text
              }
            >
              Descripcion error registro:{"\n"}
              {registro.descripcion_error_registro
                ? registro.descripcion_error_registro
                : "No hay descripcion error registro"}
            </Text>
          </View>
          <View>
            <Text style={styles.textgreen}>
              Nombre obligado:{"\n"}
              {registro.nombre_obligado}
            </Text>
          </View>
          <View>
            <Text style={styles.textgreen}>
              NIF obligado:{"\n"}
              {registro.nif_obligado}
            </Text>
          </View>
          <View>
            <Text style={styles.textgreen}>
              Remisión voluntaria:{"\n"}
              {registro.remision_voluntaria.toString()}
            </Text>
          </View>
          <View>
            <Text style={styles.textgreen}>
              Incidencia:{"\n"}
              {registro.incidencia ? registro.incidencia.toString() : "No"}
            </Text>
          </View>
          <View>
            <Text style={styles.textgreen}>
              Tiempo de espera:{"\n"}
              {registro.tiempo_espera}
            </Text>
          </View>
          <View>
            <Text style={styles.text}>
              Estado envío:{"\n"}
              {registro.estado_envio}
            </Text>
          </View>
          <View>
            <Text style={styles.textgreen}>
              ID emisor envio:{"\n"}
              {registro.id_emisor_factura}
            </Text>
          </View>
          <View>
            <Text style={styles.text}>
              Serie:{"\n"}
              {registro.ticket_identifier_serie
                ? registro.ticket_identifier_serie
                : "No hay serie"}
            </Text>
          </View>
          <View>
            <Text style={styles.text}>
              Fecha:{"\n"}
              {registro.fecha}
            </Text>
          </View>
          <View>
            <Text style={styles.textgreen}>
              Subsanaación:{"\n"}
              {registro.subsanacion.toString()}
            </Text>
          </View>
          <View>
            <Text style={styles.textgreen}>
              Rechazo previo:{"\n"}
              {registro.rechazo_previo}
            </Text>
          </View>
          {registro.nombre_destinatario ? (
            <View>
              <Text style={styles.text}>
                Nombre destinatario:{"\n"}
                {registro.nombre_destinatario
                  ? registro.nombre_destinatario
                  : "No hay destinatario"}
              </Text>
            </View>
          ) : null}
          {registro.nif_destinatario ? (
            <View>
              <Text style={styles.text}>
                Nif destinatario:{"\n"}
                {registro.nif_destinatario
                  ? registro.nif_destinatario
                  : "No hay destinatario"}
              </Text>
            </View>
          ) : null}
          <View>
            <Text style={styles.textgreen}>
              Huella:{"\n"}
              {registro.huella}
            </Text>
          </View>
          {}
          <View>
            {!registro.primer_registro ? (
              <Text style={styles.text}>
                Numero serie factura anterior:{"\n"}
                {registro.numero_serie_factura_anterior}
              </Text>
            ) : null}
          </View>
          <View>
            {!registro.primer_registro ? (
              <Text style={styles.text}>
                Fecha factura anterior:{"\n"}
                {registro.fecha_factura_anterior}
              </Text>
            ) : null}
          </View>
          <View>
            {!registro.primer_registro ? (
              <Text style={styles.text}>
                Huella factura anterior:{"\n"}
                {registro.huella_factura_anterior}
              </Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.textblue}>
              Nombre sistema informático:{"\n"}
              {registro.nombre_sistema_informatico}
            </Text>
          </View>
          <View>
            <Text style={styles.textblue}>
              Nif sistema informático:{"\n"}
              {registro.nif_sistema_informatico}
            </Text>
          </View>
          <View>
            <Text style={styles.textblue}>
              Id sistema informático:{"\n"}
              {registro.id_sistema_informatico}
            </Text>
          </View>
          <View>
            <Text style={styles.textblue}>
              Número instalación:{"\n"}
              {registro.numero_instalacion}
            </Text>
          </View>
          <View>
            <Text style={styles.textblue}>
              Nombre sistema informatico comercial:{"\n"}
              {registro.nombre_sistema_informatico_comercial}
            </Text>
          </View>
          <View>
            <Text style={styles.textblue}>
              Descripcion:{"\n"}
              {registro.descripcion}
            </Text>
          </View>
          {registro.ticket_identifier ? (
            <View style={styles.innercard}>
              <View>
                <Text style={styles.text}>FACTURA</Text>
              </View>
              {anulada ? (
                <View>
                  <Text style={styles.textBoldError}>ANULADA</Text>
                </View>
              ) : null}
              <View>
                <Text style={styles.text}>
                  Identificador:{"\n"}
                  {registro.ticket_identifier.ticket_identifier}
                </Text>
              </View>
              <View>
                <Text style={styles.text}>
                  Creado en:{"\n"}
                  {registro.ticket_identifier.created}
                </Text>
              </View>
              <View>
                <Text style={styles.text}>
                  Restaurante:{"\n"}
                  {registro.ticket_identifier.restaurant.franchise}, en{" "}
                  {registro.ticket_identifier.restaurant.address},{" "}
                  {registro.ticket_identifier.restaurant.localidad}
                </Text>
              </View>
              <View>
                <Text style={styles.text}>
                  Tipo de factura:{"\n"}
                  {registro.ticket_identifier.ticket_identifier_serie}
                </Text>
              </View>
              <View>
                <Text style={styles.text}>
                  <Text
                    style={
                      registro.ticket_identifier.negative
                        ? styles.textredcentered
                        : styles.text
                    }
                  >
                    Negativa (abono):{"\n"}
                    {registro.ticket_identifier.negative.toString()}
                  </Text>
                </Text>
              </View>
              <View>
                {registro.ticket_identifier.ticket_identifier_serie == "F1" ? (
                  <Text style={styles.text}>
                    Nif destinatario:{"\n"}
                    {registro.ticket_identifier.nif.toString()}
                  </Text>
                ) : null}
              </View>
              <View>
                {registro.ticket_identifier.ticket_identifier_serie == "F1" ? (
                  <Text style={styles.text}>
                    Domicilio fiscal destinatario:{"\n"}
                    {registro.ticket_identifier.domicilio_fiscal}
                  </Text>
                ) : null}
              </View>
              <View>
                {registro.ticket_identifier.ticket_identifier_serie == "F1" ? (
                  <Text style={styles.text}>
                    Nombre destinatario:{"\n"}
                    {registro.ticket_identifier.nombre_o_razon_social}
                  </Text>
                ) : null}
              </View>
              <View>
                <Text style={styles.text}>
                  Rectificativa por diferencias:{"\n"}
                  {registro.ticket_identifier.rectificativa_por_diferencias.toString()}
                </Text>
              </View>
              <View>
                <Text style={styles.text}>
                  Rectificativa sustitutiva:{"\n"}
                  {registro.ticket_identifier.rectificativa_sustitutiva.toString()}
                </Text>
              </View>
              <View>
                <Text style={styles.text}>
                  Comentario rectificacion:{"\n"}
                  {registro.ticket_identifier.comentario_rectificacion}
                </Text>
              </View>
              <View>
                <Text style={styles.text}>
                  Rectificada:{"\n"}
                  {registro.ticket_identifier.rectificada?.ticket_identifier}
                </Text>
              </View>
              <View>
                {registro.ticket_identifier.ticket_identifier_serie == "F1" ? (
                  <Text style={styles.text}>
                    Ordinaria de simplificada:{"\n"}
                    {registro.ticket_identifier.ordinaria_de_simplificada.toString()}
                  </Text>
                ) : null}
              </View>
              <View>
                <Text style={styles.text}>Pedido:</Text>
                {registro.ticket_identifier.order_elements.length > 0 ? (
                  registro.ticket_identifier.order_elements.map(
                    (element, index) => (
                      <Text
                        style={
                          registro.ticket_identifier.negative
                            ? styles.textred
                            : null
                        }
                        key={index}
                      >
                        {element.dish} (x{element.quantity}) - {element.new_price_corrected?element.new_price_corrected:element.dish_price} €
                      </Text>
                    )
                  )
                ) : (
                  <Text
                    style={
                      registro.ticket_identifier.negative
                        ? styles.textred
                        : null
                    }
                  >
                    No hay platos
                  </Text>
                )}
                {/* {registro.ticket_identifier.order_elements.map(
                  (element, index) => (
                    <Text key={index}>
                      {element.dish} (x{element.quantity})
                    </Text>
                  )
                )} */}
              </View>
              <View>
                <Text style={styles.text}>Conceptos:</Text>
                {registro.ticket_identifier.conceptos_extra.length > 0 ? (
                  registro.ticket_identifier.conceptos_extra.map((element, index) => (
                    <Text
                      style={registro.ticket_identifier.negative ? styles.textred : null}
                      key={index}
                    >
                      {element.description} - [{element.price} €]
                    </Text>
                  ))
                ) : (
                  <Text style={registro.ticket_identifier.negative ? styles.textred : null}>
                    No hay conceptos
                  </Text>
                )}
              </View>

              <Text style={styles.text}>Facturado por:{" "}{registro.ticket_identifier.created_by}</Text>

              <TouchableOpacity
                style={styles.buttongreen}
                onPress={() => {
                  navigation.navigate("Factura Rectificativa", {
                    eventId: registro.ticket_identifier.id,
                  });
                }}
              >
                <Text style={styles.textbutton}>Rectificar</Text>
              </TouchableOpacity>

              {!anulada ? (
                <TouchableOpacity
                  style={styles.buttonred}
                  onPress={() => {
                    askBeforeNulling(
                      registro.ticket_identifier.id,
                      fetchFacturas
                    );
                  }}
                >
                  <Text style={styles.textbutton}>Anular</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 30,
    marginHorizontal: 15,
  },
  cardred: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "red",
    borderRadius: 30,
    marginHorizontal: 15,
  },
  innercard: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    backgroundColor: "rgb(107,106,106)",
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 30,
    marginHorizontal: 15,
    padding: 10,
  },
  text: {
    color: "black",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  textredcentered: {
    color: "red",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  textblue: {
    color: "blue",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  textgreen: {
    color: "green",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  textred: {
    color: "red",
    fontSize: 22,
    textAlign: "center",
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
  textunderlined: {
    color: "black",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
    textDecorationLine: "underline",
  },
  textunderlinedred: {
    color: "red",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
    textDecorationLine: "underline",
  },
  insidecard: {
    padding: 15,
  },
  buttonred: {
    marginTop: 10,
    padding: 6,
    backgroundColor: "red",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 15,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "black",
    shadowOpacity: 1,
  },
  buttongreen: {
    marginTop: 10,
    padding: 6,
    backgroundColor: "green",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 15,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "black",
    shadowOpacity: 1,
  },
  textbutton: {
    fontSize: 25,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
});

export default memo(NewsInList);

//REPASADO Y LIMPIADO
