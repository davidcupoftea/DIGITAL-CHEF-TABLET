import { useState, memo, useContext, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL,
} from "../services/index.jsx";
import { soloImprimirFacturaAsociada } from "../services/printerFunctions.jsx";
import { PrinterContext } from "./PrintersContextProvider.jsx";

const NewsInList = ({ factura, fetchFacturas }) => {
  let { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;
    const { selectedPrinters, setSelectedPrinters } = useContext(PrinterContext);

  const [anulada, setAnulada] = useState(factura.anulada)

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
          onPress: async () => await askBeforeNullingAgain(factura_id, fetchFacturas),
        },
      ]
    );
  };

  const nullFactura = async (factura_id, fetchFacturas) => {
    Alert.alert('Anulando...', 'La factura seleccionada se está anulando')
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
    if (jsonData2.status == 'ok'){
      Alert.alert('Factura anulada con éxito', jsonData2.message)
      setAnulada(true)
      fetchFacturas(restaurantChosen.pk);
    } else if (jsonData2.status == 'nook'){
      Alert.alert('Problema', jsonData2.message)
      fetchFacturas(restaurantChosen.pk);
    }
    
  };


  return (
    <>
      <View style={styles.card}>
        <View style={styles.insidecard}>
          {anulada?(<View>
            <Text style={styles.textBoldError}>ANULADA</Text>
          </View>):null}
          {factura.needed_to_resend ? (
            <View>
              <Text style={styles.textBoldError}>SE NECESITA REENVIAR</Text>
            </View>
          ) : null}
          <View>
            <Text style={styles.text}>Identificador:{'\n'}{factura.ticket_identifier}</Text>
          </View>
          <View>
            <Text style={styles.text}>Creado en:{'\n'}{factura.created}</Text>
          </View>
          <View>
            <Text style={styles.text}>Restaurante:{'\n'}{factura.restaurant.franchise}, en {factura.restaurant.address}, {factura.restaurant.localidad}</Text>
          </View>
          <View>
            <Text style={styles.text}>Tipo de factura:{'\n'}{factura.ticket_identifier_serie}</Text>
          </View>
          <View>
            <Text style={factura.negative?styles.textredcentered:styles.text}>Negativa (abono):{'\n'}{factura.negative.toString()}</Text>
          </View>
          <View>
            {factura.ticket_identifier_serie == 'F1'?<Text style={styles.text}>Nif destinatario:{'\n'}{factura.nif.toString()}</Text>:null}
          </View>
          <View>
            {factura.ticket_identifier_serie == 'F1'?<Text style={styles.text}>Domicilio fiscal destinatario:{'\n'}{factura.domicilio_fiscal}</Text>:null}
          </View>
          <View>
            {factura.ticket_identifier_serie == 'F1'?<Text style={styles.text}>Nombre destinatario:{'\n'}{factura.nombre_o_razon_social}</Text>:null}
          </View>
          <View>
            <Text style={styles.text}>Rectificativa por diferencias:{'\n'}{factura.rectificativa_por_diferencias.toString()}</Text>
          </View>
          <View>
            <Text style={styles.text}>Rectificativa sustitutiva:{'\n'}{factura.rectificativa_sustitutiva.toString()}</Text>
          </View>
          <View>
            <Text style={styles.text}>Comentario rectificacion:{'\n'}{factura.comentario_rectificacion}</Text>
          </View>
          <View>
            <Text style={styles.text}>Rectificada:{'\n'}{factura.rectificada?.ticket_identifier}</Text>
          </View>
          <View>
            {factura.ticket_identifier_serie == 'F1'?<Text style={styles.text}>Ordinaria de simplificada:{'\n'}{factura.ordinaria_de_simplificada.toString()}</Text>:null}
          </View>
          <View><Text style={styles.text}>Pedido:</Text>
            {factura.order_elements.length > 0 ? factura.order_elements.map((element, index)=>(
              <Text style={factura.negative? styles.textred :null} key={index}>{element.dish} (x{element.quantity})</Text>
            )): <Text style={factura.negative? styles.textred :null} >No hay platos</Text>}
          </View>
          <View><Text style={styles.text}>Conceptos:</Text>
            {factura.conceptos_extra.length > 0 ? factura.conceptos_extra.map((element, index)=>(
              <Text style={factura.negative? styles.textred :null} key={index}>{element.description}</Text>
            )): <Text style={factura.negative? styles.textred :null}>No hay conceptos</Text>}
          </View>

          {factura.available_from_simplified_to_ordinary ?
          (<TouchableOpacity
            style={styles.buttonyellow}
            onPress={() => { 
              navigation.navigate('De simplificada a ordinaria', {eventId: factura.id})
            }}
          >
            <Text style={styles.textbuttonblack}>Convertir en ordinaria</Text>
          </TouchableOpacity>)
          :
          null}

          <TouchableOpacity
            style={styles.buttongreen}
            onPress={() => { 
              navigation.navigate('Factura Rectificativa', {eventId: factura.id})
            }}
          >
            <Text style={styles.textbutton}>Rectificar</Text>
          </TouchableOpacity>


          {!anulada?<TouchableOpacity
            style={styles.buttonred}
            onPress={() => {
              askBeforeNulling(factura.id, fetchFacturas);
            }}
          >
            <Text style={styles.textbutton}>Anular</Text>
          </TouchableOpacity>:null}

          <TouchableOpacity
            style={styles.buttonblue}
            onPress={() => {
              soloImprimirFacturaAsociada(factura.id, restaurantChosen, authTokens?.access, selectedPrinters)
            }}
          >
            <Text style={styles.textbutton}>Imprimir última factura asociada</Text>
          </TouchableOpacity>
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
    marginHorizontal:15,
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
    textBoldError: {
    color: "red",
    fontSize: 30,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  insidecard: {
    padding: 15,
  },
  textred:{
    color: 'red',

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
    buttonyellow: {
    marginTop: 10,
    padding: 6,
    backgroundColor: "yellow",
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
    buttonblue: {
    marginTop: 10,
    padding: 6,
    backgroundColor: "blue",
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
    textbuttonblack: {
    fontSize: 25,
    color: "black",
    textAlign: "center",
    fontFamily: "Function-Regular",
  }
});

export default memo(NewsInList);

//REPASADO Y LIMPIADO
